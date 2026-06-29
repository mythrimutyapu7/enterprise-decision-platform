from datetime import datetime

from bson import ObjectId

from backend.database.mongodb import database

incidents_collection = database["incidents"]


# =====================================================
# Get Recommendation
# =====================================================

async def get_recommendation(id: str):

    try:

        incident = await incidents_collection.find_one(
            {"_id": ObjectId(id)}
        )

        if not incident:

            return {
                "success": False,
                "message": "Incident not found"
            }

        analysis = incident.get("analysis")

        if not analysis:

            return {
                "success": False,
                "message": "No analysis available"
            }

        return {
            "success": True,
            "data": analysis.get("recommendation", {})
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }


# =====================================================
# Approve Recommendation
# =====================================================

async def approve_recommendation(id: str):

    try:

        analyst = "Security Analyst"

        await incidents_collection.update_one(

            {
                "_id": ObjectId(id)
            },

            {
                "$set": {

                    "analysis.approval.approved": True,

                    "analysis.approval.execution_status": "Approved",

                    "analysis.approval.approved_by": analyst,

                    "analysis.approval.approval_timestamp": datetime.utcnow().isoformat()

                }

            }

        )

        # Learning memory: save the completed case to memory
        from backend.services.memory_service import add_to_memory
        await add_to_memory(id)

        incident = await incidents_collection.find_one(
            {"_id": ObjectId(id)}
        )

        return {

            "success": True,

            "approval": incident["analysis"]["approval"]

        }

    except Exception as e:

        return {

            "success": False,

            "error": str(e)

        }


# =====================================================
# Reject Recommendation
# =====================================================

async def reject_recommendation(id: str):

    try:

        analyst = "Security Analyst"

        await incidents_collection.update_one(

            {
                "_id": ObjectId(id)
            },

            {
                "$set": {

                    "analysis.approval.approved": False,

                    "analysis.approval.execution_status": "Rejected",

                    "analysis.approval.approved_by": analyst,

                    "analysis.approval.approval_timestamp": datetime.utcnow().isoformat()

                }

            }

        )

        # Learning memory: save the completed case to memory
        from backend.services.memory_service import add_to_memory
        await add_to_memory(id)

        incident = await incidents_collection.find_one(
            {"_id": ObjectId(id)}
        )

        return {

            "success": True,

            "approval": incident["analysis"]["approval"]

        }

    except Exception as e:

        return {

            "success": False,

            "error": str(e)

        }