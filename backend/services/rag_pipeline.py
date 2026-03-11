from typing import List

from services.embeddings import embedding_service
from services.vector_store import vector_store
from services.ollama_client import ollama_client
from models.schemas import SourceReference


class RAGPipeline:
    """
    Orchestrates the full RAG workflow:
    Query → Embedding → Retrieval → Prompt → LLM → Answer + Sources
    """

    async def query(
        self,
        question: str,
        user_id: int,
        document_id: str | None = None,
        top_k: int = 5
    ):
        """
        Execute the RAG pipeline.
        """

        # Step 1 — Embed query
        query_vector = embedding_service.embed_query(question)

        # Step 2 — Retrieve chunks
        results = vector_store.search(
            query_vector=query_vector,
            user_id=user_id,
            document_id=document_id,
            top_k=top_k
        )

        if not results:
            return {
                "answer": "The document does not contain enough information.",
                "sources": []
            }

        # Step 3 — Build context
        retrieved_chunks = []
        sources: List[SourceReference] = []

        for r in results.points:
            payload = r.payload

            retrieved_chunks.append(
                f"[Page {payload['page_number']}]\n{payload['text']}"
            )

            sources.append(
                SourceReference(
                    document_id=payload["document_id"],
                    page_number=payload["page_number"],
                    chunk_index=payload["chunk_index"],
                    text=payload["text"][:200]
                )
            )

        context = "\n\n".join(retrieved_chunks)

        # Step 4 — Build prompt
        prompt = self._build_prompt(context, question)

        # Step 5 — Call LLM
        answer = await ollama_client.generate(prompt)

        return {
            "answer": answer,
            "sources": sources
        }

    def _build_prompt(self, context: str, question: str) -> str:
        """
        Construct the RAG prompt.
        """

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


# Singleton instance
rag_pipeline = RAGPipeline()
