# Deployment

## Local Development (Docker)

The recommended way to run the full stack.

```bash
# Start all services
docker compose up --build -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild a single service after code changes
docker compose up --build -d backend
```

Services and ports:

| Service | Port | URL |
|---|---|---|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 8000 | http://localhost:8000/docs |
| AI Service | 8001 | http://localhost:8001/docs |
| PostgreSQL | 5432 | — |
| Redis | 6379 | — |
| Qdrant | 6333 | http://localhost:6333/dashboard |

---

## Running Services Individually

### Frontend

```bash
cd frontend
npm install
npm run dev       # development
npm run build && npm start  # production
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Celery Worker

```bash
cd backend
celery -A app.celery_app worker --loglevel=info
```

### AI Service

```bash
cd ai
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

---

## Optional: Groq API (AI Chatbot)

Sign up at [console.groq.com](https://console.groq.com) and create a free API key, then add it to `.env`:

```bash
GROQ_API_KEY=gsk_your_key_here
```

The AI service will use Groq when `GROQ_API_KEY` is set. Without it, the chatbot falls back to a built-in rule-based engine.

---

## Optional: External API Keys

Add to `.env` to enhance results:

```env
VIRUSTOTAL_API_KEY=your_key_here   # Enhances threat intelligence
SHODAN_API_KEY=your_key_here       # Enhances reverse IP lookup
```

---

## Production Checklist

Before deploying to production:

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Change `POSTGRES_PASSWORD` to a strong password
- [ ] Set `ENVIRONMENT=production`
- [ ] Put the app behind a reverse proxy (nginx/Caddy) with HTTPS
- [ ] Restrict database and Redis ports (remove public port bindings)
- [ ] Set up log aggregation
- [ ] Configure rate limiting on the `/analyze` endpoint

---

## Updating Threat Feeds

```bash
python scripts/update_feeds.py
```

This downloads the latest Spamhaus and other threat feed data into `data/threat_feeds/`. Schedule this as a cron job for production use.
