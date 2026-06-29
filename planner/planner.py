from planner.workflow import SecurityWorkflow


class Planner:

    def __init__(self):

        self.workflow = SecurityWorkflow()

    async def run(self, state, force_fresh: bool = False):

        return await self.workflow.run(state, force_fresh=force_fresh)