from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.utils.auth import verify_token
from backend.database.mongodb import database
from bson import ObjectId

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return payload


async def check_incident_access(id: str, user=Depends(get_current_user)):
    if id.startswith("seed-"):
        return {"_id": id, "title": "Seeded Memory Case", "created_by_email": user["sub"]}

    try:
        obj_id = ObjectId(id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid incident ID format"
        )

    incident = await database["incidents"].find_one({"_id": obj_id})
    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    if incident.get("created_by_email") != user["sub"]:
        raise HTTPException(
            status_code=403,
            detail="Access to this incident is denied"
        )

    return incident