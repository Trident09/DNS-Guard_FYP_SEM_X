"""
Subdomain enumeration via DNS brute-force + crt.sh SAN extraction.
Flags suspicious subdomains (login, secure, verify, etc.)
"""
import asyncio
import dns.resolver
import httpx

COMMON_SUBS = [
    "www", "mail", "ftp", "smtp", "pop", "imap", "webmail", "cpanel",
    "admin", "portal", "api", "dev", "staging", "test", "beta", "app",
    "login", "secure", "verify", "account", "update", "support", "help",
    "shop", "store", "pay", "payment", "checkout", "billing", "invoice",
    "vpn", "remote", "cdn", "static", "assets", "media", "img",
    "ns1", "ns2", "mx", "mx1", "mx2", "autodiscover", "autoconfig",
]

SUSPICIOUS_KEYWORDS = {
    "login", "secure", "verify", "account", "update", "payment",
    "checkout", "billing", "invoice", "confirm", "validate", "auth",
}


def _resolve_sub(fqdn: str) -> str | None:
    try:
        dns.resolver.resolve(fqdn, "A", lifetime=3)
        return fqdn
    except Exception:
        return None


async def _crt_subdomains(domain: str) -> set[str]:
    """Extract subdomains from crt.sh certificate SANs."""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            res = await client.get(
                f"https://crt.sh/?q=%.{domain}&output=json",
                headers={"Accept": "application/json"},
            )
        subs: set[str] = set()
        for cert in res.json():
            for name in cert.get("name_value", "").splitlines():
                name = name.strip().lstrip("*.")
                if name.endswith(f".{domain}") or name == domain:
                    subs.add(name)
        return subs
    except Exception:
        return set()


async def get_subdomains(domain: str) -> dict:
    # Run crt.sh lookup and brute-force in parallel
    crt_subs_task = asyncio.create_task(_crt_subdomains(domain))

    loop = asyncio.get_event_loop()
    brute_fqdns = [f"{sub}.{domain}" for sub in COMMON_SUBS]
    brute_results = await asyncio.gather(
        *[loop.run_in_executor(None, _resolve_sub, fqdn) for fqdn in brute_fqdns]
    )
    brute_found = {r for r in brute_results if r}

    crt_found = await crt_subs_task

    all_subs = sorted(brute_found | crt_found)

    suspicious = [
        s for s in all_subs
        if any(kw in s.split(".")[0] for kw in SUSPICIOUS_KEYWORDS)
    ]

    return {
        "total_found": len(all_subs),
        "subdomains": all_subs[:50],
        "suspicious": suspicious,
        "suspicious_count": len(suspicious),
        "sources": {
            "brute_force": len(brute_found),
            "cert_transparency": len(crt_found),
        },
    }
