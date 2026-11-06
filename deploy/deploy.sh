#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/trusttrace"
COMPOSE=(docker compose --env-file "$ROOT/secrets.env" -f "$ROOT/trusttrace-backend/deploy/compose.prod.yml")

cd "$ROOT/trusttrace-backend" && git pull --ff-only
cd "$ROOT/trusttrace-frontend" && git pull --ff-only

"${COMPOSE[@]}" build
"${COMPOSE[@]}" up -d postgres redis
"${COMPOSE[@]}" run --rm tools pnpm db:migrate
"${COMPOSE[@]}" up -d
docker image prune -f

echo "Deploy finished at $(date -u +%FT%TZ)"
