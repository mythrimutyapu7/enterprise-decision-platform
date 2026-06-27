from fastapi import APIRouter
from services.analysis_service import analyze_incident

router = APIRouter(
    prefix="/incidents",
    tags=["AI Analysis"]
)


@router.post("/{id}/analyze")
async def analyze(id: str):
    return await analyze_incident(id)