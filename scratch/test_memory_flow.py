import asyncio
import os
from dotenv import load_dotenv
load_dotenv()

from backend.services.memory_service import seed_memory, search_similar_incidents, add_to_memory
from backend.database.mongodb import database

async def main():
    print("--- Memory Service Verification ---")
    
    # 1. Ping DB
    try:
        await database.command("ping")
        print("✅ MongoDB Connected successfully.")
    except Exception as e:
        print(f"❌ MongoDB Connection Failed: {e}")
        return
        
    # 2. Run Seeding
    print("Running seed_memory()...")
    await seed_memory()
    
    # 3. Check memory collection count
    count = await database["memory"].count_documents({})
    print(f"Memory collection document count: {count}")
    
    # 4. Test exact query (Suspicious Login)
    test_incident_login = {
        "title": "Suspicious Login",
        "description": "15 failed logins followed by successful login.",
        "severity": "high"
    }
    
    print("\nRunning similarity search for exact match (Suspicious Login)...")
    res1 = await search_similar_incidents(test_incident_login)
    print("Match Result:")
    print(f"  Similarity: {res1.get('similarity')}%")
    print(f"  Decision: {res1.get('planner_decision')}")
    print(f"  Existing Investigation ID: {res1.get('existing_investigation_id')}")
    if res1.get("match"):
        print(f"  Match Title: {res1['match']['title']}")
        print(f"  Match Recommendation: {res1['match']['recommendation']}")
        print(f"  Match Resolution Time: {res1['match']['resolution_time']}")
        print(f"  Match Approved: {res1['match']['approved']}")

    # 5. Test partial query (SSH Brute Force gateway)
    test_incident_ssh = {
        "title": "SSH Gateway Failed logins",
        "description": "Alert: Multiple SSH Gateway login attempts failed. Source IP 203.0.113.88 has been seen performing ssh brute force.",
        "severity": "medium"
    }
    
    print("\nRunning similarity search for partial match (SSH)...")
    res2 = await search_similar_incidents(test_incident_ssh)
    print("Match Result:")
    print(f"  Similarity: {res2.get('similarity')}%")
    print(f"  Decision: {res2.get('planner_decision')}")
    if res2.get("match"):
        print(f"  Match Title: {res2['match']['title']}")
        
    # 6. Test no match query
    test_incident_nomatch = {
        "title": "Routine Windows Update",
        "description": "Routine security patching update is executed on workstation WS-9831.",
        "severity": "low"
    }
    
    print("\nRunning similarity search for no match (Windows patches)...")
    res3 = await search_similar_incidents(test_incident_nomatch)
    print("Match Result:")
    print(f"  Similarity: {res3.get('similarity')}%")
    print(f"  Decision: {res3.get('planner_decision')}")
    
    print("\nVerification Completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
