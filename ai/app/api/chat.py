from fastapi import APIRouter
from pydantic import BaseModel
import httpx
import os

router = APIRouter()

OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")

INTENT_PROMPTS = {
    "I own this domain": "You are a DNS security expert helping a domain owner secure their domain. Give specific, actionable advice.",
    "I want to report abuse": "You are a DNS abuse specialist helping someone file a complaint. Guide them through the reporting process with specific resources.",
    "I want to learn": "You are a friendly DNS security educator. Explain concepts clearly with examples.",
}


@router.post("/chat")
async def chat(req: dict):
    domain = req.get("domain", "")
    intent = req.get("intent", "")
    message = req.get("message", "")

    system_prompt = INTENT_PROMPTS.get(intent, "You are a helpful DNS security assistant.")
    full_prompt = f"Domain being analyzed: {domain}\n\nUser: {message}"

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            res = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": full_prompt,
                    "system": system_prompt,
                    "stream": False,
                },
            )
        reply = res.json().get("response", "")
    except Exception:
        # Fallback if Ollama is not running
        reply = _rule_based_reply(intent, domain, message)

    return {"reply": reply}


def _rule_based_reply(intent: str, domain: str, message: str) -> str:
    """Fallback responses when LLM is unavailable."""
    if "I own" in intent:
        return (
            f"To secure {domain}, start by: 1) Enabling DNSSEC, "
            "2) Adding SPF, DKIM, and DMARC records, "
            "3) Monitoring DNS changes regularly. "
            "Ask me about any specific step."
        )
    elif "report" in intent:
        return (
            "To report DNS abuse, you can submit to: "
            "1) ICANN WHOIS Inaccuracy Reporting: icann.org/wicf, "
            "2) Your registrar's abuse contact, "
            "3) PhishTank: phishtank.org, "
            "4) Abuse.ch: abuse.ch. "
            "What type of abuse are you reporting?"
        )
    else:
        return (
            "DNS (Domain Name System) translates domain names to IP addresses. "
            "DNSSEC adds cryptographic signatures to prevent tampering. "
            "What would you like to learn about?"
        )
