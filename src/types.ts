export type ConferenceSettings = {
  id: string;
  name: string;
  short_name: string;
  theme: string;
  description: string;
  conference_date: string;
  venue: string;
  city: string;
  email: string;
  phone: string;
};

export type Track = { id: string; title: string; description: string; accent: string };
export type ImportantDate = { id: string; label: string; date_text: string; detail: string };
export type Announcement = { id: string; title: string; excerpt: string; category: string; published_at: string };
export type View = 'home' | 'about' | 'papers' | 'tracks' | 'dates' | 'schedule' | 'committee' | 'speakers' | 'accepted' | 'contact' | 'login' | 'register' | 'forgot' | 'dashboard' | 'submit' | 'register-conference' | 'review';

export type PaperSubmission = {
  id: string;
  title: string;
  abstract: string;
  track: string;
  keywords: string;
  status: string;
  created_at: string;
  paper_file_path: string | null;
};

export type Registration = {
  id: string;
  full_name: string;
  affiliation: string;
  attendance_type: string;
  created_at: string;
};

export type ReviewSubmission = {
  id: string;
  title: string;
  track: string;
  status: string;
  created_at: string;
  paper_file_path: string | null;
};

export type CommitteeMember = {
  id: string;
  name: string;
  role: string;
};

export type Speaker = {
  id: string;
  name: string;
  affiliation: string;
  bio: string;
};

export type ScheduleItem = {
  id: string;
  day_label: string;
  time_label: string;
  title: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
};

export type AcceptedPaper = {
  id: string;
  title: string;
  track: string;
};
