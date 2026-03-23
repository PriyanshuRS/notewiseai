from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    MatchAny
)

from typing import List, Dict
import uuid

from django.conf import settings
from services.embeddings import embedding_service


COLLECTION_NAME = "pdf_chunks"


class VectorStore:
    def __init__(self):
        import os
        from django.conf import settings
        qdrant_path = os.path.join(settings.BASE_DIR, "qdrant_db")
        self.client = QdrantClient(path=qdrant_path)
        self.dimension = embedding_service.dimension
        self._ensure_collection()

    def _ensure_collection(self):
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

    def insert_chunks(self, document_id: str, user_id: int, chunks: List[Dict], embeddings: List[List[float]]):
        points = []
        for chunk, vector in zip(chunks, embeddings):
            payload = {
                "text": chunk["text"],
                "document_id": str(document_id),
                "user_id": user_id,
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
        self.client.upsert(collection_name=COLLECTION_NAME, points=points)

    def search(self, query_vector: List[float], user_id: int, document_ids: List[str] = None, top_k: int = 5):
        must_conditions = [
            FieldCondition(key="user_id", match=MatchValue(value=user_id))
        ]

        if document_ids:
            must_conditions.append(
                FieldCondition(key="document_id", match=MatchAny(any=document_ids))
            )

        query_filter = Filter(must=must_conditions)

        results = self.client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=top_k,
            query_filter=query_filter
        )
        return results

    def delete_document(self, document_id: str):
        self.client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=Filter(
                must=[
                    FieldCondition(key="document_id", match=MatchValue(value=str(document_id)))
                ]
            )
        )

vector_store = VectorStore()
