# CI/CD Guide

This repository uses PR gates before merge to `main`.

## Git Flow

1. Create a feature branch from `main`
2. Open a pull request targeting `main`
3. Wait for all required CI checks to pass
4. Merge only when all required checks are green

## GitHub UI Setup (Branch Protection)

Configure this in GitHub:

1. Go to `Settings` → `Branches` → `Add branch protection rule`
2. Set branch name pattern to `main`
3. Enable `Require a pull request before merging`
4. Enable `Require approvals` (recommended: at least 1)
5. Enable `Require status checks to pass before merging`
6. Enable `Require branches to be up to date before merging`

Recommended additional toggles:

- `Require conversation resolution before merging`
- `Do not allow bypassing the above settings`
- Keep force-push and branch deletion disabled on `main`

## Required Checks for Branch Protection

Set these status checks as **required** on branch `main`:

- `PR Quality Gate / dependency-review`
- `PR Quality Gate / stable-deps`
- `PR Quality Gate / lint`
- `PR Quality Gate / npm-audit`
- `PR Quality Gate / typecheck`
- `PR Quality Gate / test`
- `PR Quality Gate / build`
- `PR Quality Gate / docker-smoke`
- `Container Security Scan / scan-image`
- `CodeQL / analyze (javascript-typescript)`

## What Each Pipeline Validates

- **lint**: strict linting (`--max-warnings 0`)
- **stable-deps**: blocks prerelease package versions (`alpha`, `beta`, `rc`, `canary`, `next`, `preview`)
- **dependency-review**: blocks risky dependency changes introduced by a PR
- **npm-audit**: production dependency vulnerability gate (fails on high/critical advisories with `--omit=dev`)
- **typecheck**: TypeScript correctness
- **test**: unit/component test suite
- **build**: production build integrity
- **docker-smoke**: image build + health endpoint (`/healthz`)
- **container-security**: Trivy image vulnerability scan and SARIF upload
- **codeql**: static security analysis for JS/TS

## Notes

- Local hooks stay lightweight to preserve developer speed.
- CI is the strict merge gate for quality and security.

## Weekly Security Checks and Notifications

- `Dependency Security Weekly` runs every Monday via cron (and can be run manually).
- It executes stable dependency policy + `npm audit --omit=dev --audit-level=high`.
- If unresolved findings require manual intervention:
  - workflow fails,
  - a GitHub issue is auto-created with run details,
  - standard GitHub Actions notifications apply for watchers/subscribers.

Note: weekly security checks are not PR status checks; they are scheduled drift detection and alerting.

Last Updated: 2026-02-22
