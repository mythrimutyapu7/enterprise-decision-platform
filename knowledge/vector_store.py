class MockVectorStore:
    """
    In-memory mock vector database for document storage and retrieval.
    """
    def __init__(self):
        self.store = []

    def add_document(self, doc_id: str, text: str, embedding: list[float], metadata: dict = None):
        """
        Stores a document's text, mock embedding, and metadata.
        """
        self.store.append({
            "id": doc_id,
            "text": text,
            "embedding": embedding,
            "metadata": metadata or {}
        })

    def query(self, query_embedding: list[float], top_k: int = 3) -> list[dict]:
        """
        Retrieves top_k documents using a mock cosine similarity score.
        """
        if not self.store:
            return []

        # Simple dot product helper for mock cosine similarity
        def mock_similarity(v1, v2):
            if len(v1) != len(v2):
                return 0.0
            return sum(x * y for x, y in zip(v1, v2))

        scored_docs = []
        for doc in self.store:
            score = mock_similarity(query_embedding, doc["embedding"])
            scored_docs.append({
                "document": doc,
                "score": score
            })

        # Sort by similarity score in descending order
        scored_docs.sort(key=lambda x: x["score"], reverse=True)
        return [item["document"] for item in scored_docs[:top_k]]
