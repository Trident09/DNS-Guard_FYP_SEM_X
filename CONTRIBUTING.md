# Contributing

Thank you for your interest in DNS Guard. This is an academic Final Year Project — contributions, bug reports, and suggestions are welcome.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/DNS-Guard_FYP_SEM_X.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Push and open a Pull Request

## Development Setup

```bash
cp .env.example .env
docker compose up --build -d
```

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for running services individually.

## Guidelines

### Code Style
- **Python** — follow PEP 8; use type hints where practical
- **TypeScript** — follow the existing ESLint config (`npm run lint`)
- Keep functions small and focused; avoid unnecessary abstraction

### Commits
Use conventional commit prefixes:

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `chore:` | Build, config, tooling |
| `refactor:` | Code change with no behaviour change |

### Pull Requests
- Fill in the pull request template
- Keep PRs focused — one feature or fix per PR
- Ensure `npm run build` passes before submitting
- Describe what you changed and why

## Reporting Bugs

Open a GitHub Issue with:
- Steps to reproduce
- Expected vs actual behaviour
- Browser/OS/Docker version if relevant

## Security Issues

Do **not** open a public issue for security vulnerabilities. See [`SECURITY.md`](SECURITY.md).
