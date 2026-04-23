import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import io
from app.services.pdf_report import generate_pdf
from app.services.dns_resolver import resolve_domain
from app.services.whois_lookup import get_whois
from app.services.cert_transparency import get_certs
from app.services.passive_dns import get_passive_dns
from app.services.typosquat import get_typosquat
from app.services.subdomain_enum import get_subdomains
from app.services.reverse_ip import get_reverse_ip
from app.services.threat_intel import get_threat_intel
from app.config import settings
import httpx

router = APIRouter()


@router.get("/report/{domain}/pdf")
async def export_pdf(domain: str):
    dns_data, whois_data, cert_data, pdns_data, typo_data, sub_data, rev_ip_data, intel_data = (
        await asyncio.gather(
            resolve_domain(domain),
            get_whois(domain),
            get_certs(domain),
            get_passive_dns(domain),
            get_typosquat(domain),
            get_subdomains(domain),
            get_reverse_ip(domain),
            get_threat_intel(domain),
        )
    )
    async with httpx.AsyncClient() as client:
        ai_res = await client.post(
            f"{settings.AI_SERVICE_URL}/score",
            json={"domain": domain, "dns_data": dns_data},
            timeout=30,
        )
    ai_result = ai_res.json()

    report = {
        "domain": domain,
        "dns_records": dns_data["records"],
        "dnssec": dns_data["dnssec"],
        "whois": whois_data,
        "certs": cert_data,
        "passive_dns": pdns_data,
        "typosquat": typo_data,
        "subdomains": sub_data,
        "reverse_ip": rev_ip_data,
        "threat_intel": intel_data,
        "threat_score": ai_result["score"],
        "verdict": ai_result["verdict"],
        "explanations": ai_result["explanations"],
    }

    pdf_bytes = generate_pdf(report)
    filename = f"dnsguard_{domain.replace('.', '_')}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
