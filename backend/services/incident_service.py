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
        user_name = user_doc["name"] if user_doc else (getattr(incident, "created_by", None) or "Unknown")

        # Ingestion normalization logic
        source_type = getattr(incident, "source_type", None)
        raw_content = getattr(incident, "raw_content", None)
        metadata = getattr(incident, "metadata", None) or {}

        if source_type:
            # Map dynamic source ingestion data to standard fields
            if source_type == "Manual Incident":
                title = metadata.get("title") or "Manual Incident"
                description = metadata.get("description") or raw_content or ""
                severity = metadata.get("severity") or "low"
                status = metadata.get("status") or "open"
            elif source_type == "Email":
                title = f"Email: {metadata.get('subject', 'No Subject')}"
                description = (
                    f"Sender: {metadata.get('sender', 'Unknown')}\n"
                    f"Subject: {metadata.get('subject', 'No Subject')}\n\n"
                    f"Body:\n{metadata.get('body', raw_content or '')}"
                )
                if metadata.get("attachment"):
                    description += f"\n\nAttachment: {metadata.get('attachment')}"
                severity = "medium"  # Default email alert severity
                status = "open"
            elif source_type == "Security Alert":
                alert_name = metadata.get("alert_name") or "Security Alert"
                alert_source = metadata.get("alert_source") or "SIEM"
                title = f"Security Alert: {alert_name} ({alert_source})"
                payload_str = metadata.get("alert_payload") or raw_content or ""
                description = (
                    f"Alert Name: {alert_name}\n"
                    f"Alert Source: {alert_source}\n"
                    f"Severity: {metadata.get('severity', 'medium')}\n\n"
                    f"Payload:\n{payload_str}"
                )
                severity = metadata.get("severity") or "high"
                status = "open"
            elif source_type == "Log File":
                filename = metadata.get("filename") or "log_file.log"
                title = f"Log Ingest: {filename}"
                description = (
                    f"Ingested Log File: {filename}\n"
                    f"File Content Preview:\n{raw_content or ''}"
                )
                severity = "medium"
                status = "open"
            elif source_type == "Meeting Transcript":
                participants = metadata.get("participants") or "SOC Team"
                title = f"Transcript Ingest: Meeting ({participants})"
                description = (
                    f"Participants: {participants}\n\n"
                    f"Transcript Content:\n{raw_content or ''}"
                )
                severity = "low"
                status = "open"
            elif source_type == "PDF Report":
                filename = metadata.get("filename") or "report.pdf"
                title = f"PDF Ingest: {filename}"
                description = (
                    f"Ingested PDF Report: {filename}\n"
                    f"Extracted Content / Highlights:\n{raw_content or ''}"
                )
                severity = "low"
                status = "open"
            elif source_type == "Threat Intelligence Feed":
                ioc = metadata.get("ioc_text") or "N/A"
                cve = metadata.get("cve") or "N/A"
                title = f"Threat Intel: IOC {ioc} | CVE {cve}"
                description = (
                    f"Indicator of Compromise (IOC): {ioc}\n"
                    f"Associated CVE: {cve}\n\n"
                    f"Threat Report Details:\n{metadata.get('threat_report', raw_content or '')}"
                )
                severity = "high"
                status = "open"
            else:
                title = f"Ingested {source_type}"
                description = raw_content or ""
                severity = "low"
                status = "open"
        else:
            # Traditional creation fallback
            title = getattr(incident, "title", None) or "Untitled Incident"
            description = getattr(incident, "description", None) or ""
            severity = getattr(incident, "severity", None) or "low"
            status = getattr(incident, "status", None) or "open"
            source_type = "Manual Incident"
            raw_content = description
            metadata = {
                "title": title,
                "description": description,
                "severity": severity,
                "status": status
            }

        incident_data = {
            "title": title,
            "description": description,
            "severity": severity.lower(),
            "status": status.lower(),
            "created_by": user_name,
            "created_by_email": user_email,
            "created_at": datetime.utcnow(),
            
            # Save original source info
            "source_type": source_type,
            "raw_content": raw_content,
            "metadata": metadata,

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