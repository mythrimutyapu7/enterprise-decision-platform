from pathlib import Path


class KnowledgeLoader:
    """
    Loads enterprise knowledge from the knowledge directory.
    """

    def __init__(self, base_path="knowledge"):
        self.base_path = Path(base_path)

    def load_all(self) -> str:
        """
        Reads every .txt file inside the knowledge folder
        and combines them into a single context document.
        """

        documents = []

        for file in self.base_path.rglob("*.txt"):

            title = file.stem.replace("_", " ").title()

            content = file.read_text(encoding="utf-8")

            documents.append(
                f"\n===== {title} =====\n{content}"
            )

        return "\n".join(documents)