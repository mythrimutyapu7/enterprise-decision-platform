import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_api_flow():
    print("=== HTTP API Integration Memory Flow Test ===")
    
    # 1. Register a test user
    email = f"test-analyst-{int(time.time())}@enterprise.ai"
    password = "Password123!"
    
    print(f"Registering user: {email}...")
    reg_res = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Test Analyst",
        "email": email,
        "password": password
    })
    
    if reg_res.status_code != 200:
        print(f"❌ Registration failed: {reg_res.text}")
        return
        
    print("✅ Registered successfully.")
    
    # 2. Login to get token
    print("Logging in...")
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    
    if login_res.status_code != 200:
        print(f"❌ Login failed: {login_res.text}")
        return
        
    token = login_res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Logged in successfully. Token acquired.")
    
    # 3. Create Incident 1
    print("\nCreating First Incident...")
    incident_a_payload = {
        "title": "API Duplicate Test Event",
        "description": "This is a critical duplicate test description to verify similarity match of Cozy Bear.",
        "severity": "critical",
        "status": "open",
        "createdBy": "Test Analyst"
    }
    
    create_a_res = requests.post(f"{BASE_URL}/incidents/", json=incident_a_payload, headers=headers)
    if create_a_res.status_code != 200:
        print(f"❌ Create Incident 1 failed: {create_a_res.text}")
        return
        
    incident_a_id = create_a_res.json().get("id")
    print(f"✅ First Incident created with ID: {incident_a_id}")
    
    # 4. Search memory for Incident 1 (Should be NO_MATCH because it's not analyzed yet)
    print("Searching memory for Incident 1 (should be NO_MATCH)...")
    search_a_res = requests.post(f"{BASE_URL}/incidents/{incident_a_id}/memory-search", headers=headers)
    print(f"Search 1 Status: {search_a_res.status_code}")
    print(f"Search 1 Response: {search_a_res.json()}")
    
    # 5. Analyze Incident 1 (runs AI pipeline and stores in memory)
    print("\nAnalyzing Incident 1 (Calling Gemini)...")
    analyze_a_res = requests.post(f"{BASE_URL}/incidents/{incident_a_id}/analyze", headers=headers)
    if analyze_a_res.status_code != 200:
        print(f"❌ Analyze Incident 1 failed: {analyze_a_res.text}")
        return
    print("✅ Incident 1 analyzed and stored in memory successfully.")
    
    # 6. Create Incident 2 (Identical description)
    print("\nCreating Second (Identical) Incident...")
    incident_b_payload = {
        "title": "API Duplicate Test Event",
        "description": "This is a critical duplicate test description to verify similarity match of Cozy Bear.",
        "severity": "critical",
        "status": "open",
        "createdBy": "Test Analyst"
    }
    
    create_b_res = requests.post(f"{BASE_URL}/incidents/", json=incident_b_payload, headers=headers)
    incident_b_id = create_b_res.json().get("id")
    print(f"✅ Second Incident created with ID: {incident_b_id}")
    
    # 7. Search memory for Incident 2 (Should match Incident 1 at >= 95% similarity!)
    print("Searching memory for Incident 2 (should find Incident 1)...")
    search_b_res = requests.post(f"{BASE_URL}/incidents/{incident_b_id}/memory-search", headers=headers)
    print(f"Search 2 Status: {search_b_res.status_code}")
    search_b_data = search_b_res.json()
    print(f"Search 2 Response: {json.dumps(search_b_data, indent=2)}")
    
    similarity = search_b_data.get("similarity", 0)
    decision = search_b_data.get("planner_decision")
    
    if similarity >= 95 and decision == "EXISTING_INVESTIGATION":
        print("\n✅ SUCCESS: API correctly identified the duplicate incident at >= 95% similarity!")
    else:
        print(f"\n❌ FAIL: API similarity was {similarity}% (decision: {decision})")
        
if __name__ == "__main__":
    test_api_flow()
