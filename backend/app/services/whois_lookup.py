import asyncio
from datetime import datetime, timezone
from typing import Any
import whois


def _whois_sync(domain: str) -> dict[str, Any]:
    try:
        w = whois.whois(domain)
    except Exception as e:
        return {"error": str(e)}

    def _date(d: Any) -> str | None:
        if isinstance(d, list):
            d = d[0]
        if isinstance(d, datetime):
            return d.isoformat()
        return str(d) if d else None

    creation = w.creation_date
    expiry = w.expiration_date
    creation_dt = creation[0] if isinstance(creation, list) else creation
    expiry_dt = expiry[0] if isinstance(expiry, list) else expiry

    age_days: int | None = None
    days_until_expiry: int | None = None
    now = datetime.now(timezone.utc)

    if isinstance(creation_dt, datetime):
        if creation_dt.tzinfo is None:
            creation_dt = creation_dt.replace(tzinfo=timezone.utc)
        age_days = (now - creation_dt).days

    if isinstance(expiry_dt, datetime):
        if expiry_dt.tzinfo is None:
            expiry_dt = expiry_dt.replace(tzinfo=timezone.utc)
        days_until_expiry = (expiry_dt - now).days

    return {
        "registrar": w.registrar,
        "creation_date": _date(creation),
        "expiry_date": _date(expiry),
        "updated_date": _date(w.updated_date),
        "name_servers": w.name_servers if isinstance(w.name_servers, list) else [w.name_servers] if w.name_servers else [],
        "status": w.status if isinstance(w.status, list) else [w.status] if w.status else [],
        "age_days": age_days,
        "days_until_expiry": days_until_expiry,
        "is_new_domain": age_days is not None and age_days < 30,
        "expiring_soon": days_until_expiry is not None and 0 < days_until_expiry < 30,
    }


async def get_whois(domain: str) -> dict[str, Any]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _whois_sync, domain)
