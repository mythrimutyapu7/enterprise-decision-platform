from backend.database.mongodb import database
from bson import ObjectId
from datetime import datetime

incidents_collection = database["incidents"]


# --------------------------------------------------
# Create Incident
# --------------------------------------------------

async def create_incident(incident):
    try:

        incident_data = {
            "title": incident.title,
            "description": incident.description,
            "severity": incident.severity,
            "status": incident.status,
            "created_by": incident.created_by,
            "created_at": datetime.utcnow(),

            # AI Analysis (filled after Analyze)
            "analysis": None,

            # Approval Information
            "approved": False,
            "approved_by": None,
            "approved_at": None
        }

        result = await incidents_collection.insert_one(
            incident_data
        )

        return {
            "success": True,
            "message": "Incident Created Successfully",
            "id": str(result.inserted_id)
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }


# --------------------------------------------------
# Get All Incidents
# --------------------------------------------------

async def get_all_incidents():

    try:

        incidents = []

        async for incident in incidents_collection.find():

            incident["_id"] = str(incident["_id"])

            incidents.append(incident)

        return {
            "success": True,
            "count": len(incidents),
            "data": incidents
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }


# --------------------------------------------------
# Get Incident By ID
# --------------------------------------------------

async def get_incident_by_id(id):

    try:

        incident = await incidents_collection.find_one(
            {"_id": ObjectId(id)}
        )

        if not incident:

            return {
                "success": False,
                "message": "Incident not found"
            }

        incident["_id"] = str(incident["_id"])

        return {
            "success": True,
            "data": incident
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }


# --------------------------------------------------
# Delete Incident
# --------------------------------------------------

async def delete_incident(id):

    try:

        result = await incidents_collection.delete_one(
            {"_id": ObjectId(id)}
        )

        if result.deleted_count == 0:

            return {
                "success": False,
                "message": "Incident not found"
            }

        return {
            "success": True,
            "message": "Incident Deleted Successfully"
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }