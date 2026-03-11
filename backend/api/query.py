from fastapi import APIRouter, HTTPException

from backend.models.schemas import QueryRequest, QueryResponse
from backend.services.rag_pipeline import rag_pipeline


router = APIRouter()


@router.post("/", response_model=QueryResponse)
async def query_document(request: QueryRequest):
    """
    Query the uploaded documents using Retrieval-Augmented Generation.
    """

    try:
        result = await rag_pipeline.query(
            question=request.question,
            document_id=request.document_id,
            top_k=request.top_k
        )

        return QueryResponse(
            answer=result["answer"],
            sources=result["sources"]
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Query failed: {str(e)}"
        )