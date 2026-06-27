from fastapi import APIRouter
from schemas.incident_schema import IncidentCreate
from services.incident_service import create_incident

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)


@router.post("/")
async def create(incident: IncidentCreate):
    return await create_incident(incident)