# Proxy-Agnostic Design

This frontend follows a proxy-agnostic pattern.

## Core Principle

- Frontend calls API using relative path `/api`
- Reverse proxy handles `/api/*` forwarding to backend
- Frontend image stays environment-agnostic

Because of this, nginx is the default implementation here, not a platform lock-in.

## What a Replacement Proxy Must Do

Any replacement (Traefik, Caddy, HAProxy, Envoy, cloud gateway, Kubernetes ingress) must:

1. Serve frontend static files and SPA fallback routing
2. Forward `/api/*` to backend upstream
3. Preserve forwarded headers (`Host`, `X-Forwarded-*`)
4. Support credentialed cookie flow for refresh/logout endpoints

## Swap Checklist

- Keep frontend API base as `/api`
- Configure SPA fallback to `index.html`
- Configure `/api` upstream target per environment
  - Dev: backend dev service
  - Prod: backend prod service
- Confirm TLS/cookie policy in each environment
  - `Secure`, `SameSite`, domain/scope behavior
- Validate auth flows after swap
  - login
  - refresh
  - protected endpoint calls
  - logout/logout-all

## Example Mapping by Environment

- Dev domain: `app-dev.example.com` → `/api` to `backend-dev:3000`
- Prod domain: `app.example.com` → `/api` to `backend-prod:3000`

Different domain names are supported as long as proxy + cookie/TLS settings are correct.

## Current Repository Defaults

- Current default proxy: nginx (`nginx.conf`)
- Optional local proxy mode is documented in `docs/guides/docker.md`

Last Updated: 2026-02-22
