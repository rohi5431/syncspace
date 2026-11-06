BEGIN;

CREATE TABLE IF NOT EXISTS public.folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  parent_folder_id uuid NULL REFERENCES public.folders(id) ON DELETE SET NULL,
  created_by_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT folders_name_length_check CHECK (length(trim(name)) BETWEEN 1 AND 120)
);

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(200) NOT NULL,
  description text NULL,
  content jsonb NOT NULL DEFAULT '{"type":"doc","content":[]}'::jsonb,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  folder_id uuid NULL REFERENCES public.folders(id) ON DELETE SET NULL,
  created_by_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  is_archived boolean NOT NULL DEFAULT false,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT documents_title_length_check CHECK (length(trim(title)) BETWEEN 1 AND 200)
);

CREATE TABLE IF NOT EXISTS public.document_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  created_by_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT document_permissions_role_check CHECK (role IN ('VIEWER', 'EDITOR')),
  CONSTRAINT document_permissions_document_user_key UNIQUE (document_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  title varchar(200) NOT NULL,
  content jsonb NOT NULL,
  created_by_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  change_summary text NULL,
  CONSTRAINT document_versions_version_number_check CHECK (version_number > 0),
  CONSTRAINT document_versions_document_version_key UNIQUE (document_id, version_number)
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  action varchar(80) NOT NULL,
  resource_type varchar(40) NOT NULL,
  resource_id uuid NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS folders_workspace_parent_idx
  ON public.folders (workspace_id, parent_folder_id);
CREATE UNIQUE INDEX IF NOT EXISTS folders_workspace_root_name_uidx
  ON public.folders (workspace_id, lower(name)) WHERE parent_folder_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS folders_workspace_parent_name_uidx
  ON public.folders (workspace_id, parent_folder_id, lower(name)) WHERE parent_folder_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS documents_workspace_updated_idx
  ON public.documents (workspace_id, updated_at DESC, id DESC)
  WHERE is_archived = false AND is_deleted = false;
CREATE INDEX IF NOT EXISTS documents_workspace_created_idx
  ON public.documents (workspace_id, created_at DESC, id DESC)
  WHERE is_archived = false AND is_deleted = false;
CREATE INDEX IF NOT EXISTS documents_workspace_folder_updated_idx
  ON public.documents (workspace_id, folder_id, updated_at DESC, id DESC)
  WHERE is_archived = false AND is_deleted = false;
CREATE INDEX IF NOT EXISTS documents_workspace_title_search_idx
  ON public.documents (workspace_id, lower(title) text_pattern_ops)
  WHERE is_archived = false AND is_deleted = false;
CREATE INDEX IF NOT EXISTS document_permissions_user_idx
  ON public.document_permissions (user_id, document_id);
CREATE INDEX IF NOT EXISTS activity_logs_workspace_created_idx
  ON public.activity_logs (workspace_id, created_at DESC, id DESC);

COMMIT;
