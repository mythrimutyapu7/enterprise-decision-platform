from agents.incident_agent import IncidentAgent
from agents.context_agent import ContextAgent
from agents.history_agent import HistoryAgent
from agents.risk_agent import RiskAgent
from agents.recommendation_agent import RecommendationAgent
from agents.memory_agent import MemoryAgent
from agents.approval_agent import ApprovalAgent

from services.llm_service import LLMService
from backend.database.mongodb import database
from bson import ObjectId

from planner.models.analysis import AnalysisResult
from planner.models.recommendation import RecommendationResult
from planner.models.context import ContextInfo
from planner.models.approval import ApprovalResult


class SecurityWorkflow:
    """
    Executes the complete Security Incident Response workflow.
    """

    def __init__(self):
        self.llm = LLMService()
        self.memory_agent = MemoryAgent()
        self.incident_agent = IncidentAgent()
        self.context_agent = ContextAgent()
        self.history_agent = HistoryAgent()
        self.risk_agent = RiskAgent()
        self.recommendation_agent = RecommendationAgent()
        self.approval_agent = ApprovalAgent()

    async def run(self, state, force_fresh: bool = False):
        # 1. Execute Memory Agent
        state = await self.memory_agent.run(state)

        # 2. Planner Routing Decision Rules
        similarity = state.similarity_score or 0.0
        
        if similarity >= 95.0 and not force_fresh:
            # Rule 1: Reuse existing investigation
            state.planner_decision = "Existing investigation reused."
            
            # Retrieve the matching investigation from database memory
            match_doc = await database["memory"].find_one({"_id": ObjectId(state.matching_incident_id)})
            if match_doc:
                state.analysis = AnalysisResult(**match_doc.get("analysis", {}))
                state.recommendation = RecommendationResult(**match_doc.get("recommendation", {}))
                state.context = ContextInfo(**match_doc.get("context", {}))
                
                # Copy approval details
                appr_data = match_doc.get("approval", {})
                state.approval = ApprovalResult(**appr_data)
                
            return state

        # Rule 2 / Rule 3 / Force Fresh: Run full workflow
        similar_rec = None
        if similarity >= 80.0:
            similar_rec = state.similar_recommendation
            state.planner_decision = "Similar incident context added."
        else:
            state.planner_decision = "No match found. Starting new investigation."

        # Execute Gemini LLM Analysis
        state.shared_analysis = self.llm.generate_complete_analysis(
            state.incident,
            similar_recommendation=similar_rec
        )

        # Execute agents in sequence
        state = await self.incident_agent.run(state)
        state = await self.context_agent.run(state)
        state = await self.history_agent.run(state)
        state = await self.risk_agent.run(state)
        state = await self.recommendation_agent.run(state)
        state = await self.approval_agent.run(state)

        return state