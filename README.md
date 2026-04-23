# DNS Guard

**Domain threat intelligence platform** — analyze any domain for DNS abuse, misconfigurations, phishing, typosquatting, and security threats. Built as a Final Year Project.

---

## Features

| Feature | Description |
|---|---|
| **Threat Score** | ML-based 0–100 risk score with radial gauge |
| **DNSSEC Check** | Validates DNSKEY, RRSIG, DS records |
| **WHOIS Analysis** | Registrar, age, expiry, new/expiring domain flags |
| **WHOIS Diff** | Detects changes between scans |
| **Certificate Transparency** | Cert count, wildcard detection, spike alerts |
| **Passive DNS** | Historical IP resolution, fast-flux detection |
| **Typosquat Detection** | Edit-distance matching against top brands |
| **Subdomain Enumeration** | Brute-force + CT log discovery |
| **Reverse IP** | Co-hosted domains, high-density hosting detection |
| **Threat Intelligence** | Spamhaus DBL + PhishTank blocklist checks |
| **IP Geolocation Map** | SVG world map with hover tooltips |
| **Feature Importance Chart** | SHAP-style bar chart from ML model |
| **Risk Summary** | Actionable recommendations per scan |
| **AI Chatbot** | Context-aware DNS security assistant (Ollama/fallback) |
| **PDF Report** | Comprehensive downloadable report |
| **Dark / Light Mode** | Persistent theme toggle |
| **Recent Searches** | localStorage history on home page |

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  AI Service │
│  Next.js 14 │     │  FastAPI    │     │  FastAPI    │
│  Port 3000  │     │  Port 8000  │     │  Port 8001  │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         PostgreSQL      Redis       Qdrant
          Port 5432    Port 6379   Port 6333
```

- **Frontend** — Next.js 14 App Router, Tailwind CSS, Recharts, Lucide icons
- **Backend** — FastAPI, Celery workers, ReportLab PDF generation
- **AI Service** — FastAPI, scikit-learn ensemble model, Ollama (optional LLM)
- **PostgreSQL** — persistent storage
- **Redis** — Celery task queue / broker
- **Qdrant** — vector database for RAG (chatbot knowledge base)

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- (Optional) [Ollama](https://ollama.ai) running locally for LLM chatbot

### 1. Clone & configure

```bash
git clone <repo-url>
cd FYP
cp .env.example .env
# Edit .env if needed (defaults work out of the box)
```

### 2. Start everything

```bash
docker compose up --build -d
```

### 3. Open the app

```
http://localhost:3000
```

### 4. Stop

```bash
docker compose down
```

---

## Environment Variables

See `.env.example` for all variables. Key ones:

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_USER` | `dnsabuse` | Database user |
| `POSTGRES_PASSWORD` | `changeme` | **Change in production** |
| `POSTGRES_DB` | `dnsabuse_db` | Database name |
| `REDIS_URL` | `redis://redis:6379/0` | Redis connection |
| `AI_SERVICE_URL` | `http://ai:8001` | Internal AI service URL |
| `OLLAMA_BASE_URL` | `http://host.docker.internal:11434` | Ollama LLM endpoint |
| `OLLAMA_MODEL` | `mistral` | Ollama model name |
| `VIRUSTOTAL_API_KEY` | _(empty)_ | Optional — enhances threat intel |
| `SHODAN_API_KEY` | _(empty)_ | Optional — enhances reverse IP |
| `SECRET_KEY` | `changeme` | **Change in production** |

---

## Project Structure

