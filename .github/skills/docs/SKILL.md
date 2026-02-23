---
name: docs
description: Update, create, or maintain project documentation in the docs/ folder for this React + Vite frontend. Use this skill when writing or editing README files, API integration docs, route/auth flow docs, component or state-management docs, testing docs, setup guides, troubleshooting guides, backlog/planning docs, or changelog entries. Triggers on tasks involving docs, documentation, changelog, backlog, roadmap, guides, frontend architecture, API integration, auth flows, routes, or testing notes.
---

# Documentation Instructions

## Purpose

Maintain comprehensive, accurate documentation for the Login App frontend project.

## Documentation Structure

Use and maintain this structure:

```
docs/
├── README.md                  # Documentation index and overview
├── architecture/              # Frontend architecture and design decisions
│   ├── overview.md           # App structure (pages/components/context/services)
│   ├── auth-flow.md          # Login/register/google callback route flow
│   ├── state-management.md   # AuthContext and localStorage strategy
│   └── routing.md            # Protected routes and navigation behavior
├── planning/                  # Project planning and tracking
│   ├── index.md              # Completed features and additions
│   ├── backlog.md            # Planned features and improvements
│   └── roadmap.md            # Long-term frontend direction
├── api/                       # Frontend API contract docs
│   ├── endpoints.md          # Endpoint reference used by frontend services
│   ├── auth-contracts.md     # Login/register/google callback payloads
│   └── error-handling.md     # Error states and UX handling strategy
├── guides/                    # How-to guides
│   ├── setup.md              # Local setup and environment configuration
│   ├── development.md        # Workflow, scripts, lint, test, build
│   ├── testing.md            # Vitest + Testing Library conventions
│   └── troubleshooting.md    # Common frontend/runtime issues
└── changelog/                 # Change history
	└── YYYY-MM.md            # Monthly changelog entries
```

## Guidelines for Maintaining Documentation

### 1. **Always Update When:**

- Adding or changing pages, routes, or navigation
- Modifying auth behavior (login/register/logout/google callback)
- Changing API request/response contracts used by `src/services/api.ts`
- Introducing or changing environment variables (e.g., `VITE_API_URL`)
- Updating validation rules or major UI states
- Adding/changing tests, linting, or build workflows

### 2. **Documentation Standards:**

- Use clear, concise language
- Prefer frontend-focused examples (route paths, payloads, component behavior)
- Date entries in ISO format (`YYYY-MM-DD`)
- Keep docs aligned with actual source files in `src/`
- Cross-link related docs (e.g., auth flow ↔ API contracts ↔ troubleshooting)

### 3. **Format for Index Entries:**

```markdown
### [Feature Name] - YYYY-MM-DD

**Status:** ✅ Completed | 🚧 In Progress | ⏸️ Paused
**Author:** [Name/Team]
**Description:** Brief description of what changed
**Frontend Areas:** Routes/pages/components/context/services affected
**Files Changed:** List of key files
**Related Docs:** Links to related documentation
```

### 4. **Format for Backlog Entries:**

```markdown
### [Feature Name]

**Priority:** 🔴 High | 🟡 Medium | 🟢 Low
**Effort:** Small | Medium | Large
**Description:** What needs to be done
**Dependencies:** Backend/API or project prerequisites
**Acceptance Criteria:** What defines "done"
```

### 5. **Changelog Format:**

Follow Keep a Changelog sections:

- `Added` for new features
- `Changed` for modifications to existing behavior
- `Deprecated` for soon-to-be removed behavior
- `Removed` for removed features
- `Fixed` for bug fixes
- `Security` for auth/session/security-related updates

### 6. **When to Create New Documents:**

- Major auth or routing changes require dedicated architecture docs
- New backend contract or integration behavior needs API docs updates
- Complex setup/workflow changes require guide updates
- Repeated production/local issues require troubleshooting entries

### 7. **AI Assistant Responsibilities:**

When working on this project, you should:

- Update relevant frontend docs automatically with code changes
- Keep `docs/API_INTEGRATION.md` as the high-level integration map
- Keep `docs/api/*.md` as the canonical detailed API contract docs
- Suggest new docs when architecture, routing, or auth complexity increases
- Maintain consistent formatting and cross-references
- Update timestamps/version references when applicable
- Flag outdated docs when code and documentation diverge

### 8. **Review Checklist:**

Before completing any task, verify:

- [ ] Updated `README.md` when setup, UX flow/routes, scripts, or developer workflow changed
- [ ] Updated `docs/API_INTEGRATION.md` when integration flow/coverage changed
- [ ] Updated `docs/api/*.md` when request/response contracts or error handling changed
- [ ] Added or updated architecture docs for auth/routing/state changes
- [ ] Added/updated guides for setup/testing/workflow changes
- [ ] Added changelog/backlog/index entries if the change is significant
- [ ] Confirmed documentation matches current TypeScript source paths

## Examples

### Good Index Entry:

```markdown
### Google OAuth Callback Hardening - 2026-02-22

**Status:** ✅ Completed
**Author:** Frontend Team
**Description:** Improved callback handling for missing/invalid token and clearer fallback navigation
**Frontend Areas:** Routing, auth flow, callback page error states
**Files Changed:** src/pages/GoogleCallback.tsx, src/context/AuthContext.tsx
**Related Docs:**

- [API Integration](../../../docs/API_INTEGRATION.md)
- [Architecture: Auth Flow](../../../docs/architecture/auth-flow.md)
```

### Good Backlog Entry:

```markdown
### Token Expiration UX

**Priority:** 🟡 Medium
**Effort:** Medium
**Description:** Detect expired JWTs and redirect users to login with a clear session-expired message
**Dependencies:** Backend must return consistent 401/expired-token response contract
**Acceptance Criteria:**

- [ ] Detect token expiration in API layer
- [ ] Clear auth state and localStorage on expiration
- [ ] Redirect to `/login` with a user-friendly message
- [ ] Add/update tests for expiration handling
- [ ] Document flow in API integration and troubleshooting docs
```

---

**Last Updated:** 2026-02-22
**Maintained By:** Frontend Development Team
