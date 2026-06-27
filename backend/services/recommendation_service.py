from database.mongodb import database
from bson import ObjectId

recommendations_collection = database["recommendations"]


async def get_recommendation(id: str):
    try:
        recommendation = await recommendations_collection.find_one(
            {"_id": ObjectId(id)}
        )

        if not recommendation:
            return {
                "success": False,
                "message": "Recommendation not found"
            }

        recommendation["_id"] = str(recommendation["_id"])

        return {
            "success": True,
            "data": recommendation
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


async def approve_recommendation(id: str):
    try:
        result = await recommendations_collection.update_one(
            {"_id": ObjectId(id)},
            {
                "$set": {
                    "approved": True
                }
            }
        )

        if result.modified_count == 0:
            return {
                "success": False,
                "message": "Recommendation not found"
            }

        return {
            "success": True,
            "message": "Recommendation Approved Successfully"
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }