"""
Query crt.sh for certificate transparency logs.
Detects: wildcard certs, cert count spikes, suspicious SANs.
"""
import httpx
from datetime import datetime, timezone


async def get_certs(domain: str) -> dict:
    url = f"https://crt.sh/?q=%.{domain}&output=json"
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            res = await client.get(url, headers={"Accept": "application/json"})
        certs = res.json()
    except Exception as e:
        return {"error": str(e), "certs": [], "summary": {}}

    seen_ids: set = set()
    unique: list[dict] = []
    for c in certs:
        if c.get("id") not in seen_ids:
            seen_ids.add(c["id"])
            unique.append(c)

    wildcards = [c for c in unique if c.get("name_value", "").startswith("*")]
    recent_30d = []
    now = datetime.now(timezone.utc)
    for c in unique:
        try:
            issued = datetime.fromisoformat(c["not_before"].replace("Z", "+00:00"))
            if (now - issued).days <= 30:
                recent_30d.append(c)
        except Exception:
            pass

    # Suspicious: many certs issued in last 30 days (cert farming / phishing infra)
    cert_spike = len(recent_30d) > 10

    return {
        "total_certs": len(unique),
        "wildcard_certs": len(wildcards),
        "certs_last_30d": len(recent_30d),
        "cert_spike": cert_spike,
        "has_wildcards": len(wildcards) > 0,
        "recent_certs": [
            {
                "id": c.get("id"),
                "issuer": c.get("issuer_name", "")[:80],
                "name": c.get("name_value", ""),
                "not_before": c.get("not_before"),
                "not_after": c.get("not_after"),
            }
            for c in unique[:10]  # return latest 10
        ],
    }
