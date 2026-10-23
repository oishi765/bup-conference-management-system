import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ArrowRight, CalendarDays, Check, ChevronRight, Clock3, FileText, Instagram, Linkedin, Mail, MapPin, Menu, Send, ShieldCheck, Sparkles, Upload, Users, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AcceptedPaper, Announcement, CommitteeMember, ConferenceSettings, ContactMessage, ImportantDate, PaperSubmission, Registration as RegistrationType, ReviewSubmission, ScheduleItem, Speaker, Track, View } from '@/types';

const fallbackSettings: ConferenceSettings = { id: 'sample', name: 'International Conference on Emerging Technologies and Society', short_name: 'ICETS 2025', theme: 'Engineering responsible futures through research, innovation, and collaboration.', description: 'A sample conference experience for the Bangladesh University of Professionals community. Replace this content with verified official information before publishing.', conference_date: '18–19 December 2025', venue: 'BUP Main Campus', city: 'Dhaka, Bangladesh', email: 'conference@bup.edu.bd', phone: '+880 2 800 0367' };
const fallbackTracks: Track[] = [
  { id: '1', title: 'Intelligent Systems', description: 'Applied AI, data science, robotics, and human-centered computing for real-world impact.', accent: 'teal' },
  { id: '2', title: 'Cybersecurity & Resilience', description: 'Trust, privacy, secure infrastructure, and the future of digital safety.', accent: 'navy' },
  { id: '3', title: 'Society & Sustainable Futures', description: 'Interdisciplinary research at the intersection of technology, policy, and communities.', accent: 'gold' },
];
const fallbackDates: ImportantDate[] = [
  { id: '1', label: 'Paper submission', date_text: '30 September 2025', detail: 'Full papers and extended abstracts close.' },
  { id: '2', label: 'Notification of decision', date_text: '25 October 2025', detail: 'Authors receive review outcomes and next steps.' },
  { id: '3', label: 'Early registration', date_text: '10 November 2025', detail: 'Reduced registration rate ends.' },
  { id: '4', label: 'Conference days', date_text: '18–19 December 2025', detail: 'Two days of research exchange at BUP.' },
];
const fallbackAnnouncements: Announcement[] = [
  { id: '1', title: 'Call for papers is now open', excerpt: 'Researchers and practitioners are invited to share original work across three interdisciplinary tracks.', category: 'Submissions', published_at: '2025-09-01' },
  { id: '2', title: 'A conversation beyond the paper', excerpt: 'The program will pair research sessions with practical conversations on responsible innovation.', category: 'Program', published_at: '2025-08-25' },
  { id: '3', title: 'Designed for meaningful exchange', excerpt: 'Join a focused community of students, faculty, and professionals shaping the next decade of technology.', category: 'Community', published_at: '2025-08-18' },
];
const fallbackCommittee: CommitteeMember[] = [
  { id: '1', name: 'Dr. A. K. M. Shafiul Islam', role: 'Conference chair' },
  { id: '2', name: 'Prof. Dr. Md. Abu Bakar Siddique', role: 'Program committee' },
  { id: '3', name: 'Dr. Farzana Rahman', role: 'Research chair' },
  { id: '4', name: 'Lt Col Md. Mahbubur Rahman', role: 'Operations lead' },
];
const fallbackSpeakers: Speaker[] = [
  { id: '1', name: 'Speaker announcements', affiliation: 'Coming soon', bio: 'Speaker details will appear here after official confirmation.' },
];
const fallbackSchedule: ScheduleItem[] = [
  { id: '1', day_label: 'Day one · 18 December', time_label: '09:00', title: 'Opening remarks & welcome' },
  { id: '2', day_label: 'Day one · 18 December', time_label: '10:30', title: 'Keynote: Designing for human futures' },
  { id: '3', day_label: 'Day one · 18 December', time_label: '13:30', title: 'Parallel research sessions' },
  { id: '4', day_label: 'Day one · 18 December', time_label: '16:00', title: 'Community roundtables' },
  { id: '5', day_label: 'Day two · 19 December', time_label: '09:30', title: 'Featured research presentations' },
  { id: '6', day_label: 'Day two · 19 December', time_label: '11:30', title: 'Methods clinic' },
  { id: '7', day_label: 'Day two · 19 December', time_label: '14:00', title: 'Poster & demo walk' },
  { id: '8', day_label: 'Day two · 19 December', time_label: '16:30', title: 'Closing conversation' },
];

