from fastapi import APIRouter, Depends
from backend.api.dependencies import check_incident_access
from backend.services.recommendation_service import (
    get_recommendation,
    approve_recommendation,
    reject_recommendation,
)

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"]
)


# -----------------------------------------
# Get Recommendation
# -----------------------------------------

@router.get("/{id}")
async def get(id: str, incident=Depends(check_incident_access)):
    return await get_recommendation(id)


# -----------------------------------------
# Approve
# -----------------------------------------

@router.post("/{id}/approve")
async def approve(id: str, incident=Depends(check_incident_access)):
    return await approve_recommendation(id)


# -----------------------------------------
# Reject
# -----------------------------------------

@router.post("/{id}/reject")
async def reject(id: str, incident=Depends(check_incident_access)):
    return await reject_recommendation(id)