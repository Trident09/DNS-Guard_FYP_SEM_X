from fastapi import APIRouter
from pydantic import BaseModel
from app.features.extractor import extract, FEATURE_NAMES
from app.models.ensemble import predict

router = APIRouter()


class ScoreRequest(BaseModel):
    domain: str
    dns_data: dict


REASON_MAP = {
    "high_risk_tld": "Domain uses a high-risk TLD commonly associated with abuse",
    "brand_impersonation": "Domain name contains a well-known brand — possible impersonation",
    "phish_keywords": "Domain contains phishing-related keywords (login, secure, verify...)",
    "no_dnssec": "No DNSSEC records found — DNS responses are not cryptographically signed",
    "mx_no_spf": "MX record present but no SPF — email spoofing is possible",
    "mx_no_dmarc": "MX record present but no DMARC — no email authentication policy",
    "fast_flux": "Multiple A records detected — possible fast-flux botnet infrastructure",
    "high_entropy_sld": "Domain name has high character entropy — may be algorithmically generated (DGA)",
    "brand_in_subdomain": "Known brand appears in subdomain but not the registered domain",
    "spam_keywords": "Domain contains spam-related keywords",
}


@router.post("/score")
def score(req: ScoreRequest):
    features = extract(req.domain, req.dns_data)
    result = predict(features)

    # Build plain-English explanations from top contributing features
    explanations = []
    for i, (name, val) in enumerate(zip(FEATURE_NAMES, features)):
        if val > 0 and name in REASON_MAP:
            impact = "high" if i in {8, 9, 10, 23, 35} else "medium" if i in {29, 30, 31, 33} else "low"
            explanations.append({
                "feature": name,
                "reason": REASON_MAP[name],
                "impact": impact,
            })

    return {
        "score": result["score"],
        "verdict": result["verdict"],
        "source": result["source"],
        "explanations": explanations,
    }
