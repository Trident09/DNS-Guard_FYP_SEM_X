from fastapi import APIRouter
from pydantic import BaseModel
import httpx
from app.config import settings

router = APIRouter()


class ChatRequest(BaseModel):
    domain: str
    intent: str
    message: str


@router.post("/chat")
async def chat(req: ChatRequest):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{settings.AI_SERVICE_URL}/chat",
            json=req.model_dump(),
            timeout=60,
        )
    return res.json()
