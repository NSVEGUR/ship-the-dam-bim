from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Literal, Dict
from enum import Enum

class Severity(str, Enum):
    BLOCKER = "BLOCKER"
    CRITICAL = "CRITICAL"
    MAJOR = "MAJOR"
    MINOR = "MINOR"
    INFO = "INFO"

class IssueType(str, Enum):
    MISSING_PROPERTY = "MISSING_PROPERTY"
    INVALID_VALUE = "INVALID_VALUE"
    TERMINOLOGY_MISMATCH = "TERMINOLOGY_MISMATCH"
    GEOMETRY_ERROR = "GEOMETRY_ERROR"
    UNKNOWN = "UNKNOWN"

class MissingProperty(BaseModel):
    """
    Represents a single missing property/issue found during scanning (matching missing_properties table).
    """
    severity: Severity = Severity.MAJOR
    issue_type: IssueType = IssueType.UNKNOWN
    rule_id: str
    rule_name: str
    ifc_guid: str = Field(..., description="GlobalId of the element")
    element_type: str
    element_name: Optional[str] = None
    object_type: Optional[str] = None
    level: Optional[str] = None
    property_set: Optional[str] = None
    property_key: Optional[str] = None
    expected: Optional[str] = None
    current: Optional[Any] = None
    suggested_value: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    why_it_matters: Optional[str] = None

    model_config = ConfigDict(use_enum_values=True)

class TerminologyStatus(str, Enum):
    PROPOSED = "PROPOSED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"

class TerminologyMapping(BaseModel):
    """
    Represents a terminology mismatch (matching terminology_mapping.csv).
    """
    entry_id: str
    scope: str = "PROPERTY_VALUE"
    element_type: Optional[str] = None
    ifc_guid: Optional[str] = None
    original: str
    canonical_key: Optional[str] = None
    suggested_en: Optional[str] = None
    suggested_de: Optional[str] = None
    confidence: float = 1.0
    status: TerminologyStatus = TerminologyStatus.PROPOSED


class IssueSummary(BaseModel):
    rule_id: str
    rule_name: str
    severity: Severity
    checked_count: int = 0
    failed_count: int = 0
    pass_rate: float = 0.0
    note: Optional[str] = None

class ProfileRule(BaseModel):
    id: str
    name: str
    check_type: Literal[
        "PROPERTY_EXISTENCE",
        "PROPERTY_VALUE",
        "CUSTOM",
        "NAMING_NORMALIZATION",
        "TERMINOLOGY_DRIFT",
        "PROPERTY_NUMERIC_GT",
    ]
    severity: Severity = Severity.BLOCKER
    # Parameters for the check
    entity_type: str
    property_set: Optional[str] = None
    property_name: Optional[str] = None
    allowed_values: Optional[List[str]] = None
    min_value: Optional[float] = None
    regex: Optional[str] = None
    description: Optional[str] = None
    # BSDD dictionary URI for terminology/allowed-values lookup (e.g. buildingSMART IFC)
    dictionary_uri: Optional[str] = None

class Profile(BaseModel):
    name: str
    version: str
    rules: List[ProfileRule]


class Guidance(BaseModel):
    id: Optional[int] = None
    what_is_wrong: str
    why_it_matters: str
    where_to_fix_it: str

class ScanResult(BaseModel):
    missing_properties: List[MissingProperty] = []
    terminology_mappings: List[TerminologyMapping] = []
    issue_summaries: List[IssueSummary] = []
    guidances: List[Guidance] = []
    scores: Optional[Dict[str, float]] = None
    timestamp: str
