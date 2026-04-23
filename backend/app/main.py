from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import analyze, chat, reports

app = FastAPI(title="DNS Guard API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)
app.include_router(chat.router)
app.include_router(reports.router)


@app.get("/health")
def health():
    return {"status": "ok"}
