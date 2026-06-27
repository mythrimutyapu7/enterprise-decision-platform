import json

from agents.base_agent import BaseAgent
from knowledge.loader import KnowledgeLoader
from services.llm_service import LLMService
from shared.utils import load_prompt


class ContextAgent(BaseAgent):

    def __init__(self):
        super().__init__("Context Agent")

        self.loader = KnowledgeLoader()
        self.llm = LLMService()

    def run(self, state):

        self.log_start()

        company_knowledge = self.loader.load_all()

        system_prompt = load_prompt("context_prompt.txt")

        prompt = f"""
{system_prompt}

Incident

Title:
{state.incident.title}

Description:
{state.incident.description}

Company Knowledge

{company_knowledge}
"""

        result = self.llm.generate_json(prompt)

        state.context.security_policies = result.get(
            "security_policies", []
        )

        state.context.incident_playbooks = result.get(
            "incident_playbooks", []
        )

        state.context.threat_intelligence = result.get(
            "threat_intelligence", []
        )

        state.context.affected_assets = result.get(
            "affected_assets", []
        )

        state.context.organizational_notes = result.get(
            "organizational_notes", []
        )

        self.log_finish()

        return state