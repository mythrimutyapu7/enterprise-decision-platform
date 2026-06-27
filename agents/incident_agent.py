from agents.base_agent import BaseAgent
from services.llm_service import LLMService
from shared.utils import load_prompt


class IncidentAgent(BaseAgent):

    def __init__(self):
        super().__init__("Incident Agent")
        self.llm = LLMService()

    def run(self, state):

        self.log_start()

        prompt = load_prompt("incident_prompt.txt")

        full_prompt = f"""
{prompt}

Incident Title:
{state.incident.title}

Incident Description:
{state.incident.description}
"""

        result = self.llm.generate_json(full_prompt)

        state.incident.summary = result["summary"]
        state.incident.incident_type = result["incident_type"]
        state.incident.severity = result["severity"]

        self.log_finish()

        return state