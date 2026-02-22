# API Integration Overview

This file is the high-level integration map for the frontend.

Detailed, retrieval-friendly API documentation lives in:

- `docs/api/endpoints.md`
- `docs/api/auth-contracts.md`
- `docs/api/error-handling.md`

## Endpoint Coverage

### Authentication

- `POST /auth/login` → `authAPI.login()`
- `POST /auth/register` → `authAPI.register()`
- `GET /auth/google` → `authAPI.googleLogin()`
- `GET /auth/google/callback` → handled by `GoogleCallback` flow

### Protected

- `GET /api/profile` → `protectedAPI.getProfile()`
- `GET /api/data` → `protectedAPI.getData()`

## Configuration

- Backend URL comes from `VITE_API_URL`
- Default local backend: `http://localhost:3000`

## Session Strategy

- Token/user stored in localStorage
- Token included for protected API requests
- Logout clears persisted auth state

## Flow Summary

- Login: validate → authenticate → persist session → redirect dashboard
- Register: validate → create account → redirect login
- Google OAuth: redirect to backend → callback token capture → persist session
- Protected routes: enforce session presence before rendering dashboard

## Notes

- Keep this file concise and navigational.
- Put contract-level request/response details in `docs/api/*`.

Last Updated: 2026-02-22
