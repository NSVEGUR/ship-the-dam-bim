import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.storage.supabase_client import get_supabase
from app.pipeline.models import ScanResult, TerminologyMapping, MissingProperty, IssueSummary, Guidance

class SupabaseStorage:
    def __init__(self):
        self.client = get_supabase()

    def create_report(self, project_id: int, content: Dict[str, Any]) -> int:
        """
        Creates a new report entry and returns the report_id.
        """
        data = {
            "project_id": project_id,
            "content": content,
            # created_at is default now()
        }
        response = self.client.table("reports").insert(data).execute()
        if response.data:
            return response.data[0]["report_id"]
        raise Exception("Failed to create report")

    def save_missing_properties(self, report_id: int, missing_properties: List[MissingProperty]):
        """
        Batch save issues to missing_properties table.
        Maps 'severity' to 'serverity' as per schema.
        """
        if not missing_properties:
            return

        # Prepare batch data
        batch_data = []
        for prop in missing_properties:
            batch_data.append({
                "report_id": report_id,
                "serverity": prop.severity,  # Typo in schema
                "issue_type": prop.issue_type,
                "rule_id": prop.rule_id,
                "rule_name": prop.rule_name,
                "ifc_guid": prop.ifc_guid,
                "element_type": prop.element_type,
                "element_name": prop.element_name,
                "object_type": prop.object_type,
                "level": prop.level,
                "property_set": prop.property_set,
                "property_key": prop.property_key,
                "expected": prop.expected,
                "current": str(prop.current) if prop.current is not None else None,
                "suggested_value": prop.suggested_value,
                "confidence": prop.confidence,
                "why_it_matters": prop.why_it_matters,
            })
        
        # Insert in chunks of 1000 to avoid request size limits
        chunk_size = 1000
        for i in range(0, len(batch_data), chunk_size):
            self.client.table("missing_properties").insert(batch_data[i:i+chunk_size]).execute()

    def save_terminology(self, report_id: int, entries: List[TerminologyMapping]):
        """
        Batch save terminology to terminology_mappings table.
        """
        if not entries:
            return

        batch_data = []
        for term in entries:
            batch_data.append({
                "report_id": report_id,
                "entry_id": term.entry_id,
                "scope": term.scope,
                "element_type": term.element_type,
                "ifc_guid": term.ifc_guid,
                "original": term.original,
                "canonical_key": term.canonical_key,
                "suggested_en": term.suggested_en,
                "suggested_de": term.suggested_de,
                "confidence": term.confidence,
                "status": term.status,
            })
        
        chunk_size = 1000
        for i in range(0, len(batch_data), chunk_size):
            self.client.table("terminology_mappings").insert(batch_data[i:i+chunk_size]).execute()

    def save_summary(self, report_id: int, summaries: List[IssueSummary]):
        """
        Batch save scan summary to issue_summaries table.
        """
        if not summaries:
            return

        batch_data = []
        for s in summaries:
            batch_data.append({
                "report_id": report_id,
                "rule_id": s.rule_id,
                "rule_name": s.rule_name,
                "severity": s.severity,
                "checked_count": s.checked_count,
                "failed_count": s.failed_count,
                "pass_rate": s.pass_rate,
                "note": s.note, # Changed notes to note in model
            })
        
        self.client.table("issue_summaries").insert(batch_data).execute()

    def save_guidances(self, report_id: int, guidances: List[Guidance]):
        """
        Batch save guidances to guidances table.
        """
        if not guidances:
            return

        batch_data = []
        for g in guidances:
            batch_data.append({
                "report_id": report_id,
                "what_is_wrong": g.what_is_wrong,
                "why_it_matters": g.why_it_matters,
                "where_to_fix_it": g.where_to_fix_it,
                # created_at default now()
            })
        
        self.client.table("guidances").insert(batch_data).execute()

    def get_latest_report_terminology(self, project_id: int) -> Dict[str, str] | None:
        """
        Fetch terminology from the most recent report for this project.
        Returns: Dict[original_value, suggested_value]
        """
        # 1. Get latest report_id
        # Supabase API: order by created_at desc, limit 1
        reports = self.client.table("reports")\
            .select("report_id")\
            .eq("project_id", project_id)\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()

        if not reports.data:
            return None

        latest_report_id = reports.data[0]["report_id"]

        # 2. Get accepted/suggested terms from terminology_mappings
        terms = self.client.table("terminology_mappings")\
            .select("original, suggested_en")\
            .eq("report_id", latest_report_id)\
            .execute()
        
        mapping = {}
        for t in terms.data:
            if t.get("original") and t.get("suggested_en"):
                mapping[t["original"]] = t["suggested_en"]
        
        return mapping
