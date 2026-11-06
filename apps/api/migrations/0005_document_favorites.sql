CREATE TABLE IF NOT EXISTS public.document_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT document_favorites_document_user_key UNIQUE (document_id, user_id)
);

CREATE INDEX IF NOT EXISTS document_favorites_user_created_idx
  ON public.document_favorites (user_id, created_at DESC);
