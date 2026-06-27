from fastapi import APIRouter
from backend.services.recommendation_service import (
    get_recommendation,
    approve_recommendation
)

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"]
)


@router.get("/{id}")
async def get(id: str):
    return await get_recommendation(id)


@router.post("/{id}/approve")
async def approve(id: str):
    return await approve_recommendation(id)