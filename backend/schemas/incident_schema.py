from pydantic import BaseModel
from typing import Optional


class IncidentCreate(BaseModel):
    title: str
    description: str
    severity: str
    status: str = "Open"
    created_by: str


class IncidentResponse(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    severity: str
    status: str
    created_by: str