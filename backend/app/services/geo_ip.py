import httpx

async def get_geo(ips: list[str]) -> list[dict]:
    results = []
    async with httpx.AsyncClient(timeout=10) as client:
        for ip in ips[:10]:  # cap at 10
            try:
                r = await client.get(f"http://ip-api.com/json/{ip}?fields=status,country,countryCode,city,lat,lon,isp,org")
                d = r.json()
                if d.get("status") == "success":
                    results.append({
                        "ip": ip,
                        "country": d.get("country"),
                        "country_code": d.get("countryCode"),
                        "city": d.get("city"),
                        "lat": d.get("lat"),
                        "lon": d.get("lon"),
                        "org": d.get("org") or d.get("isp"),
                    })
            except Exception:
                pass
    return results
