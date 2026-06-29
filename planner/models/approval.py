from typing import Optional

from pydantic import BaseModel, Field


class ApprovalResult(BaseModel):
    """
    Represents the Human-in-the-Loop review outcome.
    """

    approved: bool = Field(
        default=False,
        description="Whether the recommendation was approved"
    )

    approved_by: Optional[str] = Field(
        default=None,
        description="Security Analyst who reviewed the recommendation"
    )

    reviewer_comments: Optional[str] = Field(
        default=None,
        description="Comments provided by the reviewer"
    )

    approval_timestamp: Optional[str] = Field(
        default=None,
        description="Time when the recommendation was approved"
    )

    execution_status: Optional[str] = Field(
        default="Pending",
        description="Pending, Approved, Rejected or Executed"
    )