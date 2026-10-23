/*
# Add authorized reviewer workflow

1. New functions
- `get_review_submissions`: returns submission summaries only to authenticated users with `app_metadata.role` set to `reviewer` or `admin`.
- `set_paper_submission_status`: changes a paper status only for those authorized reviewer roles.

2. Security
- Both functions use `SECURITY DEFINER` with a fixed `search_path`.
- Anonymous callers cannot execute either function.
- Authenticated callers are checked inside the function using immutable `app_metadata`, not user-editable metadata.
- Status values are validated against the allowed workflow states.

3. Important notes
- The browser reviewer panel uses these functions instead of direct status updates.
- A reviewer account must be assigned its role in Supabase Auth app metadata before it can access the panel.
- No existing rows are changed by this migration.
*/

CREATE OR REPLACE FUNCTION public.get_review_submissions()
RETURNS TABLE (
  id uuid,
  title text,
  track text,
  status text,
  created_at timestamptz,
  paper_file_path text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') NOT IN ('reviewer', 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT p.id, p.title, p.track, p.status, p.created_at, p.paper_file_path
  FROM public.paper_submissions p
  ORDER BY p.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_paper_submission_status(
  p_submission_id uuid,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') NOT IN ('reviewer', 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_status NOT IN ('Submitted', 'Under review', 'Accepted', 'Revision requested', 'Rejected') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE public.paper_submissions
  SET status = p_status
  WHERE id = p_submission_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_review_submissions() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_review_submissions() TO authenticated;

REVOKE ALL ON FUNCTION public.set_paper_submission_status(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_paper_submission_status(uuid, text) TO authenticated;
