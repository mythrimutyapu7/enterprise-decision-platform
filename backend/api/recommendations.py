from fastapi import APIRouter

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
async def get(id: str):
    return await get_recommendation(id)


# -----------------------------------------
# Approve
# -----------------------------------------

@router.post("/{id}/approve")
async def approve(id: str):
    return await approve_recommendation(id)


# -----------------------------------------
# Reject
# -----------------------------------------

@router.post("/{id}/reject")
async def reject(id: str):
    return await reject_recommendation(id)