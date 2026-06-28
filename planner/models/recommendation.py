from typing import List, Optional

from pydantic import BaseModel, Field


class RecommendationResult(BaseModel):
    """
    Executive recommendation shown on the SOC dashboard.
    """

    recommended_action: Optional[str] = Field(
        default=None,
        description="Primary recommendation"
    )

    action_priority: Optional[str] = Field(
        default=None,
        description="Priority"
    )

    business_impact: Optional[str] = Field(
        default=None,
        description="Business impact"
    )

    confidence: Optional[int] = Field(
        default=None,
        ge=0,
        le=100,
        description="AI confidence"
    )

    follow_up_actions: List[str] = Field(
        default_factory=list,
        description="Immediate actions"
    )