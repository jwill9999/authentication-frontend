# Frontend Architecture Overview

## Scope

React + Vite + TypeScript frontend for authentication and protected routes.

## Key Areas

- `src/pages`: screen-level route components (`Login`, `Register`, `Dashboard`, `GoogleCallback`)
- `src/components`: shared UI and route guards (`ProtectedRoute`)
- `src/context`: auth state and session lifecycle (`AuthContext`)
- `src/services`: API client wrappers and endpoint calls (`api.ts`)

## Related Docs

- [Auth Flow](./auth-flow.md)
- [State Management](./state-management.md)
- [Routing](./routing.md)
- [API Integration Overview](../API_INTEGRATION.md)

Last Updated: 2026-02-22
