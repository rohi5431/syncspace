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

## Phase 3 database schema

The workspace document schema is recorded in `apps/api/migrations/0003_workspace_documents.sql` and has been applied to the connected Neon database. It adds folders, documents, document permissions, document versions, and activity logs with foreign keys, uniqueness constraints, and pagination/search indexes. For another environment, apply this migration before starting the API. The project uses Drizzle ORM to match the existing Phase 2 backend; do not run Prisma migrations against this schema.

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
| `GET` | `/api/workspaces/:workspaceId/members?page=1&pageSize=50` | List workspace members; any member may view. |
| `POST` | `/api/workspaces/:workspaceId/members` | Add an existing account as `MEMBER`; `OWNER` or `ADMIN` only. |
| `PATCH` | `/api/workspaces/:workspaceId/members/:memberId` | Change a member role; only `OWNER` may grant or remove `ADMIN`. |
| `DELETE` | `/api/workspaces/:workspaceId/members/:memberId` | Remove a member or leave a workspace. |
| `POST` | `/api/workspaces/:workspaceId/folders` | Create a root or nested folder. |
| `GET` | `/api/workspaces/:workspaceId/folders` | List workspace folders with parent IDs. |
| `PATCH` | `/api/folders/:folderId` | Rename or reparent a folder; circular moves are rejected. |
| `DELETE` | `/api/folders/:folderId` | Delete a folder while reparenting its documents and child folders. |
| `POST` | `/api/workspaces/:workspaceId/documents` | Create a document with empty JSON content. |
| `GET` | `/api/workspaces/:workspaceId/documents` | Paginated list; supports `page`, `pageSize`, `search`, `folderId`, `sortBy`, and `sortDirection`. Use `folderId=root` for unfiled documents. |
| `GET` | `/api/documents/:documentId` | Read a document after workspace membership and document access checks. |
| `PATCH` | `/api/documents/:documentId` | Update title, description, folder, or archive state. |
| `PATCH` | `/api/documents/:documentId/content` | Save JSON content and create an immutable version snapshot. |
| `DELETE` | `/api/documents/:documentId` | Soft-delete a document and retain its versions. |
| `POST` | `/api/documents/:documentId/duplicate` | Duplicate current content into a new document. |
| `POST` | `/api/documents/:documentId/share` | Grant `VIEWER` or `EDITOR` access to a workspace member by email. |
| `GET` | `/api/documents/:documentId/permissions` | List explicit permissions; document creator and workspace administrators only. |
| `PATCH` | `/api/documents/:documentId/permissions/:permissionId` | Change an explicit permission role. |
| `DELETE` | `/api/documents/:documentId/permissions/:permissionId` | Remove explicit document access. |
| `GET` | `/api/documents/:documentId/versions?page=1&pageSize=20` | Paginated version history. |
| `GET` | `/api/documents/:documentId/versions/:versionId` | Read a specific version snapshot. |
| `GET` | `/api/workspaces/:workspaceId/activity?page=1&pageSize=20` | Read recent workspace activity visible to the caller. |

Authentication credentials are sent only as `HttpOnly`, `Secure` cookies. Access JWTs are short-lived; refresh tokens are random, rotated on refresh, stored only as SHA-256 hashes, and backed by revocable database sessions. User responses never include password hashes or token values.

Workspace endpoints scope reads and writes to the authenticated user and membership record. A caller outside a workspace receives `404` for its detail route, avoiding disclosure of workspace IDs.
