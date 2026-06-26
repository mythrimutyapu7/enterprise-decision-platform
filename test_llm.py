from services.llm_service import LLMService

llm = LLMService()

response = llm.generate_text(

"""
Say hello in one sentence.
"""

)

print(response)