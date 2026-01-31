"""
Context-aware reasoning: deduplicate, enrich, and structure scan results.

Combines deterministic and AI scan results, deduplicates by (ifc_guid, rule_id, property_key),
enriches why_it_matters with human-readable explanations, suggests values where missing.
"""

from app.pipeline.models import IssueSummary
import os
from typing import List, Dict, Optional, Any, Tuple

from langchain_google_genai import ChatGoogleGenerativeAI

from app.pipeline.models import (
    MissingProperty,
    TerminologyMapping,
    Profile,
    Guidance,
)
from app.terminology.bsdd_client import get_allowed_values_for_property


class ContextReasoner:
    """Enrich raw issues with human-readable reasoning and suggested values."""

    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        self.llm = (
            ChatGoogleGenerativeAI(
                model="gemini-1.5-pro-latest",
                temperature=0,
                google_api_key=api_key,
            )
            if api_key
            else None
        )

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
        if self.llm:
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

        return deduped, terminology, summary

    async def generate_guidance(self, issues: List[MissingProperty]) -> List[Guidance]:
        """Generate high-level guidance/recommendations based on aggregated issues."""
        if not self.llm or not issues:
            return []
        
        from langchain_core.messages import HumanMessage, SystemMessage

        # Aggregate issues by rule/type for context
        counts = {}
        for i in issues:
            k = f"{i.rule_name} ({i.issue_type})"
            counts[k] = counts.get(k, 0) + 1
        
        top_issues = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:5]
        summary_text = "\n".join([f"- {k}: {v} occurrences" for k, v in top_issues])

        sys = (
            "You are a BIM Manager providing strategic guidance based on scan results. "
            "Analyze the summary of top issues and provide 3-5 actionable guidance items. "
            "For each item, provide: 'what_is_wrong', 'why_it_matters', and 'where_to_fix_it'. "
            "Format the output strictly as distinct blocks separated by '---'."
        )
        user = f"Scan Summary (Top Issues):\n{summary_text}\n\nProvide guidance:"

        try:
            resp = await self.llm.ainvoke([SystemMessage(content=sys), HumanMessage(content=user)])
            text = resp.content if hasattr(resp, "content") else str(resp)
            
            guidances = []
            blocks = text.split("---")
            for block in blocks:
                lines = [l.strip() for l in block.strip().split("\n") if l.strip()]
                g = {"what_is_wrong": "", "why_it_matters": "", "where_to_fix_it": ""}
                current_key = None
                
                for line in lines:
                    lower = line.lower()
                    if "what is wrong" in lower or "what_is_wrong" in lower:
                        current_key = "what_is_wrong"
                        g[current_key] = line.split(":", 1)[-1].strip()
                    elif "why it matters" in lower or "why_it_matters" in lower:
                        current_key = "why_it_matters"
                        g[current_key] = line.split(":", 1)[-1].strip()
                    elif "where to fix" in lower or "where_to_fix_it" in lower:
                        current_key = "where_to_fix_it"
                        g[current_key] = line.split(":", 1)[-1].strip()
                    elif current_key:
                        g[current_key] += " " + line
                
                if g["what_is_wrong"] and g["why_it_matters"]:
                    guidances.append(Guidance(**g))
            
            return guidances

        except Exception:
            return []

    async def _enrich_with_llm(self, issues: List[MissingProperty], profile: Profile) -> List[MissingProperty]:
        """Enrich why_it_matters for issues that lack it or have generic text."""
        from langchain_core.messages import HumanMessage, SystemMessage

        to_enrich = [
            i for i in issues
            if not i.why_it_matters or len(str(i.why_it_matters)) < 30
        ]
        if not to_enrich or not self.llm:
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
            resp = await self.llm.ainvoke([SystemMessage(content=sys), HumanMessage(content=user)])
            text = resp.content if hasattr(resp, "content") else str(resp)
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
