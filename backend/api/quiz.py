from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def quiz_placeholder():
    return {"message": "quiz endpoint placeholder"}