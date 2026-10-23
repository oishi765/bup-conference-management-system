/*
# Remove inherited author control over protected columns

1. Modified tables
- `paper_submissions`: remove INSERT and UPDATE privileges on `user_id`, `status`, and `created_at` from PUBLIC and client roles.
- `registrations`: remove INSERT and UPDATE privileges on `user_id` and `created_at` from PUBLIC and client roles.

2. Security
- Prevents inherited PUBLIC privileges from bypassing the intended column-level protection.
- Authors retain normal row access and can still submit/edit only user-owned content columns.

3. Important notes
- Database defaults continue to populate ownership, status, and timestamps.
- No rows are deleted or changed.
*/

REVOKE INSERT (user_id, status, created_at) ON paper_submissions FROM PUBLIC, anon, authenticated;
REVOKE UPDATE (user_id, status, created_at) ON paper_submissions FROM PUBLIC, anon, authenticated;

REVOKE INSERT (user_id, created_at) ON registrations FROM PUBLIC, anon, authenticated;
REVOKE UPDATE (user_id, created_at) ON registrations FROM PUBLIC, anon, authenticated;
