from agents.base_agent import BaseAgent
from backend.services.memory_service import search_similar_incidents

class MemoryAgent(BaseAgent):
    def __init__(self):
        super().__init__("Memory Agent")

    async def run(self, state):
        self.log_start()
        
        # Prepare data structure for the search query
        incident_data = {
            "id": state.incident.id,
            "title": state.incident.title,
            "description": state.incident.description,
            "severity": state.incident.severity
        }
        
        result = await search_similar_incidents(incident_data)
        
        state.similarity_score = float(result.get("similarity", 0.0))
        state.matching_incident_id = result.get("existing_investigation_id")
        state.planner_decision = result.get("planner_decision", "NO_MATCH")
        
        if result.get("match"):
            match_rec = result["match"].get("recommendation")
            state.similar_recommendation = match_rec
            
        self.log_finish()
        return state
