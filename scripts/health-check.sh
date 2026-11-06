#!/usr/bin/env sh
set -eu
BASE_URL="${1:-http://localhost}"
curl --fail --silent --show-error "$BASE_URL/health" >/dev/null
printf '%s\n' "Health check passed for $BASE_URL"
