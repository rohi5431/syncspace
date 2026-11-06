# Database migrations

Use Prisma migrations from `backend/api`: `pnpm --dir backend/api exec prisma migrate dev` locally and `pnpm --dir backend/api exec prisma migrate deploy` in a deployment. Never use `prisma db push` in production.

Migrations run once before replicas are updated. Prefer additive, backward-compatible changes: add nullable columns, deploy code that backfills/reads both shapes, then remove old columns in a later release. Back up PostgreSQL before destructive changes; application rollback does not undo schema migrations.
