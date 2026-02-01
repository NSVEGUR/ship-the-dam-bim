"""
Context-aware reasoning: deduplicate, enrich, and structure scan results.

Combines deterministic and AI scan results, deduplicates by (ifc_guid, rule_id, property_key),
enriches why_it_matters with human-readable explanations, suggests values where missing.
"""

from app.pipeline.models import IssueSummary
import os
import re
from typing import List, Dict, Optional, Any, Tuple, TYPE_CHECKING

if TYPE_CHECKING:
    from app.pipeline.llm_providers import LLMProvider

from app.pipeline.models import (
    IssueSummary,
    MissingProperty,
    TerminologyMapping,
    Profile,
)
from app.terminology.bsdd_client import get_allowed_values_for_property, lookup_bsdd_terminology


class ContextReasoner:
    """Enrich raw issues with human-readable reasoning and suggested values."""

    def __init__(self, llm_provider: Optional["LLMProvider"] = None):
        """
        Initialize reasoner with optional LLM provider.
        
        Args:
            llm_provider: LLMProvider instance. If None, uses default Gemini.
        """
        self.llm_provider = llm_provider
        
        # Fallback to OpenAI if no provider specified (Gemini quota often exhausted)
        if self.llm_provider is None:
            from app.pipeline.llm_providers import OpenAIProvider
            provider = OpenAIProvider()
            self.llm_provider = provider if provider.is_available() else None

    async def process(
        self,
        issues: List[MissingProperty],
        terminology: List[TerminologyMapping],
        summary: List[IssueSummary], # Kept for now, will map to IssueSummary in Orchestrator
        profile: Profile,
    ) -> Tuple[List[MissingProperty], List[TerminologyMapping], List[IssueSummary]]:
        """
        Deduplicate issues, enrich why_it_matters, fill suggested_value where missing.
        Returns (issues, terminology, summary).
        """
        # 1. Deduplicate by (ifc_guid, rule_id, property_key)
        seen: set = set()
        deduped: List[MissingProperty] = []
        for i in issues:
            key = (i.ifc_guid, i.rule_id, i.property_key or "")
            if key in seen:
                continue
            seen.add(key)
            deduped.append(i)

        # 2. Enrich why_it_matters and suggested_value using LLM if available
        if self.llm_provider:
            try:
                deduped = await self._enrich_with_llm(deduped, profile)
            except Exception:
                pass

        # 3. Fill suggested_value from bsdd where missing
        for i in deduped:
            it = str(i.issue_type) if i.issue_type else ""
            if not i.suggested_value and it in ("MISSING_PROPERTY", "INVALID_VALUE"):
                rule = next((r for r in profile.rules if r.id == i.rule_id), None)
                if rule and rule.property_name:
                    if rule.allowed_values:
                        i.suggested_value = rule.allowed_values[0]
                    elif rule.dictionary_uri:
                        vals = get_allowed_values_for_property(
                            rule.dictionary_uri,
                            i.element_type,
                            rule.property_name,
                        )
                        if vals:
                            i.suggested_value = vals[0]

        # 4. Generate Guidance for Rule Summaries and propagate to issues
        if self.llm_provider:
            try:
                summary, deduped = await self._generate_guidance_for_summaries(summary, deduped)
            except Exception:
                pass

        # 5. Enrich terminology with suggested_de (German) using bSDD + AI
        terminology = await self._enrich_terminology_with_german(terminology)

        return deduped, terminology, summary

    async def _generate_guidance_for_summaries(
        self,
        summaries: List[IssueSummary],
        issues: List[MissingProperty]
    ) -> Tuple[List[IssueSummary], List[MissingProperty]]:
        """
        Generate guidance (what_is_wrong, why_it_matters, where_to_fix_it) for each failed rule.
        Update IssueSummary and corresponding MissingProperty objects.
        """
        from langchain_core.messages import HumanMessage, SystemMessage

        # Filter only failed rules
        failed_summaries = [s for s in summaries if s.failed_count > 0]
        if not failed_summaries:
            return summaries, issues

        # Prepare batch prompt
        prompt_items = []
        for s in failed_summaries:
            prompt_items.append(f"- Rule: {s.rule_name} (ID: {s.rule_id})")

        sys = (
            "You are a BIM Manager. For each failed rule, provide 3 short distinct strings:\n"
            "1. 'what_is_wrong': The error description.\n"
            "2. 'why_it_matters': The impact.\n"
            "3. 'where_to_fix_it': General location/method to fix.\n"
            "Format: RuleID | what_is_wrong | why_it_matters | where_to_fix_it"
        )
        user = "Rules:\n" + "\n".join(prompt_items)

        try:
            text = await self.llm_provider.ainvoke([SystemMessage(content=sys), HumanMessage(content=user)])
            
            # Parse response
            guidance_map = {} # rule_id -> {what, why, where}
            for line in text.split("\n"):
                parts = [p.strip() for p in line.split("|")]
                if len(parts) >= 4:
                    rid = parts[0]
                    guidance_map[rid] = {
                        "what_is_wrong": parts[1],
                        "why_it_matters": parts[2],
                        "where_to_fix_it": parts[3]
                    }
            
            # Update summaries
            for s in summaries:
                if s.rule_id in guidance_map:
                    g = guidance_map[s.rule_id]
                    s.what_is_wrong = g["what_is_wrong"]
                    s.why_it_matters = g["why_it_matters"]
                    s.where_to_fix_it = g["where_to_fix_it"]
            
            # Update issues
            for i in issues:
                if i.rule_id in guidance_map:
                    g = guidance_map[i.rule_id]
                    i.what_is_wrong = g["what_is_wrong"]
                    # Only overwrite why_it_matters if missing or short? keeping logic simple for now
                    if not i.why_it_matters:
                        i.why_it_matters = g["why_it_matters"]
                    i.where_to_fix_it = g["where_to_fix_it"]
                    
        except Exception:
            pass
            
        return summaries, issues



    async def _enrich_with_llm(self, issues: List[MissingProperty], profile: Profile) -> List[MissingProperty]:
        """Enrich why_it_matters for issues that lack it or have generic text."""
        from langchain_core.messages import HumanMessage, SystemMessage

        to_enrich = [
            i for i in issues
            if not i.why_it_matters or len(str(i.why_it_matters)) < 30
        ]
        if not to_enrich or not self.llm_provider:
            return issues

        # Batch: ask LLM to provide concise why_it_matters for each
        sys = (
            "You are a BIM QA expert. For each issue, provide a 1–2 sentence "
            "'why_it_matters' explaining the impact in submission/QA context. "
            "Be concise and practical."
        )
        items = []
        for i in to_enrich[:20]:  # Limit to avoid token overflow
            items.append(
                f"- {i.rule_id} | {i.element_type} | {i.ifc_guid} | "
                f"property: {i.property_key} | current: {i.current or 'Missing'}"
            )
        user = (
            "For each issue below, provide a brief 'why_it_matters' (1–2 sentences):\n\n"
            + "\n".join(items)
        )

        try:
            text = await self.llm_provider.ainvoke([SystemMessage(content=sys), HumanMessage(content=user)])
            # Parse numbered/bullet responses and map back
            lines = [l.strip() for l in text.split("\n") if l.strip()]
            for idx, i in enumerate(to_enrich[:20]):
                if idx < len(lines):
                    line = lines[idx]
                    # Strip leading number/bullet
                    for c in "0123456789.-) ":
                        if line.startswith(c):
                            line = line[1:].strip()
                        else:
                            break
                    if line and len(line) > 10:
                        i.why_it_matters = line[:500]
        except Exception:
            pass

        return issues

    # --------------------------------------------------------------------------- #
    # Terminology Enrichment: suggested_de (German) population
    # --------------------------------------------------------------------------- #

    async def _enrich_terminology_with_german(
        self, terminology: List[TerminologyMapping]
    ) -> List[TerminologyMapping]:
        """
        Populate suggested_de for all terminology entries using:
        1. bSDD lookup (preferred - official translations)
        2. AI batch translation (fallback - follows bSDD naming conventions)
        """
        if not terminology:
            return terminology

        # ---------- Phase 1: Try bSDD for each term missing suggested_de ----------
        for t in terminology:
            if t.suggested_de:
                continue  # Already has German translation
            
            search_term = t.suggested_en or t.original or ""
            if not search_term:
                continue
            
            try:
                result = lookup_bsdd_terminology(
                    search_term=search_term,
                    element_type=t.element_type,
                )
                if result:
                    # Update German if found
                    if result.get("de"):
                        t.suggested_de = result["de"]
                        t.confidence = 0.95  # High confidence for bSDD
                    # Also improve English if we got a better one
                    if result.get("en") and (not t.suggested_en or t.suggested_en == "Review"):
                        t.suggested_en = result["en"]
            except Exception:
                pass

        # ---------- Phase 2: AI batch for terms still missing suggested_de ----------
        needs_german = [t for t in terminology if not t.suggested_de]
        
        if needs_german and self.llm_provider:
            try:
                await self._ai_batch_german_translation(needs_german)
            except Exception:
                pass

        # ---------- Phase 3: Final fallback - translate English to German ----------
        still_missing = [t for t in terminology if not t.suggested_de and t.suggested_en]
        if still_missing and self.llm_provider:
            try:
                await self._ai_translate_to_german(still_missing)
            except Exception:
                pass

        return terminology

    async def _ai_batch_german_translation(
        self, terms: List[TerminologyMapping]
    ) -> None:
        """
        Use AI to provide German translations in batch.
        Updates terms in-place.
        """
        from langchain_core.messages import HumanMessage, SystemMessage

        if not terms or not self.llm_provider:
            return

        # Limit batch size to avoid token overflow
        batch = terms[:30]

        # Build the prompt with strict requirements
        term_list = []
        for i, t in enumerate(batch, 1):
            original = t.original or ""
            english = t.suggested_en or original
            elem_type = t.element_type or "Unknown"
            term_list.append(f"{i}. {original} | {english} | {elem_type}")

        system_prompt = """You are a BIM terminology expert fluent in English and German.
You MUST follow buildingSMART Data Dictionary (bSDD) naming conventions.

For each term below, provide the German translation following these rules:
- Use official bSDD/IFC German terminology when available
- Use standard German BIM/construction terminology
- Keep technical terms like "Ifc" prefixes unchanged
- NEVER leave German empty - always provide your best translation

Output format (EXACTLY 3 columns separated by |):
Number. Original | English | German

Example:
1. FireRating | Fire Rating | Feuerwiderstandsklasse
2. IfcWall | Wall | Wand
3. LoadBearing | Load Bearing | Tragend"""

        user_prompt = f"""Translate these BIM terms to German (Column 3 MUST NOT be empty):

{chr(10).join(term_list)}

IMPORTANT: Every line MUST have exactly 3 columns: Original | English | German
The German column is REQUIRED - infer the translation if unsure."""

        try:
            response = await self.llm_provider.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ])
            
            self._parse_german_translations(response, batch)
            
        except Exception:
            pass

    def _parse_german_translations(
        self, response: str, terms: List[TerminologyMapping]
    ) -> None:
        """
        Parse AI response and update terms with German translations.
        Handles various response formats robustly.
        """
        if not response:
            return

        lines = [l.strip() for l in response.split("\n") if l.strip()]
        
        # Build a mapping from index/original to German
        translations: Dict[int, str] = {}
        original_to_german: Dict[str, str] = {}
        
        for line in lines:
            # Skip header lines
            if line.startswith("#") or line.startswith("Number") or "---" in line:
                continue
            
            # Try to parse "N. Original | English | German" format
            # First, extract the number prefix if present
            line_content = line
            line_idx = None
            
            # Match patterns like "1.", "1)", "1:"
            import re
            num_match = re.match(r'^(\d+)[.\):\s]+(.*)$', line)
            if num_match:
                line_idx = int(num_match.group(1)) - 1  # Convert to 0-based
                line_content = num_match.group(2).strip()
            
            # Split by pipe
            parts = [p.strip() for p in line_content.split("|")]
            
            # We need at least 2 parts, ideally 3
            if len(parts) >= 3:
                original = parts[0]
                english = parts[1]
                german = parts[2]
                
                # Clean up German - remove quotes, trailing punctuation
                german = german.strip().strip('"\'').strip()
                
                if german and german.lower() not in ("none", "n/a", "-", ""):
                    if line_idx is not None and 0 <= line_idx < len(terms):
                        translations[line_idx] = german
                    original_to_german[original.lower()] = german
                    
            elif len(parts) == 2:
                # Maybe "English | German" format
                english = parts[0]
                german = parts[1].strip().strip('"\'').strip()
                if german and german.lower() not in ("none", "n/a", "-", ""):
                    original_to_german[english.lower()] = german

        # Apply translations to terms
        for idx, t in enumerate(terms):
            if t.suggested_de:
                continue  # Already has German
            
            # Try by index first
            if idx in translations:
                t.suggested_de = translations[idx]
                t.confidence = 0.85
                continue
            
            # Try by original match
            original_key = (t.original or "").lower()
            if original_key in original_to_german:
                t.suggested_de = original_to_german[original_key]
                t.confidence = 0.85
                continue
            
            # Try by English match
            english_key = (t.suggested_en or "").lower()
            if english_key in original_to_german:
                t.suggested_de = original_to_german[english_key]
                t.confidence = 0.80

    async def _ai_translate_to_german(
        self, terms: List[TerminologyMapping]
    ) -> None:
        """
        Final fallback: directly translate English terms to German.
        Used when batch parsing failed for some terms.
        """
        from langchain_core.messages import HumanMessage, SystemMessage

        if not terms or not self.llm_provider:
            return

        # Smaller batch for direct translation
        batch = terms[:20]
        
        english_terms = [t.suggested_en for t in batch if t.suggested_en]
        if not english_terms:
            return

        system_prompt = """You are a German BIM terminology translator.
Translate each English BIM/construction term to German.
Use official buildingSMART/IFC German terminology.
Output one German term per line, in the same order as input.
NEVER output empty lines or 'None'."""

        user_prompt = "Translate to German:\n" + "\n".join(english_terms)

        try:
            response = await self.llm_provider.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ])
            
            # Parse simple line-by-line response
            german_lines = [l.strip() for l in response.split("\n") if l.strip()]
            
            term_idx = 0
            for german in german_lines:
                if term_idx >= len(batch):
                    break
                
                # Skip if it looks like a header or instruction
                if german.startswith("#") or ":" in german[:20]:
                    continue
                
                # Clean up
                german = german.strip().strip('"\'').strip()
                german = re.sub(r'^\d+[.\)]\s*', '', german)  # Remove numbering
                
                if german and german.lower() not in ("none", "n/a", "-", ""):
                    if not batch[term_idx].suggested_de:
                        batch[term_idx].suggested_de = german
                        batch[term_idx].confidence = 0.75
                    term_idx += 1
                    
        except Exception:
            pass
