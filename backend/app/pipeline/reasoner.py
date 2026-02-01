"""
Context-aware reasoning: deduplicate, enrich, and structure scan results.

Combines deterministic and AI scan results, deduplicates by (ifc_guid, rule_id, property_key),
enriches why_it_matters with human-readable explanations, suggests values where missing.
"""

from app.pipeline.models import IssueSummary
import os
from typing import List, Dict, Optional, Any, Tuple, TYPE_CHECKING

if TYPE_CHECKING:
    from app.pipeline.llm_providers import LLMProvider

from app.pipeline.models import (
    IssueSummary,
    MissingProperty,
    TerminologyMapping,
    Profile,
)
from app.terminology.bsdd_client import get_allowed_values_for_property


class ContextReasoner:
    """Enrich raw issues with human-readable reasoning and suggested values."""

    def __init__(self, llm_provider: Optional["LLMProvider"] = None):
        """
        Initialize reasoner with optional LLM provider.
        
        Args:
            llm_provider: LLMProvider instance. If None, uses default Gemini.
        """
        self.llm_provider = llm_provider
        
        # Fallback to Gemini if no provider specified
        if self.llm_provider is None:
            from app.pipeline.llm_providers import GeminiProvider
            provider = GeminiProvider()
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
