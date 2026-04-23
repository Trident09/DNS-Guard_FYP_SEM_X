import asyncio
import dns.resolver
import dns.dnssec
import dns.name
import dns.query
import dns.rdatatype


RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"]


def _resolve_sync(domain: str) -> dict:
    records: dict[str, list[str]] = {}
    resolver = dns.resolver.Resolver()
    resolver.timeout = 5
    resolver.lifetime = 10

    for rtype in RECORD_TYPES:
        try:
            answers = resolver.resolve(domain, rtype)
            records[rtype] = [str(r) for r in answers]
        except Exception:
            pass

    # Basic DNSSEC check: look for DNSKEY and RRSIG
    dnssec = {"dnskey": False, "rrsig": False, "ds": False}
    for key, rtype in [("dnskey", "DNSKEY"), ("rrsig", "RRSIG"), ("ds", "DS")]:
        try:
            resolver.resolve(domain, rtype)
            dnssec[key] = True
        except Exception:
            pass

    return {"records": records, "dnssec": dnssec}


async def resolve_domain(domain: str) -> dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _resolve_sync, domain)
