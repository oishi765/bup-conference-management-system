/*
# Protect review status and prevent duplicate attendance registration

1. Modified table: `paper_submissions`
- Users may continue editing their own title, abstract, track, keywords, and private PDF path.
- Users may no longer insert or update `user_id`, `status`, or `created_at` through the Data API.
- The database continues to assign the owner and default review status.

2. Modified table: `registrations`
- Users may no longer insert or update `user_id` or `created_at` through the Data API.
- Each authenticated user may have at most one attendance registration.

3. Security
- Protected review and ownership fields cannot be changed by an author even through a direct API request.
- Existing owner-only row policies remain in place.

4. Important notes
- A future reviewer workflow must use a separately authorized server-side path to change paper status.
- No existing rows are deleted or modified by this migration.
*/

REVOKE INSERT (user_id, status, created_at) ON paper_submissions FROM anon, authenticated;
REVOKE UPDATE (user_id, status, created_at) ON paper_submissions FROM anon, authenticated;

REVOKE INSERT (user_id, created_at) ON registrations FROM anon, authenticated;
REVOKE UPDATE (user_id, created_at) ON registrations FROM anon, authenticated;

CREATE UNIQUE INDEX IF NOT EXISTS registrations_one_per_user_idx
ON registrations (user_id);
