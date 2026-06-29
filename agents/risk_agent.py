from agents.base_agent import BaseAgent


class RiskAgent(BaseAgent):

    def __init__(self):
        super().__init__("Risk Agent")

    def run(self, state):

        self.log_start()

        result = state.shared_analysis.get("analysis", {})

        state.analysis.risk_level = result.get(
            "risk_level",
            state.analysis.risk_level
        )

        state.analysis.risk_score = result.get(
            "risk_score",
            state.analysis.risk_score
        )

        state.analysis.confidence = result.get(
            "confidence",
            state.analysis.confidence
        )

        state.analysis.indicators = result.get(
            "indicators",
            []
        )

        state.analysis.missing_information = result.get(
            "missing_information",
            []
        )

        state.analysis.risks = result.get(
            "risks",
            []
        )

        self.log_finish()

        return state