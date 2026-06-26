from planner.models.incident import IncidentInfo

incident = IncidentInfo(
    incident_id=1,
    title="Suspicious Login",
    description="15 failed login attempts followed by a successful login from Russia.",
    severity="High",
    source="Microsoft Sentinel",
    created_by="Security Analyst"
)

print(incident)
print()
print(incident.model_dump())