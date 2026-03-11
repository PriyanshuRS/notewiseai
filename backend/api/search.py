from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def search_placeholder():
    return {"message": "search endpoint placeholder"}