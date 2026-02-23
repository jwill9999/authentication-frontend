# Development Guide

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run typecheck`

## Preferred Make Commands

- `make quick-check` (fast local gate: lint + typecheck)
- `make ci-local` (strict local CI-equivalent checks: lint-ci + typecheck + test + build)
- `make help` (discover all available targets)

## Workflow

1. Implement code change
2. Run local checks (`make quick-check` during development, `make ci-local` before opening/merging PRs)
3. Update relevant docs in `docs/`

## Local Git Hooks Policy

Local hooks should be fast and focused on immediate developer feedback:

- `pre-commit`: staged-file checks only (`lint-staged`)
- `pre-push`: lightweight `typecheck` only

Heavier checks are intentionally left to CI/CD:

- full test suite
- production build checks
- container vulnerability scans
- CodeQL/security analysis

## Accessibility Linting Rollout

- `eslint-plugin-jsx-a11y` is enabled and enforced through strict linting (`--max-warnings 0`).
- Accessibility issues should be fixed immediately when introduced.
- Both local lint and CI lint gates are strict (`npm run lint` / `npm run lint:ci`).

Last Updated: 2026-02-22
