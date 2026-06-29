from fastapi import APIRouter, Depends
from backend.api.dependencies import get_current_user, check_incident_access
from backend.services.memory_service import search_similar_incidents, database

router = APIRouter(
    tags=["Case Memory"]
)

# ----------------------------------------
# Search Memory for Incident
# ----------------------------------------
@router.post("/incidents/{id}/memory-search")
async def memory_search(id: str, incident=Depends(check_incident_access)):
    # incident is retrieved by dependency check_incident_access
    # Pass incident dictionary to search_similar_incidents
    result = await search_similar_incidents(incident)
    return result

# ----------------------------------------
# Get All Saved Memories
# ----------------------------------------
@router.get("/memory")
async def get_all_memories(user=Depends(get_current_user)):
    try:
        memories = []
        async for doc in database["memory"].find({}):
            doc["_id"] = str(doc["_id"])
            memories.append(doc)
        return {
            "success": True,
            "count": len(memories),
            "data": memories
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
