from agents.base_agent import BaseAgent

class ApprovalAgent(BaseAgent):
    def __init__(self):
        super().__init__("Approval Agent")

    async def run(self, state):
        self.log_start()
        
        # Initialize the initial approval state if not set
        if not state.approval.execution_status:
            state.approval.execution_status = "Pending"
            state.approval.approved = False
            state.approval.approved_by = "Pending Analyst Review"
            state.approval.reviewer_comments = "Awaiting analyst approval."
            
        self.log_finish()
        return state
