# Routing

## Primary Routes

- `/` → redirects to login
- `/login`
- `/register`
- `/dashboard` (protected)
- `/auth/google/callback`

## Guarding Rules

- Protected routes require an access token; missing token redirects to `/login`
- Presence of `user` profile is not required at guard-time and may hydrate after route entry

Last Updated: 2026-02-23
