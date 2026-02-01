import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.storage.supabase_client import get_supabase
from app.pipeline.models import ScanResult, TerminologyMapping, MissingProperty, IssueSummary

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
                "what_is_wrong": prop.what_is_wrong,
                "where_to_fix_it": prop.where_to_fix_it,
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
                "pass_rate": s.pass_rate,
                "what_is_wrong": s.what_is_wrong,
                "why_it_matters": s.why_it_matters,
                "where_to_fix_it": s.where_to_fix_it,
            })
        
        self.client.table("issue_summaries").insert(batch_data).execute()



    def get_latest_report_id(self, project_id: int) -> Optional[int]:
        """Get the latest report_id for a project."""
        reports = self.client.table("reports")\
            .select("report_id")\
            .eq("project_id", project_id)\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        if reports.data:
            return reports.data[0]["report_id"]
        return None

    def get_missing_properties_by_report(self, report_id: int) -> List[MissingProperty]:
        """Fetch all missing_properties for a report."""
        result = self.client.table("missing_properties")\
            .select("*")\
            .eq("report_id", report_id)\
            .execute()
        
        properties = []
        for row in result.data:
            try:
                properties.append(MissingProperty(
                    severity=row.get("serverity", "MAJOR"),  # Note: typo in DB schema
                    issue_type=row.get("issue_type", "UNKNOWN"),
                    rule_id=row.get("rule_id", ""),
                    rule_name=row.get("rule_name", ""),
                    ifc_guid=row.get("ifc_guid", ""),
                    element_type=row.get("element_type", ""),
                    element_name=row.get("element_name"),
                    object_type=row.get("object_type"),
                    level=row.get("level"),
                    property_set=row.get("property_set"),
                    property_key=row.get("property_key"),
                    expected=row.get("expected"),
                    current=row.get("current"),
                    suggested_value=row.get("suggested_value"),
                    confidence=row.get("confidence", 1.0),
                    why_it_matters=row.get("why_it_matters"),
                    what_is_wrong=row.get("what_is_wrong"),
                    where_to_fix_it=row.get("where_to_fix_it"),
                ))
            except Exception:
                pass  # Skip invalid rows
        return properties

    def get_terminology_by_report(self, report_id: int) -> List[TerminologyMapping]:
        """Fetch all terminology_mappings for a report."""
        result = self.client.table("terminology_mappings")\
            .select("*")\
            .eq("report_id", report_id)\
            .execute()
        
        mappings = []
        for row in result.data:
            try:
                mappings.append(TerminologyMapping(
                    entry_id=row.get("entry_id", ""),
                    scope=row.get("scope", "PROPERTY_VALUE"),
                    element_type=row.get("element_type"),
                    ifc_guid=row.get("ifc_guid"),
                    original=row.get("original", ""),
                    canonical_key=row.get("canonical_key"),
                    suggested_en=row.get("suggested_en"),
                    suggested_de=row.get("suggested_de"),
                    confidence=row.get("confidence", 1.0),
                    status=row.get("status", "PROPOSED"),
                ))
            except Exception:
                pass  # Skip invalid rows
        return mappings

    def get_latest_report_terminology(self, project_id: int) -> Dict[str, str] | None:
        """
        Fetch terminology from the most recent report for this project.
        Returns: Dict[original_value, suggested_value]
        """
        latest_report_id = self.get_latest_report_id(project_id)
        if not latest_report_id:
            return None

        # Get accepted/suggested terms from terminology_mappings
        terms = self.client.table("terminology_mappings")\
            .select("original, suggested_en")\
            .eq("report_id", latest_report_id)\
            .execute()
        
        mapping = {}
        for t in terms.data:
            if t.get("original") and t.get("suggested_en"):
                mapping[t["original"]] = t["suggested_en"]
        
        return mapping
