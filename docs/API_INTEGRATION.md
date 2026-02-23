# API Integration Overview

This file is the high-level integration map for the frontend.

Detailed, retrieval-friendly API documentation lives in:

- `docs/api/endpoints.md`
- `docs/api/auth-contracts.md`
- `docs/api/error-handling.md`

  Request body:

  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```

  Success response:

  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "string",
      "email": "user@example.com",
      "name": "string"
    }
  }
  ```

2. **POST /auth/register** ✅
   - Location: `src/services/api.ts` → `authAPI.register()`
   - Used in: `src/context/AuthContext.tsx` and `src/pages/Register.tsx`
   - Features:
     - Dedicated register page for first-time users
     - Sends email + password + optional name
     - Password rules: min 8 chars, 1 uppercase, 1 lowercase, 1 number
       - Handles API response contract (`success`, `message`, `error`, `token`, `user`)
       - Redirects to login on successful registration (no auto-login)

### Protected

- `GET /api/profile` → `protectedAPI.getProfile()`
- `GET /api/data` → `protectedAPI.getData()`

## Configuration

**Backend URL:** Set via environment variable

- Default: `http://localhost:3000`
- Override: Create `.env` file with `VITE_API_URL=your_backend_url`

## Session Strategy

- Access token stored in memory only (not localStorage); refresh token stored as an httpOnly cookie
- Non-sensitive user profile (`user` object) may be stored in localStorage
- Access token included for protected API requests via in-memory auth state
- Logout clears in-memory access token and persisted user state

## Flow Summary

- Login: validate → authenticate → persist session → redirect dashboard
- Register: validate → create account → redirect login
- Google OAuth: redirect to backend → callback token capture → persist session
- Protected routes: require token presence; user profile may hydrate lazily

## Notes

- Keep this file concise and navigational.
- Put contract-level request/response details in `docs/api/*`.

Last Updated: 2026-02-23
