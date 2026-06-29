"""
Embedding service.

Purpose:
    Convert enterprise knowledge documents into vector embeddings
    for semantic similarity search.

Current Status:
    Placeholder implementation.

Planned:
    - Google Gemini Embeddings
    - Sentence Transformers
    - OpenAI Embeddings
"""

from typing import List


class EmbeddingService:
    """Interface for generating document embeddings."""

    def embed_documents(self, documents: List[str]):
        """
        Generate embeddings for knowledge documents.

        TODO:
            Replace with a production embedding model.
        """
        raise NotImplementedError(
            "Embedding generation is not implemented yet."
        )

    def embed_query(self, query: str):
        """
        Generate embedding for an incident query.

        TODO:
            Replace with a production embedding model.
        """
        raise NotImplementedError(
            "Query embedding is not implemented yet."
        )
