# ICETS 2025 — BUP Academic Conference

A responsive React conference management website for the Bangladesh University of Professionals.

## Included

- Public conference homepage, about, call for papers, tracks, dates, program, committee, speakers, accepted papers, and contact pages.
- Supabase-backed PostgreSQL conference content with seeded sample data.
- Email/password author accounts, private PDF paper submissions, and private attendance registrations.
- Contact form with public submission access and a protected message store.
- Original visual assets preserved at `public/assets/hero.jpg` and `public/assets/logo.png`.

## Important

The seeded conference content is explicitly sample content. Replace it with verified official information before publishing. The database schema is included in `database/schema.sql`; private PDF storage and owner-only storage policies are applied to the provisioned PostgreSQL database. Review status changes require a separately authorized reviewer workflow.

## Windows setup

1. Install Node.js 18 or newer.
2. Open this folder in VS Code.
3. Run `npm install`.
4. Use the existing environment configuration for the connected Supabase project.
5. Run `npm run build` to create the production build.

The web app uses Supabase as the PostgreSQL database and authentication service. No MongoDB or Mongoose code is used.
