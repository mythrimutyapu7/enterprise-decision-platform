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
    # SINGLE GEMINI CALL
    # =====================================================

    def generate_complete_analysis(self, incident, similar_recommendation: str = None):

        historical_context = ""
        if similar_recommendation:
            historical_context = f"""
----------------------------------------------------
HISTORICAL CONTEXT

A highly similar incident was resolved in the past. Below is the recommendation that was approved and successfully resolved that incident:
"{similar_recommendation}"

You MUST evaluate this historical recommendation:
1. If it is relevant, reuse or adapt it for the current incident's recommendation.
2. If you base the recommendation on this historical action, increase your analysis and recommendation confidence scores (risk/confidence fields in the JSON response) to reflect that this is a recognized/recurring scenario (e.g., set confidence to 95-100%).
----------------------------------------------------
"""

        prompt = f"""
You are Microsoft Security Copilot.

You are assisting an experienced SOC analyst.

Your response will be displayed on a single enterprise dashboard.

DO NOT write a report.

DO NOT explain your reasoning.

DO NOT repeat the incident description.

Keep every response concise.

{historical_context}

----------------------------------------------------

INCIDENT

Title:
{incident.title}

Description:
{incident.description}

Source:
{incident.source}

----------------------------------------------------

Return ONLY valid JSON.

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
        "missing_information": []
    }},

    "recommendation": {{
        "recommended_action": "",
        "action_priority": "",
        "business_impact": "",
        "follow_up_actions": [],
        "confidence": 0
    }},

    "approval": {{
        "approved": false,
        "execution_status": "Pending",
        "approved_by": "Pending Analyst Review",
        "approval_timestamp": "",
        "reviewer_comments": "Awaiting analyst approval."
    }}
}}

----------------------------------------------------

RULES

Executive Summary
- Maximum TWO sentences.
- Maximum 40 words.

Indicators
- Maximum FIVE bullets.
- Less than 8 words each.

Risks
- Maximum THREE bullets.
- Less than 8 words each.

Missing Information
- Maximum THREE bullets.
- Less than 8 words each.

Security Policies
- Maximum THREE items.

Incident Playbooks
- Maximum THREE items.

Organizational Notes
- Maximum TWO items.

Threat Intelligence
- Maximum TWO items.

Recommended Action
- ONE sentence only.
- Maximum 20 words.

Follow-up Actions
- Maximum FOUR bullets.
- Less than 6 words each.

Business Impact
- ONE short sentence.
- Maximum 15 words.

Risk Score
- Integer between 0 and 100.

Confidence
- Integer between 0 and 100.

IMPORTANT

Think like a SOC analyst.

Do not write explanations.

Do not generate paragraphs.

Do not repeat information.

Do not use markdown.

Return JSON only.
"""

        logger.success("✅ SINGLE GEMINI CALL")

        return self.generate_json(prompt)