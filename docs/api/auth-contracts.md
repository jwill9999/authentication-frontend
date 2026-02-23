# Auth API Contracts

## Login Request

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

## Login Success Response

```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token",
  "user": {
    "id": "string",
    "email": "user@example.com",
    "name": "string"
  }
}
```

## Register Request

```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "name": "Optional Name"
}
```

## Register Behavior

- Frontend redirects to `/login?registered=1` on success
- If the backend returns an access token on successful registration, the client hydrates the token and user (effective auto-login)
- If no token is returned, the user remains unauthenticated and must log in manually

Last Updated: 2026-02-23
