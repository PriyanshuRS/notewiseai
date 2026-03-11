from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue
)

from typing import List, Dict
import uuid

from backend.config.settings import settings
from backend.services.embeddings import embedding_service


COLLECTION_NAME = "pdf_chunks"


class VectorStore:
    """
    Handles all interactions with the Qdrant vector database.
    """

    def __init__(self):

        self.client = QdrantClient(
            host=settings.QDRANT_HOST,
            port=settings.QDRANT_PORT
        )

        self.dimension = embedding_service.dimension

        self._ensure_collection()

    def _ensure_collection(self):
        """
        Create collection if it does not exist.
        """

        collections = self.client.get_collections().collections
        existing = [c.name for c in collections]

        if COLLECTION_NAME not in existing:

            self.client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=self.dimension,
                    distance=Distance.COSINE
                )
            )

    def insert_chunks(
        self,
        document_id: str,
        chunks: List[Dict],
        embeddings: List[List[float]]
    ):
        """
        Insert chunk embeddings into Qdrant.
        """

        points = []

        for chunk, vector in zip(chunks, embeddings):

            payload = {
                "text": chunk["text"],
                "document_id": document_id,
                "page_number": chunk["page_number"],
                "chunk_index": chunk["chunk_index"]
            }

            points.append(
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vector,
                    payload=payload
                )
            )

        self.client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )

    def search(
        self,
        query_vector: List[float],
        document_id: str | None = None,
        top_k: int = 5
    ):
        """
        Perform semantic search in Qdrant.
        """

        query_filter = None

        if document_id:
            query_filter = Filter(
                must=[
                    FieldCondition(
                        key="document_id",
                        match=MatchValue(value=document_id)
                    )
                ]
            )

        results = self.client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=top_k,
            query_filter=query_filter
        )

        return results


# Singleton instance
vector_store = VectorStore()