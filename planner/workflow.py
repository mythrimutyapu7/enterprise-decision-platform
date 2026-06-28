from agents.incident_agent import IncidentAgent
from agents.context_agent import ContextAgent
from agents.history_agent import HistoryAgent
from agents.risk_agent import RiskAgent
from agents.recommendation_agent import RecommendationAgent

from services.llm_service import LLMService


class SecurityWorkflow:
    """
    Executes the complete Security Incident Response workflow.

    Gemini is called ONLY ONCE.
    Every agent reads from the shared response.
    """

    def __init__(self):

        self.llm = LLMService()

        self.incident_agent = IncidentAgent()

        self.context_agent = ContextAgent()

        self.history_agent = HistoryAgent()

        self.risk_agent = RiskAgent()

        self.recommendation_agent = RecommendationAgent()

    def run(self, state):

        # ======================================
        # ONE Gemini Call
        # ======================================

        state.shared_analysis = self.llm.generate_complete_analysis(
            state.incident
        )

        # ======================================
        # Agents now read shared_analysis
        # ======================================

        state = self.incident_agent.run(state)

        state = self.context_agent.run(state)

        state = self.history_agent.run(state)

        state = self.risk_agent.run(state)

        state = self.recommendation_agent.run(state)

        return state