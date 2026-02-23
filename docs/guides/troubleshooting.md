# Troubleshooting Guide

## Common Issues

### 1) Login fails with valid credentials

- Confirm `VITE_API_URL` points to running backend
- Inspect backend auth response contract

### 2) Redirect loop on protected routes

- Verify an in-memory access token is being set after login/refresh
- Verify localStorage contains only non-sensitive user profile (`user`)
- Verify `ProtectedRoute` token guard behavior

### 3) Google callback token missing

- Confirm backend callback includes `token` query param
- Confirm frontend callback route is correct

Last Updated: 2026-02-23
