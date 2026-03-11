from pydantic import BaseModel
from typing import List, Optional


class QueryRequest(BaseModel):
    question: str
    document_id: Optional[str] = None
    top_k: int = 5


class SourceReference(BaseModel):
    document_id: str
    page_number: int
    chunk_index: int
    text: str


class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceReference]


class SearchRequest(BaseModel):
    query: str
    document_id: Optional[str] = None
    top_k: int = 5


class SearchResult(BaseModel):
    text: str
    page_number: int
    document_id: str
    score: float


class SearchResponse(BaseModel):
    results: List[SearchResult]


class QuizRequest(BaseModel):
    document_id: str
    num_questions: int = 5


class SummaryRequest(BaseModel):
    document_id: str