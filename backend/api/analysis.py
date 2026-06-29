from fastapi import APIRouter, Depends
from backend.api.dependencies import check_incident_access
from backend.services.analysis_service import (
    analyze_incident,
    get_saved_analysis,
)
from backend.services.pdf_service import build_investigation_report

router = APIRouter(
    prefix="/incidents",
    tags=["AI Analysis"]
)


# ----------------------------------------
# Get Existing Analysis
# ----------------------------------------

@router.get("/{id}/analysis")
async def get_analysis(id: str, incident=Depends(check_incident_access)):
    return await get_saved_analysis(id)


# ----------------------------------------
# Analyze Incident
# ----------------------------------------

@router.post("/{id}/analyze")
async def analyze(id: str, incident=Depends(check_incident_access)):
    return await analyze_incident(id)


# ----------------------------------------
# Download Investigation Report
# ----------------------------------------

@router.get("/{id}/report")
async def download_report(id: str, incident=Depends(check_incident_access)):
    return await build_investigation_report(id)