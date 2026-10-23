/* PostgreSQL schema for ICETS / BUP Academic Conference.
   This source file mirrors the schema applied to the provisioned PostgreSQL database.
   Public content is readable by visitors; attendee registrations and paper submissions
   are restricted to the authenticated owner through Row Level Security. */

CREATE TABLE IF NOT EXISTS conference_settings (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, short_name text NOT NULL, theme text NOT NULL, description text NOT NULL, conference_date text NOT NULL, venue text NOT NULL, city text NOT NULL, email text NOT NULL, phone text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS conference_tracks (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, description text NOT NULL, accent text NOT NULL DEFAULT 'green', display_order integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS important_dates (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), label text NOT NULL, date_text text NOT NULL, detail text NOT NULL, display_order integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS announcements (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, excerpt text NOT NULL, category text NOT NULL DEFAULT 'Update', published_at date NOT NULL DEFAULT CURRENT_DATE, display_order integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS contact_messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, email text NOT NULL, subject text NOT NULL, message text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS registrations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE, full_name text NOT NULL, affiliation text NOT NULL, attendance_type text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS paper_submissions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE, title text NOT NULL, abstract text NOT NULL, track text NOT NULL, keywords text NOT NULL, status text NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under review', 'Accepted', 'Revision requested', 'Rejected')), created_at timestamptz NOT NULL DEFAULT now(), paper_file_path text);

ALTER TABLE conference_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conference_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read conference settings" ON conference_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can read conference tracks" ON conference_tracks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can read important dates" ON important_dates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can read announcements" ON announcements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Visitors can submit contact messages" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can read own registrations" ON registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own registrations" ON registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own registrations" ON registrations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own registrations" ON registrations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can read own paper submissions" ON paper_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own paper submissions" ON paper_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own paper submissions" ON paper_submissions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own paper submissions" ON paper_submissions FOR DELETE TO authenticated USING (auth.uid() = user_id);
