from typing import List, Optional

from pydantic import BaseModel, Field


class AnalysisResult(BaseModel):
    """
    Compact AI risk assessment shown on the dashboard.
    """

    risk_level: Optional[str] = Field(
        default=None,
        description="Overall risk level"
    )

    risk_score: Optional[int] = Field(
        default=None,
        ge=0,
        le=100,
        description="Risk score"
    )

    confidence: Optional[int] = Field(
        default=None,
        ge=0,
        le=100,
        description="AI confidence"
    )

    indicators: List[str] = Field(
        default_factory=list,
        description="Top findings"
    )

    risks: List[str] = Field(
        default_factory=list,
        description="Top risks"
    )

    missing_information: List[str] = Field(
        default_factory=list,
        description="Missing information"
    )