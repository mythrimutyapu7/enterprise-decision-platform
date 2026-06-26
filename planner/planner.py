from planner.workflow import SecurityWorkflow


class Planner:

    def __init__(self):

        self.workflow = SecurityWorkflow()

    def run(self, state):

        return self.workflow.run(state)