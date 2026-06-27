from fastapi import APIRouter
from schemas.incident_schema import IncidentCreate
from services.incident_service import (
    create_incident,
    get_all_incidents,
    get_incident_by_id,
    delete_incident
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

@router.get("/{id}")
async def get_one(id: str):
    return await get_incident_by_id(id)

@router.delete("/{id}")
async def delete(id: str):
    return await delete_incident(id)