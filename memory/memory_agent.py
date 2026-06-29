from pathlib import Path
import json


class MemoryAgent:

    def __init__(self):

        self.memory_file = Path("memory/incident_memory.json")

        if (
            not self.memory_file.exists()
            or
            self.memory_file.read_text().strip() == ""
        ):

            self.memory_file.write_text("[]")

    def save(self, state):

        incidents = json.loads(
            self.memory_file.read_text()
        )

        incidents.append(state.model_dump())

        self.memory_file.write_text(
            json.dumps(
                incidents,
                indent=4
            )
        )

    def load(self):

        content = self.memory_file.read_text().strip()

        if not content:
            incidents = []
        else:
            incidents = json.loads(content)