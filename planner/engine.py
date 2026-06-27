from planner.planner import Planner
from planner.state import AgentState
from planner.models.incident import IncidentInfo


def analyze_incident(data: dict):

    state = AgentState(

        incident=IncidentInfo(**data)

    )

    planner = Planner()

    result = planner.run(state)

    return result.model_dump()