from agents.base_agent import BaseAgent


class RiskAgent(BaseAgent):

    def __init__(self):

        super().__init__("Risk Agent")

    def run(self, state):

        self.log_start()

        state.analysis.risk_level = "Critical"
        state.analysis.risk_score = 96
        state.analysis.confidence = 94

        self.log_finish()

        return state