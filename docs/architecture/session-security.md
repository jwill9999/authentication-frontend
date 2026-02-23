# Session & Security Model

This app uses a split-token strategy:

- Access token: in-memory only (module variable in `src/services/api.ts`)
- Refresh token: expected as httpOnly cookie from backend
- User profile: non-sensitive user info persisted in localStorage

## Why This Model

- Reduces exposure of access token to persistent storage
- Allows silent session restoration via refresh endpoint
- Supports automatic retry on expired access token

## Lifecycle Summary

1. Login calls `POST /auth/login`
2. Backend returns access token + refresh cookie
3. Frontend keeps access token in memory
4. On mount, frontend attempts `POST /auth/refresh`
5. Protected calls use `Authorization: Bearer <token>`
6. On `401`, client attempts one refresh then retries request
7. Logout calls backend and clears in-memory/local user state

## Client Behaviors

- Refresh requests use `credentials: include`
- Concurrent refreshes are deduplicated (`refreshPromise` queue)
- Auth context runs proactive refresh every ~4 minutes when logged in
- Failed refresh clears session and allows route guard redirect to login

## Backend Expectations

- `POST /auth/refresh` returns `{ token }` when refresh cookie is valid
- Refresh cookie is httpOnly and sent on same-site requests
- `POST /auth/logout` and `POST /auth/logout-all` invalidate server session(s)
- CORS and cookie settings allow credentialed requests where needed

## Security Notes

- Do not store access tokens in localStorage
- Keep only minimal user profile data in localStorage
- Prefer same-origin API proxy (`/api`) in containerized setups

Last Updated: 2026-02-22
