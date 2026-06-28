from fastapi import APIRouter, Depends
from pydantic import BaseModel
from backend.api.dependencies import get_current_user, check_incident_access
from backend.schemas.incident_schema import IncidentCreate
from backend.services.incident_service import (
    create_incident,
    get_all_incidents,
    get_incident_by_id,
    delete_incident,
    update_analyst_notes,
    update_incident_status,
)


router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)


class AnalystNotesUpdate(BaseModel):
    notes: str = ""


class StatusUpdate(BaseModel):
    status: str


@router.post("/")
async def create(
    incident: IncidentCreate,
    user=Depends(get_current_user)
):
    return await create_incident(incident, user["sub"])


@router.get("/")
async def get_all(user=Depends(get_current_user)):
    return await get_all_incidents(user["sub"])

@router.get("/{id}")
async def get_one(id: str, incident=Depends(check_incident_access)):
    incident["_id"] = str(incident["_id"])
    return {
        "success": True,
        "data": incident
    }

@router.delete("/{id}")
async def delete(id: str, incident=Depends(check_incident_access)):
    return await delete_incident(id)


@router.put("/{id}/notes")
async def update_notes(id: str, payload: AnalystNotesUpdate, incident=Depends(check_incident_access)):
    return await update_analyst_notes(id, payload.notes)


@router.put("/{id}/status")
async def update_status(id: str, payload: StatusUpdate, incident=Depends(check_incident_access)):
    return await update_incident_status(id, payload.status)