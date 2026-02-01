"""
Manus Synthesis Layer - Per-Row Enrichment.

Provides holistic guidance for each MissingProperty and IssueSummary.
Always runs after base LLM reasoning (if MANUS_API_KEY is set).

Manus strengths:
✅ Contextual guidance per issue
✅ Cross-issue pattern recognition
✅ Risk-adjusted scoring
"""

import os
import httpx
import asyncio
import re
from typing import List, Dict, Optional, Any

from app.pipeline.models import MissingProperty, IssueSummary


class ManusSynthesis:
    """
    Manus AI Agent for per-row holistic enrichment.
    
    Adds holistic_guidance to each MissingProperty and IssueSummary,
    and provides adjusted scores based on cross-issue analysis.
    """
    
    def __init__(self):
        self.api_key = os.getenv("MANUS_API_KEY")
        self.base_url = "https://api.manus.im/v1"
        self._available = bool(self.api_key)
    
    def is_available(self) -> bool:
        return self._available
    
    async def enrich_issues(
        self,
        issues: List[MissingProperty],
        summaries: List[IssueSummary],
    ) -> List[MissingProperty]:
        """
        Add holistic_guidance to each MissingProperty.
        
        Uses cross-issue context for better guidance.
        """
        if not self._available or not issues:
            return issues
        
        # Build context from summaries
        context = self._build_context(summaries)
        
        # Batch issues (max 10 at a time to avoid token limits)
        batch_size = 10
        for i in range(0, len(issues), batch_size):
            batch = issues[i:i+batch_size]
            try:
                await self._enrich_issue_batch(batch, context)
            except Exception:
                pass
        
        return issues
    
    async def enrich_summaries(
        self,
        summaries: List[IssueSummary],
    ) -> List[IssueSummary]:
        """
        Add holistic_guidance to each IssueSummary.
        """
        if not self._available or not summaries:
            return summaries
        
        # Only enrich failed rules
        failed = [s for s in summaries if s.failed_count > 0]
        if not failed:
            return summaries
        
        try:
            await self._enrich_summary_batch(failed)
        except Exception:
            pass
        
        return summaries
    
    async def adjust_scores(
        self,
        scores: Dict[str, float],
        summaries: List[IssueSummary],
    ) -> Dict[str, float]:
        """
        Add adjusted_* scores based on holistic risk analysis.
        """
        if not self._available:
            return scores
        
        try:
            adjusted = await self._calculate_adjusted_scores(scores, summaries)
            # Merge adjusted scores into original dict
            for key, value in adjusted.items():
                scores[f"adjusted_{key}"] = value
        except Exception:
            pass
        
        return scores
    
    def _build_context(self, summaries: List[IssueSummary]) -> str:
        """Build context string from summaries."""
        lines = []
        for s in summaries:
            if s.failed_count > 0:
                lines.append(f"- {s.rule_name} ({s.severity}): {s.failed_count} failures")
        return "\n".join(lines) if lines else "No failures detected"
    
    async def _enrich_issue_batch(
        self,
        batch: List[MissingProperty],
        context: str,
    ) -> None:
        """Enrich a batch of issues with holistic guidance."""
        items = []
        for i, issue in enumerate(batch):
            # Include base LLM findings for deeper Manus synthesis
            llm_context = f"LLM Findings: {issue.what_is_wrong or 'N/A'}"
            items.append(
                f"{i+1}. {issue.element_type} | {issue.property_key or 'N/A'} | "
                f"Current: {issue.current or 'Missing'} | Rule: {issue.rule_name}\n"
                f"   > {llm_context}"
            )
        
        prompt = f"""You are an elite BIM Strategist. Provide deep, non-obvious holistic guidance for each issue.

## Project Context
{context}

## Issues to Review (with base LLM insights)
{chr(10).join(items)}

## Your Task
For each numbered issue, provide one paragraph of **Rich Text Markdown** guidance. 
DO NOT simply repeat what the base LLM said. Instead, provide:
- **Systematic Impact**: How this failure affects other disciplines (Structural, MEP, etc.)
- **BIM Protocol Context**: Why this specific data point is critical for the project lifecycle (COBie, FM, etc.)
- **Fix Strategy**: A sophisticated recommendation for the design team.

### Format Requirement
Use exactly this format for each item:
NUMBER. [Guidance in Markdown]

Example:
1. **Systematic Risk**: This missing FireRating blocks automated egress simulation. Without this data, the structural model cannot be finalized for life-safety approval. **Recommendation**: Cross-check the architectural door schedule with the wall fire-separation partitions."""

        text = await self._invoke_manus(prompt)
        self._parse_issue_guidance(batch, text)
    
    async def _enrich_summary_batch(self, summaries: List[IssueSummary]) -> None:
        """Enrich summaries with holistic guidance."""
        items = []
        for i, s in enumerate(summaries):
            items.append(
                f"{i+1}. Rule: {s.rule_name} | {s.failed_count} failures | Severity: {s.severity}\n"
                f"   > Base Analysis: {s.what_is_wrong or 'N/A'}"
            )
        
        prompt = f"""You are an elite BIM Evaluator. Provide a strategic, high-level holistic assessment for each failed rule.

## Failed Rules Summary
{chr(10).join(items)}

## Your Task
For each numbered rule, provide one paragraph of **Rich Text Markdown** guidance.
Provide deeper insights than the base analysis. Focus on:
- **Root Cause Pattern**: Is this a systematic export error or a modeling discipline issue?
- **Holistic Stakeholder Impact**: Who needs to be informed (Owner, GC, Sub)?
- **Strategic Fix**: What process change is needed to prevent this in the next upload?

### Format Requirement
Use exactly this format:
NUMBER. [Guidance in Markdown]

Example:
1. **Process Gap Detected**: The 100% failure rate indicates a systemic export mapping error in Revit. GC should verify the shared parameter mapping file before the next model drop to avoid downstream cost estimation errors."""

        text = await self._invoke_manus(prompt)
        self._parse_summary_guidance(summaries, text)
    
    async def _calculate_adjusted_scores(
        self,
        scores: Dict[str, float],
        summaries: List[IssueSummary],
    ) -> Dict[str, float]:
        """Calculate risk-adjusted scores."""
        blocker_count = sum(1 for s in summaries if s.severity == "BLOCKER" and s.failed_count > 0)
        major_count = sum(1 for s in summaries if s.severity == "MAJOR" and s.failed_count > 0)
        
        prompt = f"""You are a BIM risk analyst. Adjust readiness scores based on severity.

## Current Scores
{chr(10).join(f"- {k}: {v*100:.1f}%" for k, v in scores.items())}

## Risk Factors
- BLOCKER rules failed: {blocker_count}
- MAJOR rules failed: {major_count}

Provide adjusted scores (0.0-1.0) considering:
- Any BLOCKER should significantly reduce overall_readiness
- Multiple MAJOR issues compound risk

Format: score_name: adjusted_value
Example:
overall_readiness: 0.45
object_classification: 0.80"""

        text = await self._invoke_manus(prompt)
        return self._parse_adjusted_scores(text, scores)
    
    def _parse_issue_guidance(self, batch: List[MissingProperty], text: str) -> None:
        """Parse numbered guidance into issues using regex for robustness."""
        # Look for patterns like "1. Guidance" or "1) Guidance"
        pattern = re.compile(r"^(\d+)[.)]\s*(.*)", re.MULTILINE | re.DOTALL)
        
        # Split by potential items (Digit followed by dot/paren at start of line)
        parts = re.split(r"^(\d+)[.)]\s*", text, flags=re.MULTILINE)
        
        # re.split with capturing group returns [prefix, group1, content1, group2, content2, ...]
        # prefix is usually empty if it starts with 1.
        for i in range(1, len(parts), 2):
            try:
                idx = int(parts[i]) - 1
                guidance = parts[i+1].strip()
                if 0 <= idx < len(batch) and guidance:
                    # Clean up trailing numbers from next item if any
                    guidance = re.split(r"\n\d+[.)]", guidance)[0].strip()
                    batch[idx].holistic_guidance = guidance
            except (ValueError, IndexError):
                continue
    
    def _parse_summary_guidance(self, summaries: List[IssueSummary], text: str) -> None:
        """Parse numbered guidance into summaries using regex for robustness."""
        parts = re.split(r"^(\d+)[.)]\s*", text, flags=re.MULTILINE)
        
        for i in range(1, len(parts), 2):
            try:
                idx = int(parts[i]) - 1
                guidance = parts[i+1].strip()
                if 0 <= idx < len(summaries) and guidance:
                    # Clean up
                    guidance = re.split(r"\n\d+[.)]", guidance)[0].strip()
                    summaries[idx].holistic_guidance = guidance
            except (ValueError, IndexError):
                continue
    
    def _parse_adjusted_scores(self, text: str, original: Dict[str, float]) -> Dict[str, float]:
        """Parse adjusted scores from Manus response."""
        adjusted = {}
        for line in text.strip().split("\n"):
            if ":" not in line:
                continue
            key, value = line.split(":", 1)
            key = key.strip().lower().replace(" ", "_")
            try:
                val = float(value.strip())
                if 0 <= val <= 1 and key in original:
                    adjusted[key] = val
            except ValueError:
                continue
        return adjusted
    
    async def _invoke_manus(self, prompt: str) -> str:
        """Call Manus API."""
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{self.base_url}/tasks",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "prompt": prompt,
                    "mode": "instant",
                },
            )
            resp.raise_for_status()
            data = resp.json()
            
            if "result" in data:
                return data["result"]
            
            task_id = data.get("task_id")
            if task_id:
                return await self._poll_task(client, task_id)
            
            return str(data)
    
    async def _poll_task(self, client: httpx.AsyncClient, task_id: str) -> str:
        """Poll task until completion."""
        for _ in range(60):
            resp = await client.get(
                f"{self.base_url}/tasks/{task_id}",
                headers={"Authorization": f"Bearer {self.api_key}"},
            )
            resp.raise_for_status()
            data = resp.json()
            
            if data.get("status") == "completed":
                return data.get("result", "")
            elif data.get("status") == "failed":
                raise RuntimeError(f"Manus task failed: {data.get('error')}")
            
            await asyncio.sleep(2)
        
        raise TimeoutError("Manus task timed out")
