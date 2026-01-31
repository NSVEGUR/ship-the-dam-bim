"""
CSV parser for IFC-like data export.

Parses CSV files that have IFC-like columns (GlobalId, IfcType or type,
Pset_* properties) for use with the deterministic scanner.
"""

import pandas as pd
from typing import Optional

# Common column mappings: profile uses entity_type (e.g. IfcWall), property_set, property_name
# CSV may have: GlobalId, Name, type/IfcType, Level, ObjectType, Pset_WallCommon.FireRating, etc.


def parse_csv_for_scan(file_path: str) -> Optional[pd.DataFrame]:
    """
    Parse CSV with IFC-like structure for scanning.

    Expected columns (case-insensitive where applicable):
    - GlobalId (or globalId)
    - Name
    - type or IfcType (IFC entity type, e.g. IfcWall, IfcDoor)
    - Level (optional, building storey name)
    - ObjectType (optional)
    - Pset_<Name>.<PropertyName> or Pset_<Name>_<PropertyName> for properties

    Returns DataFrame with normalized columns: globalId, name, type, level, objectType, properties
    properties is a dict of {pset_name: {prop_name: value}}
    """
    try:
        df = pd.read_csv(file_path)
    except Exception:
        return None

    if df.empty:
        return None

    # Normalize column names
    cols_lower = {c.lower(): c for c in df.columns}

    # Required: some form of id and type
    id_col = cols_lower.get("globalid") or cols_lower.get("global_id")
    type_col = cols_lower.get("type") or cols_lower.get("ifctype") or cols_lower.get("entity_type")

    if not id_col or not type_col:
        return None

    # Build normalized frame
    result = df.copy()
    result["_globalId"] = result[id_col].astype(str)
    result["_type"] = result[type_col].astype(str)
    result["_name"] = result[cols_lower["name"]].astype(str) if cols_lower.get("name") else result["_globalId"]
    result["_level"] = result[cols_lower["level"]].astype(str) if cols_lower.get("level") else ""
    result["_objectType"] = result[cols_lower["objecttype"]].astype(str) if cols_lower.get("objecttype") else ""

    # Parse property columns: Pset_Name_Property or Pset_Name.Property
    properties_by_row = []
    for _, row in result.iterrows():
        props = {}
        for col in df.columns:
            if col.startswith("Pset_") or "Pset" in col:
                parts = col.replace(".", "_").split("_")
                if len(parts) >= 3:
                    # Pset_WallCommon_FireRating or similar
                    pset_name = "_".join(parts[:2])  # Pset_WallCommon
                    prop_name = "_".join(parts[2:])  # FireRating
                    val = row[col]
                    if pd.notna(val):
                        if pset_name not in props:
                            props[pset_name] = {}
                        props[pset_name][prop_name] = str(val)
        properties_by_row.append(props)

    result["_properties"] = properties_by_row
    return result


def get_entities_by_type(df: pd.DataFrame, entity_type: str) -> pd.DataFrame:
    """Filter DataFrame to rows matching entity_type (exact or subclass)."""
    if df is None or df.empty:
        return pd.DataFrame()
    # Simple exact match; for subclass support we'd need IFC hierarchy
    return df[df["_type"].str.upper() == entity_type.upper()]


def get_property_value(row: pd.Series, pset_name: str, prop_name: str) -> Optional[str]:
    """Get property value from a CSV row's _properties dict."""
    props = row.get("_properties", {})
    if pset_name in props and prop_name in props:
        return str(props[pset_name][prop_name])
    return None


def has_property(row: pd.Series, pset_name: str, prop_name: str) -> bool:
    """Check if row has the given property."""
    return get_property_value(row, pset_name, prop_name) is not None
