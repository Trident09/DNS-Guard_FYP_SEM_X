# API Reference

Base URL: `http://localhost:8000`

All request/response bodies are JSON unless noted.

---

## POST `/analyze`

Full domain analysis. Runs all checks in parallel and returns a consolidated report.

**Request**
```json
{ "domain": "example.com" }
```

**Response**
```json
{
  "domain": "example.com",
  "threat_score": 42,
  "verdict": "Suspicious",
  "dns_records": {
    "A": ["93.184.216.34"],
    "MX": ["0 ."],
    "NS": ["a.iana-servers.net.", "b.iana-servers.net."],
    "TXT": ["v=spf1 -all"]
  },
  "dnssec": {
    "dnskey": true,
    "rrsig": true,
    "ds": true
  },
  "whois": {
    "registrar": "RESERVED-Internet Assigned Numbers Authority",
    "creation_date": "1995-08-14T04:00:00",
    "expiry_date": "2025-08-13T04:00:00",
    "age_days": 10650,
    "days_until_expiry": 112,
    "is_new_domain": false,
    "expiring_soon": false
  },
  "certs": {
    "total_certs": 134,
    "wildcard_certs": 0,
    "certs_last_30d": 2,
    "cert_spike": false,
    "has_wildcards": false,
    "recent_certs": [
      {
        "id": 123456,
        "issuer": "DigiCert",
        "name": "example.com",
        "not_before": "2024-01-01",
        "not_after": "2025-01-01"
      }
    ]
  },
  "passive_dns": {
    "total_records": 12,
    "unique_ip_count": 3,
    "fast_flux_suspected": false,
    "top_ips": [
      { "ip": "93.184.216.34", "count": 10 }
    ]
  },
  "typosquat": {
    "is_typosquat": false,
    "match_count": 0,
    "matches": [],
    "checked_against": 500
  },
  "subdomains": {
    "total_found": 4,
    "subdomains": ["www.example.com", "mail.example.com"],
    "suspicious": [],
    "suspicious_count": 0,
    "sources": { "brute_force": 2, "cert_transparency": 2 }
  },
  "reverse_ip": {
    "ip": "93.184.216.34",
    "shared_domains": [],
    "shared_count": 0,
    "high_density_hosting": false
  },
  "threat_intel": {
    "any_listed": false,
    "spamhaus_dbl": { "listed": false },
    "phishtank": { "listed": false }
  },
  "geo": [
    {
      "ip": "93.184.216.34",
      "country": "United States",
      "country_code": "US",
      "city": "Norwell",
      "lat": 42.1596,
      "lon": -70.8217,
      "org": "AS15133 Edgecast Inc."
    }
  ],
  "explanations": [
    {
      "feature": "no_dnssec",
      "reason": "No DNSSEC records found — DNS responses are not cryptographically signed",
      "impact": "medium"
    }
  ],
  "feature_importance": [
    { "feature": "No Dnssec", "value": 20.0, "impact": "medium" }
  ]
}
```

---

## POST `/chat`

Send a message to the AI DNS security assistant.

**Request**
```json
{
  "domain": "example.com",
  "intent": "I want to learn",
  "message": "What is DNSSEC?",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}
```

`intent` must be one of:
- `"I own this domain"`
- `"I want to report abuse"`
- `"I want to learn"`

**Response**
```json
{ "reply": "DNSSEC (DNS Security Extensions) adds cryptographic signatures..." }
```

---

## GET `/report/{domain}/pdf`

Download a full PDF report for a previously analyzed domain.

**Example**
```
GET /report/example.com/pdf
```

**Response** — `application/pdf` binary stream.

> Note: This triggers a fresh analysis to generate the PDF.

---

## GET `/whois/{domain}`

WHOIS lookup only.

**Response**
```json
{
  "registrar": "Example Registrar Inc.",
  "creation_date": "2010-05-01T00:00:00",
  "expiry_date": "2026-05-01T00:00:00",
  "age_days": 5200,
  "days_until_expiry": 365,
  "is_new_domain": false,
  "expiring_soon": false
}
```

---

## GET `/certs/{domain}`

Certificate Transparency log query via crt.sh.

**Response**
```json
{
  "total_certs": 45,
  "wildcard_certs": 2,
  "certs_last_30d": 1,
  "cert_spike": false,
  "has_wildcards": true,
  "recent_certs": [...]
}
```

---

## GET `/passive-dns/{domain}`

Historical DNS resolution records.

**Response**
```json
{
  "total_records": 20,
  "unique_ip_count": 5,
  "fast_flux_suspected": false,
  "top_ips": [
    { "ip": "1.2.3.4", "count": 8 }
  ]
}
```

---

## GET `/subdomains/{domain}`

Subdomain enumeration via brute-force wordlist + CT logs.

**Response**
```json
{
  "total_found": 6,
  "subdomains": ["www.example.com", "mail.example.com", "api.example.com"],
  "suspicious": ["login.example.com"],
  "suspicious_count": 1,
  "sources": { "brute_force": 3, "cert_transparency": 3 }
}
```

---

## GET `/reverse-ip/{domain}`

Find other domains hosted on the same IP.

**Response**
```json
{
  "ip": "93.184.216.34",
  "shared_domains": ["other.com", "another.net"],
  "shared_count": 2,
  "high_density_hosting": false
}
```

---

## GET `/threat-intel/{domain}`

Check domain against Spamhaus DBL and PhishTank.

**Response**
```json
{
  "any_listed": false,
  "spamhaus_dbl": { "listed": false, "reason": null },
  "phishtank": { "listed": false }
}
```

---

## AI Service Endpoints

Base URL: `http://localhost:8001` (internal, proxied via backend)

### POST `/score`

Compute ML threat score for a domain.

**Request**
```json
{
  "domain": "example.com",
  "dns_data": {
    "records": { "A": ["1.2.3.4"], "MX": ["mail.example.com"] },
    "dnssec": { "dnskey": false, "rrsig": false, "ds": false }
  }
}
```

**Response**
```json
{
  "score": 42,
  "verdict": "Suspicious",
  "source": "ensemble",
  "explanations": [...],
  "feature_importance": [...]
}
```

---

## Error Responses

All endpoints return standard HTTP status codes.

| Code | Meaning |
|---|---|
| `200` | Success |
| `422` | Validation error (missing/invalid fields) |
| `500` | Internal server error |

Error body:
```json
{ "detail": "Error message here" }
```