function App() {
  const [view, setView] = useState<View>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState(fallbackSettings);
  const [tracks, setTracks] = useState(fallbackTracks);
  const [dates, setDates] = useState(fallbackDates);
  const [announcements, setAnnouncements] = useState(fallbackAnnouncements);
  const [committee, setCommittee] = useState(fallbackCommittee);
  const [speakers, setSpeakers] = useState(fallbackSpeakers);
  const [schedule, setSchedule] = useState(fallbackSchedule);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isReviewer, setIsReviewer] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    void loadConference();
    void supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => applySession(session));
    return () => data.subscription.unsubscribe();
  }, []);

  async function loadConference() {
    const [settingsResult, tracksResult, datesResult, announcementsResult, committeeResult, speakersResult, scheduleResult] = await Promise.all([
      supabase.from('conference_settings').select('*').order('updated_at', { ascending: false }).maybeSingle(),
      supabase.from('conference_tracks').select('id,title,description,accent').order('display_order'),
      supabase.from('important_dates').select('id,label,date_text,detail').order('display_order'),
      supabase.from('announcements').select('id,title,excerpt,category,published_at').order('display_order'),
      supabase.from('committee_members').select('id,name,role').order('display_order'),
      supabase.from('speakers').select('id,name,affiliation,bio').order('display_order'),
      supabase.from('schedule_items').select('id,day_label,time_label,title').order('display_order'),
    ]);
    if (settingsResult.data) setSettings(settingsResult.data);
    if (tracksResult.data?.length) setTracks(tracksResult.data);
    if (datesResult.data?.length) setDates(datesResult.data);
    if (announcementsResult.data?.length) setAnnouncements(announcementsResult.data);
    if (committeeResult.data?.length) setCommittee(committeeResult.data);
    if (speakersResult.data?.length) setSpeakers(speakersResult.data);
    if (scheduleResult.data?.length) setSchedule(scheduleResult.data);
  }

  function applySession(session: Session | null) {
    const role = session?.user.app_metadata?.role;
    setSessionEmail(session?.user.email ?? null);
    setIsReviewer(role === 'reviewer' || role === 'admin');
  }

  function navigate(nextView: View) {
    setView(nextView);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setNotice('You have been signed out.');
    navigate('home');
  }

  return <div className="app-shell">
    <header className="site-header">
      <div className="topline"><div className="container topline-inner"><span>Bangladesh University of Professionals</span><span>Academic conference portal</span></div></div>
      <div className="container nav-wrap">
        <button className="brand" onClick={() => navigate('home')} aria-label="Go to homepage"><img src="/assets/logo.png" alt="Bangladesh University of Professionals logo" /><span><strong>{settings.short_name}</strong><small>Emerging technologies & society</small></span></button>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        <nav className={menuOpen ? 'main-nav open' : 'main-nav'}>
          <button onClick={() => navigate('home')}>Home</button><button onClick={() => navigate('about')}>About</button><button onClick={() => navigate('papers')}>Call for papers</button><button onClick={() => navigate('tracks')}>Tracks</button><button onClick={() => navigate('dates')}>Dates</button><button onClick={() => navigate('schedule')}>Program</button><button onClick={() => navigate('committee')}>Committee</button><button onClick={() => navigate('speakers')}>Speakers</button><button onClick={() => navigate('accepted')}>Accepted papers</button><button onClick={() => navigate('contact')}>Contact</button>
          {sessionEmail ? <button className="nav-account" onClick={() => navigate('dashboard')}>My portal</button> : <button className="nav-account" onClick={() => navigate('login')}>Sign in</button>}
          {isReviewer && <button className="nav-account" onClick={() => navigate('review')}>Review inbox</button>}
          <button onClick={() => navigate('register-conference')}>Register</button>
        </nav>
      </div>
    </header>
    {notice && <div className="notice"><Check size={16} /> {notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15} /></button></div>}
    <main>
      {view === 'home' && <Home settings={settings} tracks={tracks} dates={dates} announcements={announcements} navigate={navigate} />}
      {view === 'about' && <PageIntro eyebrow="The conference" title="A meeting point for ideas with consequence." text={settings.description}><About /></PageIntro>}
      {view === 'papers' && <PageIntro eyebrow="Contribute" title="Call for papers" text="Bring your strongest questions, methods, and evidence to a community committed to responsible progress."><PaperPage navigate={navigate} sessionEmail={sessionEmail} /></PageIntro>}
      {view === 'tracks' && <PageIntro eyebrow="Research directions" title="Three lenses. One shared future." text="The program welcomes work that moves between disciplines, scales, and lived experiences."><TrackGrid tracks={tracks} /></PageIntro>}
      {view === 'dates' && <PageIntro eyebrow="Plan your participation" title="Important dates" text="Keep your submission and conference plans moving with the milestones below."><DateTimeline dates={dates} /></PageIntro>}
      {view === 'schedule' && <PageIntro eyebrow="Two days at BUP" title="A program built for exchange." text="The detailed schedule is being shaped with session chairs and will be published here as the program is confirmed."><ScheduleView items={schedule} /></PageIntro>}
      {view === 'committee' && <PageIntro eyebrow="The people behind ICETS" title="Organizing committee" text="A cross-disciplinary team from the BUP community is shaping a focused, welcoming conference."><People kind="committee" members={committee} /></PageIntro>}
      {view === 'speakers' && <PageIntro eyebrow="Voices to look forward to" title="Keynote speakers" text="Speaker announcements will appear here after official confirmation."><People kind="speakers" members={speakers} /></PageIntro>}
      {view === 'accepted' && <AcceptedPapers />}
      {view === 'contact' && <PageIntro eyebrow="Start a conversation" title="We would love to hear from you." text="For questions about submissions, participation, or accessibility, send the team a note."><Contact settings={settings} onSent={setNotice} /></PageIntro>}
      {view === 'login' && <Auth mode="login" onSuccess={(message) => { setNotice(message); navigate('dashboard'); }} switchMode={() => navigate('register')} forgot={() => navigate('forgot')} />}
      {view === 'register' && <Auth mode="register" onSuccess={(message) => { setNotice(message); navigate('dashboard'); }} switchMode={() => navigate('login')} />}
      {view === 'forgot' && <Auth mode="forgot" onSuccess={setNotice} switchMode={() => navigate('login')} />}
      {view === 'dashboard' && <Dashboard email={sessionEmail} navigate={navigate} onSignOut={signOut} onNotice={setNotice} />}
      {view === 'review' && <ReviewInbox isReviewer={isReviewer} onNotice={setNotice} />}
      {view === 'submit' && <Submission tracks={tracks} sessionEmail={sessionEmail} navigate={navigate} onNotice={setNotice} />}
      {view === 'register-conference' && <PageIntro eyebrow="Join the conference" title="Register to attend" text="Reserve your place at the conference. Sign in to complete your attendance registration."><ConferenceRegistration sessionEmail={sessionEmail} navigate={navigate} onNotice={setNotice} /></PageIntro>}
    </main>
    <Footer settings={settings} navigate={navigate} />
  </div>;
}

