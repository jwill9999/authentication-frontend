# API Error Handling Strategy

## Frontend Handling

- Show user-facing messages for auth failures
- Catch network errors and show retry guidance
- Handle unauthorized (`401`) by clearing session and redirecting to login when appropriate

## UX States

- Loading indicators during requests
- Disabled submit buttons during in-flight auth requests
- Graceful fallback for OAuth callback errors

Last Updated: 2026-02-22
