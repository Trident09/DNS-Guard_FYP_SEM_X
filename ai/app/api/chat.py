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
    history = req.get("history", [])

    system_prompt = INTENT_PROMPTS.get(intent, "You are a helpful DNS security assistant.")

    # Build conversation context
    history_text = ""
    for h in history[-6:]:  # last 3 exchanges
        role = "User" if h["role"] == "user" else "Assistant"
        history_text += f"{role}: {h['content']}\n"

    full_prompt = f"Domain being analyzed: {domain}\n\n{history_text}User: {message}"

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
    msg = message.lower()

    # Topic detection
    if any(w in msg for w in ["dnssec", "secure", "security", "protect"]):
        return (
            f"To secure {domain} with DNSSEC: 1) Enable DNSSEC at your registrar, "
            "2) Your registrar generates a KSK and ZSK key pair, "
            "3) A DS record is published in the parent zone, "
            "4) All DNS responses are cryptographically signed. "
            "This prevents DNS spoofing and cache poisoning attacks."
        )
    if any(w in msg for w in ["spf", "dkim", "dmarc", "email", "mail", "spam"]):
        return (
            f"For email security on {domain}: "
            "SPF (TXT record) lists authorized mail servers, "
            "DKIM adds a cryptographic signature to outgoing emails, "
            "DMARC tells receivers what to do when SPF/DKIM fail (none/quarantine/reject). "
            "All three together prevent email spoofing."
        )
    if any(w in msg for w in ["whois", "registrar", "owner", "registered", "who"]):
        return (
            f"WHOIS for {domain} shows registration details: registrar, creation/expiry dates, "
            "and contact info. Privacy protection (WHOIS redaction) hides personal data under GDPR. "
            "Check whois.domaintools.com or your registrar's WHOIS lookup."
        )
    if any(w in msg for w in ["phish", "phishing", "fake", "spoof", "typosquat"]):
        return (
            f"Typosquatting on {domain} involves registering similar domains (e.g. adding hyphens, "
            "swapping letters, or using different TLDs) to deceive users. "
            "To protect yourself: monitor similar domain registrations, enable brand alerts, "
            "and report phishing to PhishTank (phishtank.org) or your registrar's abuse team."
        )
    if any(w in msg for w in ["report", "abuse", "complaint", "malicious"]):
        return (
            "To report DNS abuse: "
            "1) ICANN WHOIS Inaccuracy: icann.org/wicf, "
            "2) Your registrar's abuse contact (found in WHOIS), "
            "3) PhishTank: phishtank.org, "
            "4) Abuse.ch: abuse.ch, "
            "5) Google Safe Browsing: safebrowsing.google.com/safebrowsing/report_phish. "
            "What type of abuse are you reporting?"
        )
    if any(w in msg for w in ["dns", "record", "a record", "mx", "cname", "txt", "ns", "nameserver"]):
        return (
            "Common DNS record types: "
            "A = IPv4 address, AAAA = IPv6, "
            "MX = mail server, CNAME = alias, "
            "TXT = text (used for SPF/DKIM/DMARC), "
            "NS = nameservers, SOA = zone authority. "
            f"You can query {domain}'s records with: dig {domain} ANY"
        )
    if any(w in msg for w in ["ssl", "tls", "certificate", "cert", "https"]):
        return (
            f"SSL/TLS certificates for {domain} encrypt traffic between users and your server. "
            "Certificate Transparency (CT) logs record all issued certs publicly — "
            "useful for detecting unauthorized certificates. "
            "Check crt.sh to see all certs issued for your domain."
        )
    if any(w in msg for w in ["subdomain", "sub"]):
        return (
            f"Subdomains of {domain} (e.g. mail.{domain}, www.{domain}) can expand your attack surface. "
            "Dangling subdomains pointing to decommissioned services are a common vulnerability. "
            "Regularly audit your DNS zone and remove unused subdomains."
        )
    if any(w in msg for w in ["threat", "risk", "score", "malware", "blacklist", "blocklist"]):
        return (
            f"Threat intelligence for {domain} checks it against known malware, phishing, "
            "and spam blacklists (VirusTotal, AbuseIPDB, Spamhaus, etc.). "
            "A high threat score means the domain has been flagged by one or more feeds. "
            "Check virustotal.com for a detailed breakdown."
        )
    if any(w in msg for w in ["hello", "hi", "hey", "help", "what can you"]):
        return (
            f"Hi! I can help you with DNS security for {domain}. "
            "Ask me about: DNSSEC, SPF/DKIM/DMARC, SSL certificates, "
            "subdomains, threat intelligence, typosquatting, or how to report abuse."
        )

    # Intent-based default
    if "I own" in intent:
        return (
            f"To secure {domain}: 1) Enable DNSSEC, "
            "2) Add SPF, DKIM, and DMARC records, "
            "3) Monitor DNS changes regularly. "
            "Ask me about any specific topic like DNSSEC, email security, or certificates."
        )
    if "report" in intent:
        return (
            "I can help you report abuse. Tell me more — is it phishing, malware, "
            "spam, or WHOIS inaccuracy? I'll point you to the right reporting channel."
        )
    return (
        f"I'm your DNS security assistant for {domain}. "
        "Ask me about DNS records, DNSSEC, email security, certificates, "
        "subdomains, threat scores, or how to report abuse."
    )
