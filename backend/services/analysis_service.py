from planner.engine import run_ai_analysis
from backend.services.incident_service import get_incident_by_id


async def analyze_incident(id: str):

    incident_response = await get_incident_by_id(id)

    if not incident_response["success"]:
        return incident_response

    incident = incident_response["data"]

    ai_input = {
        "incident_id": 1,   # we'll improve this later
        "title": incident["title"],
        "description": incident["description"],
        "severity": incident["severity"],
        "source": "Microsoft Sentinel"
    }
    try:
        result = run_ai_analysis(ai_input)

        return {
            "success": True,
            "analysis": result
        }

    except Exception as e:
        # Return structured error instead of allowing an uncaught exception
        return {
            "success": False,
            "error": f"AI analysis failed: {str(e)}"
        }