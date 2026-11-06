#!/usr/bin/env sh
set -eu
TAG="${1:-local}"
docker build --tag "syncspace-web:$TAG" .
for service in api realtime worker; do
  docker build --file docker/Dockerfile.service --tag "syncspace-$service:$TAG" "backend/$service"
done
