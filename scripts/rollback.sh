#!/usr/bin/env sh
set -eu
PREVIOUS_TAG="${1:-$(cat .previous-version 2>/dev/null || true)}"
: "${PREVIOUS_TAG:?Pass the previously verified image tag}"
export IMAGE_TAG="$PREVIOUS_TAG"
printf '%s\n' "Rolling back application images to $IMAGE_TAG; database changes are not reverted."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans
./scripts/health-check.sh "${HEALTHCHECK_URL:-http://localhost}"
