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
3. Callback returns to `/auth/google/callback?token=...`
4. Token loaded into in-memory auth state (user profile optionally persisted), then redirect to dashboard

## Logout

- Clear local auth state and localStorage
- Redirect to `/login`

Last Updated: 2026-02-23