function Home({ settings, tracks, dates, announcements, navigate }: { settings: ConferenceSettings; tracks: Track[]; dates: ImportantDate[]; announcements: Announcement[]; navigate: (view: View) => void }) {
  return <>
    <section className="hero"><img src="/assets/hero.jpg" alt="BUP campus courtyard" /><div className="hero-overlay" /><div className="container hero-content"><span className="eyebrow light">BUP presents</span><h1>{settings.name}</h1><p className="hero-theme">{settings.theme}</p><div className="hero-meta"><span><CalendarDays size={17} /> {settings.conference_date}</span><span><MapPin size={17} /> {settings.venue}, {settings.city}</span></div><div className="hero-actions"><button className="button primary" onClick={() => navigate('submit')}>Submit a paper <ArrowRight size={17} /></button><button className="button ghost" onClick={() => navigate('register-conference')}>Register now</button></div></div><div className="hero-stamp"><Sparkles size={16} /> A space for responsible ideas</div></section>
    <section className="intro-band"><div className="container split-intro"><div><span className="eyebrow">The invitation</span><h2>Research is at its best when it opens a door.</h2></div><p>ICETS brings together emerging scholarship, practical insight, and the people who are willing to ask what comes next — and who it should serve.</p></div></section>
    <section className="section"><div className="container"><SectionHeading eyebrow="Explore the program" title="Find your point of entry." action="View all tracks" onClick={() => navigate('tracks')} /><TrackGrid tracks={tracks} compact /></div></section>
    <section className="section soft-section"><div className="container dates-layout"><div><SectionHeading eyebrow="Mark your calendar" title="The moments that matter." action="All important dates" onClick={() => navigate('dates')} /><DateTimeline dates={dates} compact /></div><div className="date-card"><span className="eyebrow">Conference days</span><strong className="date-card-date">{settings.conference_date}</strong><b>{settings.short_name}</b><p>Talks, working sessions, and chance encounters at {settings.venue}.</p><button className="text-button" onClick={() => navigate('schedule')}>See the program <ArrowRight size={16} /></button></div></div></section>
    <section className="section"><div className="container"><SectionHeading eyebrow="From the desk" title="What is happening at ICETS." action="All announcements" onClick={() => navigate('about')} /><div className="announcement-grid">{announcements.map((item) => <article className="announcement" key={item.id}><span>{item.category}</span><h3>{item.title}</h3><p>{item.excerpt}</p><small>{item.published_at}</small></article>)}</div></div></section>
    <section className="cta-section"><div className="container cta-inner"><div><span className="eyebrow light">Your work belongs in the conversation</span><h2>Ready to share what you are learning?</h2></div><button className="button light-button" onClick={() => navigate('papers')}>Read the call for papers <ArrowRight size={17} /></button></div></section>
  </>;
}

