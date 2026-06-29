from agents.base_agent import BaseAgent


class IncidentAgent(BaseAgent):

    def __init__(self):
        super().__init__("Incident Agent")

    async def run(self, state):

        self.log_start()

        # Read the shared Gemini response
        result = state.shared_analysis.get("incident", {})

        state.incident.summary = result.get(
            "summary",
            state.incident.summary,
        )

        state.incident.incident_type = result.get(
            "incident_type",
            state.incident.incident_type,
        )

        state.incident.severity = result.get(
            "severity",
            state.incident.severity,
        )

        self.log_finish()

        return state