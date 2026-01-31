"""
BSDD (buildingSMART Data Dictionary) client wrapper for deterministic terminology and classification.

Uses the bsdd Python package to lookup allowed values, classifications, and terminology
from the buildingSMART Data Dictionary. Falls back to profile allowed_values when offline.
See: https://docs.ifcopenshell.org/bsdd.html
"""

from typing import Any, Optional

# Optional import - bsdd requires network; fallback when unavailable
try:
    from bsdd import Client, apply_ifc_classification_properties

    BSDD_AVAILABLE = True
except ImportError:
    BSDD_AVAILABLE = False
    Client = None  # type: ignore
    apply_ifc_classification_properties = None  # type: ignore


def get_bsdd_client() -> Optional[Any]:
    """Return a BSDD Client instance if available, else None."""
    if BSDD_AVAILABLE and Client is not None:
        try:
            return Client()
        except Exception:
            return None
    return None


def get_allowed_values_for_property(
    dictionary_uri: str,
    entity_type: str,
    property_name: str,
) -> Optional[list[str]]:
    """
    Lookup allowed values for a property from BSDD.

    Returns list of allowed values if found, else None (use profile allowed_values).
    """
    client = get_bsdd_client()
    if client is None:
        return None

    try:
        results = client.search_in_dictionary(
            dictionary_uri,
            related_ifc_entity=entity_type,
        )
        if not results:
            return None

        # Search for property in class properties
        for item in results if isinstance(results, list) else [results]:
            class_data = client.get_class(item.get("uri", item)) if isinstance(item, dict) else None
            if class_data and "classProperties" in class_data:
                for prop in class_data["classProperties"]:
                    if prop.get("name") == property_name:
                        # Extract allowed values if present
                        if "allowedValues" in prop:
                            return [av.get("value", str(av)) for av in prop["allowedValues"]]
                        if "dataType" in prop and prop.get("predefinedValue"):
                            return [prop["predefinedValue"]]
        return None
    except Exception:
        return None


def search_classifications(
    search_text: str,
    dictionary_uris: str | list[str],
    related_ifc_entities: list[str],
) -> list[dict[str, Any]]:
    """
    Search classifications in BSDD by text and IFC entity filter.

    Returns list of matching class info dicts.
    """
    client = get_bsdd_client()
    if client is None:
        return []

    try:
        uris = dictionary_uris if isinstance(dictionary_uris, list) else [dictionary_uris]
        results = client.search_class(
            search_text=search_text,
            dictionary_uris=uris,
            related_ifc_entities=related_ifc_entities,
        )
        return results if isinstance(results, list) else [results] if results else []
    except Exception:
        return []


def get_class_details(class_uri: str) -> Optional[dict[str, Any]]:
    """Get full class details including classProperties from BSDD."""
    client = get_bsdd_client()
    if client is None:
        return None

    try:
        return client.get_class(class_uri)
    except Exception:
        return None


def get_dictionaries() -> list[dict[str, Any]]:
    """List available dictionary domains from BSDD."""
    client = get_bsdd_client()
    if client is None:
        return []

    try:
        result = client.get_dictionary()
        return result if isinstance(result, list) else [result] if result else []
    except Exception:
        return []


def apply_classification_properties(ifc_file: Any, element: Any, class_properties: list[dict]) -> None:
    """
    Apply default properties from BSDD classification to an IFC element.

    Uses apply_ifc_classification_properties from bsdd package.
    """
    if not BSDD_AVAILABLE or apply_ifc_classification_properties is None:
        return

    try:
        apply_ifc_classification_properties(ifc_file, element, class_properties)
    except Exception:
        pass
