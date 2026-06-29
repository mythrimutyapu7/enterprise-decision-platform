from pathlib import Path
from knowledge.loader import KnowledgeLoader
from knowledge.embeddings import EmbeddingGenerator
from knowledge.vector_store import MockVectorStore

class KnowledgeRetriever:
    """
    Coordinates loading knowledge sources, embedding them, and retrieving matches.
    """
    def __init__(self, knowledge_dir: str = "knowledge"):
        self.loader = KnowledgeLoader(base_path=knowledge_dir)
        self.embedder = EmbeddingGenerator()
        self.vector_store = MockVectorStore()
        self._initialize_vector_store()

    def _initialize_vector_store(self):
        """
        Walks the knowledge directory and registers all files into the vector store.
        """
        try:
            base = Path(self.loader.base_path)
            if not base.exists():
                return

            for file_path in base.rglob("*.txt"):
                # Skip __pycache__ or other metadata paths if any
                if any(part.startswith("__") or part.startswith(".") for part in file_path.parts):
                    continue

                content = file_path.read_text(encoding="utf-8")
                embedding = self.embedder.generate_embedding(content)
                doc_id = str(file_path.relative_to(base))

                self.vector_store.add_document(
                    doc_id=doc_id,
                    text=content,
                    embedding=embedding,
                    metadata={
                        "category": file_path.parent.name,
                        "filename": file_path.name,
                        "file_path": str(file_path)
                    }
                )
        except Exception as e:
            # Silently handle failures so the workflow doesn't break
            pass

    def retrieve(self, query: str, top_k: int = 3) -> list[dict]:
        """
        Queries the vector store and returns matching document contents.
        """
        query_embedding = self.embedder.generate_embedding(query)
        return self.vector_store.query(query_embedding, top_k=top_k)
