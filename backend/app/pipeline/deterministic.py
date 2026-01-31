"""
Deterministic scanning of IFC/CSV files against a profile.

Uses ifcOpenShell for IFC, pandas for CSV. Integrates bsdd for terminology
and allowed-values lookup when profile rules reference a dictionary URI.
"""

from typing import List, Optional, Tuple, Dict, Any
import ifcopenshell as ios

from app.pipeline.models import MissingProperty, Profile, ProfileRule, Severity, IssueType
from app.pipeline.csv_parser import (
    parse_csv_for_scan,
    get_entities_by_type,
    get_property_value,
    has_property,
)
from app.terminology.bsdd_client import get_allowed_values_for_property

# Rule stats: {rule_id: {checked_count, failed_count}}
RuleStats = Dict[str, Dict[str, int]]


def _get_level_ifc(entity: Any) -> Optional[str]:
    """Extract building storey name (level) for an IFC element."""
    try:
        import ifcopenshell.util.element as el_util

        container = el_util.get_container(entity, ifc_class="IfcBuildingStorey")
        if container and hasattr(container, "Name"):
            return container.Name
    except Exception:
        pass
    return None


def _get_object_type_ifc(entity: Any) -> Optional[str]:
    """Get ObjectType or PredefinedType from IFC element."""
    if hasattr(entity, "ObjectType") and entity.ObjectType:
        return entity.ObjectType
    try:
        import ifcopenshell.util.element as el_util

        pt = el_util.get_predefined_type(entity)
        if pt:
            return pt
    except Exception:
        pass
    return None


