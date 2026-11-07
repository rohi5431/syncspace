# SyncSpace – Distributed Real-Time Collaboration Platform

<p align="center">
  <strong>One Workspace. One Team. Real-Time Collaboration.</strong>
</p>

<p align="center">
  A distributed collaboration platform that enables software development teams to collaboratively edit documents, manage projects, assign tasks, and communicate in real time through a unified workspace.
</p>

<p align="center">
  <img width="1917" height="982" alt="image" src="https://github.com/user-attachments/assets/6d13f0c3-ca2a-40ff-81b5-f0a56de10ed0" />

  
</p>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Project Objectives](#-project-objectives)
- [Multi-Tenant Organization Isolation](#-multi-tenant-organization-isolation)
- [Core Features](#-core-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Real-Time Collaboration](#-real-time-collaboration)
- [System Design and Distributed Systems](#-system-design-and-distributed-systems)
- [Database Design](#-database-design)
- [Project Structure](#-project-structure)
- [API Design](#-api-design)
- [Authentication and Security](#-authentication-and-security)
- [Background Job Processing](#-background-job-processing)
- [Scalability and Reliability](#-scalability-and-reliability)
- [Performance and Responsiveness](#-performance-and-responsiveness)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Future Enhancements](#-future-enhancements)
- [Learning Outcomes](#-learning-outcomes)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Overview

**SyncSpace** is a distributed, multi-user, real-time collaboration platform designed to simplify how software development teams work together.

Modern development teams use multiple applications for document editing, project management, task tracking, file sharing, and team communication. Managing work across disconnected tools creates unnecessary complexity and reduces productivity.

SyncSpace brings these collaboration capabilities into one unified workspace.

Organizations can use the same SyncSpace application while keeping their data isolated from other organizations. Within an organization, authorized users can create workspaces, invite team members, collaboratively edit technical documents, manage software projects, assign tasks, track progress, and receive real-time updates.

The platform focuses on building a scalable and reliable collaborative environment using modern distributed systems concepts.

### Vision

Build a unified engineering workspace where teams can plan, document, develop, and manage software projects together without switching between multiple applications.

---

## ❌ Problem Statement

Software development teams frequently face the following challenges:

### 1. Fragmented Collaboration Tools

Teams use different applications for:
- Document creation and editing.
- Project and task management.
- Team communication.
- File sharing.
- Progress tracking.

Switching between these tools makes collaboration difficult.

### 2. Concurrent Editing Conflicts

When multiple team members edit the same document simultaneously:
- Changes can overwrite each other.
- Synchronization becomes complicated.
- Users may see outdated content.
- Maintaining document consistency becomes challenging.

### 3. Lack of Centralized Project Management

Project documentation, tasks, deadlines, and discussions are often scattered across different platforms.

This makes it difficult to maintain a single source of truth.

### 4. Poor Real-Time Visibility

Team members cannot always see:
- Who is currently online.
- Who is editing a particular document.
- Which tasks are being worked on.
- What changes have recently occurred.

### 5. Collaboration During Network Failures

Temporary internet disconnections can interrupt editing sessions and create synchronization challenges.

### 6. Limited Collaboration Scalability

As the number of users and workspaces grows, maintaining real-time communication, consistent data, and reliable background processing becomes increasingly challenging.

---

## 💡 Our Solution

SyncSpace addresses these challenges through a unified collaboration platform.

| Problem | SyncSpace Solution |
|---|---|
| Fragmented tools | Unified workspace |
| Editing conflicts | Yjs CRDT |
| Scattered documentation | Centralized document management |
| Manual task tracking | Integrated Kanban boards |
| Lack of visibility | Live presence and cursors |
| Delayed updates | WebSocket communication |
| Temporary disconnections | Offline editing and synchronization |
| Lost document changes | Version history and snapshots |
| Repetitive operations | Background job processing |
| Growing user traffic | Horizontally scalable realtime architecture |

---

## 🎯 Project Objectives

The primary objectives of SyncSpace are:

1. Build a multi-tenant collaboration platform for software development teams.
2. Implement real-time collaborative document editing using CRDT.
3. Support simultaneous editing without losing concurrent updates.
4. Develop centralized project and task management.
5. Implement workspace-level authentication and authorization.
6. Provide live user presence and activity tracking.
7. Support document version history and restoration.
8. Implement reliable background processing.
9. Design a scalable architecture supporting multiple realtime server instances.
10. Automate testing and integration through CI/CD.


---

## 🏢 Multi-Tenant Organization Isolation

SyncSpace is designed as a **multi-tenant SaaS platform**. Multiple independent organizations use the same application and shared infrastructure, while each organization's data remains private to that organization.

### Organization Hierarchy

```text
SyncSpace Platform
│
├── Organization A
│   ├── Organization Members
│   ├── Workspace 1
│   │   ├── Projects
│   │   ├── Teams
│   │   ├── Tasks
│   │   └── Documents
│   └── Workspace 2
│
├── Organization B
│   ├── Organization Members
│   ├── Workspace 1
│   │   ├── Projects
│   │   ├── Teams
│   │   ├── Tasks
│   │   └── Documents
│   └── Workspace 2
│
└── Platform Super Admin
```

Each organization manages its own members, workspaces, projects, teams, tasks, documents, invitations, and activity records. Organization A must never be able to read or modify Organization B's private resources.

### Roles and Responsibilities

| Role | Scope | Responsibilities |
|---|---|---|
| Platform Super Admin | Entire platform | Manage platform-level operations and organization accounts |
| Organization Owner | One organization | Manage organization settings, administrators, members, and workspaces |
| Organization Admin | One organization | Manage members, workspaces, teams, projects, and organization resources |
| Workspace Admin | Assigned workspace | Manage workspace members and workspace-level resources |
| Member | Authorized workspace/project | Use assigned projects, documents, and tasks according to permissions |

A user may belong to more than one organization. The active organization context must be selected and validated for each request. Membership in one organization does not grant access to another organization.

### Tenant Isolation Principles

- Every tenant-owned resource must be associated with an organization.
- Workspace, project, team, task, document, invitation, notification, and activity queries must be scoped to the authenticated user's authorized organization.
- Never trust an `organizationId`, `workspaceId`, or `projectId` supplied by the browser without checking the user's membership and permissions.
- Validate resource ownership and relationships on the backend for every read, create, update, delete, download, and realtime operation.
- Use database constraints, including composite foreign keys where appropriate, to prevent records from referencing resources belonging to another organization.
- Consider PostgreSQL Row-Level Security (RLS) as an additional defense-in-depth control where it fits the database access model.
- Namespace Redis keys, cache entries, BullMQ job payloads, WebSocket rooms, and Yjs document identifiers with tenant context.
- Check organization membership before allowing a user to join a collaborative document room or download a stored file.
- Keep organization context in audit events so access and administrative actions can be traced.

### Example: Independent Organization Data

| Resource | Organization A | Organization B |
|---|---|---|
| Members | A's members only | B's members only |
| Workspaces | A's workspaces | B's workspaces |
| Projects | A's projects | B's projects |
| Teams | A's teams | B's teams |
| Documents and files | A's private data | B's private data |
| Tasks and activity | A's records | B's records |

Both organizations may use the same PostgreSQL cluster and application services. Logical isolation must be enforced by backend authorization and database safeguards; sharing infrastructure must not mean sharing tenant data.

### Organization-Level Data Model

The relational model should include organization ownership and membership:

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : has
    USERS ||--o{ ORGANIZATION_MEMBERS : joins
    ORGANIZATIONS ||--o{ WORKSPACES : owns
    WORKSPACES ||--o{ WORKSPACE_MEMBERS : has
    USERS ||--o{ WORKSPACE_MEMBERS : joins
    WORKSPACES ||--o{ PROJECTS : contains
    PROJECTS ||--o{ TEAMS : groups
    PROJECTS ||--o{ TASKS : contains
    ORGANIZATIONS ||--o{ INVITATIONS : issues

    ORGANIZATIONS {
        uuid id PK
        string name
        string slug
        string status
    }

    ORGANIZATION_MEMBERS {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        string role
    }

    WORKSPACES {
        uuid id PK
        uuid organization_id FK
        string name
        uuid owner_id FK
    }

    WORKSPACE_MEMBERS {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        string role
    }

    PROJECTS {
        uuid id PK
        uuid workspace_id FK
        string name
        string status
    }

    TEAMS {
        uuid id PK
        uuid project_id FK
        string name
    }

    TASKS {
        uuid id PK
        uuid project_id FK
        uuid assignee_id FK
        string title
        string status
    }
```

This is a conceptual tenant-aware model. Adapt entity names and relationships to the actual Prisma schema and application implementation.

### Organization Context in Requests

A typical protected request should follow this sequence:

1. Authenticate the user.
2. Resolve the active organization from a validated session, membership, or request context.
3. Verify that the user is an active member of that organization.
4. Check the user's role and resource-level permissions.
5. Execute a tenant-scoped database operation.
6. Return only resources the user is authorized to access.

Do not use frontend route separation as the security boundary. Admin and member dashboards are user-interface experiences; authorization must be enforced by the backend.


---

## ✨ Core Features

### 1. Workspace and Team Management

- Create and manage multiple workspaces.
- Invite team members through email.
- Support multiple members within a workspace.
- Role-based access control.
- Workspace-level permissions.

**Supported roles:**
- Owner
- Admin
- Member

### 2. Real-Time Collaborative Document Editing

A Google Docs-inspired collaborative editor powered by TipTap and Yjs.

Features:
- Create and edit documents.
- Simultaneous editing by multiple users.
- Live content synchronization.
- Live cursors and user selections.
- User presence indicators.
- Automatic conflict resolution through CRDT.
- Document autosaving.
- Version history.

### 3. Document Management

Centralized management of engineering documentation.

Supported document types:

| Document | Purpose |
|---|---|
| SRS | Software Requirements Specification |
| HLD | High-Level Design |
| LLD | Low-Level Design |
| README | Project documentation |
| API Documentation | API specifications |
| Meeting Notes | Team discussions |
| Technical Reports | Engineering reports |
| Markdown Files | Technical documentation |

Additional capabilities:
- Upload and download files.
- Organize documents into folders.
- Search and filter documents.
- Rename, duplicate, move, and delete.
- Share documents with workspace members.
- Maintain document versions.

### 4. Project Management

- Create software development projects.
- Add project descriptions and members.
- Organize project documentation.
- Track project progress.
- Manage project activities.
- View project-related tasks.

### 5. Task Management

A centralized task management system.

Features:
- Create and assign tasks.
- Set deadlines.
- Define task priorities.
- Track task status.
- Filter and sort tasks.
- Kanban board.
- Task activity tracking.

**Task statuses:**

- To Do
- In Progress
- In Review
- Completed

**Priority levels:**

- Low
- Medium
- High
- Urgent

### 6. Live Presence and Activity

- Display online team members.
- Show active document collaborators.
- Display live editing cursors.
- Track recent workspace activities.
- Send real-time notifications.

### 7. Offline Editing and Synchronization

- Allow local document editing during temporary disconnections.
- Preserve local updates.
- Synchronize pending changes after reconnection.
- Use CRDT update merging to maintain document consistency.

### 8. Document Version History

- Store historical document snapshots.
- View previous versions.
- Restore older content.
- Preserve history after restoration by creating a new version.

### 9. Notifications and Background Processing

- Workspace invitation emails.
- Task assignment notifications.
- Document activity notifications.
- Background email delivery.
- Asynchronous document processing.
- Retry failed background jobs.

---

## 🏗️ System Architecture

SyncSpace follows a modular architecture consisting of a frontend application, backend API, realtime collaboration server, background workers, and persistent storage systems.

### High-Level Architecture

```mermaid
flowchart TB
    U[Users / Team Members]

    subgraph Frontend
        FE[Next.js Application]
        ED[TipTap Collaborative Editor]
        UI[Workspace / Projects / Tasks UI]
    end

    subgraph Backend
        API[NestJS REST API]
        AUTH[Authentication & RBAC]
        RT[Realtime WebSocket Server]
        YJS[Yjs CRDT Engine]
        WORKER[Background Workers]
    end

    subgraph Infrastructure
        REDIS[Redis Cache / PubSub]
        QUEUE[BullMQ Job Queue]
    end

    subgraph Storage
        PG[(PostgreSQL)]
        MDB[(MongoDB GridFS)]
    end

    U --> FE
    FE --> ED
    FE --> UI
    FE --> API
    ED <--> RT
    RT <--> YJS
    API --> AUTH
    API --> PG
    API --> MDB
    API --> REDIS
    API --> QUEUE
    RT <--> REDIS
    QUEUE --> WORKER
    WORKER --> PG
    WORKER --> MDB
```

### Architecture Components

| Component | Responsibility |
|---|---|
| Next.js Frontend | User interface and application routing |
| NestJS Backend | Business logic and REST APIs |
| Realtime Server | Persistent WebSocket connections |
| Yjs CRDT | Concurrent document synchronization |
| Redis | Cache, presence and cross-instance Pub/Sub |
| PostgreSQL | Structured application data |
| MongoDB GridFS | Uploaded file storage |
| BullMQ | Asynchronous job processing |
| Background Workers | Email, notifications and document processing |

### Architectural Approach

The initial implementation follows a **modular monolith approach** with separately deployable realtime and worker processes.

This keeps the architecture manageable while allowing the realtime and background-processing workloads to scale independently.

---

## 🔄 Real-Time Collaboration

One of the most important engineering challenges in SyncSpace is handling simultaneous document editing.

### Problem: Concurrent Editing

Consider two users editing the same document:

```text
Initial Document:
"Welcome to SyncSpace"

User A:
"Welcome to SyncSpace Platform"

User B:
"Welcome to SyncSpace Collaboration"
```

If changes are handled using simple last-write-wins replacement, one user's updates may overwrite another user's changes.

This creates a data consistency problem.

### Solution: Yjs CRDT

SyncSpace uses **Yjs (Conflict-Free Replicated Data Type framework)** to manage concurrent document updates.

Yjs allows multiple replicas of a shared document to process changes and merge compatible concurrent updates.

### Collaboration Workflow

```mermaid
sequenceDiagram
    participant A as User A
    participant B as User B
    participant FE as Frontend Editor
    participant Y as Yjs Document
    participant WS as WebSocket Server
    participant R as Redis
    participant DB as Persistent Storage

    A->>FE: Edit document
    B->>FE: Edit same document

    FE->>Y: Generate document updates
    Y->>WS: Send updates
    WS->>R: Publish updates
    R-->>WS: Distribute updates
    WS-->>FE: Broadcast updates

    FE-->>A: Updated document
    FE-->>B: Updated document

    WS->>DB: Persist document updates
```

### Yjs Components

| Component | Purpose |
|---|---|
| Y.Doc | Shared collaborative document |
| Y.Text | Shared text data |
| Y.Array | Collaborative array data |
| Y.Map | Shared key-value data |
| Yjs Provider | Network synchronization |
| Awareness | Live cursors and user presence |

### Synchronization Strategy

1. Each client maintains a local Yjs document.
2. Users make local changes in the editor.
3. Yjs generates document updates.
4. Updates are transmitted through WebSockets.
5. The server distributes updates to connected collaborators.
6. Redis Pub/Sub enables communication between different realtime server instances.
7. Document updates are persisted to durable storage.
8. Reconnecting clients synchronize their document state.

**Important:** Redis Pub/Sub is used for transient message distribution, not as the durable source of document history. Persistent storage is required for recovery after server restarts.

---

## 🧰 Technology Stack

### Frontend

| Technology | Usage |
|---|---|
| Next.js | Frontend framework |
| React.js | Component-based UI |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | Reusable UI components |
| TipTap | Rich-text document editor |
| Zustand | Client-side state management |
| TanStack Query | Server-state management |

### Backend

| Technology | Usage |
|---|---|
| Node.js | JavaScript runtime |
| NestJS | Backend framework |
| TypeScript | Backend development |
| REST APIs | Client-server communication |
| JWT | Authentication |
| Passport.js | Authentication strategies |
| RBAC | Role-based authorization |

### Real-Time Communication

| Technology | Usage |
|---|---|
| Yjs | CRDT-based synchronization |
| TipTap | Collaborative editing interface |
| WebSockets | Bidirectional communication |
| y-websocket | Yjs WebSocket provider |
| Awareness | Live presence and cursors |
| Redis Pub/Sub | Cross-instance synchronization |

### Database and Storage

| Technology | Usage |
|---|---|
| PostgreSQL | Relational application database |
| Prisma ORM | Database access |
| MongoDB | File storage infrastructure |
| MongoDB GridFS | Large file storage |
| Redis | Caching and presence |

### Background Processing

| Technology | Usage |
|---|---|
| BullMQ | Background job queue |
| Redis | Queue backend |
| Node.js Workers | Asynchronous processing |
| Resend | Transactional email delivery |

### DevOps and CI/CD

| Technology | Usage |
|---|---|
| Docker | Containerization |
| Docker Compose | Local infrastructure |
| Git | Version control |
| GitHub | Source code management |
| GitHub Actions | CI/CD automation |

### Testing and Monitoring

| Technology | Usage |
|---|---|
| Jest | Unit testing |
| Supertest | API testing |
| Playwright | End-to-end testing |
| React Testing Library | UI testing |
| Sentry | Error monitoring |
| Prometheus | Metrics collection |
| Grafana | Monitoring dashboards |

---

## 🗄️ Database Design

SyncSpace uses multiple storage technologies, each responsible for a different type of data.

### PostgreSQL – Structured Data

PostgreSQL stores relational application data.

**Core entities:**

```mermaid
erDiagram
    USERS ||--o{ WORKSPACE_MEMBERS : joins
    WORKSPACES ||--o{ WORKSPACE_MEMBERS : contains
    WORKSPACES ||--o{ PROJECTS : contains
    PROJECTS ||--o{ TASKS : contains
    USERS ||--o{ TASKS : assigned
    PROJECTS ||--o{ DOCUMENTS : contains
    USERS ||--o{ DOCUMENTS : creates
    WORKSPACES ||--o{ INVITATIONS : issues
    USERS ||--o{ NOTIFICATIONS : receives

    USERS {
        uuid id PK
        string name
        string email
        string password_hash
    }

    WORKSPACES {
        uuid id PK
        string name
        uuid owner_id FK
    }

    WORKSPACE_MEMBERS {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        string role
    }

    PROJECTS {
        uuid id PK
        uuid workspace_id FK
        string name
        string status
    }

    TASKS {
        uuid id PK
        uuid project_id FK
        uuid assignee_id FK
        string title
        string status
        string priority
    }

    DOCUMENTS {
        uuid id PK
        uuid project_id FK
        uuid creator_id FK
        string title
        string content_type
    }

    INVITATIONS {
        uuid id PK
        uuid workspace_id FK
        string email
        string token_hash
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string message
        boolean is_read
    }
```

### MongoDB GridFS – File Storage

MongoDB GridFS is used for storing large uploaded files such as:

- PDF documents.
- DOCX files.
- Images.
- Project attachments.
- Other supported binary files.

GridFS internally stores file metadata and file chunks.

PostgreSQL maintains the application-level document metadata and corresponding GridFS file reference.

### Redis – Fast Data and Messaging

Redis is responsible for:

- Caching frequently accessed data.
- User presence.
- Realtime cross-instance Pub/Sub.
- BullMQ job queues.
- Temporary collaboration-related state.

---

## 📁 Project Structure

Proposed monorepo structure:

```text
syncspace/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── stores/
│   │   └── public/
│   │
│   ├── api/
│   │   └── src/
│   │       ├── auth/
│   │       ├── users/
│   │       ├── workspaces/
│   │       ├── projects/
│   │       ├── tasks/
│   │       ├── documents/
│   │       ├── invitations/
│   │       ├── notifications/
│   │       ├── storage/
│   │       └── main.ts
│   │
│   ├── realtime/
│   │   └── src/
│   │       ├── websocket/
│   │       ├── yjs/
│   │       ├── awareness/
│   │       ├── persistence/
│   │       └── main.ts
│   │
│   └── worker/
│       └── src/
│           ├── email/
│           ├── notifications/
│           ├── document-processing/
│           └── main.ts
│
├── packages/
│   ├── shared/
│   ├── types/
│   ├── config/
│   └── validation/
│
├── prisma/
│   └── schema.prisma
│
├── docker/
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔌 API Design

The backend exposes REST APIs for workspace management, projects, documents, tasks, authentication, and other application operations.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate user |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Organizations

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/organizations` | Create organization |
| GET | `/api/organizations` | List organizations the user belongs to |
| GET | `/api/organizations/:id` | Get authorized organization |
| PATCH | `/api/organizations/:id` | Update organization |
| GET | `/api/organizations/:id/members` | List organization members |
| POST | `/api/organizations/:id/invitations` | Invite organization member |

### Workspaces

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/workspaces` | Create workspace |
| GET | `/api/workspaces` | List workspaces |
| GET | `/api/workspaces/:id` | Get workspace |
| PATCH | `/api/workspaces/:id` | Update workspace |
| DELETE | `/api/workspaces/:id` | Delete workspace |
| POST | `/api/workspaces/:id/invitations` | Invite member |
| GET | `/api/workspaces/:id/members` | List members |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | List projects |
| GET | `/api/projects/:id` | Get project |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Teams

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/teams` | Create team |
| GET | `/api/teams` | List authorized teams |
| GET | `/api/teams/:id` | Get team |
| PATCH | `/api/teams/:id` | Update team |
| DELETE | `/api/teams/:id` | Delete team |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks` | List tasks |
| GET | `/api/tasks/:id` | Get task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Documents

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/documents` | Create document |
| GET | `/api/documents` | List documents |
| GET | `/api/documents/:id` | Get document metadata |
| PATCH | `/api/documents/:id` | Update document metadata |
| DELETE | `/api/documents/:id` | Delete document |
| POST | `/api/documents/:id/upload` | Upload attachment |
| GET | `/api/documents/:id/download` | Download attachment |
| GET | `/api/documents/:id/versions` | Get version history |

### WebSocket Events

| Event | Description |
|---|---|
| `document:join` | Join collaborative document |
| `document:update` | Send document update |
| `document:sync` | Synchronize document state |
| `document:leave` | Leave document session |
| `presence:update` | Update user presence |
| `cursor:update` | Broadcast cursor position |
| `notification:new` | Deliver notification |

*Note: These endpoints and event names describe the proposed API contract. Actual routes may vary with implementation.*

---

## 🔐 Authentication and Security

Security is an important part of a multi-tenant collaboration platform.

### Authentication

- JWT-based authentication.
- Secure password hashing.
- Access and refresh token strategy.
- Protected API endpoints.
- Token validation for WebSocket connections.

### Authorization

Role-based access control:

| Role | Permissions |
|---|---|
| Owner | Full workspace control |
| Admin | Manage members, projects and workspace resources |
| Member | Access permitted projects, documents and tasks |

### Security Measures

- Organization-level tenant isolation across all tenant-owned resources.
- Workspace-level and project-level authorization.
- Tenant-scoped database queries, cache keys, background jobs, and realtime rooms.
- Cross-tenant access tests and database constraints where implemented.
- Backend authorization on every protected resource.
- Input validation and sanitization.
- Secure invitation tokens.
- Token expiration.
- Rate limiting.
- Secure HTTP headers.
- Environment-based secret management.
- File upload validation.
- Protection against unauthorized document access.

---

## ⚙️ Background Job Processing

SyncSpace uses BullMQ with Redis for asynchronous processing.

### Why Background Jobs?

Some operations should not block the main API request.

For example, sending an invitation email should not require the API to wait for the entire email delivery process.

### Workflow

```mermaid
flowchart TD
    A[User Action] --> B[NestJS API]
    B --> C[Create Background Job]
    C --> D[Redis / BullMQ Queue]
    D --> E[Worker Picks Job]
    E --> F{Processing Successful?}
    F -->|Yes| G[Mark Completed]
    F -->|No| H[Retry with Backoff]
    H --> E
    G --> I[Update Job Status]
```

### Background Job Examples

- Invitation email delivery.
- Notification processing.
- Document export generation.
- Document snapshot creation.
- File metadata processing.
- Cleanup of expired invitations.

### Reliability

- Retry failed jobs.
- Exponential backoff.
- Job status tracking.
- Idempotent job handlers.
- Dead-letter or failed-job inspection.

---

## 📈 Scalability and Reliability

SyncSpace is designed with scalability and distributed systems principles in mind.

### 1. Horizontal Scaling

Multiple backend and realtime server instances can process incoming traffic.

A load balancer can distribute incoming requests across instances.

### 2. Redis Pub/Sub

Redis Pub/Sub distributes realtime events between different WebSocket server instances.

This enables users connected to different servers to receive shared document updates.

### 3. Stateless API Design

The REST API is designed to avoid depending on local in-memory session state.

Shared authentication and application state are maintained through appropriate persistent or shared infrastructure.

### 4. Database Optimization

- Database indexes.
- Connection pooling.
- Pagination.
- Query optimization.
- Efficient data retrieval.

### 5. Reliable Document Persistence

- Persist Yjs document updates.
- Maintain document snapshots.
- Recover document state after restarts.
- Synchronize disconnected clients.

### 6. Fault Tolerance

- Retry mechanisms.
- Health checks.
- Graceful error handling.
- Background job recovery.
- Monitoring and logging.

### 7. Consistency

Yjs CRDT manages concurrent collaborative document updates, while PostgreSQL transactions maintain consistency for relational business operations.


---

## ⚡ Performance and Responsiveness

SyncSpace should provide immediate feedback to user interactions while keeping API operations, realtime synchronization, and background processing reliable.

### Immediate Button Feedback

A button should respond visually as soon as the user clicks it, even when the underlying server operation takes longer.

- Show a pressed, loading, or pending state immediately after a valid interaction.
- Disable submit actions while the same request is in progress to prevent accidental duplicate submissions.
- Use optimistic UI updates only when the operation can be safely reconciled with the server response.
- Show clear success and error feedback.
- Restore or reconcile the UI when an operation fails.
- Avoid full-page reloads for operations that can update local or server state incrementally.
- Do not add artificial delays or fake success states.

### Frontend Performance

- Identify unnecessary React renders and optimize component state boundaries.
- Avoid repeating identical API requests when existing query data can be reused safely.
- Use pagination or virtualization for large project, task, member, and activity lists.
- Debounce search and filter inputs where appropriate.
- Lazy-load large editors and other expensive components when they are not immediately needed.
- Keep expensive computation off the browser's main thread when it materially affects interaction responsiveness.
- Provide accessible loading, disabled, success, and error states.

### Backend and Database Performance

- Measure API latency before optimizing.
- Inspect slow endpoints, database query plans, N+1 queries, and repeated reads.
- Add indexes based on observed query patterns.
- Use pagination for large result sets.
- Use connection pooling and bounded concurrency.
- Run independent operations concurrently only when doing so is safe.
- Cache frequently accessed data only with tenant-aware cache keys and an appropriate invalidation strategy.
- Move non-interactive work such as email delivery and exports to BullMQ workers.

### Realtime Performance

- Avoid duplicate WebSocket event listeners and duplicate subscriptions.
- Authenticate and authorize every realtime connection and document-room join.
- Keep Yjs updates incremental rather than repeatedly transmitting complete document state.
- Use Redis Pub/Sub for cross-instance event distribution, not as durable document storage.
- Monitor active connections, message volume, update sizes, and persistence latency.
- Apply backpressure or limits where needed to protect the realtime service.

### Measurement and Targets

Use measurements rather than assumptions to identify bottlenecks.

| Measurement | Suggested target or practice |
|---|---|
| Click-to-visual-feedback | Aim for under 100 ms |
| Lightweight API operations | Aim for under 500 ms where practical; measure p50 and p95 |
| Page responsiveness | Track Core Web Vitals and interaction responsiveness |
| Realtime synchronization | Measure update propagation and persistence latency |
| Background jobs | Track queue wait time, processing time, retries, and failures |

These are engineering targets, not guaranteed performance claims. Actual results depend on infrastructure, data volume, network conditions, and concurrent usage.

### Performance Validation

Test representative user journeys, including:

- Creating an organization and workspace.
- Creating projects and teams.
- Inviting members.
- Creating and assigning tasks.
- Searching and filtering large lists.
- Opening and editing collaborative documents.
- Receiving realtime updates from another user.
- Uploading and downloading attachments.

Use browser performance tools, backend timing logs, and automated browser tests where configured. Record before-and-after measurements for optimizations and avoid claiming improvements that have not been measured.


---

## 🔄 CI/CD Pipeline

SyncSpace uses GitHub Actions to automate code validation and testing.

### CI Pipeline

```mermaid
flowchart TD
    A[Developer Pushes Code] --> B[GitHub Repository]
    B --> C[GitHub Actions Trigger]
    C --> D[Install Dependencies]
    D --> E[Lint]
    E --> F[Type Checking]
    F --> G[Run Unit Tests]
    G --> H[Run Integration Tests]
    H --> I[Build Applications]
    I --> J{All Checks Passed?}
    J -->|Yes| K[CI Successful]
    J -->|No| L[Report Failure]
```

### Automated Checks

- Dependency installation.
- ESLint.
- TypeScript type checking.
- Unit testing.
- Integration testing.
- Application builds.
- Tenant-isolation tests for organization, workspace, project, file, and realtime access where implemented.
- Frontend interaction and performance checks where configured.
- Docker configuration and image-build validation where configured.

The initial pipeline focuses on continuous integration and automated quality checks. Deployment automation can be added separately when a production hosting environment is selected.

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

Install the following:

- Node.js 20+
- npm
- Git
- Docker Desktop
- Docker Compose

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/syncspace.git

cd syncspace
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Update the environment variables according to your local setup.

### 4. Start Infrastructure

```bash
docker compose up -d
```

This starts the required infrastructure services configured in Docker Compose.

### 5. Run Database Migrations

If Prisma is configured:

```bash
npx prisma migrate dev
npx prisma generate
```

### 6. Start Development Servers

Run the frontend, backend, realtime server, and worker using the configured development scripts.

```bash
npm run dev
```

*The exact commands depend on the scripts configured in the root package.json.*

### 7. Access Application

```text
Frontend:        http://localhost:3000
Backend API:     http://localhost:3001
Realtime Server: http://localhost:3002
```

---

## 🔑 Environment Variables

Create a `.env` file using the following template.

```env
# Application
NODE_ENV=development

# PostgreSQL
DATABASE_URL=postgresql://syncspace:syncspace@localhost:5432/syncspace

# MongoDB
MONGODB_URI=mongodb://localhost:27017/syncspace_files

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_ACCESS_SECRET=replace-with-a-secure-secret
JWT_REFRESH_SECRET=replace-with-another-secure-secret

# Frontend
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3002

# Email
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=SyncSpace <onboarding@resend.dev>

# Monitoring
SENTRY_DSN=
```

**Security note:** Never commit actual credentials, API keys, database passwords, or JWT secrets to GitHub. Keep `.env` in `.gitignore` and provide only placeholder values in `.env.example`.

---

## 🧪 Testing

Testing is important for validating the correctness of collaborative operations and backend services.

### Unit Tests

Test individual components and business logic.

```bash
npm run test
```

### Integration Tests

Test interactions between:
- API and PostgreSQL.
- API and Redis.
- Backend and MongoDB.
- Realtime server and Yjs.
- Worker and BullMQ.

### End-to-End Tests

Use Playwright to validate complete user workflows:

1. Register and log in.
2. Create a workspace.
3. Invite another user.
4. Create a project.
5. Create and assign a task.
6. Create a collaborative document.
7. Edit the same document using multiple users.
8. Verify synchronization.
9. Reconnect after temporary network disconnection.
10. Verify document persistence.
11. Create two separate organizations and verify that their data remains isolated.
12. Attempt cross-organization access to workspaces, projects, tasks, documents, and files and verify that access is denied.
13. Verify that buttons provide immediate loading or interaction feedback and prevent duplicate submissions.

---

## 🛣️ Future Enhancements

Potential improvements for future releases:

- [ ] Advanced organization-level administration and audit controls.
- [ ] Automated tenant-isolation security test suite.
- [ ] Performance benchmarking under realistic multi-organization concurrency.
- [ ] Advanced document permissions.
- [ ] Rich document templates.
- [ ] Advanced search across workspaces.
- [ ] Comments and threaded discussions.
- [ ] Document mentions and notifications.
- [ ] Calendar integration.
- [ ] Advanced analytics dashboard.
- [ ] Real-time voice/video collaboration.
- [ ] Advanced offline-first synchronization.
- [ ] Document export to PDF and DOCX.
- [ ] Advanced audit logs.
- [ ] Performance benchmarking under concurrent users.
- [ ] Multi-region deployment.

---

## 📚 Learning Outcomes

This project provides practical exposure to several important software engineering concepts.

### Distributed Systems

- Distributed communication.
- Horizontal scaling.
- Cross-instance synchronization.
- Event-driven architecture.
- Fault tolerance.

### Concurrency

- Concurrent document editing.
- CRDT.
- Conflict-free merging.
- Real-time state synchronization.
- Offline update synchronization.

### Backend Engineering

- Modular backend architecture.
- REST API development.
- Authentication and authorization.
- Background processing.
- Database transactions.

### Database Engineering

- Relational database design.
- Document and file storage.
- Indexing and query optimization.
- Database migrations.
- Data persistence.

### System Design

- Multi-tenant architecture.
- Real-time collaboration architecture.
- Caching.
- Message distribution.
- Reliability and scalability.

### DevOps

- Docker containerization.
- CI/CD automation.
- Automated testing.
- Application monitoring.

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a Pull Request.

```bash
git checkout -b feature/your-feature-name

git add .

git commit -m "feat: add your feature"

git push origin feature/your-feature-name
```

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## 👨‍💻 Author

**Rohit Kumar**

B.Tech – Computer Science and Engineering

IIIT Nagpur

GitHub: [GITHUB_PROFILE](https://github.com/rohi5431)

LinkedIn: [LINKEDIN_PROFILE](https://www.linkedin.com/in/rohit-kumar-3707382a2/)

---

<p align="center">
  <strong>SyncSpace – Bringing Software Teams Together.</strong>
  <br/>
  Built to explore real-time collaboration, distributed systems, and scalable backend engineering.
</p>
