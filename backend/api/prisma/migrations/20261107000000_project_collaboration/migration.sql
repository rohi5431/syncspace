ALTER TABLE "projects"
ADD COLUMN "template" TEXT NOT NULL DEFAULT 'web-application-development';

ALTER TABLE "documents"
ADD COLUMN "projectId" TEXT,
ADD COLUMN "folderId" TEXT,
ADD COLUMN "type" TEXT NOT NULL DEFAULT 'TECHNICAL_DOCUMENTATION',
ADD COLUMN "editor" TEXT NOT NULL DEFAULT 'rich-text',
ADD COLUMN "starred" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "tasks"
ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'MEDIUM';

CREATE TABLE "project_sections" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_sections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "document_folders" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "document_folders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "document_versions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentFormat" TEXT NOT NULL DEFAULT 'html',
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "document_comments" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "anchor" TEXT,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "document_comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "document_permissions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "document_permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "document_updates" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "update" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_updates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "project_sections_projectId_key_key" ON "project_sections"("projectId", "key");
CREATE INDEX "project_sections_projectId_position_idx" ON "project_sections"("projectId", "position");
CREATE INDEX "document_folders_workspaceId_idx" ON "document_folders"("workspaceId");
CREATE UNIQUE INDEX "document_folders_workspaceId_parentId_name_key" ON "document_folders"("workspaceId", "parentId", "name");
CREATE INDEX "document_versions_documentId_createdAt_idx" ON "document_versions"("documentId", "createdAt");
CREATE INDEX "document_comments_documentId_createdAt_idx" ON "document_comments"("documentId", "createdAt");
CREATE UNIQUE INDEX "document_permissions_documentId_email_key" ON "document_permissions"("documentId", "email");
CREATE INDEX "document_updates_documentId_createdAt_idx" ON "document_updates"("documentId", "createdAt");
CREATE INDEX "documents_projectId_idx" ON "documents"("projectId");
CREATE INDEX "documents_folderId_idx" ON "documents"("folderId");

ALTER TABLE "project_sections" ADD CONSTRAINT "project_sections_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_folders" ADD CONSTRAINT "document_folders_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_folders" ADD CONSTRAINT "document_folders_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "document_folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_folderId_fkey"
FOREIGN KEY ("folderId") REFERENCES "document_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_documentId_fkey"
FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_documentId_fkey"
FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_documentId_fkey"
FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_updates" ADD CONSTRAINT "document_updates_documentId_fkey"
FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
