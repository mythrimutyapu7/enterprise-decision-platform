import re
import json
from datetime import datetime
from pathlib import Path
from bson import ObjectId
from loguru import logger
from backend.database.mongodb import database

memory_collection = database["memory"]
incidents_collection = database["incidents"]

# =====================================================
# IOC Extraction
# =====================================================

def extract_iocs(text: str) -> dict:
    """
    Extract IP addresses, domains, file hashes (MD5/SHA256),
    and user emails from a block of text.
    """
    if not text:
        return {"ips": [], "domains": [], "hashes": [], "users": []}

    # IP Address regex (v4)
    ips = list(set(re.findall(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b', text)))
    
    # Domain regex (exclude pure numbers and IP matches)
    raw_domains = list(set(re.findall(r'\b[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b', text)))
    domains = []
    for d in raw_domains:
        if re.match(r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$', d):
            continue
        # simple check to filter out obvious logs, version numbers, etc.
        if d.count('.') >= 1 and not d.endswith('.') and not re.search(r'[^a-zA-Z0-9.-]', d):
            domains.append(d)

    # Hashes (MD5: 32 hex, SHA256: 64 hex)
    hashes = list(set(re.findall(r'\b[a-fA-F0-9]{64}\b|\b[a-fA-F0-9]{32}\b', text)))
    
    # User emails
    users = list(set(re.findall(r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b', text)))

    return {
        "ips": ips,
        "domains": domains,
        "hashes": hashes,
        "users": users
    }

# =====================================================
# Similarity Algorithms
# =====================================================

def token_similarity(str1: str, str2: str) -> float:
    """
    Calculate Jaccard similarity between two string token sets.
    """
    if not str1 or not str2:
        return 0.0
    words1 = set(re.findall(r'\w+', str1.lower()))
    words2 = set(re.findall(r'\w+', str2.lower()))
    if not words1 or not words2:
        return 0.0
    return len(words1.intersection(words2)) / len(words1.union(words2))

def list_jaccard(list1, list2) -> float:
    """
    Calculate Jaccard similarity between two lists.
    Returns 1.0 if both lists are empty.
    """
    if not list1 and not list2:
        return 1.0
    if not list1 or not list2:
        return 0.0
    set1, set2 = set(list1), set(list2)
    return len(set1.intersection(set2)) / len(set1.union(set2))

def calculate_similarity(inc1: dict, inc2: dict) -> float:
    """
    Calculate weighted similarity score between inc1 (incoming) and inc2 (stored memory).
    Weights:
      - Title similarity: 30%
      - Description similarity: 30%
      - IOCs overlap: 20%
      - Severity match: 10%
      - Affected assets overlap: 10%
    """
    # 1. Title Similarity (30%)
    title1 = inc1.get("title", "")
    title2 = inc2.get("title", "")
    title_sim = token_similarity(title1, title2)

    # 2. Description Similarity (30%)
    desc1 = inc1.get("description", "")
    desc2 = inc2.get("description", "")
    desc_sim = token_similarity(desc1, desc2)

    # 3. Severity Match (10%)
    sev1 = (inc1.get("severity") or "low").lower()
    sev2 = (inc2.get("severity") or "low").lower()
    sev_sim = 1.0 if sev1 == sev2 else 0.5

    # 4. IOCs Overlap (20%)
    # Combine title, description and key findings / indicators to extract IOCs
    text1 = title1 + " " + desc1
    ioc1 = extract_iocs(text1)
    
    ioc2 = inc2.get("extracted_iocs")
    if not ioc2:
        text2 = title2 + " " + desc2 + " " + " ".join(inc2.get("analysis", {}).get("indicators", []))
        ioc2 = extract_iocs(text2)

    ioc_sims = []
    for key in ["ips", "domains", "hashes", "users"]:
        val1, val2 = ioc1.get(key, []), ioc2.get(key, [])
        if val1 or val2:
            ioc_sims.append(list_jaccard(val1, val2))
    
    ioc_sim = sum(ioc_sims) / len(ioc_sims) if ioc_sims else 1.0

    # 5. Assets Overlap (10%)
    # Stored memory context lists affected assets. Incoming may have affected assets inside metadata or context
    assets1 = inc1.get("metadata", {}).get("affected_assets", []) or inc1.get("context", {}).get("affected_assets", [])
    assets2 = inc2.get("context", {}).get("affected_assets", [])
    assets_sim = list_jaccard(assets1, assets2)

    # Final Weighted Similarity Score
    total_score = (
        title_sim * 0.30 +
        desc_sim * 0.30 +
        sev_sim * 0.10 +
        ioc_sim * 0.20 +
        assets_sim * 0.10
    )
    return total_score

# =====================================================
# Database Helpers
# =====================================================

async def search_similar_incidents(incident_data: dict) -> dict:
    """
    Search MongoDB 'memory' collection for matching completed investigations.
    """
    try:
        best_match = None
        best_score = 0.0

        async for memory_doc in memory_collection.find({}):
            score = calculate_similarity(incident_data, memory_doc)
            if score > best_score:
                best_score = score
                best_match = memory_doc

        # Convert score to percentage
        similarity_percentage = int(best_score * 100)

        # Apply Decision Rules
        if similarity_percentage >= 95:
            decision = "EXISTING_INVESTIGATION"
        elif similarity_percentage >= 80:
            decision = "SIMILAR_INCIDENT"
        else:
            decision = "NO_MATCH"

        result = {
            "success": True,
            "similarity": similarity_percentage,
            "planner_decision": decision,
            "existing_investigation_id": str(best_match["_id"]) if best_match else None,
            "match": None
        }

        if best_match:
            # Format display match details
            resolution_time = best_match.get("time_to_resolution") or "15 Minutes"
            
            # If not explicitly saved, calculate it from timestamps
            created_at = best_match.get("created_at") or best_match.get("timestamp")
            approved_at = best_match.get("approval", {}).get("approval_timestamp")
            if created_at and approved_at:
                try:
                    c_dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                    a_dt = datetime.fromisoformat(approved_at.replace("Z", "+00:00"))
                    delta = a_dt - c_dt
                    minutes = int(delta.total_seconds() / 60)
                    if minutes > 0:
                        if minutes < 60:
                            resolution_time = f"{minutes} Minutes"
                        elif minutes < 1440:
                            resolution_time = f"{minutes // 60} Hours"
                        else:
                            resolution_time = f"{minutes // 1440} Days"
                except Exception:
                    pass

            result["match"] = {
                "id": str(best_match["_id"]),
                "incident_id": best_match.get("incident_id") or str(best_match.get("original_incident_id", best_match["_id"])),
                "title": best_match["title"],
                "severity": best_match.get("severity", "low"),
                "approved": best_match.get("approval", {}).get("approved", False),
                "resolution_time": resolution_time,
                "recommendation": best_match.get("recommendation", {}).get("recommended_action", "No action specified.")
            }

        return result

    except Exception as e:
        logger.error(f"Memory Search Error: {e}")
        return {
            "success": False,
            "error": str(e),
            "similarity": 0,
            "planner_decision": "NO_MATCH",
            "existing_investigation_id": None,
            "match": None
        }

async def add_to_memory(incident_id: str) -> dict:
    """
    Copy a completed, approved or rejected incident's analysis from the 'incidents'
    collection to the 'memory' collection, ensuring it is permanently registered in 
    the organizational memory registry.
    """
    try:
        incident = await incidents_collection.find_one({"_id": ObjectId(incident_id)})
        if not incident:
            return {"success": False, "error": "Incident not found"}

        if not incident.get("analysis"):
            return {"success": False, "error": "Incident has not been analyzed yet"}

        # Calculate resolution time
        created_at = incident.get("created_at")
        approved_at = incident.get("analysis", {}).get("approval", {}).get("approval_timestamp")
        res_time = "15 Minutes"
        if created_at and approved_at:
            try:
                c_dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                a_dt = datetime.fromisoformat(approved_at.replace("Z", "+00:00"))
                delta = a_dt - c_dt
                minutes = int(delta.total_seconds() / 60)
                if minutes > 0:
                    if minutes < 60:
                        res_time = f"{minutes} Minutes"
                    elif minutes < 1440:
                        res_time = f"{minutes // 60} Hours"
                    else:
                        res_time = f"{minutes // 1440} Days"
            except Exception:
                pass

        # Extract IOCs
        indicators_list = incident.get("analysis", {}).get("analysis", {}).get("indicators", [])
        combined_text = (
            incident.get("title", "") + " " + 
            incident.get("description", "") + " " + 
            " ".join(indicators_list)
        )
        extracted_iocs = extract_iocs(combined_text)

        # Prepare memory document
        memory_doc = {
            "original_incident_id": str(incident["_id"]),
            "incident_id": incident.get("incident_id") or f"INC-{datetime.now().year}-{str(incident['_id'])[-4:].upper()}",
            "title": incident["title"],
            "description": incident["description"],
            "severity": incident.get("severity", "low"),
            "created_at": created_at,
            
            # AI outputs
            "analysis": incident["analysis"].get("analysis", {}),
            "recommendation": incident["analysis"].get("recommendation", {}),
            "approval": incident["analysis"].get("approval", {}),
            "context": incident["analysis"].get("context", {}),
            
            # Metadata
            "time_to_resolution": res_time,
            "extracted_iocs": extracted_iocs,
            "timestamp": datetime.utcnow().isoformat()
        }

        # Check if already added to memory
        existing = await memory_collection.find_one({"original_incident_id": str(incident["_id"])})
        if existing:
            await memory_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": memory_doc}
            )
            logger.info(f"Updated organizational memory record for incident {incident_id}")
        else:
            await memory_collection.insert_one(memory_doc)
            logger.info(f"Saved incident {incident_id} to organizational memory collection")

        return {"success": True}

    except Exception as e:
        logger.error(f"Add to memory error: {e}")
        return {"success": False, "error": str(e)}

# =====================================================
# Database Seeding
# =====================================================

async def seed_memory():
    """
    Seed MongoDB 'memory' collection with high-fidelity case investigations 
    from 'memory/incident_memory.json' if it is empty.
    """
    try:
        count = await memory_collection.count_documents({})
        if count > 0:
            logger.info(f"Memory collection has {count} records. Skipping seeding.")
            return

        json_path = Path("memory/incident_memory.json")
        if not json_path.exists():
            logger.warning("memory/incident_memory.json file not found. Seeding skipped.")
            return

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        logger.info(f"Seeding memory collection with {len(data)} items...")
        
        inserted_count = 0
        for i, item in enumerate(data):
            inc = item.get("incident", {})
            ctx = item.get("context", {})
            ana = item.get("analysis", {})
            rec = item.get("recommendation", {})
            appr = item.get("approval", {})

            # Standardize fields
            title = inc.get("title", "Suspicious Activity Detected")
            desc = inc.get("description", "")
            sev = (inc.get("severity") or "low").lower()

            indicators = ana.get("indicators", [])
            combined_text = title + " " + desc + " " + " ".join(indicators)
            iocs = extract_iocs(combined_text)

            # Map the seed object to database schema
            memory_doc = {
                "incident_id": f"INC-2026-000{i+1}",
                "original_incident_id": f"seed-incident-{i+1}",
                "title": title,
                "description": desc,
                "severity": sev,
                "created_at": datetime.utcnow().isoformat(),
                
                "analysis": ana,
                "recommendation": rec,
                "approval": appr,
                "context": ctx,
                
                "time_to_resolution": "12 Minutes" if i == 0 else "24 Minutes" if i == 1 else "45 Minutes",
                "extracted_iocs": iocs,
                "timestamp": datetime.utcnow().isoformat()
            }

            await memory_collection.insert_one(memory_doc)
            inserted_count += 1

        logger.success(f"Successfully seeded {inserted_count} baseline records into MongoDB memory collection")

    except Exception as e:
        logger.error(f"Error seeding memory collection: {e}")