function PageIntro({ eyebrow, title, text, children }: { eyebrow: string; title: string; text: string; children: React.ReactNode }) { return <><section className="page-hero"><div className="container narrow"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div></section><section className="section"><div className="container narrow-content">{children}</div></section></>; }
function SectionHeading({ eyebrow, title, action, onClick }: { eyebrow: string; title: string; action?: string; onClick?: () => void }) { return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action && <button className="text-button" onClick={onClick}>{action} <ArrowRight size={16} /></button>}</div>; }
function TrackGrid({ tracks, compact = false }: { tracks: Track[]; compact?: boolean }) { return <div className={compact ? 'track-grid compact' : 'track-grid'}>{tracks.map((track, index) => <article className={`track-card ${track.accent}`} key={track.id}><div className="track-number">0{index + 1}</div><h3>{track.title}</h3><p>{track.description}</p><ChevronRight size={18} /></article>)}</div>; }
function DateTimeline({ dates, compact = false }: { dates: ImportantDate[]; compact?: boolean }) { return <div className={compact ? 'timeline compact' : 'timeline'}>{dates.map((date) => <div className="timeline-item" key={date.id}><div className="timeline-icon"><Clock3 size={17} /></div><div><strong>{date.label}</strong><b>{date.date_text}</b>{!compact && <p>{date.detail}</p>}</div></div>)}</div>; }
function About() { return <div className="content-stack"><div className="quote-block"><span>“</span><p>We are building a conference where rigorous thinking feels connected to the world outside the room.</p></div><div className="prose-grid"><div><h3>Why ICETS</h3><p>Technology is changing how we learn, work, govern, and care for one another. ICETS creates an interdisciplinary setting for research that takes that complexity seriously.</p></div><div><h3>Who belongs here</h3><p>Students, early-career researchers, faculty, practitioners, and policy thinkers are all welcome. We value thoughtful questions, clear communication, and work with a path to impact.</p></div></div><div className="values-row"><div><ShieldCheck size={22} /><strong>Responsible</strong><span>People-first thinking</span></div><div><Users size={22} /><strong>Interdisciplinary</strong><span>Many lenses, one room</span></div><div><Sparkles size={22} /><strong>Generative</strong><span>Ideas that move forward</span></div></div></div>; }
function ScheduleView({ items }: { items: ScheduleItem[] }) { const days = [...new Set(items.map((i) => i.day_label))]; return <div className="schedule">{days.map((day) => <div className="schedule-day" key={day}><span>{day}</span>{items.filter((i) => i.day_label === day).map((i) => <div key={i.id}><b>{i.time_label}</b><p>{i.title}</p></div>)}</div>)}</div>; }
function People({ kind, members }: { kind: 'committee' | 'speakers'; members: { id: string; name: string; role?: string; affiliation?: string; bio?: string }[] }) {
  if (members.length === 0) return <EmptyState icon={<Users />} title="Nothing published yet" text={kind === 'committee' ? 'Committee members will be listed here.' : 'Speaker details will appear here after official confirmation.'} />;
  return <div className="people-grid">{members.map((m) => <div className="person" key={m.id}><div className="person-initial">{m.name.charAt(0)}</div><h3>{m.name}</h3><span>{kind === 'committee' ? m.role : m.affiliation}</span>{kind === 'speakers' && m.bio && <p className="person-bio">{m.bio}</p>}</div>)}</div>;
}
function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="empty-state">{icon}<h3>{title}</h3><p>{text}</p></div>; }

function PaperPage({ navigate, sessionEmail }: { navigate: (view: View) => void; sessionEmail: string | null }) { return <div className="paper-call"><div className="call-card"><span className="eyebrow">Submission overview</span><h2>Share work that makes a difference.</h2><p>We welcome original research, applied studies, and thoughtful provocations across the conference tracks. Authors may submit full papers or extended abstracts.</p><ul><li><Check size={16} /> Original work not under review elsewhere</li><li><Check size={16} /> Clear abstract, keywords, and track selection</li><li><Check size={16} /> PDF manuscript upload in the author portal</li></ul><button className="button primary" onClick={() => navigate(sessionEmail ? 'submit' : 'login')}>{sessionEmail ? 'Open submission form' : 'Sign in to submit'} <ArrowRight size={17} /></button></div><div className="paper-side"><h3>What happens next?</h3><div><b>01</b><p>Submit your paper through the secure author portal.</p></div><div><b>02</b><p>Peer review focuses on relevance, clarity, method, and contribution.</p></div><div><b>03</b><p>Receive a decision and feedback from the committee.</p></div></div></div>; }

