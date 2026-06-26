from agents.base_agent import BaseAgent


class RecommendationAgent(BaseAgent):

    def __init__(self):

        super().__init__("Recommendation Agent")

    def run(self, state):

        self.log_start()

        state.recommendation.recommended_action = \
            "Disable User Account"

        state.recommendation.action_priority = "Critical"

        state.recommendation.reasoning.append(
            "High probability of credential compromise."
        )

        self.log_finish()

        return state