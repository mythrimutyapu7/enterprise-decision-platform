from fastapi import APIRouter
from schemas.incident_schema import IncidentCreate
from services.incident_service import (
    create_incident,
    get_all_incidents
)       

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)


@router.post("/")
async def create(incident: IncidentCreate):
    return await create_incident(incident)

@router.get("/")
async def get_all():
    return await get_all_incidents()