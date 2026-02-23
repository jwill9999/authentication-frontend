# State Management

## Current Approach

- Auth state managed in `AuthContext`
- Access token persisted in memory only and mirrored in API module state
- Non-sensitive user profile may be persisted in localStorage (`user`)
- Protected route checks token presence; user profile may be loaded lazily

## Notes

- Keep API contract mapping in `docs/api/auth-contracts.md`
- Keep token error handling in `docs/api/error-handling.md`

Last Updated: 2026-02-23