```
FYP/
├── frontend/               # Next.js 14 app
│   ├── app/
│   │   ├── page.tsx                    # Home / search page
│   │   ├── layout.tsx                  # Root layout + SEO metadata
│   │   ├── analyze/[domain]/
│   │   │   ├── page.tsx                # Analysis results page
│   │   │   └── layout.tsx              # Per-domain SEO metadata
│   │   └── api/
│   │       ├── analyze/route.ts        # Proxy → backend /analyze
│   │       ├── chat/route.ts           # Proxy → backend /chat
│   │       └── report/[domain]/pdf/    # Proxy → backend PDF
│   └── components/
│       ├── ThreatScoreCard.tsx         # Radial gauge
│       ├── RiskSummary.tsx             # Recommendations panel
│       ├── FeatureImportanceChart.tsx  # SHAP-style bar chart
│       ├── GeoMap.tsx                  # SVG world map
│       ├── WhoisDiff.tsx               # WHOIS change detection
│       ├── DnssecBadge.tsx             # DNSSEC status badge
│       ├── ThemeToggle.tsx             # Dark/light mode
│       ├── ChatBot.tsx                 # AI assistant
│       └── ...                         # Other data cards
│
├── backend/                # FastAPI backend
│   └── app/
│       ├── api/
│       │   ├── analyze.py              # Main analysis endpoint
│       │   ├── chat.py                 # Chat proxy to AI service
│       │   └── reports.py             # PDF download endpoint
│       ├── services/
│       │   ├── dns_resolver.py         # DNS + DNSSEC resolution
│       │   ├── whois_lookup.py         # WHOIS data
│       │   ├── cert_transparency.py    # crt.sh CT log queries
│       │   ├── passive_dns.py          # Historical DNS records
│       │   ├── typosquat.py            # Brand similarity detection
│       │   ├── subdomain_enum.py       # Subdomain discovery
│       │   ├── reverse_ip.py           # Reverse IP lookup
│       │   ├── threat_intel.py         # Spamhaus + PhishTank
│       │   ├── geo_ip.py               # IP geolocation (ip-api.com)
│       │   └── pdf_report.py           # ReportLab PDF generation
│       ├── workers/tasks.py            # Celery async tasks
│       └── config.py                   # Pydantic settings
│
├── ai/                     # AI / ML service
│   └── app/
│       ├── api/
│       │   ├── score.py                # Threat scoring endpoint
│       │   └── chat.py                 # Chatbot endpoint (Ollama + fallback)
│       ├── features/extractor.py       # 40-feature vector extraction
│       └── models/
│           ├── ensemble.py             # Ensemble model (RF + rules)
│           └── mlp.py                  # MLP neural network
│
├── scripts/
│   └── update_feeds.py                 # Threat feed updater
├── data/
│   ├── raw/                            # Raw feed data
│   ├── threat_feeds/                   # Processed threat feeds
│   └── knowledge_base/                 # Qdrant RAG documents
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## API Reference

See [`docs/API.md`](docs/API.md) for full endpoint documentation.

### Quick reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/analyze` | Full domain analysis |
| `POST` | `/chat` | AI chatbot message |
| `GET` | `/report/{domain}/pdf` | Download PDF report |
| `GET` | `/whois/{domain}` | WHOIS only |
| `GET` | `/certs/{domain}` | Certificate transparency |
| `GET` | `/passive-dns/{domain}` | Passive DNS history |
| `GET` | `/subdomains/{domain}` | Subdomain enumeration |
| `GET` | `/reverse-ip/{domain}` | Reverse IP lookup |
| `GET` | `/threat-intel/{domain}` | Blocklist check |

---

## ML Model

The threat scoring model uses a **40-feature vector** extracted from the domain name and DNS records:

- **Lexical features** (12) — entropy, length, digit ratio, brand keywords, phishing keywords, TLD risk
- **DNS record features** (14) — A/MX/NS/TXT presence, SPF/DKIM/DMARC, fast-flux indicators
- **DNSSEC features** (3) — DNSKEY, RRSIG, DS presence
- **Composite features** (7) — no DNSSEC, MX without SPF/DMARC, high entropy, brand in subdomain

The ensemble combines rule-based scoring with an MLP neural network. Feature importance is returned with each score for explainability.

---

## Chatbot

The AI assistant uses **Ollama** (local LLM, default: `mistral`) when available. If Ollama is not running, it falls back to a keyword-based rule engine covering:

- DNSSEC configuration
- SPF / DKIM / DMARC email security
- SSL/TLS certificates
- Subdomain security
- Threat intelligence & blocklists
- Typosquatting & phishing
- Abuse reporting resources

---

## Development

### Run frontend locally

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

### Run backend locally

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Run AI service locally

```bash
cd ai
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### Update threat feeds

```bash
python scripts/update_feeds.py
```

---

## License

Academic project — Final Year Project. Not for production use without security hardening.
