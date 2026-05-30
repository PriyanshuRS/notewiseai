from typing import List

from services.embeddings import embedding_service
from services.vector_store import vector_store
from services.llm_client import llm_client

class RAGPipeline:
    async def query(
        self,
        question: str,
        user_id: int,
        document_ids: List[str] = None,
        top_k: int = 5,
        provider: str = "ollama",
        api_key: str = ""
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
        answer = await llm_client.generate(prompt, provider=provider, api_key=api_key)

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
You are an intelligent, helpful, and engaging study assistant.
1. Use the provided CONTEXT as your primary source of truth and ground your answer in it.
2. Focus on conceptual understanding and synthesize the context. Do not be overly rigid or look only for exact word matches; instead, capture the overall meaning.
3. If the context does not fully cover the answer, you are encouraged to use your general knowledge to bridge the gap, elaborate, or explain the concepts, but clearly distinguish or indicate when you are drawing from general knowledge versus quoting/referencing the document.
4. When referencing facts, details, or quotes from the context, make sure to cite the page numbers (e.g., [Page X]) to show where they came from.
5. Be comprehensive, explanatory, and student-friendly in your response.
"""
        return prompt.strip()


rag_pipeline = RAGPipeline()
