from pydantic import BaseModel
from typing import Optional, Dict, Any


class IncidentCreate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = "Open"
    created_by: Optional[str] = None
    
    # Ingestion support fields
    source_type: Optional[str] = None
    raw_content: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class IncidentResponse(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    severity: str
    status: str
    created_by: str