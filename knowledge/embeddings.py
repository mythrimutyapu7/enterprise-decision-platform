import random

class EmbeddingGenerator:
    """
    Generates text embeddings using Gemini or mock values.
    """
    def __init__(self, model_name: str = "text-embedding-004"):
        self.model_name = model_name

    def generate_embedding(self, text: str) -> list[float]:
        """
        Generates a mock vector of 768 dimensions deterministically based on text input.
        This allows tests/skeletons to run without hit to real APIs.
        """
        vector_size = 768
        # Create a deterministic mock vector based on string hash
        seed = sum(ord(c) for c in text) % 10000
        rng = random.Random(seed)
        return [rng.uniform(-1.0, 1.0) for _ in range(vector_size)]
