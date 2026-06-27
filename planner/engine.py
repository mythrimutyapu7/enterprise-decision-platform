from planner.planner import Planner
from planner.state import AgentState
from planner.models.incident import IncidentInfo


def run_ai_analysis(data: dict):

    state = AgentState(

        incident=IncidentInfo(**data)

    )

    planner = Planner()

    result = planner.run(state)

    return result.model_dump()