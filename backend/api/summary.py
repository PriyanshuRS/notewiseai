from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def summary_placeholder():
    return {"message": "summary endpoint placeholder"}