# Architecture

SyncSpace is a Next.js web client backed by a NestJS API, separate realtime gateways, and a BullMQ worker. PostgreSQL is the source of truth; Redis provides pub/sub and queues. Nginx exposes the web/API boundary and balances realtime connections. Prometheus scrapes service metrics and Grafana stores dashboards.

The compose topology deliberately keeps replicas stateless. Persistent data belongs in PostgreSQL/Redis volumes, while secrets arrive through the runtime environment rather than image layers.
