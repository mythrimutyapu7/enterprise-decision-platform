from planner.state import AgentState
from planner.models.incident import IncidentInfo


state = AgentState(

    incident=IncidentInfo(

        incident_id=1,

        title="Suspicious Login",

        description="15 failed login attempts followed by successful login.",

        severity="High",

        source="Microsoft Sentinel"

    )

)

print(state)

print()

print(state.model_dump())