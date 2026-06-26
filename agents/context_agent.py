from agents.base_agent import BaseAgent


class ContextAgent(BaseAgent):

    def __init__(self):

        super().__init__("Context Agent")

    def run(self, state):

        self.log_start()

        state.context.security_policies.append(
            "MFA Required"
        )

        state.context.incident_playbooks.append(
            "Credential Compromise Playbook"
        )

        self.log_finish()

        return state