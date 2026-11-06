# Docker setup

Copy `.env.development.example` to `.env.development` and replace local-only values. Set `MONGODB_URI` in the root `.env` file to enable MongoDB GridFS file storage; keep Atlas credentials out of tracked files. The API reads the root `.env` for direct local starts, and Compose passes `MONGODB_URI` through to the API container. Start the full stack with `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build`. Stop with `docker compose down`; add `-v` only when intentionally deleting local database volumes.

Production uses immutable image tags: `IMAGE_TAG=sha-<commit> docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`. PostgreSQL and Redis are persistent named volumes. Nginx terminates the internal routing boundary and balances the two realtime replicas.
