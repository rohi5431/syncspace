CREATE TABLE IF NOT EXISTS public.document_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  snapshot_data bytea NOT NULL,
  state_vector bytea NOT NULL,
  created_by_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  update_count integer NOT NULL DEFAULT 0,
  CONSTRAINT document_snapshots_update_count_check CHECK (update_count >= 0)
);

CREATE INDEX IF NOT EXISTS document_snapshots_document_created_idx
  ON public.document_snapshots (document_id, created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS public.document_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  update_data bytea NOT NULL,
  update_hash varchar(64) NOT NULL,
  actor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT document_updates_document_hash_key UNIQUE (document_id, update_hash)
);

CREATE INDEX IF NOT EXISTS document_updates_document_created_idx
  ON public.document_updates (document_id, created_at ASC, id ASC);
