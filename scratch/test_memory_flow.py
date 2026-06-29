import asyncio
import os
from dotenv import load_dotenv
load_dotenv()

from backend.services.memory_service import seed_memory, search_similar_incidents, add_to_memory
from backend.services.analysis_service import analyze_incident
from backend.database.mongodb import database
from bson import ObjectId

async def main():
    print("--- Double Incident Upload Verification ---")
    
    # 1. Clean test entries if any
    await database["incidents"].delete_many({"title": "Test Duplicate Breach Event"})
    await database["memory"].delete_many({"title": "Test Duplicate Breach Event"})

    # 2. Ingest first incident
    print("Creating First Incident...")
    incident_a = {
        "title": "Test Duplicate Breach Event",
        "description": "Critical breach: cozy bear executable campaign targets AD controller logs and leaks active tokens.",
        "severity": "critical",
        "status": "open",
        "created_by": "System Auditor",
        "created_by_email": "auditor@enterprise.ai",
        "created_at": "2026-06-29T12:00:00Z"
    }
    result_a = await database["incidents"].insert_one(incident_a)
    incident_a_id = str(result_a.inserted_id)
    print(f"First Incident created with ID: {incident_a_id}")

    # 3. Analyze First Incident (automatically runs AI workflow and stores to memory)
    print("Analyzing First Incident...")
    res_a = await analyze_incident(incident_a_id)
    if res_a.get("success"):
        print("✅ First Incident analyzed and saved to database & memory successfully.")
    else:
        print(f"❌ First Incident analysis failed: {res_a.get('error')}")
        return

    # 4. Ingest second (identical) incident
    print("\nCreating Second (Identical) Incident...")
    incident_b = {
        "title": "Test Duplicate Breach Event",
        "description": "Critical breach: cozy bear executable campaign targets AD controller logs and leaks active tokens.",
        "severity": "critical",
        "status": "open",
        "created_by": "System Auditor",
        "created_by_email": "auditor@enterprise.ai",
        "created_at": "2026-06-29T12:05:00Z"
    }
    result_b = await database["incidents"].insert_one(incident_b)
    incident_b_id = str(result_b.inserted_id)
    print(f"Second Incident created with ID: {incident_b_id}")

    # 5. Search memory for second incident
    print("Searching memory for Second Incident match...")
    # Fetch details from database to pass correct structure to memory search
    incident_b_doc = await database["incidents"].find_one({"_id": ObjectId(incident_b_id)})
    res_search = await search_similar_incidents(incident_b_doc)
    
    print("\nSearch Match Results for Second Incident:")
    print(f"  Similarity Score: {res_search.get('similarity')}%")
    print(f"  Planner Decision: {res_search.get('planner_decision')}")
    print(f"  Existing Investigation ID: {res_search.get('existing_investigation_id')}")
    
    # Assert similarity meets duplicate check gate threshold of >= 95%
    if res_search.get('similarity', 0) >= 95:
        print("✅ SUCCESS: Second incident matches the first incident with similarity >= 95%!")
    else:
        print("❌ FAIL: Jaccard similarity is below duplicate threshold.")

    # 6. Exclude Self-Matching Verification: search memory for first incident itself
    print("\nRunning self-matching exclusion check on First Incident...")
    res_self_search = await search_similar_incidents(incident_a)
    print(f"  First Incident Self-Similarity Score: {res_self_search.get('similarity')}%")
    print(f"  Planner Decision: {res_self_search.get('planner_decision')}")
    if res_self_search.get('similarity', 0) < 95:
        print("✅ SUCCESS: Excluded self-matching! First incident did not match itself.")
    else:
        print("❌ FAIL: First incident matched itself (self-exclusion failed).")

    # Clean up test database entries
    await database["incidents"].delete_many({"title": "Test Duplicate Breach Event"})
    await database["memory"].delete_many({"title": "Test Duplicate Breach Event"})
    print("\nDatabase cleaned up.")

if __name__ == "__main__":
    asyncio.run(main())
