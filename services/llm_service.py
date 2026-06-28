import os
import json
import time

from dotenv import load_dotenv
from google import genai
from loguru import logger

load_dotenv()


class LLMService:

    def __init__(self):

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY not found.")

        self.client = genai.Client(api_key=api_key)

        self.model = "gemini-2.5-flash"

    def generate_text(self, prompt: str):

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
        )

        return response.text

    def generate_json(self, prompt: str):

        retries = 3

        for attempt in range(retries):

            try:

                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                )

                text = (
                    response.text
                    .replace("```json", "")
                    .replace("```", "")
                    .strip()
                )

                return json.loads(text)

            except Exception as e:

                logger.warning(
                    f"Gemini failed ({attempt+1}/{retries}): {e}"
                )

                if attempt == retries - 1:
                    raise

                time.sleep(2)

    # =====================================================
    # NEW : ONE Gemini call for the entire workflow
    # =====================================================

    def generate_complete_analysis(self, incident):

        prompt = f"""
You are a Senior Enterprise SOC AI.

Analyze the following incident.

TITLE:
{incident.title}

DESCRIPTION:
{incident.description}

SOURCE:
{incident.source}

Return ONLY valid JSON.

DO NOT explain.

DO NOT use markdown.

Return this exact structure:

{{
  "incident": {{
    "summary": "",
    "incident_type": "",
    "severity": ""
  }},

  "context": {{
    "security_policies": [],
    "incident_playbooks": [],
    "organizational_notes": [],
    "threat_intelligence": []
  }},

  "analysis": {{
    "risk_score": 0,
    "risk_level": "",
    "confidence": 0,
    "indicators": [],
    "risks": [],
    "missing_information": [],
    "opportunities": []
  }},

  "recommendation": {{
    "recommended_action": "",
    "action_priority": "",
    "business_impact": "",
    "reasoning": [],
    "supporting_evidence": [],
    "alternative_actions": [],
    "follow_up_actions": [],
    "confidence": 0
  }},

  "approval": {{
    "approved": false,
    "execution_status": "Pending Analyst Review",
    "approved_by": "",
    "approval_timestamp": "",
    "reviewer_comments": ""
  }}
}}
"""

        return self.generate_json(prompt)