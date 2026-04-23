"""
Typosquat detection using Levenshtein distance against Tranco top 1M.
Downloads and caches the list on first use (synchronous to avoid race conditions).
"""
import asyncio
import io
import zipfile
import threading
import httpx
from pathlib import Path

CACHE_PATH = Path("/tmp/tranco_top1m.txt")
TRANCO_URL = "https://tranco-list.eu/top-1m.csv.zip"
TOP_N = 10_000

_download_lock = threading.Lock()


def _levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    if len(a) < len(b):
        a, b = b, a
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a):
        curr = [i + 1]
        for j, cb in enumerate(b):
            curr.append(min(prev[j + 1] + 1, curr[j] + 1, prev[j] + (ca != cb)))
        prev = curr
    return prev[-1]


def _ensure_tranco() -> bool:
    """Download Tranco list synchronously if not cached. Thread-safe."""
    if CACHE_PATH.exists():
        return True
    with _download_lock:
        if CACHE_PATH.exists():  # double-check after acquiring lock
            return True
        try:
            import urllib.request
            with urllib.request.urlopen(TRANCO_URL, timeout=30) as resp:
                data = resp.read()
            z = zipfile.ZipFile(io.BytesIO(data))
            with z.open(z.namelist()[0]) as f:
                CACHE_PATH.write_bytes(f.read())
            return True
        except Exception:
            return False


def _load_tranco() -> list[str]:
    domains: list[str] = []
    with open(CACHE_PATH) as f:
        for line in f:
            parts = line.strip().split(",")
            if len(parts) >= 2:
                domains.append(parts[1].strip().lower())
            if len(domains) >= TOP_N:
                break
    return domains


def _check_typosquat(domain: str, tranco: list[str]) -> list[dict]:
    parts = domain.lower().split(".")
    sld = parts[-2] if len(parts) >= 2 else parts[0]
    hits = []
    for popular in tranco:
        pop_parts = popular.split(".")
        pop_sld = pop_parts[-2] if len(pop_parts) >= 2 else pop_parts[0]
        if pop_sld == sld:
            continue
        dist = _levenshtein(sld, pop_sld)
        if dist <= 2:
            hits.append({"target": popular, "distance": dist, "your_sld": sld, "target_sld": pop_sld})
    hits.sort(key=lambda x: x["distance"])
    return hits[:10]


async def get_typosquat(domain: str) -> dict:
    loop = asyncio.get_event_loop()

    # Download + load in thread pool (blocking I/O)
    ok = await loop.run_in_executor(None, _ensure_tranco)
    if not ok:
        return {"error": "Tranco list unavailable", "matches": [], "is_typosquat": False}

    tranco = await loop.run_in_executor(None, _load_tranco)
    matches = await loop.run_in_executor(None, _check_typosquat, domain, tranco)

    return {
        "is_typosquat": len(matches) > 0,
        "match_count": len(matches),
        "matches": matches,
        "checked_against": len(tranco),
    }
