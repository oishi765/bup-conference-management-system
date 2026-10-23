/*
# Add private PDF manuscript storage

1. New storage bucket
- `paper-manuscripts`: private bucket for author PDF files.
- Only PDF files are accepted and each file is limited to 10 MB.

2. Modified table
- `paper_submissions.paper_file_path`: optional private storage path for the uploaded manuscript.

3. Security
- Storage objects must live under a folder named with the authenticated user's ID.
- Authenticated users can upload, read, update, and delete only files in their own folder.
- Paper submission rows keep their existing owner-only row policies.

4. Important notes
- The browser stores only the private path, never a public URL.
- The application will use short-lived signed URLs when a file needs to be opened.
- The bucket's type and size limits are enforced by storage in addition to the form checks.
*/

ALTER TABLE paper_submissions
  ADD COLUMN IF NOT EXISTS paper_file_path text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'paper-manuscripts', 'paper-manuscripts', false, 10485760, ARRAY['application/pdf']::text[]
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'paper-manuscripts'
);

DROP POLICY IF EXISTS "Authors can upload own manuscript PDFs" ON storage.objects;
CREATE POLICY "Authors can upload own manuscript PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'paper-manuscripts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Authors can read own manuscript PDFs" ON storage.objects;
CREATE POLICY "Authors can read own manuscript PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'paper-manuscripts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Authors can update own manuscript PDFs" ON storage.objects;
CREATE POLICY "Authors can update own manuscript PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'paper-manuscripts'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'paper-manuscripts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Authors can delete own manuscript PDFs" ON storage.objects;
CREATE POLICY "Authors can delete own manuscript PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'paper-manuscripts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
