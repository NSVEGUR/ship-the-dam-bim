"""
IFC Fixer: Apply suggested fixes to IFC files using ifcopenshell.

Takes missing_properties and terminology_mappings from scan results
and applies the suggested values to create a corrected IFC file.
"""

import os
import tempfile
from typing import List, Optional, Dict, Any

import ifcopenshell
import ifcopenshell.api
import ifcopenshell.util.element as element_util

from app.pipeline.models import MissingProperty, TerminologyMapping


def _find_element_by_guid(ifc_file, guid: str):
    """Find an IFC element by its GlobalId."""
    try:
        return ifc_file.by_guid(guid)
    except Exception:
        return None


def _get_or_create_pset(ifc_file, element, pset_name: str):
    """Get existing property set or create a new one."""
    # Check existing psets
    psets = element_util.get_psets(element)
    if pset_name in psets:
        # Find the actual pset entity
        for rel in getattr(element, "IsDefinedBy", []):
            if rel.is_a("IfcRelDefinesByProperties"):
                prop_def = rel.RelatingPropertyDefinition
                if prop_def.is_a("IfcPropertySet") and prop_def.Name == pset_name:
                    return prop_def
    
    # Create new pset
    try:
        pset = ifcopenshell.api.run(
            "pset.add_pset",
            ifc_file,
            product=element,
            name=pset_name,
        )
        return pset
    except Exception:
        return None


def _set_property_value(ifc_file, pset, property_name: str, value: str):
    """Set a property value in a property set."""
    try:
        ifcopenshell.api.run(
            "pset.edit_pset",
            ifc_file,
            pset=pset,
            properties={property_name: value},
        )
        return True
    except Exception:
        return False


def _set_direct_attribute(ifc_file, element, attr_name: str, value: str):
    """Set a direct attribute on an IFC element (Name, Description, etc.)."""
    try:
        ifcopenshell.api.run(
            "attribute.edit_attributes",
            ifc_file,
            product=element,
            attributes={attr_name: value},
        )
        return True
    except Exception:
        # Fallback: direct assignment
        try:
            setattr(element, attr_name, value)
            return True
        except Exception:
            return False


# Direct attributes that can be edited without property sets
DIRECT_ATTRS = {"Name", "LongName", "Description", "ObjectType", "Tag"}


def apply_fixes(
    ifc_path: str,
    missing_properties: List[MissingProperty],
    terminology_mappings: List[TerminologyMapping],
) -> bytes:
    """
    Apply suggested fixes to an IFC file and return the modified content.
    
    Args:
        ifc_path: Path to the original IFC file
        missing_properties: List of issues with suggested_value to apply
        terminology_mappings: List of terminology with suggested_en/suggested_de
        
    Returns:
        bytes: The modified IFC file content
    """
    # Open the IFC file
    ifc_file = ifcopenshell.open(ifc_path)
    applied_count = 0
    
    # ---------- Phase 1: Apply missing property fixes ----------
    for issue in missing_properties:
        if not issue.suggested_value:
            continue
        
        element = _find_element_by_guid(ifc_file, issue.ifc_guid)
        if not element:
            continue
        
        property_key = issue.property_key or ""
        
        # Check if it's a direct attribute
        if property_key in DIRECT_ATTRS:
            if _set_direct_attribute(ifc_file, element, property_key, issue.suggested_value):
                applied_count += 1
            continue
        
        # Otherwise, it's a property in a property set
        pset_name = issue.property_set
        if not pset_name:
            # Default pset naming convention
            entity_type = element.is_a()
            pset_name = f"Pset_{entity_type.replace('Ifc', '')}Common"
        
        pset = _get_or_create_pset(ifc_file, element, pset_name)
        if pset and property_key:
            if _set_property_value(ifc_file, pset, property_key, issue.suggested_value):
                applied_count += 1
    
    # ---------- Phase 2: Apply terminology mappings ----------
    for term in terminology_mappings:
        if not term.ifc_guid:
            continue
        
        element = _find_element_by_guid(ifc_file, term.ifc_guid)
        if not element:
            continue
        
        suggested_value = term.suggested_de
        
        if not suggested_value:
            continue
        
        # Determine what to update based on scope
        scope = term.scope or "PROPERTY_VALUE"
        
        if scope in ("NAME", "ELEMENT_NAME"):
            if _set_direct_attribute(ifc_file, element, "Name", suggested_value):
                applied_count += 1
        elif scope == "LONG_NAME":
            if _set_direct_attribute(ifc_file, element, "LongName", suggested_value):
                applied_count += 1
        elif scope == "OBJECT_TYPE":
            if _set_direct_attribute(ifc_file, element, "ObjectType", suggested_value):
                applied_count += 1
        elif scope == "PROPERTY_VALUE" and term.canonical_key:
            # Try to find and update the property
            # canonical_key format might be "PsetName.PropertyName" or just "PropertyName"
            parts = term.canonical_key.split(".", 1)
            if len(parts) == 2:
                pset_name, prop_name = parts
            else:
                prop_name = parts[0]
                entity_type = element.is_a()
                pset_name = f"Pset_{entity_type.replace('Ifc', '')}Common"
            
            pset = _get_or_create_pset(ifc_file, element, pset_name)
            if pset:
                if _set_property_value(ifc_file, pset, prop_name, suggested_value):
                    applied_count += 1
    
    # ---------- Write to temp file and read bytes ----------
    with tempfile.NamedTemporaryFile(delete=False, suffix=".ifc") as tmp:
        tmp_output_path = tmp.name
    
    try:
        ifc_file.write(tmp_output_path)
        with open(tmp_output_path, "rb") as f:
            return f.read()
    finally:
        try:
            os.unlink(tmp_output_path)
        except Exception:
            pass


def apply_fixes_from_scan_result(
    ifc_path: str,
    scan_result: Dict[str, Any],
) -> bytes:
    """
    Convenience function to apply fixes from a scan result dict.
    
    Args:
        ifc_path: Path to the original IFC file
        scan_result: The scan result containing missing_properties and terminology
        
    Returns:
        bytes: The modified IFC file content
    """
    # Parse missing_properties
    missing_props = []
    for mp in scan_result.get("missing_properties", []):
        if isinstance(mp, dict):
            missing_props.append(MissingProperty(**mp))
        elif isinstance(mp, MissingProperty):
            missing_props.append(mp)
    
    # Parse terminology
    terminology = []
    for t in scan_result.get("terminology", []):
        if isinstance(t, dict):
            terminology.append(TerminologyMapping(**t))
        elif isinstance(t, TerminologyMapping):
            terminology.append(t)
    
    return apply_fixes(ifc_path, missing_props, terminology)
