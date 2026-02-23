# Authentication Flow

## Login

1. User submits credentials on `/login`
2. Frontend validates input
3. `POST /auth/login`
4. Access token stored in memory; non-sensitive user profile may be persisted in localStorage
5. Redirect to `/dashboard`

## Register

1. User opens `/register`
2. Frontend validates password policy
3. `POST /auth/register`
4. Redirect to `/login?registered=1`

## Google OAuth

1. User clicks Google auth button
2. Redirect to backend `/auth/google`
3. Backend completes OAuth handshake and sets refresh session cookie (httpOnly)
4. Frontend callback route (`/auth/google/callback`) restores access token via `POST /auth/refresh`
5. Frontend optionally hydrates user profile via protected API, then redirects to dashboard

## Logout

- Clear local auth state and localStorage
- Redirect to `/login`

Last Updated: 2026-02-23
