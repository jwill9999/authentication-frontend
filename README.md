# Login App

A React application with authentication, form validation, and protected routes.

## Features

- ✅ Email and password login with validation
- ✅ Dedicated first-time user registration page
- ✅ Google SSO button (UI ready for backend integration)
- ✅ Protected routes that require authentication
- ✅ User dashboard accessible only after login
- ✅ Register form validation:
  - Valid email format required
  - Password must contain:
    - At least 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number

## Quick Start

First-time setup:

```bash
cp .env.example .env
```

Then install and run:

```bash
npm install
npm run dev
```

Recommended local check command:

```bash
make quick-check
```

The app will start at `http://localhost:5173`

## Docker (Optional)

Preflight:

- Ensure `.env` exists (copy from `.env.example` if needed).
- Ensure `package-lock.json` exists in the repo.
  - This repo already includes `package-lock.json`.
  - If it is missing in your local copy, run `npm install` once to regenerate it.

Build and run with Docker Compose:

```bash
make docker-build
make docker-up
```

The container serves the app at `http://localhost` by default.

Configuration:

- `VITE_API_URL` is baked in at build time (see `.env.example`)
- `FRONTEND_PORT` controls the host port (default `80`)

Stop services:

```bash
make docker-down
```

Useful `Makefile` commands:

```bash
make help
make quick-check
make ci-local
make docker-build
make docker-up
make docker-health
make docker-logs
make docker-down
```

## Routes

- `/` - Redirects to login
- `/login` - Login page
- `/register` - Registration page
- `/auth/google/callback` - Google OAuth callback route
- `/dashboard` - Protected dashboard (requires authentication)

## Further Reading

- Documentation hub: [docs/README.md](docs/README.md)
- Setup guide: [docs/guides/setup.md](docs/guides/setup.md)
- CI/CD guide: [docs/guides/ci-cd.md](docs/guides/ci-cd.md)
- Branch protection setup: [docs/guides/ci-cd.md#github-ui-setup-branch-protection](docs/guides/ci-cd.md#github-ui-setup-branch-protection)
- Environment variables: [docs/guides/environment.md](docs/guides/environment.md)
- Secrets management: [docs/guides/secrets-management.md](docs/guides/secrets-management.md)
- Proxy-agnostic design: [docs/guides/proxy-agnostic-design.md](docs/guides/proxy-agnostic-design.md)
- Development workflow: [docs/guides/development.md](docs/guides/development.md)
- Testing guide: [docs/guides/testing.md](docs/guides/testing.md)
- Docker guide: [docs/guides/docker.md](docs/guides/docker.md)
- API integration overview: [docs/API_INTEGRATION.md](docs/API_INTEGRATION.md)
- API contracts: [docs/api/endpoints.md](docs/api/endpoints.md), [docs/api/auth-contracts.md](docs/api/auth-contracts.md), [docs/api/error-handling.md](docs/api/error-handling.md)
- Frontend architecture: [docs/architecture/overview.md](docs/architecture/overview.md)
- Session & security model: [docs/architecture/session-security.md](docs/architecture/session-security.md)
