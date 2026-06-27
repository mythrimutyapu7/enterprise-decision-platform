from agents.base_agent import BaseAgent
from services.llm_service import LLMService
from shared.utils import load_prompt


class RecommendationAgent(BaseAgent):

    def __init__(self):

        super().__init__("Recommendation Agent")

        self.llm = LLMService()

    def run(self, state):

        self.log_start()

        system_prompt = load_prompt(
            "recommendation_prompt.txt"
        )

        prompt = f"""
{system_prompt}

Incident Summary

{state.incident.summary}

Risk Level

{state.analysis.risk_level}

Risk Score

{state.analysis.risk_score}

Confidence

{state.analysis.confidence}

Indicators

{state.analysis.indicators}

Risks

{state.analysis.risks}

Missing Information

{state.analysis.missing_information}

Opportunities

{state.analysis.opportunities}
"""

        result = self.llm.generate_json(prompt)

        state.recommendation.recommended_action = result.get(
            "recommended_action"
        )

        state.recommendation.action_priority = result.get(
            "action_priority"
        )

        state.recommendation.business_impact = result.get(
            "business_impact"
        )

        state.recommendation.reasoning = result.get(
            "reasoning", []
        )

        state.recommendation.supporting_evidence = result.get(
            "supporting_evidence", []
        )

        state.recommendation.confidence = result.get(
            "confidence"
        )

        state.recommendation.alternative_actions = result.get(
            "alternative_actions", []
        )

        state.recommendation.follow_up_actions = result.get(
            "follow_up_actions", []
        )

        self.log_finish()

        return state