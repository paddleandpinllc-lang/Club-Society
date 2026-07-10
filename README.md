# Club Society

Club Society is the scalable product direction for the event app: where ballers & golfers come to play, connect, and challenge.

This prototype is separate from the current Paddle + Pint local event app.

## Current Prototype

- Desktop-friendly admin interface
- iPhone-installable PWA structure
- Pickleball/golf mode switch
- Event creation
- Event edit, delete, and archive controls
- Event templates for fast setup
- Onsite player check-in
- Public player check-in screen that keeps roster/contact info private
- Required public waiver agreement before check-in
- Public event page preview with RSVP and waitlist
- Draft/published event status and public slugs
- Admin team roles
- Shared database sync preview
- Player profiles
- Player profile edit/delete, address fields, and prototype email/SMS verification
- Discover hub for player matching and tournaments
- Admin-managed shop collection cards
- Public View controls for public page copy, featured events, and featured players
- Event archive with CSV and printable report exports
- Brevo and Meta/Facebook/Instagram integration placeholders
- Cloudflare Pages API endpoint for Paddle + Pint Shopify form submissions
- Host revenue and payout estimates
- Hosted PWA launch center
- Supabase-ready shared data sync
- RSVP quick-fill at check-in
- CSV RSVP/player import
- Player CSV export
- Waiver queue tracking
- Round-robin generation with rotating partners
- Tournament bracket seeding and advancement
- Community match board
- Host dashboard
- Paddle + Pin shop connection
- Club Society brand mark and app identity
- Local browser storage and JSON snapshot export

## RSVP CSV Import

Use `sample-rsvp-import.csv` as the easiest starting point. Supported columns include:

- First Name
- Last Name
- Name
- Email
- Phone
- Event Name
- Skill
- Signed Waiver
- Payment Status
- Status
- Notes

## Public Check-In

Use the Public Check-In tab when the phone or laptop is facing players. Players can search their RSVP, confirm their own details, and check in without seeing the admin roster, email list, phone numbers, waiver queue, or exports.

If a player has not signed the waiver, the app opens the waiver agreement before check-in can be completed. Selecting "I Disagree" blocks check-in. Selecting "I Agree" marks their waiver as signed and completes or resumes check-in.

## Phase 2 Preview

The Public Events tab previews the hosted player-facing side of the app. Published events appear publicly, players can RSVP, and full events automatically place new signups on a waitlist.

The Host Dashboard includes an Admin Team area and a Shared Database Preview. These are local simulations for now, but the data model is ready for a hosted backend.

## Phase 3 Preview

The Player Profile tab scaffolds future player accounts. Discover brings together recommended connections, community posts, and published tournament/challenge events. Shop now includes collection cards, and Host Dashboard estimates event revenue and host payouts.

## Phase 4 Launch

The Launch tab prepares the app for hosted PWA distribution and shared data. It includes Supabase settings, push/pull sync, and install instructions for iPhone and desktop.

Use `supabase-schema.sql` to create the first shared data table. Read `PHASE-4-LAUNCH.md` for the launch checklist.

## Admin Guide

The non-technical admin guide is available at:

```text
C:\Users\craig\Documents\Paddle + Pint App\output\pdf\club-society-admin-guide.pdf
```

It explains how admins should edit events, public page content, player profiles, shop drops, archive exports, Cloudflare uploads, and integration settings.

## Integration Notes

Use `.env.example` as the setup checklist for hosted integrations. Do not paste API secrets into the browser app. Brevo email sending, SMS verification, and Meta/Facebook/Instagram publishing should run through a secure Cloudflare Worker or another backend where secrets can be protected.

## Paddle + Pint Shopify Forms

The app includes a Cloudflare Pages Function at:

```text
POST /api/paddle-pint
```

It accepts Paddle + Pint round-robin signups and free shirt claim submissions from `https://www.paddleandpin.com` and stores them in the D1 table `paddle_pint_submissions`.

Read `PADDLE-PINT-ENDPOINT.md` for the expected JSON payloads, required fields, CORS rule, D1 binding name, and migration setup.

## How To Open

Open:

```text
C:\Users\craig\Documents\Paddle + Pint App\paddle-pin-club\index.html
```

## Install Direction

For one or two admin phones/desktops, host this folder on HTTPS as a PWA.

- iPhone: open hosted link in Safari, then Add to Home Screen.
- Desktop: open hosted link in Chrome or Edge, then Install app.

## Scale Roadmap

Phase 1:

- Keep local/admin PWA
- Add event templates: complete
- Add CSV import/export: complete
- Add better waiver and check-in tools: complete

Phase 2:

- Hosted PWA with login: scaffolded
- Shared event database: local sync preview scaffolded
- Multiple admins per event: scaffolded
- Public event pages: scaffolded
- RSVP and waitlist: complete locally

Phase 3:

- Player accounts: scaffolded
- Community matching: scaffolded
- Tournament discovery: scaffolded
- Paddle + Pin shop collections: scaffolded
- Host payouts and event payments: scaffolded

Phase 4:

- Hosted PWA launch center: complete
- Supabase shared sync scaffold: complete
- Native app wrappers if needed
- iOS TestFlight or App Store
- Android distribution
- Golf leagues, scrambles, and tee-time groups
