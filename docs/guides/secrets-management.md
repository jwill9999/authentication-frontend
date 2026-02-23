# Secrets Management

This project separates **public frontend config** from **private backend secrets**.

## Rule of Thumb

- If it starts with `VITE_`, treat it as **public**.
- Do **not** put passwords, API private keys, JWT secrets, or database credentials in frontend env files.

## What Is Safe in Frontend `.env`

- `VITE_API_URL`
- `FRONTEND_PORT` (compose host-port setting)

These are configuration values, not secrets.

## What Must Stay Secret (Backend/Platform Only)

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `DATABASE_URL`
- Third-party provider client secrets/private keys

Store these in secure secret stores, not in this frontend repository.

## Local Development: Private Files

For local-only private values, use ignored files such as:

- `.env.local`
- `.env.internal`
- `.env.development.local`

This repository already ignores `.env`, `.env.*`, and `*.local`, so these files are not committed by default.

Use `.env.example` only as a template for non-secret frontend-safe variables.

## Production Secret Names (Set These Exactly)

For compatibility with common backend/deployment templates, set these names in your password manager or CI secret store:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_SECRET` (if Google OAuth is enabled)

Related non-secret deployment variables often set alongside secrets:

- `NODE_ENV=production`
- `PORT=3000`
- `CLIENT_URL=https://<your-frontend-domain>`

## Recommended Secret Stores

- GitHub Actions `Secrets` / `Variables` for CI/CD
- Cloud/Kubernetes secret managers (provider-specific)
- Team password managers for local handoff (then exported to local env on each machine)

## Guidance for Users Cloning This Repo

1. Copy `.env.example` to `.env`
2. Set only frontend-safe values (`VITE_API_URL`, `FRONTEND_PORT`)
3. Store backend secrets using the production names above (`DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, ...)
4. Never commit `.env` with sensitive values

## CI/CD Pattern

- Build frontend with non-secret `VITE_API_URL` only
- Inject backend secrets in backend deployment pipeline
- Keep frontend and backend secret boundaries separate

## Verification Checklist

- [ ] No secret values in `VITE_*` variables
- [ ] No credentials committed to frontend `.env`
- [ ] Backend secrets stored in secure secret manager
- [ ] Production deploy uses secret store, not plaintext files

Last Updated: 2026-02-22
