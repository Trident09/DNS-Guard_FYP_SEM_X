"""
Threat intel checks:
- Spamhaus DBL: DNS-based blocklist lookup (no API key)
- PhishTank: community phishing feed (no API key)
"""
import asyncio
import csv
import gzip
import io
import dns.resolver
import httpx
from pathlib import Path

PHISHTANK_CACHE = Path("/tmp/phishtank.csv")
PHISHTANK_URL = "http://data.phishtank.com/data/online-valid.csv"

# Spamhaus DBL return codes and their meanings
DBL_CODES = {
    "127.0.1.2": "spam domain",
    "127.0.1.4": "phishing domain",
    "127.0.1.5": "malware domain",
    "127.0.1.6": "botnet C&C domain",
    "127.0.1.102": "abused legit spam",
    "127.0.1.104": "abused legit phishing",
    "127.0.1.105": "abused legit malware",
    "127.0.1.106": "abused legit botnet C&C",
}


def _spamhaus_check(domain: str) -> dict:
    query = f"{domain}.dbl.spamhaus.org"
    try:
        answers = dns.resolver.resolve(query, "A", lifetime=5)
        for rdata in answers:
            ip = str(rdata)
            label = DBL_CODES.get(ip, f"listed ({ip})")
            return {"listed": True, "reason": label, "code": ip}
    except dns.resolver.NXDOMAIN:
        return {"listed": False, "reason": None, "code": None}
    except Exception as e:
        return {"listed": False, "reason": None, "error": str(e)}
    return {"listed": False, "reason": None, "code": None}


async def _ensure_phishtank():
    if PHISHTANK_CACHE.exists():
        return
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.get(PHISHTANK_URL)
        PHISHTANK_CACHE.write_bytes(res.content)
    except Exception:
        pass


def _phishtank_check(domain: str) -> dict:
    if not PHISHTANK_CACHE.exists():
        return {"listed": False, "reason": "feed unavailable"}
    try:
        with open(PHISHTANK_CACHE, encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for row in reader:
                url = row.get("url", "")
                if domain.lower() in url.lower():
                    return {
                        "listed": True,
                        "url": url,
                        "verified": row.get("verified", ""),
                        "target": row.get("target", ""),
                    }
    except Exception:
        pass
    return {"listed": False}


async def get_threat_intel(domain: str) -> dict:
    await _ensure_phishtank()
    loop = asyncio.get_event_loop()

    spamhaus, phishtank = await asyncio.gather(
        loop.run_in_executor(None, _spamhaus_check, domain),
        loop.run_in_executor(None, _phishtank_check, domain),
    )

    any_listed = spamhaus.get("listed") or phishtank.get("listed")

    return {
        "any_listed": any_listed,
        "spamhaus_dbl": spamhaus,
        "phishtank": phishtank,
    }