function Contact({ settings, onSent }: { settings: ConferenceSettings; onSent: (message: string) => void }) { const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' }); const [error, setError] = useState(''); async function submit(event: FormEvent) { event.preventDefault(); setError(''); const { error: insertError } = await supabase.from('contact_messages').insert(form); if (insertError) setError('Please check your details and try again.'); else { setForm({ name: '', email: '', subject: '', message: '' }); onSent('Your message has been sent to the conference team.'); } } return <div className="contact-layout"><form className="form-card" onSubmit={submit}><div className="form-grid"><label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label></div><label>Subject<input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label><label>Message<textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>{error && <p className="form-error">{error}</p>}<button className="button primary" type="submit">Send message <Send size={16} /></button></form><aside className="contact-aside"><span className="eyebrow">Find us</span><h3>Come join the conversation.</h3><p>For official updates, please use the contact details below.</p><div><Mail size={18} /><span>{settings.email}</span></div><div><MapPin size={18} /><span>{settings.venue}<br />{settings.city}</span></div></aside></div>; }

function Auth({ mode, onSuccess, switchMode, forgot }: { mode: 'login' | 'register' | 'forgot'; onSuccess: (message: string) => void; switchMode: () => void; forgot?: () => void }) { const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState(''); const [error, setError] = useState(''); async function submit(event: FormEvent) { event.preventDefault(); setError(''); if (mode === 'forgot') { const { error: resetError } = await supabase.auth.resetPasswordForEmail(email); if (resetError) setError('We could not send a reset email. Please check the address.'); else onSuccess('If an account exists for that email, a reset link is on its way.'); return; } const result = mode === 'login' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } }); if (result.error) setError('Please check your email and password and try again.'); else onSuccess(mode === 'login' ? 'Welcome back to your author portal.' : 'Your account is ready. Welcome to ICETS.'); } return <section className="auth-section"><div className="auth-card"><span className="eyebrow">{mode === 'forgot' ? 'Account recovery' : mode === 'login' ? 'Author portal' : 'Join ICETS'}</span><h1>{mode === 'forgot' ? 'Reset your password.' : mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h1><p>{mode === 'forgot' ? 'Enter the email connected to your account and we will send a reset link.' : 'Use your portal to submit work, register for the conference, and track updates.'}</p><form onSubmit={submit}>{mode === 'register' && <label>Full name<input required value={name} onChange={(e) => setName(e.target.value)} /></label>}<label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>{mode !== 'forgot' && <label>Password<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>}{error && <p className="form-error">{error}</p>}<button className="button primary full" type="submit">{mode === 'forgot' ? 'Send reset link' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></button></form>{mode === 'login' && forgot && <button className="link-button" onClick={forgot}>Forgot password?</button>}<button className="switch-auth" onClick={switchMode}>{mode === 'register' ? 'Already have an account? Sign in' : mode === 'login' ? 'Need an account? Register' : 'Back to sign in'}</button></div></section>; }

function Dashboard({ email, navigate, onSignOut, onNotice }: { email: string | null; navigate: (view: View) => void; onSignOut: () => void; onNotice: (message: string) => void }) {
  const [papers, setPapers] = useState<PaperSubmission[]>([]);
  const [regs, setRegs] = useState<RegistrationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegForm, setShowRegForm] = useState(false);

  useEffect(() => { if (email) void loadDashboard(); }, [email]);

  async function openManuscript(path: string) {
    const { data, error } = await supabase.storage.from('paper-manuscripts').createSignedUrl(path, 300);
    if (error || !data?.signedUrl) { onNotice('The PDF could not be opened right now.'); return; }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  }

  async function loadDashboard() {
    setLoading(true);
    const [papersRes, regsRes] = await Promise.all([
      supabase.from('paper_submissions').select('id,title,abstract,track,keywords,status,created_at,paper_file_path').order('created_at', { ascending: false }),
      supabase.from('registrations').select('id,full_name,affiliation,attendance_type,created_at').order('created_at', { ascending: false }),
    ]);
    if (papersRes.data) setPapers(papersRes.data);
    if (regsRes.data) setRegs(regsRes.data);
    setLoading(false);
  }

  if (!email) return <Auth mode="login" onSuccess={() => navigate('dashboard')} switchMode={() => navigate('register')} forgot={() => navigate('forgot')} />;

  return <section className="section dashboard-section"><div className="container">
    <div className="dashboard-head"><div><span className="eyebrow">Your author portal</span><h1>Good to see you.</h1><p>{email}</p></div><button className="button outline" onClick={onSignOut}>Sign out</button></div>

    <div className="portal-grid">
      <div className="portal-card"><FileText size={24} /><h3>Submit your research</h3><p>Start a new paper submission and tell the committee where your work belongs.</p><button className="text-button" onClick={() => navigate('submit')}>Open submission form <ArrowRight size={16} /></button></div>
      <div className="portal-card"><CalendarDays size={24} /><h3>Register to attend</h3><p>Reserve your place at the conference.</p><button className="text-button" onClick={() => setShowRegForm(!showRegForm)}>{showRegForm ? 'Close form' : 'Register now'} <ArrowRight size={16} /></button>{showRegForm && <Registration onNotice={onNotice} onDone={loadDashboard} />}</div>
      <div className="portal-card wide"><ShieldCheck size={24} /><h3>Your data, kept private</h3><p>Your submissions and registration details are only available to your signed-in account. Review decisions are managed by the conference committee.</p></div>
    </div>

    <div className="dashboard-lists">
      <div className="dashboard-list">
        <h3>Your paper submissions</h3>
        {loading ? <p className="muted-text">Loading...</p> : papers.length === 0 ? <p className="muted-text">No submissions yet. <button className="link-button" onClick={() => navigate('submit')}>Submit your first paper</button></p> : <div className="item-list">{papers.map((p) => <div className="list-item" key={p.id}><div className="list-item-head"><strong>{p.title}</strong><span className={`status-badge ${p.status.toLowerCase().replace(/\s/g, '-')}`}>{p.status}</span></div><small>{p.track} · {new Date(p.created_at).toLocaleDateString()}</small><p className="list-abstract">{p.abstract.slice(0, 160)}{p.abstract.length > 160 ? '...' : ''}</p><div className="keyword-row">{p.keywords.split(',').map((kw, i) => <span className="keyword-chip" key={i}>{kw.trim()}</span>)}{p.paper_file_path && <button className="keyword-chip file-chip" onClick={() => openManuscript(p.paper_file_path as string)}>Open PDF</button>}</div></div>)}</div>}
      </div>
      <div className="dashboard-list">
        <h3>Your attendance registrations</h3>
        {loading ? <p className="muted-text">Loading...</p> : regs.length === 0 ? <p className="muted-text">No registration yet. <button className="link-button" onClick={() => setShowRegForm(true)}>Register to attend</button></p> : <div className="item-list">{regs.map((r) => <div className="list-item" key={r.id}><div className="list-item-head"><strong>{r.full_name}</strong><span className="status-badge accepted">{r.attendance_type}</span></div><small>{r.affiliation} · {new Date(r.created_at).toLocaleDateString()}</small></div>)}</div>}
      </div>
    </div>
  </div></section>;
}
function AcceptedPapers() {
  const [papers, setPapers] = useState<AcceptedPaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void loadPapers(); }, []);

  async function loadPapers() {
    setLoading(true);
    const { data } = await supabase.rpc('get_accepted_papers');
    setPapers((data ?? []) as AcceptedPaper[]);
    setLoading(false);
  }

  return <PageIntro eyebrow="Published research" title="Accepted papers" text="Accepted papers will be listed here after the review and author confirmation process is complete.">{loading ? <p className="muted-text">Loading...</p> : papers.length === 0 ? <EmptyState icon={<FileText />} title="The list is not published yet" text="Check back after the notification date for the first published collection." /> : <div className="item-list">{papers.map((p) => <div className="list-item" key={p.id}><div className="list-item-head"><strong>{p.title}</strong></div><small>{p.track}</small></div>)}</div>}</PageIntro>;
}

