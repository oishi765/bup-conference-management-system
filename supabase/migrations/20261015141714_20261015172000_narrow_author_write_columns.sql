/*
# Narrow author write permissions

1. Modified table: `paper_submissions`
- Authors can insert and update only title, abstract, track, keywords, and paper_file_path.
- Ownership, review status, and creation time are database-controlled.

2. Modified table: `registrations`
- Attendees can insert and update only full_name, affiliation, and attendance_type.
- Ownership and creation time are database-controlled.

3. Security
- Removes table-wide INSERT and UPDATE privileges from client roles.
- Grants only the user-editable columns while existing owner RLS policies remain active.

4. Important notes
- Existing data is untouched.
- The current submission and registration forms use only the granted columns.
*/

REVOKE INSERT, UPDATE ON paper_submissions FROM PUBLIC, anon, authenticated;
GRANT INSERT (title, abstract, track, keywords, paper_file_path) ON paper_submissions TO authenticated;
GRANT UPDATE (title, abstract, track, keywords, paper_file_path) ON paper_submissions TO authenticated;

REVOKE INSERT, UPDATE ON registrations FROM PUBLIC, anon, authenticated;
GRANT INSERT (full_name, affiliation, attendance_type) ON registrations TO authenticated;
GRANT UPDATE (full_name, affiliation, attendance_type) ON registrations TO authenticated;
