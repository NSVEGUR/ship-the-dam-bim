"""
Profile storage: in-memory local profiles and optional profile_id lookup.

Preloads default profiles; API can resolve profile_id to Profile object.
"""

from typing import Dict, Optional

from app.pipeline.models import Profile, ProfileRule, Severity


# Default profiles for local storage
DEFAULT_PROFILES: Dict[str, dict] = {
    "default_safety": {
        "name": "Default Safety Profile",
        "version": "1.0",
        "rules": [

            # --------------------
            # IFCDOOR
            # --------------------
            {
                "id": "DE-D01",
                "name": "Doors: FireRating required",
                "check_type": "PROPERTY_EXISTENCE",
                "entity_type": "IfcDoor",
                "property_set": "Pset_DoorCommon",
                "property_name": "FireRating",
                "allowed_values": ["EI30", "EI60", "EI90", "F30", "F60", "F90"],
                "severity": "BLOCKER",
                "description": "Required for submission QA; missing fire rating often causes rejection.",
            },
            {
                "id": "DE-D02",
                "name": "Doors: Height required",
                "check_type": "PROPERTY_NUMERIC_GT",
                "entity_type": "IfcDoor",
                "property_set": None,
                "property_name": "OverallHeight",
                "min_value": 0,
                "severity": "BLOCKER",
                "description": "Dimensional data required for accurate scheduling and fabrication.",
            },
            {
                "id": "DE-D03",
                "name": "Doors: Width required",
                "check_type": "PROPERTY_NUMERIC_GT",
                "entity_type": "IfcDoor",
                "property_set": None,
                "property_name": "OverallWidth",
                "min_value": 0,
                "severity": "BLOCKER",
                "description": "Dimensional data required for accurate scheduling and fabrication.",
            },
            {
                "id": "DE-D04",
                "name": "Doors: Name consistency",
                "check_type": "NAMING_NORMALIZATION",
                "entity_type": "IfcDoor",
                "property_set": None,
                "property_name": "Name",
                "severity": "MINOR",
                "description": "Consistent naming improves schedule accuracy and reduces manual cleanup.",
            },

            # --------------------
            # IFCSPACE
            # --------------------
            {
                "id": "DE-S01",
                "name": "Spaces: Room name required",
                "check_type": "PROPERTY_EXISTENCE",
                "entity_type": "IfcSpace",
                "property_set": None,
                "property_name": "LongName",
                "severity": "BLOCKER",
                "description": "Room names are essential for facility management and wayfinding.",
            },
            {
                "id": "DE-S02",
                "name": "Spaces: Room number required",
                "check_type": "PROPERTY_EXISTENCE",
                "entity_type": "IfcSpace",
                "property_set": "Pset_SpaceCommon",
                "property_name": "Reference",
                "severity": "BLOCKER",
                "description": "Room numbers are critical for navigation, maintenance, and asset tracking.",
            },
            {
                "id": "DE-S03",
                "name": "Spaces: Usage type required",
                "check_type": "PROPERTY_VALUE",
                "entity_type": "IfcSpace",
                "property_set": "Pset_SpaceCommon",
                "property_name": "OccupancyType",
                "allowed_values": [
                    "Office", "Corridor", "Meeting", "WC", "Storage",
                    "Büro", "Flur", "Besprechungsraum", "Lager"
                ],
                "severity": "BLOCKER",
                "description": "Usage classification is required for code compliance and space planning.",
            },
            {
                "id": "DE-S04",
                "name": "Spaces: Terminology consistency",
                "check_type": "TERMINOLOGY_DRIFT",
                "entity_type": "IfcSpace",
                "property_set": None,
                "property_name": "LongName",
                "severity": "MINOR",
                "description": "Inconsistent terminology causes confusion and requires manual normalization.",
            },

            # --------------------
            # IFCWALL
            # --------------------
            {
                "id": "DE-W01",
                "name": "Walls: Load-bearing info",
                "check_type": "PROPERTY_VALUE",
                "entity_type": "IfcWall",
                "property_set": "Pset_WallCommon",
                "property_name": "LoadBearing",
                "allowed_values": ["TRUE", "FALSE", "True", "False", "Yes", "No", "true", "false"],
                "severity": "MINOR",
                "description": "Structural classification is important for renovation planning and safety.",
            },
            {
                "id": "DE-W02",
                "name": "Walls: Material required",
                "check_type": "PROPERTY_EXISTENCE",
                "entity_type": "IfcWall",
                "property_set": None,
                "property_name": "Material",
                "severity": "MINOR",
                "description": "Material data is required for quantity takeoffs and sustainability reporting.",
            },
            {
                "id": "DE-W03",
                "name": "Walls: Name consistency",
                "check_type": "NAMING_NORMALIZATION",
                "entity_type": "IfcWall",
                "property_set": None,
                "property_name": "Name",
                "severity": "MINOR",
                "description": "Consistent naming improves filtering and reduces export errors.",
            },
        ],
    }
}


_profile_store: Dict[str, Profile] = {}


def _ensure_loaded() -> None:
    """Load default profiles into store."""
    if _profile_store:
        return
    for pid, data in DEFAULT_PROFILES.items():
        _profile_store[pid] = Profile(**data)


def get_profile(profile_id: str) -> Optional[Profile]:
    """Resolve profile_id to Profile object."""
    _ensure_loaded()
    return _profile_store.get(profile_id)


def list_profiles() -> Dict[str, str]:
    """Return profile_id -> name mapping."""
    _ensure_loaded()
    return {pid: p.name for pid, p in _profile_store.items()}


def add_profile(profile_id: str, profile: Profile) -> None:
    """Add or overwrite a profile in local storage."""
    _ensure_loaded()
    _profile_store[profile_id] = profile
