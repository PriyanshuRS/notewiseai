from typing import List

from services.embeddings import embedding_service
from services.vector_store import vector_store
from services.ollama_client import ollama_client


class RAGPipeline:
    async def query(
        self,
        question: str,
        user_id: int,
        document_ids: List[str] = None,
        top_k: int = 5
    ):
        query_vector = embedding_service.embed_query(question)

        results = vector_store.search(
            query_vector=query_vector,
            user_id=user_id,
            document_ids=document_ids,
            top_k=top_k
        )

        if not results or not getattr(results, 'points', None):
            return {
                "answer": "The document does not contain enough information.",
                "sources": []
            }

        retrieved_chunks = []
        sources = []

        for r in results.points:
            payload = r.payload
            retrieved_chunks.append(f"[Page {payload['page_number']}]\n{payload['text']}")
            
            sources.append({
                "document_id": payload["document_id"],
                "page_number": payload["page_number"],
                "chunk_index": payload["chunk_index"],
                "text": payload["text"][:200]
            })

        context = "\n\n".join(retrieved_chunks)
        prompt = self._build_prompt(context, question)
        answer = await ollama_client.generate(prompt)

        return {
            "answer": answer,
            "sources": sources
        }

    def _build_prompt(self, context: str, question: str) -> str:
        prompt = f"""
CONTEXT:
{context}

QUESTION:
{question}

INSTRUCTIONS:
Answer ONLY using the provided context.
If the answer is not present, say:
"The document does not contain enough information."

Include the page numbers in your explanation when relevant.
"""
        return prompt.strip()


rag_pipeline = RAGPipeline()
