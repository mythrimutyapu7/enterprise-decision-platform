from typing import List, Optional

from pydantic import BaseModel, Field


class AnalysisResult(BaseModel):
    """
    Result produced by the Risk Agent after analyzing
    the incident, context and history.
    """

    risk_level: Optional[str] = Field(
        default=None,
        description="Low, Medium, High or Critical"
    )

    risk_score: Optional[float] = Field(
        default=None,
        ge=0,
        le=100,
        description="Overall risk score"
    )

    confidence: Optional[float] = Field(
        default=None,
        ge=0,
        le=100,
        description="Confidence in the analysis"
    )

    indicators: List[str] = Field(
        default_factory=list,
        description="Evidence supporting the analysis"
    )

    missing_information: List[str] = Field(
        default_factory=list,
        description="Information still required"
    )

    opportunities: List[str] = Field(
        default_factory=list,
        description="Positive findings"
    )

    risks: List[str] = Field(
        default_factory=list,
        description="Detected risks"
    )