# Rollback

Run `IMAGE_TAG=<previous-verified-tag> ./scripts/rollback.sh` from the deployment host. The script replaces application images, leaves the database schema unchanged, and verifies `/health`. Keep at least one previous image tag in GHCR.

Do not automatically reverse database migrations. Restore a backup or apply a reviewed forward migration after assessing compatibility.
