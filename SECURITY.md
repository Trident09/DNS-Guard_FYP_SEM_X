# Security Policy

## Supported Versions

This is an academic Final Year Project. Only the latest version on the `main` branch is maintained.

| Version | Supported |
|---|---|
| `main` | ✅ |
| Older branches | ❌ |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub Issues.**

If you discover a security vulnerability, please report it responsibly:

1. Open a [GitHub Security Advisory](https://github.com/Trident09/DNS-Guard_FYP_SEM_X/security/advisories/new) (preferred)
2. Or email the maintainer directly via the contact on their GitHub profile

Please include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix (optional)

You can expect an acknowledgement within **48 hours** and a resolution or status update within **7 days**.

## Known Limitations

This project is **not hardened for production use**. Known areas that require attention before any production deployment:

- Default credentials in `.env.example` (`changeme`) must be replaced
- No rate limiting on the `/analyze` endpoint
- No authentication or authorisation layer
- External API calls (ip-api.com, crt.sh, etc.) are made without caching in all cases
- The Ollama LLM integration is unauthenticated

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the production checklist.
