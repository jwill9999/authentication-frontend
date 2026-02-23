# Environment Variables

Frontend environment variables for local and containerized runs.

## Public vs Secret

- `VITE_*` variables are public in frontend builds.
- Do not store secrets in frontend env files.
- Keep secrets in backend/deployment secret stores.
- See `docs/guides/secrets-management.md` for full guidance.

## Variables

### `VITE_API_URL`

- Purpose: backend base URL used by the frontend API client
- Default: `http://localhost:3000`
- Used in: `src/services/api.ts`
- Important: with Vite, this value is injected at build time

Examples:

```env
VITE_API_URL=http://localhost:3000
VITE_API_URL=/api
VITE_API_URL=https://api.example.com
```

### `FRONTEND_PORT`

- Purpose: host port mapped to nginx container port `8080` in Docker Compose
- Default: `80`
- Used in: `docker-compose.yml`

Example:

```env
FRONTEND_PORT=8080
```

## Local Development

For local `npm run dev`, create `.env`:

```env
VITE_API_URL=http://localhost:3000
```

If you need machine-specific private overrides, prefer ignored local files such as `.env.local`.

## Docker Development

For Docker Compose, create `.env`:

```env
VITE_API_URL=http://localhost:3000
FRONTEND_PORT=80
```

For local private compose values, you can use a separate ignored file:

```bash
docker compose --env-file .env.internal build frontend
docker compose --env-file .env.internal up -d frontend
```

## Common Mistakes

- Changing `VITE_API_URL` without rebuilding Docker image
- Using an API URL that is not reachable from browser/container context
- Expecting runtime changes to Vite build-time variables
- Storing private keys/passwords in `VITE_*` variables

Last Updated: 2026-02-22
