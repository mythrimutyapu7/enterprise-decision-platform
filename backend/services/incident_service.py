from database.mongodb import database

incidents_collection = database["incidents"]


async def create_incident(incident):
    try:
        incident_data = {
            "title": incident.title,
            "description": incident.description,
            "severity": incident.severity,
            "status": incident.status,
            "created_by": incident.created_by
        }

        result = await incidents_collection.insert_one(incident_data)

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