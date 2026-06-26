from planner.state import AgentState
from planner.planner import Planner

from planner.models.incident import IncidentInfo

state = AgentState(

    incident=IncidentInfo(

        incident_id=1,

        title="Suspicious Login",

        description="15 failed logins followed by successful login.",

        severity="High",

        source="Microsoft Sentinel"

    )

)

planner = Planner()

result = planner.run(state)

print(result.model_dump())