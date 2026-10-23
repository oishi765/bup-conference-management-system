/*
# Create BUP academic conference data model

1. New Tables
- `conference_settings`: one editable row for conference identity, theme, dates, venue, and contact details.
- `conference_tracks`: public research tracks shown on the conference website.
- `important_dates`: public submission and event milestones.
- `announcements`: public updates for the homepage.
- `contact_messages`: visitor messages submitted through the contact form.
- `registrations`: authenticated attendee registrations owned by the submitting user.
- `paper_submissions`: authenticated author submissions owned by the submitting user.

2. Security
- Row Level Security is enabled on every table.
- Public conference content is readable by anonymous and authenticated visitors.
- Contact messages can be created publicly but cannot be read by visitors.
- Registrations and paper submissions are restricted to their authenticated owners.

3. Important notes
- Conference content is clearly marked as sample content and can be edited by a future admin workflow.
- No administrator or reviewer account is created automatically.
- Asset files remain frontend-owned and are not stored in the database.
*/

CREATE TABLE IF NOT EXISTS conference_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text NOT NULL,
  theme text NOT NULL,
  description text NOT NULL,
  conference_date text NOT NULL,
  venue text NOT NULL,
  city text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conference_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  accent text NOT NULL DEFAULT 'green',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS important_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  date_text text NOT NULL,
  detail text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL,
  category text NOT NULL DEFAULT 'Update',
  published_at date NOT NULL DEFAULT CURRENT_DATE,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  affiliation text NOT NULL,
  attendance_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS paper_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  abstract text NOT NULL,
  track text NOT NULL,
  keywords text NOT NULL,
  status text NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under review', 'Accepted', 'Revision requested', 'Rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conference_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conference_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read conference settings" ON conference_settings;
CREATE POLICY "Public can read conference settings" ON conference_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can read conference tracks" ON conference_tracks;
CREATE POLICY "Public can read conference tracks" ON conference_tracks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can read important dates" ON important_dates;
CREATE POLICY "Public can read important dates" ON important_dates FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can read announcements" ON announcements;
CREATE POLICY "Public can read announcements" ON announcements FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Visitors can submit contact messages" ON contact_messages;
CREATE POLICY "Visitors can submit contact messages" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own registrations" ON registrations;
CREATE POLICY "Users can read own registrations" ON registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own registrations" ON registrations;
CREATE POLICY "Users can create own registrations" ON registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own registrations" ON registrations;
CREATE POLICY "Users can update own registrations" ON registrations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own registrations" ON registrations;
CREATE POLICY "Users can delete own registrations" ON registrations FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own paper submissions" ON paper_submissions;
CREATE POLICY "Users can read own paper submissions" ON paper_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own paper submissions" ON paper_submissions;
CREATE POLICY "Users can create own paper submissions" ON paper_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own paper submissions" ON paper_submissions;
CREATE POLICY "Users can update own paper submissions" ON paper_submissions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own paper submissions" ON paper_submissions;
CREATE POLICY "Users can delete own paper submissions" ON paper_submissions FOR DELETE TO authenticated USING (auth.uid() = user_id);

INSERT INTO conference_settings (name, short_name, theme, description, conference_date, venue, city, email, phone)
SELECT 'International Conference on Emerging Technologies and Society', 'ICETS 2025', 'Engineering responsible futures through research, innovation, and collaboration.', 'A sample conference experience for the Bangladesh University of Professionals community. Replace this content with verified official information before publishing.', '18–19 December 2025', 'BUP Main Campus', 'Dhaka, Bangladesh', 'conference@bup.edu.bd', '+880 2 800 0367'
WHERE NOT EXISTS (SELECT 1 FROM conference_settings);

INSERT INTO conference_tracks (title, description, accent, display_order)
SELECT * FROM (VALUES
  ('Intelligent Systems', 'Applied AI, data science, robotics, and human-centered computing for real-world impact.', 'teal', 1),
  ('Cybersecurity & Resilience', 'Trust, privacy, secure infrastructure, and the future of digital safety.', 'navy', 2),
  ('Society & Sustainable Futures', 'Interdisciplinary research at the intersection of technology, policy, and communities.', 'gold', 3)
) AS seed(title, description, accent, display_order)
WHERE NOT EXISTS (SELECT 1 FROM conference_tracks);

INSERT INTO important_dates (label, date_text, detail, display_order)
SELECT * FROM (VALUES
  ('Paper submission', '30 September 2025', 'Full papers and extended abstracts close.', 1),
  ('Notification of decision', '25 October 2025', 'Authors receive review outcomes and next steps.', 2),
  ('Early registration', '10 November 2025', 'Reduced registration rate ends.', 3),
  ('Conference days', '18–19 December 2025', 'Two days of research exchange at BUP.', 4)
) AS seed(label, date_text, detail, display_order)
WHERE NOT EXISTS (SELECT 1 FROM important_dates);

INSERT INTO announcements (title, excerpt, category, published_at, display_order)
SELECT * FROM (VALUES
  ('Call for papers is now open', 'Researchers and practitioners are invited to share original work across three interdisciplinary tracks.', 'Submissions', CURRENT_DATE, 1),
  ('A conversation beyond the paper', 'The program will pair research sessions with practical conversations on responsible innovation.', 'Program', CURRENT_DATE - 7, 2),
  ('Designed for meaningful exchange', 'Join a focused community of students, faculty, and professionals shaping the next decade of technology.', 'Community', CURRENT_DATE - 14, 3)
) AS seed(title, excerpt, category, published_at, display_order)
WHERE NOT EXISTS (SELECT 1 FROM announcements);