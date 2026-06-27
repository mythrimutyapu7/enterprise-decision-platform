from agents.base_agent import BaseAgent


class HistoryAgent(BaseAgent):

    def __init__(self):

        super().__init__("History Agent")

    def run(self, state):

        self.log_start()

        state.analysis.indicators.append(
            "Found 2 similar historical incidents."
        )

        self.log_finish()

        return state