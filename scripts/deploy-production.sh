#!/usr/bin/env sh
set -eu
: "${IMAGE_TAG:?IMAGE_TAG must be set}"
export IMAGE_TAG
./scripts/migrate.sh
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans
./scripts/health-check.sh "${HEALTHCHECK_URL:-http://localhost}"
printf '%s\n' "$IMAGE_TAG" > .deployed-version
