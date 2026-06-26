from agents.base_agent import BaseAgent


class TestAgent(BaseAgent):

    def __init__(self):
        super().__init__("Test Agent")

    def run(self, state):
        self.log_start()

        print("Hello from Test Agent")

        self.log_finish()

        return state