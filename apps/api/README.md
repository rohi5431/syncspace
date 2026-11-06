# SyncSpace API

An independently runnable NestJS API for account authentication and workspace membership. The API uses PostgreSQL through the connected Neon database and Drizzle ORM. Its schema mirrors the tables provisioned for this project in Neon.

## Configuration

Copy `.env.example` to a local environment file, or configure the same variables in the project environment:

- `DATABASE_URL` — PostgreSQL connection URL from the Neon integration.
- `JWT_ACCESS_SECRET` — a random secret with at least 32 characters. Generate one with `openssl rand -base64 32`.
- `JWT_ACCESS_EXPIRES_IN` — access-token lifetime in seconds (default `900`).
- `FRONTEND_URL` — exact frontend origin allowed for direct cross-origin API calls (default `http://localhost:3000`).
- `PORT` — API port (default `4000`).
- `NODE_ENV` — use `development` locally; development cookies use `SameSite=None; Secure` for the embedded v0 preview.

The root Next.js app proxies `/api/*` to `API_SERVER_URL`, which defaults to `http://localhost:4000`. When deploying the frontend and API separately, set `API_SERVER_URL` on the frontend project and set `FRONTEND_URL` on the API to the frontend's exact origin.

## Install and run

From the repository root:

```sh
pnpm install
pnpm dev
```

In a second terminal, run the API:

```sh
pnpm --filter @syncspace/api start:dev
```

The frontend runs on port `3000`; the API runs on port `4000`. Swagger UI is available at `http://localhost:4000/api/docs` (and through the frontend proxy at `/api/docs`).

## Checks

```sh
pnpm --filter @syncspace/api test
pnpm --filter @syncspace/api build
pnpm test
```

## Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account and issue access/refresh cookies. |
| `POST` | `/api/auth/login` | Verify email and password and issue cookies. |
| `POST` | `/api/auth/refresh` | Rotate the refresh cookie and issue a new access cookie. |
| `POST` | `/api/auth/logout` | Revoke the refresh session and clear cookies. |
| `GET` | `/api/auth/me` | Return the authenticated profile. |
| `GET` | `/api/users/me` | Return the authenticated profile. |
| `GET` | `/api/workspaces` | List workspaces where the caller is a member. |
| `POST` | `/api/workspaces` | Create a workspace; creator is added as `OWNER` in the same transaction. |
| `GET` | `/api/workspaces/:id` | Read a workspace only when the caller is a member. |
| `PATCH` | `/api/workspaces/:id` | Update workspace details as `OWNER` or `ADMIN`. |
| `DELETE` | `/api/workspaces/:id` | Delete a workspace as `OWNER`. |

Authentication credentials are sent only as `HttpOnly`, `Secure` cookies. Access JWTs are short-lived; refresh tokens are random, rotated on refresh, stored only as SHA-256 hashes, and backed by revocable database sessions. User responses never include password hashes or token values.

Workspace endpoints scope reads and writes to the authenticated user and membership record. A caller outside a workspace receives `404` for its detail route, avoiding disclosure of workspace IDs.
