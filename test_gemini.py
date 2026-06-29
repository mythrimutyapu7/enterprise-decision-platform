from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

print("Key starts with:", os.getenv("GEMINI_API_KEY")[:5])

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

print(client)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Hello"
)

print(response.text)