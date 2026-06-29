from bson import ObjectId
from datetime import datetime

from planner.engine import run_ai_analysis

from backend.database.mongodb import database
from backend.services.incident_service import get_incident_by_id

incidents_collection = database["incidents"]


# =====================================================
# Get Saved Analysis
# =====================================================

async def get_saved_analysis(id: str):

    try:

        incident = await incidents_collection.find_one(
            {"_id": ObjectId(id)}
        )

        if not incident:

            return {
                "success": False,
                "message": "Incident not found"
            }

        if not incident.get("analysis"):

            return {
                "success": False,
                "message": "Analysis not found"
            }

        return {
            "success": True,
            "analysis": incident["analysis"]
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }


# =====================================================
# Analyze Incident
# =====================================================

async def analyze_incident(id: str, force_fresh: bool = False):

    incident_response = await get_incident_by_id(id)

    if not incident_response["success"]:
        return incident_response

    incident = incident_response["data"]

    # Already analyzed
    if incident.get("analysis") and not force_fresh:
        return {
            "success": True,
            "analysis": incident["analysis"],
            "cached": True
        }

    ai_input = {
        "incident_id": incident.get("incident_id") or 1,
        "title": incident["title"],
        "description": incident["description"],
        "severity": incident["severity"],
        "source": incident.get(
            "created_by",
            "Microsoft Sentinel"
        )
    }

    try:
        result = await run_ai_analysis(ai_input, force_fresh=force_fresh)
        generated_at = datetime.utcnow().isoformat()

        result.setdefault("meta", {})
        result["meta"]["analysis_completed_at"] = generated_at
        result["meta"]["recommendation_generated_at"] = generated_at

        ai_severity = result.get("analysis", {}).get("risk_level", incident["severity"]).lower()
        
        # If it was an existing investigation reused, copy severity from the match
        if result.get("planner_decision") == "Existing investigation reused.":
            ai_severity = result.get("analysis", {}).get("risk_level", incident["severity"]).lower()

        await incidents_collection.update_one(
            {
                "_id": ObjectId(id)
            },
            {
                "$set": {
                    "analysis": result,
                    "severity": ai_severity
                }
            }
        )

        return {
            "success": True,
            "analysis": result,
            "cached": False
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# =====================================================
# Force Re-analysis
# =====================================================

async def reanalyze_incident(id: str):
    return await analyze_incident(id, force_fresh=True)