class DeterministicScanner:
    """Scan IFC files against a profile using ifcOpenShell."""

    def __init__(self, file_path: str):
        self.file_path = file_path
        try:
            self.model = ios.open(file_path)
        except Exception:
            self.model = None

    def scan(
        self,
        profile: Profile,
        user_approved_terminology: Optional[Dict[str, str]] = None,
    ) -> Tuple[List[MissingProperty], RuleStats]:
        """
        Scan IFC file against profile. Returns (missing_properties, rule_stats).
        user_approved_terminology: optional map of original -> canonical for terminology.
        """
        missing_properties: List[MissingProperty] = []
        rule_stats: RuleStats = {}

        if not self.model:
            return [
                MissingProperty(
                    rule_id="FATAL",
                    rule_name="File Load Error",
                    severity=Severity.BLOCKER,
                    ifc_guid="N/A",
                    element_type="File",
                    why_it_matters="Cannot scan an invalid IFC file.",
                )
            ], {"FATAL": {"checked_count": 0, "failed_count": 1}}

        for rule in profile.rules:
            rule_issues, checked, failed = self._check_rule(rule, user_approved_terminology)
            missing_properties.extend(rule_issues)
            rule_stats[rule.id] = {"checked_count": checked, "failed_count": failed}

        return missing_properties, rule_stats

    def _get_allowed_values(
        self,
        rule: ProfileRule,
    ) -> Optional[List[str]]:
        """Resolve allowed values from profile or BSDD."""
        if rule.allowed_values:
            return rule.allowed_values
        if rule.dictionary_uri and rule.property_name:
            vals = get_allowed_values_for_property(
                rule.dictionary_uri,
                rule.entity_type,
                rule.property_name,
            )
            if vals:
                return vals
        return None

    def _check_rule(
        self,
        rule: ProfileRule,
        user_approved_terminology: Optional[Dict[str, str]] = None,
    ) -> Tuple[List[MissingProperty], int, int]:
        """Check one rule. Returns (issues, checked_count, failed_count)."""
        issues: List[MissingProperty] = []
        entities = self.model.by_type(rule.entity_type)  # type: ignore
        checked = len(entities)
        failed = 0

        allowed_values = self._get_allowed_values(rule)

        for entity in entities:
            guid = getattr(entity, "GlobalId", None) or "N/A"
            name = getattr(entity, "Name", None)
            elem_type = entity.is_a()
            level = _get_level_ifc(entity)
            obj_type = _get_object_type_ifc(entity)

            def make_issue(
                issue_type: IssueType,
                expected: str,
                current: str,
                suggested: Optional[str] = None,
            ) -> MissingProperty:
                failed_inc = 1
                nonlocal failed
                failed += failed_inc
                return MissingProperty(
                    severity=rule.severity,
                    issue_type=issue_type,
                    rule_id=rule.id,
                    rule_name=rule.name,
                    ifc_guid=str(guid),
                    element_type=elem_type,
                    element_name=str(name) if name else None,
                    object_type=obj_type,
                    level=level,
                    property_set=rule.property_set,
                    property_key=rule.property_name,
                    expected=expected,
                    current=current,
                    suggested_value=suggested,
                    confidence=1.0,
                    why_it_matters=rule.description or "Required by profile.",
                )

            if rule.check_type == "PROPERTY_EXISTENCE":
                if not self._has_property(entity, rule.property_set, rule.property_name):
                    issues.append(
                        make_issue(
                            IssueType.MISSING_PROPERTY,
                            f"Property '{rule.property_name}' in Pset '{rule.property_set}'",
                            "Missing",
                        )
                    )

            elif rule.check_type == "PROPERTY_VALUE":
                val = self._get_property_value(entity, rule.property_set, rule.property_name)
                if val is None:
                    exp = f"Value in {allowed_values}" if allowed_values else "Property required"
                    issues.append(
                        make_issue(IssueType.MISSING_PROPERTY, exp, "Missing")
                    )
                else:
                    val_str = str(val)
                    # Apply user-approved terminology if provided
                    if user_approved_terminology and val_str in user_approved_terminology:
                        val_str = user_approved_terminology[val_str]
                    if allowed_values and val_str not in allowed_values:
                        sug = allowed_values[0] if allowed_values else None
                        issues.append(
                            make_issue(
                                IssueType.INVALID_VALUE,
                                f"One of {allowed_values}",
                                str(val),
                                sug,
                            )
                        )

            elif rule.check_type == "PROPERTY_NUMERIC_GT":
                val = self._get_property_value(entity, rule.property_set, rule.property_name)
                # If specific pset not found, try direct attribute (e.g. OverallHeight)
                if val is None and hasattr(entity, rule.property_name or ""):
                    val = getattr(entity, rule.property_name or "")

                if val is None:
                    issues.append(make_issue(IssueType.MISSING_PROPERTY, f"> {rule.min_value}", "Missing"))
                else:
                    try:
                        num_val = float(val)
                        if rule.min_value is not None and num_val <= rule.min_value:
                             issues.append(make_issue(
                                 IssueType.INVALID_VALUE,
                                 f"> {rule.min_value}",
                                 str(val)
                             ))
                    except (ValueError, TypeError):
                         issues.append(make_issue(IssueType.INVALID_VALUE, "Numeric", str(val)))

            elif rule.check_type in ("NAMING_NORMALIZATION", "TERMINOLOGY_DRIFT"):
                # Treat these as "Value Collection" rules.
                # If value matches allowed_values (if present), it's OK.
                # If no allow_values, we just collect it (maybe create INFO issue or TERMINOLOGY_MISMATCH).
                # Since user wants Terminology Mapping, we should treat non-allowed as TERMINOLOGY_MISMATCH.
                
                val = self._get_property_value(entity, rule.property_set, rule.property_name)
                # Fallback to direct attribute for Name, etc.
                if val is None:
                     if rule.property_name == "Name" and hasattr(entity, "Name"):
                         val = entity.Name
                     elif rule.property_name == "LongName" and hasattr(entity, "LongName"):
                         val = entity.LongName
                
                if val is not None:
                     val_str = str(val)
                     if allowed_values and val_str not in allowed_values:
                        issues.append(make_issue(
                            IssueType.TERMINOLOGY_MISMATCH,
                            "Consistent Term",
                            val_str
                        ))
                     elif not allowed_values:
                         # If no restrictions, log as mismatch to force into terminology map for review?
                         # Or maybe just INFO?
                         # User said "Terminology mapping is always none", implying they WANT to see things here.
                         pass # For now, only flag if violates allowed_values OR if it's explicitly TERMINOLOGY_DRIFT we might flag everything? 
                         # Actually, if no allowed values, we can't say it's wrong, but we can capture it for mapping.
                         # Let's create an issue so it flows to Orchestrator -> Terminology Map.
                         issues.append(make_issue(
                             IssueType.TERMINOLOGY_MISMATCH,
                             "Review",
                             val_str
                         ))

        return issues, checked, failed

    def _has_property(self, entity: Any, pset_name: Optional[str], prop_name: Optional[str]) -> bool:
        if not pset_name or not prop_name:
            return False
        for rel in getattr(entity, "IsDefinedBy", []):
            if rel.is_a("IfcRelDefinesByProperties"):
                pset = rel.RelatingPropertyDefinition
                if pset.is_a("IfcPropertySet") and pset.Name == pset_name:
                    for prop in pset.HasProperties:
                        if prop.Name == prop_name:
                            return True
        return False

    def _get_property_value(
        self,
        entity: Any,
        pset_name: Optional[str],
        prop_name: Optional[str],
    ) -> Optional[Any]:
        if not pset_name or not prop_name:
            return None
        for rel in getattr(entity, "IsDefinedBy", []):
            if rel.is_a("IfcRelDefinesByProperties"):
                pset = rel.RelatingPropertyDefinition
                if pset.is_a("IfcPropertySet") and pset.Name == pset_name:
                    for prop in pset.HasProperties:
                        if prop.Name == prop_name:
                            if hasattr(prop, "NominalValue"):
                                return prop.NominalValue.wrappedValue
        return None


