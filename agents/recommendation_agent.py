from agents.base_agent import BaseAgent


class RecommendationAgent(BaseAgent):

    def __init__(self):

        super().__init__("Recommendation Agent")

    async def run(self, state):

        self.log_start()

        result = state.shared_analysis.get("recommendation", {})

        state.recommendation.recommended_action = result.get(
            "recommended_action",
            ""
        )

        state.recommendation.action_priority = result.get(
            "action_priority",
            ""
        )

        state.recommendation.business_impact = result.get(
            "business_impact",
            ""
        )

        state.recommendation.confidence = result.get(
            "confidence",
            0
        )

        state.recommendation.follow_up_actions = result.get(
            "follow_up_actions",
            []
        )

        self.log_finish()

        return state