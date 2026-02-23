# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:22.13-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Pull latest patched Alpine packages and install dependencies
RUN apk update && apk upgrade --no-cache \
	&& npm ci --omit=dev

# VITE_API_URL is baked into the bundle at build time by Vite.
# Pass at build time: docker build --build-arg VITE_API_URL=https://api.example.com
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginxinc/nginx-unprivileged:1.27.5-alpine AS runner

USER root

# Pull latest patched Alpine packages in the runtime image
RUN apk update && apk upgrade --no-cache \
	&& rm /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (handles SPA routing + security headers)
COPY nginx.conf /etc/nginx/conf.d/default.conf

USER 101

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
