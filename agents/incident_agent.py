from agents.base_agent import BaseAgent


class IncidentAgent(BaseAgent):

    def __init__(self):

        super().__init__("Incident Agent")

    def run(self, state):

        self.log_start()

        # We'll replace this with Gemini later.
        state.incident.description = state.incident.description.strip()

        self.log_finish()

        return state