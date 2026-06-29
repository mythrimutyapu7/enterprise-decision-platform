from agents.base_agent import BaseAgent


class ContextAgent(BaseAgent):

    def __init__(self):
        super().__init__("Context Agent")

    async def run(self, state):

        self.log_start()

        result = state.shared_analysis.get("context", {})

        state.context.security_policies = result.get(
            "security_policies",
            []
        )

        state.context.incident_playbooks = result.get(
            "incident_playbooks",
            []
        )

        state.context.threat_intelligence = result.get(
            "threat_intelligence",
            []
        )

        state.context.affected_assets = result.get(
            "affected_assets",
            []
        )

        state.context.organizational_notes = result.get(
            "organizational_notes",
            []
        )

        self.log_finish()

        return state