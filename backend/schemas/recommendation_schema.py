from pydantic import BaseModel
from typing import List, Optional


class RecommendationResponse(BaseModel):
    id: Optional[str] = None
    incident_id: str
    recommendation: str
    reasoning: List[str]
    confidence: int
    approved: bool = False