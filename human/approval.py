from datetime import datetime


class HumanApproval:

    def approve(self, state, reviewer_name: str):

        state.approval.approved = True
        state.approval.approved_by = reviewer_name
        state.approval.execution_status = "Approved"
        state.approval.approval_timestamp = datetime.now().isoformat()

        return state

    def reject(self, state, reviewer_name: str, comments: str):

        state.approval.approved = False
        state.approval.approved_by = reviewer_name
        state.approval.reviewer_comments = comments
        state.approval.execution_status = "Rejected"
        state.approval.approval_timestamp = datetime.now().isoformat()

        return state