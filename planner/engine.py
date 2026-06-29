from planner.planner import Planner
from planner.state import AgentState
from planner.models.incident import IncidentInfo


async def run_ai_analysis(data: dict, force_fresh: bool = False):

    state = AgentState(

        incident=IncidentInfo(**data)

    )

    planner = Planner()

    result = await planner.run(state, force_fresh=force_fresh)

    return result.model_dump()