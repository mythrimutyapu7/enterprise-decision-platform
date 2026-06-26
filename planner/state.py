from pydantic import BaseModel
from typing import Optional, List

class AgentState(BaseModel):
    incident_id: Optional[int] = None
    incident_text: str = ""
    incident_summary: Optional[str] = None
    incident_type: Optional[str] = None
    severity: Optional[str] = None

    context: List[str] = []
    similar_incidents: List[str] = []

    risk_score: Optional[float] = None
    confidence: Optional[float] = None

    recommendation: Optional[str] = None
    reasoning: List[str] = []

    approved: bool = False
    feedback: Optional[str] = None