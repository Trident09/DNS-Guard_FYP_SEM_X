import asyncio
from fastapi import APIRouter
from pydantic import BaseModel
import httpx
from app.services.dns_resolver import resolve_domain
from app.services.whois_lookup import get_whois
from app.services.cert_transparency import get_certs
from app.services.passive_dns import get_passive_dns
from app.services.typosquat import get_typosquat
from app.services.subdomain_enum import get_subdomains
from app.services.reverse_ip import get_reverse_ip
from app.services.threat_intel import get_threat_intel
from app.services.geo_ip import get_geo
from app.config import settings

router = APIRouter()


class AnalyzeRequest(BaseModel):
    domain: str


@router.post("/analyze")
async def analyze(req: AnalyzeRequest):
    (
        dns_data, whois_data, cert_data, pdns_data,
        typo_data, sub_data, rev_ip_data, intel_data,
    ) = await asyncio.gather(
        resolve_domain(req.domain),
        get_whois(req.domain),
        get_certs(req.domain),
        get_passive_dns(req.domain),
        get_typosquat(req.domain),
        get_subdomains(req.domain),
        get_reverse_ip(req.domain),
        get_threat_intel(req.domain),
    )

    # Collect IPs from A/AAAA records
    ips = dns_data["records"].get("A", []) + dns_data["records"].get("AAAA", [])
    if rev_ip_data.get("ip") and rev_ip_data["ip"] not in ips:
        ips.insert(0, rev_ip_data["ip"])

    geo_data, ai_res_raw = await asyncio.gather(
        get_geo(ips),
        _get_ai_score(req.domain, dns_data),
    )
    ai_result = ai_res_raw

    return {
        "domain": req.domain,
        "dns_records": dns_data["records"],
        "dnssec": dns_data["dnssec"],
        "whois": whois_data,
        "certs": cert_data,
        "passive_dns": pdns_data,
        "typosquat": typo_data,
        "subdomains": sub_data,
        "reverse_ip": rev_ip_data,
        "threat_intel": intel_data,
        "geo": geo_data,
        "threat_score": ai_result["score"],
        "verdict": ai_result["verdict"],
        "explanations": ai_result["explanations"],
    }


async def _get_ai_score(domain: str, dns_data: dict) -> dict:
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{settings.AI_SERVICE_URL}/score",
            json={"domain": domain, "dns_data": dns_data},
            timeout=30,
        )
    return res.json()


@router.get("/whois/{domain}")
async def whois_lookup(domain: str):
    return await get_whois(domain)

@router.get("/certs/{domain}")
async def cert_lookup(domain: str):
    return await get_certs(domain)

@router.get("/passive-dns/{domain}")
async def passive_dns_lookup(domain: str):
    return await get_passive_dns(domain)

@router.get("/typosquat/{domain}")
async def typosquat_check(domain: str):
    return await get_typosquat(domain)

@router.get("/subdomains/{domain}")
async def subdomain_enum(domain: str):
    return await get_subdomains(domain)

@router.get("/reverse-ip/{domain}")
async def reverse_ip_lookup(domain: str):
    return await get_reverse_ip(domain)

@router.get("/threat-intel/{domain}")
async def threat_intel_lookup(domain: str):
    return await get_threat_intel(domain)
