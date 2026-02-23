# Docker Guide

This frontend is built with a multi-stage Dockerfile and served by nginx.

## Preflight

Before building:

1. Copy `.env.example` to `.env` and set values
2. Confirm `package-lock.json` exists

```bash
cp .env.example .env
```

If `package-lock.json` is missing in your local copy, run:

```bash
npm install
```

## Quick Start

```bash
docker compose build frontend
docker compose up -d frontend
```

App URL (default): `http://localhost`

Runtime note:

- Container runs unprivileged nginx on internal port `8080`
- Compose maps host `${FRONTEND_PORT:-80}` to container `8080`

## Stop

```bash
docker compose down
```

## Health & Availability Checks

The container exposes a health endpoint at `/healthz` and defines Docker health checks.

Quick checks:

```bash
docker compose ps
docker inspect --format='{{json .State.Health}}' $(docker compose ps -q frontend)
curl -f http://localhost:${FRONTEND_PORT:-80}/healthz
```

Expected `/healthz` response: `ok`

## Makefile Shortcuts

```bash
make docker-build
make docker-up
make docker-logs
make docker-down
```

## Configuration

- `VITE_API_URL` is passed as a build arg and baked into the Vite bundle.
- `FRONTEND_PORT` maps host port to container port `8080`.
- Preferred deployment mode is same-origin `/api` proxy for tighter CSP and simpler CORS behavior.

Example `.env` values:

```env
VITE_API_URL=http://localhost:3000
FRONTEND_PORT=80
```

Production-friendly proxy-mode example:

```env
VITE_API_URL=/api
FRONTEND_PORT=80
```

## API Proxy Mode (Recommended)

Use proxy mode to avoid CORS during local containerized setup:

1. Set `VITE_API_URL=/api` at build time
2. Enable both `/api/auth/` rewrite and `/api/` passthrough proxy blocks in `nginx.conf`
3. Ensure backend is reachable as `http://backend:3000`

Example nginx proxy pattern:

```nginx
location /api/auth/ {
	rewrite            ^/api/(auth/.*)$ /$1 break;
	proxy_pass         http://backend:3000;
	proxy_http_version 1.1;
	proxy_set_header   Host              $host;
	proxy_set_header   X-Real-IP         $remote_addr;
	proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
	proxy_set_header   X-Forwarded-Proto $scheme;
}

location /api/ {
	proxy_pass         http://backend:3000;
	proxy_http_version 1.1;
	proxy_set_header   Host              $host;
	proxy_set_header   X-Real-IP         $remote_addr;
	proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
	proxy_set_header   X-Forwarded-Proto $scheme;
}
```

Helper command:

```bash
make docker-build-proxy
```

For proxy replacement guidance (Traefik/Caddy/Ingress/etc.), see `docs/guides/proxy-agnostic-design.md`.

## Notes

- Static assets are served by nginx from `dist/`.
- SPA routing is handled via `try_files ... /index.html`.
- Security headers and gzip are configured in `nginx.conf`.

## Security Best Practices

- Keep base images patched regularly (rebuild on security updates).
- Scan images in CI (e.g., Trivy/Grype/Snyk).
- Keep frontend env values non-secret (`VITE_*` is public at build time).
- Rotate Docker logs (configured in `docker-compose.yml`).
- Use HTTPS/TLS termination in front of nginx for production.
- Keep CSP enabled and reviewed in `nginx.conf`.

### CSP Tightening Strategy

This repository uses a staged approach:

1. Enforced `Content-Security-Policy` baseline for immediate protection
2. Stricter `Content-Security-Policy-Report-Only` policy for validation
3. Promote report-only policy to enforced after verification

Validation tips:

- Watch browser console for CSP report-only violations
- Monitor requests to `/csp-report`
- Ensure auth, routing, and API calls still work before tightening

Current implementation in this repository:

- Container health checks (`/healthz`) at image and compose level
- CSP and browser hardening headers in `nginx.conf`
- GitHub Actions image vulnerability scanning (`.github/workflows/container-security.yml`)

Last Updated: 2026-02-23
