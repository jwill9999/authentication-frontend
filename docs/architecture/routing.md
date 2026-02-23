# Routing

## Primary Routes

- `/` → redirects to login
- `/login`
- `/register`
- `/dashboard` (protected)
- `/auth/google/callback`

## Guarding Rules

- Unauthenticated users are redirected from protected routes to `/login`
- Authenticated users should not be blocked from dashboard flow

Last Updated: 2026-02-22
