from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np

from backend.config.settings import settings


class EmbeddingService:
    """
    Handles embedding generation for documents and queries.
    Loads the SentenceTransformer model once and reuses it.
    """

    def __init__(self):

        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)

        # cache embedding dimension
        self.dimension = self.model.get_sentence_embedding_dimension()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for document chunks.
        """

        embeddings = self.model.encode(
            texts,
            batch_size=32,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True
        )

        return embeddings.tolist()

    def embed_query(self, query: str) -> List[float]:
        """
        Generate embedding for a single query.
        """

        embedding = self.model.encode(
            query,
            convert_to_numpy=True,
            normalize_embeddings=True
        )

        return embedding.tolist()


# Singleton instance
embedding_service = EmbeddingService()