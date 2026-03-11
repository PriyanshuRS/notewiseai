from fastapi import APIRouter

from .upload import router as upload_router
from .query import router as query_router
from .quiz import router as quiz_router
from .summary import router as summary_router
from .search import router as search_router

api_router = APIRouter()

api_router.include_router(upload_router, prefix="/upload", tags=["Upload"])
api_router.include_router(query_router, prefix="/query", tags=["Query"])
api_router.include_router(quiz_router, prefix="/quiz", tags=["Quiz"])
api_router.include_router(summary_router, prefix="/summary", tags=["Summary"])
api_router.include_router(search_router, prefix="/search", tags=["Search"])