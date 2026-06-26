import os

from dotenv import load_dotenv
from google import genai

load_dotenv()


class LLMService:
    """
    Wrapper around Google's Gemini API.
    """

    def __init__(self):

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY not found.")

        self.client = genai.Client(api_key=api_key)

        self.model = "gemini-2.5-flash"

    import json


    def generate(self, prompt: str):

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
        )

        text = response.text.strip()

        # Remove Markdown code fences if Gemini returns them
        text = text.replace("```json", "").replace("```", "").strip()

        return json.loads(text)

        return response.text