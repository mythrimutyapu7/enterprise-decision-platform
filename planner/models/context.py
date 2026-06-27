from typing import List

from pydantic import BaseModel, Field


class ContextInfo(BaseModel):
    """
    Organizational context collected by the Context Agent.
    """

    security_policies: List[str] = Field(
        default_factory=list,
        description="Relevant security policies"
    )

    incident_playbooks: List[str] = Field(
        default_factory=list,
        description="Applicable incident response playbooks"
    )

    threat_intelligence: List[str] = Field(
        default_factory=list,
        description="Threat intelligence indicators"
    )

    affected_assets: List[str] = Field(
        default_factory=list,
        description="Servers, users or devices involved"
    )

    organizational_notes: List[str] = Field(
        default_factory=list,
        description="Additional organizational knowledge"
    )