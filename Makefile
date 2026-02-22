SHELL := /bin/bash

COMPOSE := docker compose
SERVICE := frontend

.PHONY: help quick-check ci-local verify lint lint-ci typecheck test build audit audit-all audit-fix docker-build docker-up docker-down docker-logs docker-ps docker-health docker-rebuild docker-clean docker-build-proxy docker-up-proxy

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

quick-check: ## Fast local checks (lint + typecheck)
	$(MAKE) lint
	$(MAKE) typecheck

ci-local: ## Full local CI-equivalent checks (lint-ci + typecheck + test + build)
	$(MAKE) lint-ci
	$(MAKE) typecheck
	$(MAKE) test
	$(MAKE) build

verify: ci-local ## Backward-compatible alias for ci-local

lint: ## Run local lint (warning-friendly)
	npm run lint

lint-ci: ## Run strict lint (fails on warnings)
	npm run lint:ci

typecheck: ## Run TypeScript type checking
	npm run typecheck

test: ## Run test suite
	npm test --silent

build: ## Run production build
	npm run build

audit: ## Run npm audit for production dependencies (high/critical)
	npm audit --omit=dev --audit-level=high

audit-all: ## Run npm audit for all dependencies (high/critical)
	npm audit --audit-level=high

audit-fix: ## Apply npm audit fixes where available
	npm audit fix --audit-level=high

docker-build: ## Build frontend image
	$(COMPOSE) build $(SERVICE)

docker-up: ## Run frontend container in detached mode
	$(COMPOSE) up -d $(SERVICE)

docker-down: ## Stop and remove containers/networks created by compose
	$(COMPOSE) down

docker-logs: ## Tail frontend container logs
	$(COMPOSE) logs -f $(SERVICE)

docker-ps: ## Show compose service status
	$(COMPOSE) ps

docker-health: ## Check frontend health endpoint
	curl -f "http://localhost:$${FRONTEND_PORT:-80}/healthz"

docker-rebuild: ## Rebuild image then recreate frontend container
	$(COMPOSE) up -d --build $(SERVICE)

docker-clean: ## Remove compose services plus local images/volumes for this project
	$(COMPOSE) down --rmi local --volumes --remove-orphans

# Build/run using nginx API proxy mode.
# Requires nginx /api proxy block enabled and backend reachable from container network.
docker-build-proxy: ## Build frontend with VITE_API_URL=/api
	VITE_API_URL=/api $(COMPOSE) build $(SERVICE)

docker-up-proxy: ## Run frontend after proxy-mode build
	$(COMPOSE) up -d $(SERVICE)
