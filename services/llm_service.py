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

                text = response.text.strip()

                text = (
                    text
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