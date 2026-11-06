# CI/CD

`ci.yml` runs frontend type checks and builds on pull requests and `main`/`develop` pushes. `security.yml` runs dependency review, CodeQL, pnpm audit, and Gitleaks. `docker-build.yml` publishes SHA-tagged images to GHCR and scans them with Trivy.

Staging and production use generic SSH targets. Add `STAGING_HOST`, `STAGING_USER`, `STAGING_SSH_KEY`, and `STAGING_PATH` to the protected GitHub environment. Production additionally requires environment approval and uses release tags such as `v1.2.3`.

Third-party actions should be reviewed and pinned to commit SHAs before adopting this workflow in a regulated environment; the version tags are intentionally readable starter references.
