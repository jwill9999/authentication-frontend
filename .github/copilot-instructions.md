# Copilot Instructions

## Build, Test, and Lint

```bash
# Development
npm run dev                  # Start dev server at http://localhost:5173

# Quality checks
make quick-check             # lint + typecheck (fast local gate)
make ci-local                # lint + typecheck + test + build (full CI equivalent)

# Individual commands
npm run lint                 # ESLint (fails on any warning)
npm run typecheck            # tsc --noEmit
npm test                     # Vitest run (single pass)
npm run test:watch           # Vitest in watch mode
npm run test:coverage        # Coverage report (thresholds: 80% lines/functions/statements, 70% branches)
npm run format               # Prettier write
npm run format:check         # Prettier check

# Run a single test file
npx vitest run src/services/api.test.ts

# Run a single test by name pattern
npx vitest run --reporter=verbose -t "returns token"
```

Husky hooks run automatically:

- **pre-commit**: `lint-staged` (ESLint + Prettier on staged files only)
- **pre-push**: `typecheck` only

Never use `--no-verify` or bypass hooks.

## Architecture

### Auth token strategy

The access token lives **only in memory** — specifically in a module-level variable in `src/services/api.ts`. It is never written to `localStorage`. The refresh token travels only as an `HttpOnly` cookie set by the backend.

On mount, `AuthContext` calls `refreshAccessToken()` silently to restore a session from the cookie. A `setInterval` at 4-minute intervals proactively refreshes the token before it expires.

### Dual API base URL

`src/services/api.ts` derives two base URLs from `VITE_API_URL`:

- `API_BASE_URL` — used for auth endpoints (`/auth/*`)
- `PROTECTED_API_BASE_URL` — appends `/api` if not already present; used for authenticated endpoints

`fetchWithAuth` automatically attaches the `Authorization: Bearer` header and retries once on 401 after attempting a token refresh. Concurrent 401s are deduplicated via a shared `refreshPromise`.

### Routing and protection

`App.tsx` wraps all routes in `<AuthProvider>`. The `<ProtectedRoute>` component reads `token` and `loading` from `AuthContext`; it renders a loading state while the silent refresh is in flight, then redirects to `/login` if no token exists.

Routes:

- `/` → redirect to `/login`
- `/login`, `/register` — public
- `/auth/google/callback` — Google OAuth callback
- `/dashboard` — protected

### Layer structure

```
src/
  pages/        # Route-level components (Login, Register, Dashboard, GoogleCallback)
  components/   # Shared UI / guards (ProtectedRoute)
  context/      # AuthContext — auth state, session lifecycle, token management
  services/     # api.ts — all fetch calls, token storage, refresh logic
  types/        # Shared TypeScript interfaces (auth.ts)
  test/         # Vitest setup (setup.ts)
```

## Key Conventions

### Vitest — no globals

Vitest is configured **without globals**. Always import test utilities explicitly:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
```

### Mocking patterns

Mock entire modules with `vi.mock`, then use `vi.mocked()` for type-safe access:

```ts
vi.mock('../services/api', () => ({
  authAPI: { login: vi.fn(), logout: vi.fn() },
  refreshAccessToken: vi.fn(),
}));
const mockedLogin = vi.mocked(api.authAPI.login);
```

For API-layer tests, stub `fetch` globally:

```ts
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);
```

Reset state in `beforeEach`:

```ts
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  setAccessToken(null);
});
```

### Context test helpers

Wrap components under test in their required providers with a named helper:

```ts
const renderWithProvider = () =>
  render(<AuthProvider><TestConsumer /></AuthProvider>);
```

### API response field convention

`message` is the canonical user-facing field; `error` is a legacy fallback. Both are present on `ApiMessageFields`. Use `data?.message ?? data?.error ?? fallback` when extracting error strings.

### JSX return type

Use `React.JSX.Element` (not `JSX.Element`) as the return type for components.

### Environment

`VITE_API_URL` is the only required env var (defaults to `http://localhost:3000`). Copy `.env.example` to `.env` before first run. Values in `.env` are **not secret** — do not place credentials there.

### Accessibility

`eslint-plugin-jsx-a11y` is enforced with `--max-warnings 0`. Fix a11y issues immediately when introduced; do not suppress them.

### Styles

No inline styles. All styles must go in separate CSS files (e.g. `Login.css`, `Dashboard.css` co-located with their component).

### Mock placement

For simple cases use inline mocks. For complex or reusable mocks, place them in a `mocks/` or `__mocks__/` folder adjacent to the test file.

### Commit message format

```
<semantic-prefix>: <branch-name> <short description>
```

Example: `feat: feat/login-form Add validation for email and password fields`

### Docs

Keep `/docs` up to date alongside code changes. Key docs:

- Architecture: `docs/architecture/`
- API contracts: `docs/api/`
- Guides (testing, Docker, CI/CD, env): `docs/guides/`