class CsvDeterministicScanner:
    """Scan CSV (IFC-like export) against a profile using pandas."""

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.df = parse_csv_for_scan(file_path)

    def scan(
        self,
        profile: Profile,
        user_approved_terminology: Optional[Dict[str, str]] = None,
    ) -> Tuple[List[MissingProperty], RuleStats]:
        """Scan CSV against profile. Returns (missing_properties, rule_stats)."""
        missing_properties: List[MissingProperty] = []
        rule_stats: RuleStats = {}

        if self.df is None or self.df.empty:
            return [
                MissingProperty(
                    rule_id="FATAL",
                    rule_name="File Load Error",
                    severity=Severity.BLOCKER,
                    ifc_guid="N/A",
                    element_type="File",
                    why_it_matters="Cannot parse CSV file or file is empty.",
                )
            ], {"FATAL": {"checked_count": 0, "failed_count": 1}}

        for rule in profile.rules:
            rule_issues, checked, failed = self._check_rule(rule, user_approved_terminology)
            missing_properties.extend(rule_issues)
            rule_stats[rule.id] = {"checked_count": checked, "failed_count": failed}

        return missing_properties, rule_stats

    def _get_allowed_values(self, rule: ProfileRule) -> Optional[List[str]]:
        if rule.allowed_values:
            return rule.allowed_values
        if rule.dictionary_uri and rule.property_name:
            vals = get_allowed_values_for_property(
                rule.dictionary_uri,
                rule.entity_type,
                rule.property_name,
            )
            if vals:
                return vals
        return None

    def _check_rule(
        self,
        rule: ProfileRule,
        user_approved_terminology: Optional[Dict[str, str]] = None,
    ) -> Tuple[List[MissingProperty], int, int]:
        issues: List[MissingProperty] = []
        entities_df = get_entities_by_type(self.df, rule.entity_type)  # type: ignore
        checked = len(entities_df)
        failed = 0

        allowed_values = self._get_allowed_values(rule)

        for _, row in entities_df.iterrows():
            guid = row.get("_globalId", "N/A")
            name = row.get("_name", "")
            elem_type = row.get("_type", rule.entity_type) or "Unknown"
            level = row.get("_level") or ""
            obj_type = row.get("_objectType") or ""

            def make_issue(
                issue_type: IssueType,
                expected: str,
                current: str,
                suggested: Optional[str] = None,
            ) -> MissingProperty:
                nonlocal failed
                failed += 1
                return MissingProperty(
                    severity=rule.severity,
                    issue_type=issue_type,
                    rule_id=rule.id,
                    rule_name=rule.name,
                    ifc_guid=str(guid),
                    element_type=elem_type,
                    element_name=str(name) if name else None,
                    object_type=obj_type if obj_type else None,
                    level=str(level) if level else None,
                    property_set=rule.property_set,
                    property_key=rule.property_name,
                    expected=expected,
                    current=current,
                    suggested_value=suggested,
                    confidence=1.0,
                    why_it_matters=rule.description or "Required by profile.",
                )

            if rule.check_type == "PROPERTY_EXISTENCE":
                if not has_property(row, rule.property_set or "", rule.property_name or ""):
                    issues.append(
                        make_issue(
                            IssueType.MISSING_PROPERTY,
                            f"Property '{rule.property_name}' in Pset '{rule.property_set}'",
                            "Missing",
                        )
                    )

            elif rule.check_type == "PROPERTY_VALUE":
                val = get_property_value(row, rule.property_set or "", rule.property_name or "")
                if val is None:
                    exp = f"Value in {allowed_values}" if allowed_values else "Property required"
                    issues.append(make_issue(IssueType.MISSING_PROPERTY, exp, "Missing"))
                else:
                    val_str = str(val)
                    if user_approved_terminology and val_str in user_approved_terminology:
                        val_str = user_approved_terminology[val_str]
                    if allowed_values and val_str not in allowed_values:
                        suggested = allowed_values[0] if allowed_values else None
                        issues.append(
                            make_issue(
                                IssueType.INVALID_VALUE,
                                f"One of {allowed_values}",
                                str(val),
                                suggested=suggested,
                            )
                        )

        return issues, checked, failed


def create_deterministic_scanner(file_path: str):
    """Factory: return IFC or CSV scanner based on file extension."""
    lower = file_path.lower()
    if lower.endswith(".csv"):
        return CsvDeterministicScanner(file_path)
    return DeterministicScanner(file_path)
