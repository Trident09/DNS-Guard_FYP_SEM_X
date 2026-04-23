# Architecture

## Overview

DNS Guard is a microservices application with three main services communicating over HTTP, backed by three data stores.

```
Browser
  │
  ▼
Frontend (Next.js 14 · Port 3000)
  │  API routes proxy all requests server-side
  ▼
Backend (FastAPI · Port 8000)
  │  Orchestrates all analysis services in parallel (asyncio.gather)
  ├──▶ AI Service (FastAPI · Port 8001)
  │      └── Returns threat score + feature importance
  ├──▶ PostgreSQL (Port 5432)  — persistent scan storage
  ├──▶ Redis (Port 6379)       — Celery task broker
  └──▶ Qdrant (Port 6333)      — vector DB for chatbot RAG

Celery Worker
  └── Consumes tasks from Redis (background jobs)
```

---

## Request Flow — Domain Analysis

```
1. User submits domain on frontend
2. Frontend POST /api/analyze → Next.js API route
3. Next.js proxies → Backend POST /analyze
4. Backend runs in parallel (asyncio.gather):
     ├── dns_resolver      → dnspython
     ├── whois_lookup      → python-whois
     ├── cert_transparency → crt.sh API
     ├── passive_dns       → PDNS API
     ├── typosquat         → edit-distance vs brand list
     ├── subdomain_enum    → wordlist + CT logs
     ├── reverse_ip        → HackerTarget API
     ├── threat_intel      → Spamhaus DNS + PhishTank API
     └── geo_ip            → ip-api.com
5. Backend POST /score → AI Service
     └── Extracts 40-feature vector → ensemble model → score
6. Backend assembles full response → returns to frontend
7. Frontend renders all cards + charts
```

---

## ML Pipeline

```
Domain string + DNS records
        │
        ▼
  Feature Extractor (40 features)
  ├── Lexical (12):  entropy, length, digit ratio, brand/phish keywords, TLD risk
  ├── DNS (14):      A/MX/NS/TXT presence, SPF/DKIM/DMARC, fast-flux
  ├── DNSSEC (3):    DNSKEY, RRSIG, DS
  └── Composite (7): no DNSSEC, MX without SPF/DMARC, high entropy, brand in subdomain
        │
        ▼
  Ensemble Model
  ├── Rule-based scorer (weighted feature sum)
  └── MLP Neural Network (scikit-learn)
        │
        ▼
  Score (0–100) + Verdict + Feature Importance
```

---

## Chatbot Architecture

```
User message
     │
     ▼
Backend /chat → AI Service /chat
     │
     ├── Try Ollama (local LLM, e.g. mistral)
     │     └── Builds prompt with domain context + conversation history
     │
     └── Fallback: keyword-based rule engine
           └── Matches message against DNS security topics
                 (DNSSEC, SPF/DKIM/DMARC, certs, subdomains, etc.)
```

---

## Data Stores

| Store | Purpose | Data |
|---|---|---|
| **PostgreSQL** | Persistent storage | Scan history, domain records |
| **Redis** | Message broker | Celery task queue |
| **Qdrant** | Vector search | RAG knowledge base for chatbot |

---

## Frontend Component Tree

```
app/layout.tsx          ← Root layout, SEO metadata, ThemeToggle
├── app/page.tsx        ← Home: search input + recent searches
└── app/analyze/[domain]/
    ├── layout.tsx      ← Per-domain SEO metadata
    └── page.tsx        ← Analysis results
        ├── ThreatScoreCard       ← Radial gauge (recharts)
        ├── RiskSummary           ← Actionable recommendations
        ├── DnssecBadge           ← DNSSEC status pill
        ├── WhoisCard             ← WHOIS data
        ├── WhoisDiff             ← Change detection (localStorage)
        ├── DnsRecordsTable       ← A/MX/NS/TXT records
        ├── CertCard              ← CT log summary
        ├── PassiveDnsCard        ← Historical IPs
        ├── TyposquatCard         ← Brand similarity matches
        ├── SubdomainCard         ← Discovered subdomains
        ├── ReverseIpCard         ← Co-hosted domains
        ├── ThreatIntelCard       ← Blocklist status
        ├── GeoMap                ← SVG world map
        ├── ExplainabilityPanel   ← Why this score?
        ├── FeatureImportanceChart← SHAP-style bar chart
        └── ChatBot               ← AI assistant
```
