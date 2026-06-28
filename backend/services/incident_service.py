from backend.database.mongodb import database
from bson import ObjectId
from datetime import datetime

incidents_collection = database["incidents"]


# --------------------------------------------------
# Create Incident
# --------------------------------------------------

async def create_incident(incident, user_email: str):
    try:
        user_doc = await database["users"].find_one({"email": user_email})
        user_name = user_doc["name"] if user_doc else incident.created_by

        incident_data = {
            "title": incident.title,
            "description": incident.description,
            "severity": incident.severity,
            "status": incident.status,
            "created_by": user_name,
            "created_by_email": user_email,
            "created_at": datetime.utcnow(),

            # AI Analysis (filled after Analyze)
            "analysis": None,

            # Approval Information
            "approved": False,
            "approved_by": None,
            "approved_at": None,

            # Analyst Investigation Notes
            "analyst_notes": "",
            "analyst_notes_updated_at": None
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
# Update Analyst Notes
# --------------------------------------------------

async def update_analyst_notes(id, notes):

    try:

        notes_value = (notes or "").strip()

        await incidents_collection.update_one(
            {"_id": ObjectId(id)},
            {
                "$set": {
                    "analyst_notes": notes_value,
                    "analyst_notes_updated_at": datetime.utcnow(),
                }
            },
        )

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
            "message": "Analyst notes saved successfully",
            "data": {
                "analyst_notes": incident.get("analyst_notes", ""),
                "analyst_notes_updated_at": incident.get("analyst_notes_updated_at"),
            },
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }


# --------------------------------------------------
# Update Incident Status
# --------------------------------------------------

async def update_incident_status(id, status):
    try:
        await incidents_collection.update_one(
            {"_id": ObjectId(id)},
            {
                "$set": {
                    "status": status
                }
            }
        )
        return {
            "success": True,
            "message": "Status updated successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# --------------------------------------------------
# Get All Incidents
# --------------------------------------------------

async def get_all_incidents(user_email: str):

    try:

        incidents = []

        async for incident in incidents_collection.find({"created_by_email": user_email}):

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