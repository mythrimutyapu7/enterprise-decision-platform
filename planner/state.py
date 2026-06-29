from typing import Optional, Dict, Any

from pydantic import BaseModel, Field

from planner.models.incident import IncidentInfo
from planner.models.context import ContextInfo
from planner.models.analysis import AnalysisResult
from planner.models.recommendation import RecommendationResult
from planner.models.approval import ApprovalResult


class AgentState(BaseModel):
    """
    Shared state exchanged between all AI agents.

    Every agent updates only its own section.

    shared_analysis stores the SINGLE Gemini response
    that every agent reads from.
    """

    incident: IncidentInfo

    context: ContextInfo = Field(
        default_factory=ContextInfo
    )

    analysis: AnalysisResult = Field(
        default_factory=AnalysisResult
    )

    recommendation: RecommendationResult = Field(
        default_factory=RecommendationResult
    )

    approval: ApprovalResult = Field(
        default_factory=ApprovalResult
    )

    # NEW
    shared_analysis: Dict[str, Any] = Field(
        default_factory=dict
    )