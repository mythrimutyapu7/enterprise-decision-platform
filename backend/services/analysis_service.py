async def analyze_incident(id: str):
    return {
        "success": True,
        "incident_id": id,
        "risk": "High",
        "confidence": 94,
        "recommendation": "Disable Account",
        "reasoning": [
            "Multiple failed logins",
            "Login from suspicious location"
        ]
    }