"""
Reverse IP lookup via HackerTarget (free, no API key).
Finds other domains sharing the same IP — flags if count is suspicious.
"""
import asyncio
import dns.resolver
import httpx


def _get_ip(domain: str) -> str | None:
    try:
        answers = dns.resolver.resolve(domain, "A", lifetime=5)
        return str(answers[0])
    except Exception:
        return None


async def _hackertarget_reverse(ip: str) -> list[str]:
    url = f"https://api.hackertarget.com/reverseiplookup/?q={ip}"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(url)
        if "error" in res.text.lower() or not res.text.strip():
            return []
        return [line.strip() for line in res.text.strip().splitlines() if line.strip()]
    except Exception:
        return []


async def get_reverse_ip(domain: str) -> dict:
    loop = asyncio.get_event_loop()
    ip = await loop.run_in_executor(None, _get_ip, domain)

    if not ip:
        return {"error": "Could not resolve domain to IP", "ip": None, "shared_domains": [], "shared_count": 0}

    shared = await _hackertarget_reverse(ip)

    # Remove the queried domain itself from results
    shared = [d for d in shared if d.lower() != domain.lower()]

    # Flag: many domains on same IP = shared/bulletproof hosting
    high_density = len(shared) > 20

    return {
        "ip": ip,
        "shared_domains": shared[:30],
        "shared_count": len(shared),
        "high_density_hosting": high_density,
    }
