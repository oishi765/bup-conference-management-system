/*
# Add committee, speakers, schedule tables plus reviewer functions

1. New tables
- `committee_members`: organizing committee members with name, role, display_order.
- `speakers`: keynote speakers with name, affiliation, bio, display_order.
- `schedule_items`: conference program sessions with day_label, time, title, display_order.

2. New functions
- `get_contact_messages`: returns contact messages to authorized reviewers/admins.
- `get_accepted_papers`: returns accepted paper titles and tracks to the public.

3. Security
- New tables have public SELECT policies (content is meant for all visitors).
- Contact message inbox function is SECURITY DEFINER with role check.
- Accepted papers function is SECURITY DEFINER, readable by anon+authenticated.

4. Important notes
- Sample data is seeded for all three new tables.
- No existing data is modified.
*/

CREATE TABLE IF NOT EXISTS committee_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS speakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  affiliation text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schedule_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_label text NOT NULL,
  time_label text NOT NULL,
  title text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read committee members" ON committee_members;
CREATE POLICY "Public can read committee members" ON committee_members
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can read speakers" ON speakers;
CREATE POLICY "Public can read speakers" ON speakers
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can read schedule items" ON schedule_items;
CREATE POLICY "Public can read schedule items" ON schedule_items
  FOR SELECT TO anon, authenticated USING (true);

INSERT INTO committee_members (name, role, display_order) VALUES
  ('Dr. A. K. M. Shafiul Islam', 'Conference chair', 1),
  ('Prof. Dr. Md. Abu Bakar Siddique', 'Program committee', 2),
  ('Dr. Farzana Rahman', 'Research chair', 3),
  ('Lt Col Md. Mahbubur Rahman', 'Operations lead', 4)
ON CONFLICT DO NOTHING;

INSERT INTO speakers (name, affiliation, bio, display_order) VALUES
  ('Speaker announcements', 'Coming soon', 'Speaker details will appear here after official confirmation.', 1)
ON CONFLICT DO NOTHING;

INSERT INTO schedule_items (day_label, time_label, title, display_order) VALUES
  ('Day one · 18 December', '09:00', 'Opening remarks & welcome', 1),
  ('Day one · 18 December', '10:30', 'Keynote: Designing for human futures', 2),
  ('Day one · 18 December', '13:30', 'Parallel research sessions', 3),
  ('Day one · 18 December', '16:00', 'Community roundtables', 4),
  ('Day two · 19 December', '09:30', 'Featured research presentations', 5),
  ('Day two · 19 December', '11:30', 'Methods clinic', 6),
  ('Day two · 19 December', '14:00', 'Poster & demo walk', 7),
  ('Day two · 19 December', '16:30', 'Closing conversation', 8)
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_contact_messages()
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  subject text,
  message text,
  created_at timestamptz
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
  SELECT c.id, c.name, c.email, c.subject, c.message, c.created_at
  FROM public.contact_messages c
  ORDER BY c.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_contact_messages() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_contact_messages() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_accepted_papers()
RETURNS TABLE (
  id uuid,
  title text,
  track text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.title, p.track
  FROM public.paper_submissions p
  WHERE p.status = 'Accepted'
  ORDER BY p.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_accepted_papers() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_accepted_papers() TO anon, authenticated;
