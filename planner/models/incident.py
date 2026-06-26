from typing import Optional

from pydantic import BaseModel, Field


class IncidentInfo(BaseModel):
    """
    Represents the incident uploaded by the Security Analyst.
    This is the starting point of the entire AI workflow.
    """

    incident_id: Optional[int] = None

    title: str = Field(..., description="Title of the incident")

    description: str = Field(
        ...,
        description="Detailed description of the incident"
    )

    severity: Optional[str] = Field(
        default=None,
        description="Initial severity provided by the analyst"
    )

    source: Optional[str] = Field(
        default=None,
        description="Origin of the incident (SIEM, Email, Firewall, etc.)"
    )

    uploaded_file: Optional[str] = Field(
        default=None,
        description="Path to uploaded evidence file"
    )

    created_by: Optional[str] = None