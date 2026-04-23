from fastapi import FastAPI
from app.api import score, chat

app = FastAPI(title="DNS Guard AI", version="0.1.0")

app.include_router(score.router)
app.include_router(chat.router)


@app.get("/health")
def health():
    return {"status": "ok"}
