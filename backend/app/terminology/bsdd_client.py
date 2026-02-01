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


# --------------------------------------------------------------------------- #
# Terminology lookup with English + German support
# --------------------------------------------------------------------------- #

# Common bSDD dictionary URIs for BIM/IFC terminology
BSDD_IFC_DICTIONARY = "https://identifier.buildingsmart.org/uri/buildingsmart/ifc/4.3"
BSDD_BUILDINGSMART_DICTIONARY = "https://identifier.buildingsmart.org/uri/buildingsmart/ifc-4.3"


def _normalize_language_code(lang: str) -> str:
    """Normalize language codes: de-DE -> de, en-GB -> en, etc."""
    if not lang:
        return ""
    lang = lang.lower().strip()
    # Handle codes like "de-DE", "en-GB", "de-AT"
    if "-" in lang:
        lang = lang.split("-")[0]
    return lang


def _extract_translations_from_class(class_data: dict) -> dict[str, str]:
    """
    Extract name translations from bSDD class data.
    
    Returns dict like {"en": "Wall", "de": "Wand", "fr": "Mur"}
    """
    result: dict[str, str] = {}
    
    if not class_data:
        return result
    
    # Primary name (usually English)
    primary_name = class_data.get("name", "")
    primary_lang = _normalize_language_code(class_data.get("languageCode", "en"))
    if primary_name and primary_lang:
        result[primary_lang] = primary_name
    
    # Check translations array
    translations = class_data.get("translations", [])
    if isinstance(translations, list):
        for trans in translations:
            if isinstance(trans, dict):
                lang = _normalize_language_code(trans.get("languageCode", ""))
                name = trans.get("name", "") or trans.get("value", "")
                if lang and name and lang not in result:
                    result[lang] = name
    
    # Check synonyms array (sometimes contains translations)
    synonyms = class_data.get("synonyms", [])
    if isinstance(synonyms, list):
        for syn in synonyms:
            if isinstance(syn, dict):
                lang = _normalize_language_code(syn.get("languageCode", ""))
                name = syn.get("name", "") or syn.get("value", "")
                if lang and name and lang not in result:
                    result[lang] = name
    
    # Check relatedIfcEntityNames for IFC standard names
    related_ifc = class_data.get("relatedIfcEntityNames", [])
    if isinstance(related_ifc, list) and related_ifc and "en" not in result:
        result["en"] = related_ifc[0]
    
    return result


def lookup_bsdd_terminology(
    search_term: str,
    element_type: Optional[str] = None,
    dictionary_uris: Optional[list[str]] = None,
) -> Optional[dict[str, str]]:
    """
    Lookup a BIM term in bSDD and return English + German translations.
    
    Args:
        search_term: The term to search (e.g., "Wall", "FireRating", "Brandschutzwand")
        element_type: Optional IFC entity type to filter (e.g., "IfcWall")
        dictionary_uris: Optional list of dictionary URIs to search
        
    Returns:
        Dict with keys "en" and "de" if found, else None.
        Example: {"en": "Fire Wall", "de": "Brandschutzwand"}
    """
    client = get_bsdd_client()
    if client is None or not search_term:
        return None
    
    # Default dictionaries to search
    uris = dictionary_uris or [BSDD_IFC_DICTIONARY]
    
    # Build related entities filter
    related_entities = [element_type] if element_type else []
    
    try:
        # Search for the term
        search_result = client.search_class(
            search_text=search_term,
            dictionary_uris=uris,
            related_ifc_entities=related_entities if related_entities else None,
        )
        
        # Handle different response formats
        classes = []
        if isinstance(search_result, dict):
            classes = search_result.get("classes", [])
        elif isinstance(search_result, list):
            classes = search_result
        
        if not classes:
            return None
        
        # Get the best matching class (first result or exact name match)
        best_match = None
        for cls in classes[:5]:  # Check top 5 results
            if isinstance(cls, dict):
                cls_name = cls.get("name", "").lower()
                if cls_name == search_term.lower():
                    best_match = cls
                    break
        
        if not best_match and classes:
            best_match = classes[0] if isinstance(classes[0], dict) else None
        
        if not best_match:
            return None
        
        # Get full class details for translations
        class_uri = best_match.get("uri", "")
        if class_uri:
            class_details = client.get_class(class_uri)
            if class_details:
                translations = _extract_translations_from_class(class_details)
                
                # We need at least English
                if translations.get("en"):
                    return {
                        "en": translations.get("en", ""),
                        "de": translations.get("de"),  # May be None
                    }
        
        # Fallback: use basic info from search result
        translations = _extract_translations_from_class(best_match)
        if translations.get("en") or translations.get("de"):
            return {
                "en": translations.get("en", search_term),
                "de": translations.get("de"),
            }
        
        return None
        
    except Exception:
        return None


def search_bsdd_term(
    term: str,
    element_type: Optional[str] = None,
) -> Optional[dict[str, str]]:
    """
    Convenience wrapper for lookup_bsdd_terminology.
    Searches common bSDD dictionaries for the term.
    
    Returns {"en": "...", "de": "..."} or None.
    """
    return lookup_bsdd_terminology(
        search_term=term,
        element_type=element_type,
        dictionary_uris=[BSDD_IFC_DICTIONARY],
    )
