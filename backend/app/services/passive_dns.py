"""
Passive DNS via HackerTarget (free, no API key).
Falls back to current DNS resolution for IP history simulation.
Detects: fast-flux (many IPs), infrastructure reuse.
"""
import httpx
import asyncio
import dns.resolver
from collections import Counter


async def _hackertarget_lookup(domain: str) -> list[str]:
    """Query HackerTarget for historical DNS records."""
    url = f"https://api.hackertarget.com/hostsearch/?q={domain}"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(url)
        if "error" in res.text.lower() or not res.text.strip():
            return []
        ips = []
        for line in res.text.strip().splitlines():
            parts = line.split(",")
            if len(parts) >= 2:
                ips.append(parts[1].strip())
        return ips
    except Exception:
        return []


def _current_ips(domain: str) -> list[str]:
    """Get current A records as baseline."""
    try:
        answers = dns.resolver.resolve(domain, "A")
        return [str(r) for r in answers]
    except Exception:
        return []


async def get_passive_dns(domain: str) -> dict:
    loop = asyncio.get_event_loop()
    ht_ips, current_ips = await asyncio.gather(
        _hackertarget_lookup(domain),
        loop.run_in_executor(None, _current_ips, domain),
    )

    all_ips = list(dict.fromkeys(ht_ips + current_ips))  # deduplicated, order preserved
    unique_ip_count = len(set(all_ips))
    fast_flux = unique_ip_count > 10
    ip_counts = Counter(all_ips)

    return {
        "total_records": len(all_ips),
        "unique_ips": list(set(all_ips))[:20],
        "unique_ip_count": unique_ip_count,
        "fast_flux_suspected": fast_flux,
        "current_ips": current_ips,
        "top_ips": [{"ip": ip, "count": cnt} for ip, cnt in ip_counts.most_common(5)],
    }
