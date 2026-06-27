from agents.incident_agent import IncidentAgent
from agents.context_agent import ContextAgent
from agents.history_agent import HistoryAgent
from agents.risk_agent import RiskAgent
from agents.recommendation_agent import RecommendationAgent


class SecurityWorkflow:
    """
    Executes the Security Incident Response workflow.
    """

    def __init__(self):

        self.incident_agent = IncidentAgent()

        self.context_agent = ContextAgent()

        self.history_agent = HistoryAgent()

        self.risk_agent = RiskAgent()

        self.recommendation_agent = RecommendationAgent()

    def run(self, state):

        state = self.incident_agent.run(state)

        state = self.context_agent.run(state)

        state = self.history_agent.run(state)

        state = self.risk_agent.run(state)

        state = self.recommendation_agent.run(state)

        return state