# Deployment guide

1. Merge through protected `main` after CI and security checks pass.
2. The image workflow publishes `ghcr.io/<owner>/syncspace-{web,api,realtime,worker}:sha-<commit>`.
3. Configure a GitHub `staging` or protected `production` environment with SSH secrets.
4. The deployment script runs `prisma migrate deploy` once, starts the pinned compose images, and calls `scripts/health-check.sh`.

If deployment secrets are absent, workflows intentionally publish/build only and report deployment as skipped. No deployment is claimed by this repository without a configured target and successful health checks.
