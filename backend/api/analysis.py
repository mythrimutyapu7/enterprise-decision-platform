from fastapi import APIRouter

from backend.services.analysis_service import (
    analyze_incident,
    get_saved_analysis,
)

router = APIRouter(
    prefix="/incidents",
    tags=["AI Analysis"]
)


# ----------------------------------------
# Get Existing Analysis
# ----------------------------------------

@router.get("/{id}/analysis")
async def get_analysis(id: str):
    return await get_saved_analysis(id)


# ----------------------------------------
# Analyze Incident
# ----------------------------------------

@router.post("/{id}/analyze")
async def analyze(id: str):
    return await analyze_incident(id)