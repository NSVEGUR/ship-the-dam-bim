"""
Pipeline orchestrator: deterministic + AI scan, terminology, reasoner, storage.

Runs: Deterministic → AI → Merge → Terminology (with BSDD + user prefs) → Reasoner
Exports outputs and saves to Supabase.
"""

import io
import pandas as pd
from typing import List, Dict, Optional, Tuple
from datetime import datetime

from app.pipeline.models import (
    ScanResult,
    Profile,
    MissingProperty,
    IssueSummary,
    TerminologyMapping,
    MissingProperty,
    IssueSummary,
    TerminologyMapping,
)
from app.pipeline.deterministic import create_deterministic_scanner
from app.pipeline.ai import AIAgent
from app.pipeline.reasoner import ContextReasoner
from app.pipeline.llm_providers import get_llm_provider, LLMChoice
from app.pipeline.manus_synthesis import ManusSynthesis
from app.storage.supabase_store import SupabaseStorage

class PipelineOrchestrator:
    def __init__(
        self,
        file_path: str,
        profile: Profile,
        project_id: int,
        user_approved_terminology: Optional[Dict[str, str]] = None,
        llm_provider: LLMChoice = "gemini",
    ):
        self.file_path = file_path
        self.profile = profile
        self.project_id = project_id
        self.user_approved_terminology = user_approved_terminology or {}
        self.llm_choice = llm_provider
        
        # Get base LLM provider (Gemini/MiniMax/OpenAI)
        try:
            self._llm_provider = get_llm_provider(llm_choice=llm_provider)
        except RuntimeError:
            self._llm_provider = None
        
        # Manus synthesis (always on if available)
        self.manus = ManusSynthesis()
        
        self.det_scanner = create_deterministic_scanner(file_path)
        self.ai_scanner = AIAgent(file_path)
        self.reasoner = ContextReasoner(llm_provider=self._llm_provider)
        self.store = SupabaseStorage()

    async def run_full_scan(self) -> ScanResult:
        """Run full pipeline: deterministic → AI → merge → terminology → reasoner."""
        timestamp = datetime.now().isoformat()

        # 1. Deterministic scan (IFC or CSV)
        det_issues, det_rule_stats = self.det_scanner.scan(
            self.profile,
            user_approved_terminology=self.user_approved_terminology,
        )

        # 2. AI scan (for CUSTOM rules; only on IFC, not CSV)
        if self.file_path.lower().endswith(".ifc"):
            ai_issues = await self.ai_scanner.scan(self.profile)
        else:
            ai_issues = []

        all_issues = det_issues + ai_issues

        # 3. Terminology normalization from issues
        terminology_map = self._generate_terminology_map(all_issues)

        # 4. Summary from rule_stats + AI issues
        summary = self._generate_summary(all_issues, det_rule_stats)

        # 5. Context-aware reasoner: dedupe, enrich, suggest
        issues_final, terminology_final, summary_final_raw = await self.reasoner.process(
            all_issues,
            terminology_map,
            summary,
            self.profile,
        )
        
        # Convert internal ScanSummary to API IssueSummary
        issue_summaries = [
            IssueSummary(
                rule_id=s.rule_id,
                rule_name=s.rule_name,
                severity=s.severity,
                checked_count=s.checked_count,
                failed_count=s.failed_count,
                pass_rate=s.pass_rate,
                what_is_wrong=s.what_is_wrong,
                why_it_matters=s.why_it_matters,
                where_to_fix_it=s.where_to_fix_it,
            ) for s in summary_final_raw
        ]

        # 7. Calculate Scores
        scores = self._calculate_scores(summary_final_raw)

        # 8. Manus Per-Row Enrichment (always runs if available)
        if self.manus.is_available():
            try:
                # Enrich each issue with holistic guidance
                issues_final = await self.manus.enrich_issues(issues_final, issue_summaries)
                # Enrich each summary with holistic guidance
                issue_summaries = await self.manus.enrich_summaries(issue_summaries)
                # Add adjusted scores
                scores = await self.manus.adjust_scores(scores, issue_summaries)
                print("Generated Manus Synthesis: ", scores)
            except Exception:
                pass

        result = ScanResult(
            missing_properties=issues_final,
            terminology_mappings=terminology_final,
            issue_summaries=issue_summaries,
            scores=scores,
            timestamp=timestamp,
        )

        # 9. Create Report
        report_id = self.store.create_report(self.project_id, scores)

        # 10. Save Details
        self.store.save_missing_properties(report_id, result.missing_properties)
        self.store.save_terminology(report_id, result.terminology_mappings)
        self.store.save_summary(report_id, result.issue_summaries)

        return result


    def _calculate_scores(self, summaries: List[IssueSummary]) -> Dict[str, float]:
        """Calculate overall readiness and category scores."""
        total_checked = sum(s.checked_count for s in summaries)
        total_failed = sum(s.failed_count for s in summaries)
        overall_readiness = ((total_checked - total_failed) / total_checked) if total_checked > 0 else 1.0

        # Heuristic categorization for scores
        obj_rules = [s for s in summaries if "object" in s.rule_name.lower() or "type" in s.rule_name.lower()]
        pset_rules = [s for s in summaries if "property" in s.rule_name.lower() or "pset" in s.rule_name.lower()]
        naming_rules = [s for s in summaries if "name" in s.rule_name.lower() or "naming" in s.rule_name.lower()]

        def calc_score(sub_summaries: List[IssueSummary]) -> float:
            c = sum(s.checked_count for s in sub_summaries)
            f = sum(s.failed_count for s in sub_summaries)
            return ((c - f) / c) if c > 0 else 0.0

        return {
            "overall_readiness": round(overall_readiness, 2),
            "object_classification": round(calc_score(obj_rules), 2),
            "property_sets": round(calc_score(pset_rules), 2),
            "naming_conventions": round(calc_score(naming_rules), 2),
        }

    def _generate_terminology_map(self, issues: List[MissingProperty]) -> List[TerminologyMapping]:
        """Build terminology entries from INVALID_VALUE issues."""
        entries: List[TerminologyMapping] = []
        seen: set = set()

        for issue in issues:
            is_invalid = (issue.issue_type == "INVALID_VALUE" and issue.current and issue.expected)
            is_mismatch = (issue.issue_type == "TERMINOLOGY_MISMATCH" and issue.current)
            
            if is_invalid or is_mismatch:
                key = f"{issue.element_type}:{issue.property_key}:{issue.current}"
                if key in seen:
                    continue
                seen.add(key)
                canonical = f"{issue.property_set or ''}.{issue.property_key or ''}".strip(".")
                entries.append(
                    TerminologyMapping(
                        entry_id=f"term_{len(entries)+1:03d}",
                        scope="PROPERTY_VALUE",
                        element_type=issue.element_type,
                        ifc_guid=issue.ifc_guid,
                        original=str(issue.current),
                        canonical_key=canonical or None,
                        suggested_en=issue.suggested_value or issue.expected,
                        suggested_de=None,
                        confidence=0.5,
                    )
                )
        return entries

    def _generate_summary(
        self,
        issues: List[MissingProperty],
        rule_stats: Dict[str, Dict[str, int]],
    ) -> List[IssueSummary]:
        """Build summary from rule_stats and issues."""
        summaries: List[IssueSummary] = []
        # Count failures per rule from issues (AI may add to rules not in det stats)
        failed_by_rule: Dict[str, int] = {}
        for i in issues:
            failed_by_rule[i.rule_id] = failed_by_rule.get(i.rule_id, 0) + 1

        for rule in self.profile.rules:
            stats = rule_stats.get(rule.id, {"checked_count": 0, "failed_count": 0})
            checked = stats.get("checked_count", 0)
            failed = failed_by_rule.get(rule.id, 0)
            if checked == 0 and failed > 0:
                checked = failed
            if checked == 0:
                checked = 1
            pass_rate = (checked - failed) / checked

            summaries.append(
                IssueSummary(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    severity=rule.severity,
                    checked_count=checked,
                    failed_count=failed,
                    pass_rate=round(pass_rate, 2),
                    # note removed
                )
            )
        return summaries

