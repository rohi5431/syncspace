#!/usr/bin/env sh
set -eu
: "${DATABASE_URL:?DATABASE_URL must be set}"
if [ ! -d backend/api ]; then printf '%s\n' 'backend/api is not present; no migration was run.'; exit 0; fi
pnpm --dir backend/api exec prisma migrate deploy
