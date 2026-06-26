from typing import Optional

from pydantic import BaseModel, Field

from planner.models.incident import IncidentInfo
from planner.models.context import ContextInfo
from planner.models.analysis import AnalysisResult
from planner.models.recommendation import RecommendationResult
from planner.models.approval import ApprovalResult


class AgentState(BaseModel):
    """
    Shared state exchanged between all AI agents.

    Every agent receives this object,
    updates only its own section,
    and returns the updated state.
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