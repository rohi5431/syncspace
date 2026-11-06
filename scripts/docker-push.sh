#!/usr/bin/env sh
set -eu
: "${GHCR_OWNER:?GHCR_OWNER must be set}"
: "${IMAGE_TAG:?IMAGE_TAG must be set}"
for service in web api realtime worker; do docker push "ghcr.io/$GHCR_OWNER/syncspace-$service:$IMAGE_TAG"; done
