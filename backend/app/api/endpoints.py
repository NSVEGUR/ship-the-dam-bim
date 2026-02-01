"""
API endpoints for Ship the BIM pipeline.

POST /scan: upload IFC/CSV, profile, project_id; run pipeline; store in Supabase; return result.
GET /profiles: list available profile_ids.
"""

import io
import json
import zipfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
import shutil
import tempfile
import os

from app.pipeline.models import Profile, ScanResult
from app.pipeline.orchestrator import PipelineOrchestrator
from app.pipeline.llm_providers import LLMChoice
from app.storage.profiles import get_profile, list_profiles
from app.storage.supabase_store import SupabaseStorage

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok", "service": "Deliverable OPS API"}


@router.get("/profiles")
def list_available_profiles():
    """List profile_id -> name mapping for dropdown selection."""
    return list_profiles()


@router.post("/scan", response_model=ScanResult)
async def run_scan(
    file: UploadFile = File(...),
    profile_data: Optional[str] = Form(None),
    profile_id: Optional[str] = Form(None),
    project_id: int = Form(123),
    llm_provider: str = Form("gemini"),
):
    """
    Run pipeline on uploaded IFC or CSV file.

    - file: IFC or CSV file
    - profile_data: JSON string of profile (use if profile_id not set)
    - profile_id: key from stored profiles (use if profile_data not set)
    - project_id: ID of the project in Supabase (must exist)
    - llm_provider: Base LLM for reasoning - "gemini", "minimax", or "openai"
    """
    try:
        # Resolve profile
        profile: Optional[Profile] = None
        if profile_id:
            profile = get_profile(profile_id)
            if not profile:
                raise HTTPException(status_code=400, detail=f"Unknown profile_id: {profile_id}")
        elif profile_data:
            try:
                profile = Profile(**json.loads(profile_data))
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid profile JSON: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail="Provide profile_id or profile_data")

        # Detect file type and save
        name = file.filename or "upload"
        ext = ".ifc" if name.lower().endswith(".ifc") else ".csv" if name.lower().endswith(".csv") else ".ifc"
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        try:
            # Previous terminology from earlier report (if rescan)
            store = SupabaseStorage()
            prev_terms = store.get_latest_report_terminology(project_id)

            orchestrator = PipelineOrchestrator(
                file_path=tmp_path,
                profile=profile,
                project_id=project_id,
                user_approved_terminology=prev_terms,
                llm_provider=llm_provider,  # type: ignore
            )

            result = await orchestrator.run_full_scan()
            return result
        finally:
            try:
                os.unlink(tmp_path)
            except Exception:
                pass

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
