# State Management

## Current Approach

- Auth state managed in `AuthContext`
- Session persisted using localStorage keys (token, user)
- Protected route checks presence/validity of session data

## Notes

- Keep API contract mapping in `docs/api/auth-contracts.md`
- Keep token error handling in `docs/api/error-handling.md`

Last Updated: 2026-02-22
