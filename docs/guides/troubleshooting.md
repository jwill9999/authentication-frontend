# Troubleshooting Guide

## Common Issues

### 1) Login fails with valid credentials

- Confirm `VITE_API_URL` points to running backend
- Inspect backend auth response contract

### 2) Redirect loop on protected routes

- Verify an in-memory access token is being set after login/refresh
- Verify localStorage contains only non-sensitive user profile (`user`)
- Verify `ProtectedRoute` token guard behavior

### 3) Google callback login fails

- Confirm backend OAuth callback sets refresh cookie (httpOnly) before redirecting to frontend callback route
- Confirm frontend callback route (`/auth/google/callback`) can call `POST /auth/refresh` successfully
- Confirm frontend and backend origins/cookie attributes (`Secure`, `SameSite`, domain/path) are compatible for your environment

Last Updated: 2026-02-23