function ReviewInbox({ isReviewer, onNotice }: { isReviewer: boolean; onNotice: (message: string) => void }) {
  const [tab, setTab] = useState<'submissions' | 'messages'>('submissions');
  const [submissions, setSubmissions] = useState<ReviewSubmission[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { if (isReviewer) void loadData(); else setLoading(false); }, [isReviewer]);

  async function loadData() {
    setLoading(true); setError('');
    const [subRes, msgRes] = await Promise.all([
      supabase.rpc('get_review_submissions'),
      supabase.rpc('get_contact_messages'),
    ]);
    if (subRes.error || msgRes.error) setError('We could not load the review inbox.');
    else { setSubmissions((subRes.data ?? []) as ReviewSubmission[]); setMessages((msgRes.data ?? []) as ContactMessage[]); }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error: updateError } = await supabase.rpc('set_paper_submission_status', { p_submission_id: id, p_status: status });
    if (updateError) { onNotice('The submission status could not be updated.'); return; }
    setSubmissions((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    onNotice('Submission status updated.');
  }

  async function openPdf(path: string) {
    const { data, error: urlError } = await supabase.storage.from('paper-manuscripts').createSignedUrl(path, 300);
    if (urlError || !data?.signedUrl) { onNotice('The PDF could not be opened right now.'); return; }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  }

  if (!isReviewer) return <PageIntro eyebrow="Restricted area" title="Reviewer access required" text="This area is available only to authorized conference reviewers."><EmptyState icon={<ShieldCheck />} title="You do not have access" text="Sign in with an authorized reviewer account to continue." /></PageIntro>;

  return <PageIntro eyebrow="Conference operations" title="Review inbox" text="Review incoming papers, update decision status, and read visitor messages.">
    <div className="review-tabs"><button className={tab === 'submissions' ? 'review-tab active' : 'review-tab'} onClick={() => setTab('submissions')}>Submissions</button><button className={tab === 'messages' ? 'review-tab active' : 'review-tab'} onClick={() => setTab('messages')}>Messages</button></div>
    {loading ? <p className="muted-text">Loading...</p> : error ? <p className="form-error">{error}</p> : tab === 'submissions' ? (
      submissions.length === 0 ? <EmptyState icon={<FileText />} title="No submissions yet" text="New author submissions will appear here." /> :
      <div className="review-list">{submissions.map((item) => <article className="review-item" key={item.id}><div><span className="eyebrow">{item.track}</span><h3>{item.title}</h3><small>{new Date(item.created_at).toLocaleDateString()}</small></div><div className="review-actions"><select value={item.status} onChange={(event) => void updateStatus(item.id, event.target.value)} aria-label={`Status for ${item.title}`}><option>Submitted</option><option>Under review</option><option>Accepted</option><option>Revision requested</option><option>Rejected</option></select>{item.paper_file_path && <button className="keyword-chip file-chip" onClick={() => void openPdf(item.paper_file_path as string)}>Open PDF</button>}</div></article>)}</div>
    ) : (
      messages.length === 0 ? <EmptyState icon={<Mail />} title="No messages yet" text="Contact form submissions will appear here." /> :
      <div className="review-list">{messages.map((m) => <article className="review-item" key={m.id}><div><span className="eyebrow">{m.subject}</span><h3>{m.name}</h3><small>{m.email} · {new Date(m.created_at).toLocaleDateString()}</small><p className="list-abstract">{m.message}</p></div></article>)}</div>
    )}
  </PageIntro>;
}

function Registration({ onNotice, onDone }: { onNotice: (message: string) => void; onDone?: () => void }) { const [form, setForm] = useState({ full_name: '', affiliation: '', attendance_type: 'In person' }); const [sent, setSent] = useState(false); const [error, setError] = useState(''); async function submit(event: FormEvent) { event.preventDefault(); setError(''); const { error: insertError } = await supabase.from('registrations').insert(form); if (insertError) setError('You already have an attendance registration, or we could not save this one.'); else { setSent(true); onNotice('Your attendance registration has been received.'); if (onDone) onDone(); } } if (sent) return <p className="success-copy"><Check size={16} /> Registration received.</p>; return <form className="mini-form" onSubmit={submit}><input required placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /><input required placeholder="Affiliation" value={form.affiliation} onChange={(e) => setForm({ ...form, affiliation: e.target.value })} /><select value={form.attendance_type} onChange={(e) => setForm({ ...form, attendance_type: e.target.value })}><option>In person</option><option>Online</option></select>{error && <p className="form-error">{error}</p>}<button className="text-button" type="submit">Register now <ArrowRight size={16} /></button></form>; }

function ConferenceRegistration({ sessionEmail, navigate, onNotice }: { sessionEmail: string | null; navigate: (view: View) => void; onNotice: (message: string) => void }) {
  const [form, setForm] = useState({ full_name: '', affiliation: '', attendance_type: 'In person' });
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  if (!sessionEmail) return <div className="empty-state"><ShieldCheck size={32} /><h3>Sign in to register</h3><p>You need an account to complete your attendance registration.</p><div className="empty-actions"><button className="button primary" onClick={() => navigate('login')}>Sign in <ArrowRight size={16} /></button><button className="button outline" onClick={() => navigate('register')}>Create account</button></div></div>;

  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    const { error: insertError } = await supabase.from('registrations').insert(form);
    if (insertError) setError('We could not save your registration. Please try again.');
    else { setSent(true); onNotice('Your attendance registration has been received.'); }
  }

  if (sent) return <div className="empty-state"><Check size={32} /><h3>Registration received</h3><p>We look forward to seeing you at the conference.</p><button className="button primary" onClick={() => navigate('dashboard')}>Go to your portal <ArrowRight size={16} /></button></div>;

  return <div className="form-card submission-card"><span className="eyebrow">Attendance registration</span><h1>Register to attend.</h1><p>Tell us how you plan to join the conference so we can prepare your spot.</p><form onSubmit={submit}><label>Full name<input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label><label>Affiliation / institution<input required value={form.affiliation} onChange={(e) => setForm({ ...form, affiliation: e.target.value })} /></label><label>Attendance type<select value={form.attendance_type} onChange={(e) => setForm({ ...form, attendance_type: e.target.value })}><option>In person</option><option>Online</option></select></label>{error && <p className="form-error">{error}</p>}<button className="button primary" type="submit">Complete registration <ArrowRight size={16} /></button></form></div>;
}
function Submission({ tracks, sessionEmail, navigate, onNotice }: { tracks: Track[]; sessionEmail: string | null; navigate: (view: View) => void; onNotice: (message: string) => void }) {
  const [form, setForm] = useState({ title: '', abstract: '', track: tracks[0]?.title ?? '', keywords: '' });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!sessionEmail) return <Auth mode="login" onSuccess={() => navigate('submit')} switchMode={() => navigate('register')} forgot={() => navigate('forgot')} />;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setError('');
    if (!selected) { setFile(null); return; }
    if (selected.type !== 'application/pdf' || !selected.name.toLowerCase().endsWith('.pdf')) { setError('Please choose a PDF file.'); event.target.value = ''; return; }
    if (selected.size > 10 * 1024 * 1024) { setError('The PDF must be 10 MB or smaller.'); event.target.value = ''; return; }
    const header = new Uint8Array(await selected.slice(0, 5).arrayBuffer());
    if (String.fromCharCode(...header) !== '%PDF-') { setError('This file does not appear to be a valid PDF.'); event.target.value = ''; return; }
    setFile(selected);
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setIsSubmitting(true);
    let path: string | null = null;
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error('session');
      if (file) {
        path = `${userData.user.id}/${crypto.randomUUID()}.pdf`;
        const { error: uploadError } = await supabase.storage.from('paper-manuscripts').upload(path, file, { contentType: 'application/pdf', upsert: false });
        if (uploadError) throw new Error('upload');
      }
      const { error: insertError } = await supabase.from('paper_submissions').insert({ ...form, paper_file_path: path });
      if (insertError) {
        if (path) await supabase.storage.from('paper-manuscripts').remove([path]);
        throw new Error('submission');
      }
      onNotice('Your paper and PDF have been submitted securely.'); navigate('dashboard');
    } catch { setError('We could not submit your paper. Please check the form and try again.'); }
    finally { setIsSubmitting(false); }
  }

  return <section className="section"><div className="container narrow-content"><div className="form-card submission-card"><span className="eyebrow">Author portal</span><h1>Submit a paper.</h1><p>Upload your manuscript as a PDF along with the submission details. Maximum file size: 10 MB.</p><form onSubmit={submit}><label>Paper title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label>Research track<select value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value })}>{tracks.map((track) => <option key={track.id}>{track.title}</option>)}</select></label><label>Abstract<textarea required minLength={40} rows={8} value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} /></label><label>Keywords<input required placeholder="e.g. responsible AI, policy, education" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} /></label><label className="file-field">PDF manuscript<input required type="file" accept="application/pdf,.pdf" onChange={handleFileChange} /><span className="file-picker"><Upload size={18} />{file ? file.name : 'Choose a PDF file'}</span><small>PDF only · maximum 10 MB</small></label>{error && <p className="form-error">{error}</p>}<button className="button primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit paper'} {!isSubmitting && <Send size={16} />}</button></form></div></div></section>;
}
function Footer({ settings, navigate }: { settings: ConferenceSettings; navigate: (view: View) => void }) { return <footer><div className="container footer-grid"><div><button className="brand footer-brand" onClick={() => navigate('home')}><img src="/assets/logo.png" alt="BUP logo" /><span><strong>{settings.short_name}</strong><small>{settings.city}</small></span></button><p className="footer-note">A focused academic gathering for research with purpose.</p></div><div><h4>Explore</h4><button onClick={() => navigate('about')}>About</button><button onClick={() => navigate('papers')}>Call for papers</button><button onClick={() => navigate('schedule')}>Program</button><button onClick={() => navigate('committee')}>Committee</button><button onClick={() => navigate('speakers')}>Speakers</button><button onClick={() => navigate('accepted')}>Accepted papers</button></div><div><h4>Participate</h4><button onClick={() => navigate('register-conference')}>Register</button><button onClick={() => navigate('submit')}>Submit a paper</button><button onClick={() => navigate('contact')}>Contact</button></div><div><h4>Connect</h4><p>{settings.email}</p><p>{settings.phone}</p><div className="socials"><Instagram size={17} /><Linkedin size={17} /><Mail size={17} /></div></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {settings.short_name} · BUP</span><span>Conference information is subject to official confirmation.</span></div></footer>; }

export default App;
