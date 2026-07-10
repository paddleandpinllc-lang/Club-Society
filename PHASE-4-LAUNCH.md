# Club Society Phase 4 Launch

Phase 4 turns the static local app into a hosted installable PWA with optional shared cloud data.

## Recommended Path

1. Host the `paddle-pin-club` folder on HTTPS.
   - Cloudflare Pages, Netlify, Vercel, or GitHub Pages can all serve this static app.

2. Create a Supabase project.
   - In Supabase SQL Editor, run `supabase-schema.sql`.
   - Copy your Project URL and anon public key.

3. Open the hosted app.
   - Go to `Launch`.
   - Paste the Supabase URL and anon key.
   - Set Mode to `Supabase`.
   - Keep Club ID as `club-society-main` or choose one per organization/event group.

4. Push data from the main admin device.
   - Click `Push Local Data`.

5. On another admin phone/laptop:
   - Open the same hosted app.
   - Enter the same Supabase settings and Club ID.
   - Click `Pull Cloud Data`.

## iPhone Install

Open the hosted HTTPS link in Safari, tap Share, then tap Add to Home Screen.

## Desktop Install

Open the hosted HTTPS link in Chrome or Edge and choose Install app.

## Before Public Launch

The included Supabase policy is prototype-friendly and permissive. Before a broad launch, add real login/auth and replace the policy with authenticated row-level security.

## Integrations

The Integrations tab stores non-secret setup fields and creates email/social drafts. Live sending should be routed through a Cloudflare Worker or backend service.

Required secret placeholders are listed in `.env.example`, including:

- `BREVO_API_KEY`
- `META_APP_SECRET`
- `META_PAGE_ACCESS_TOKEN`
- `TWILIO_AUTH_TOKEN` or another SMS verification provider key

Do not store these secret values in the public app, GitHub, or Cloudflare Pages variables that are exposed to the browser.

## Paddle + Pint Shopify Form Endpoint

The `functions/api/paddle-pint.js` Pages Function creates:

```text
POST /api/paddle-pint
```

This endpoint is for Paddle + Pint Shopify form submissions from:

```text
https://www.paddleandpin.com
```

Bind a Cloudflare D1 database to the Pages project with the variable name `DB`, then run:

```text
migrations/0001_paddle_pint_submissions.sql
```
