from agents.base_agent import BaseAgent
from services.llm_service import LLMService
from shared.utils import load_prompt


class RiskAgent(BaseAgent):

    def __init__(self):
        super().__init__("Risk Agent")
        self.llm = LLMService()

    def run(self, state):

        self.log_start()

        system_prompt = load_prompt("risk_prompt.txt")

        prompt = f"""
{system_prompt}

Incident

Title:
{state.incident.title}

Summary:
{state.incident.summary}

Incident Type:
{state.incident.incident_type}

Severity:
{state.incident.severity}


Company Context

Policies:
{state.context.security_policies}

Playbooks:
{state.context.incident_playbooks}

Threat Intelligence:
{state.context.threat_intelligence}

Organizational Notes:
{state.context.organizational_notes}
"""

        result = self.llm.generate_json(prompt)

        state.analysis.risk_level = result.get("risk_level")
        state.analysis.risk_score = result.get("risk_score")
        state.analysis.confidence = result.get("confidence")

        state.analysis.indicators = result.get("indicators", [])
        state.analysis.missing_information = result.get(
            "missing_information", []
        )

        state.analysis.opportunities = result.get(
            "opportunities", []
        )

        state.analysis.risks = result.get(
            "risks", []
        )

        self.log_finish()

        return state