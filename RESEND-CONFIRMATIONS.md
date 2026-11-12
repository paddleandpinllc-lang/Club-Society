# Paddle + Pint registration confirmation

Source: `functions/api/paddle-pint.js` and `lib/paddle-pint-email.js`.

The existing signup saves to D1 before sending. Only new `round_robin_event`
submissions trigger email, including returning-player signups after the server
resolves the saved name. Shirt claims and existing registrations do not trigger
email. No newsletter opt-in or Shopify Messaging automation is involved.

## Delivery settings

- Sender: `Paddle + Pint <info@paddleandpin.com>`
- Reply-to: `craig@paddleandpin.com`
- Time: 6:00 PM Eastern Time
- Location: South Main Brewing Warehouse
- Logo: the hosted `PP_NEW_CREST.png` from the Paddle + Pint signup page
- Contents: player name, selected event date, time, location, additional players
  when supplied, event details link, and reply instructions
- Tracking: none added by this integration

## Enable

1. Verify `paddleandpin.com` in Resend using the records issued by that account.
   Preserve the domain's current website, MX, SPF, DKIM, and other DNS entries.
   Receiving through Resend is not required.
2. Create a sending-only Resend API key restricted to `paddleandpin.com`.
3. Apply `migrations/0002_paddle_pint_confirmation_emails.sql` to the original
   `club-society` database (`1e78bd6b-02e9-4833-87f2-58d8ec275f44`).
4. Store `RESEND_API_KEY` and `PADDLE_PINT_EMAIL_ENABLED=true` as server secrets
   on the **club-society Pages project**, not the separate commercial host Worker.
5. Build and deploy the current source and functions to that Pages project.
6. Send a sample only to the owner's address. Verify From, Reply-To, event date,
   logo, and Resend delivery events before claiming live delivery works.

## Reliability

Cloudflare `waitUntil` lets the response return after saving while email sending
continues. The provider has a six-second timeout per attempt. Temporary network,
429, and 5xx failures retry up to three attempts with the same idempotency key.
Permanent errors do not retry. Errors never turn a saved signup into a failure.

The delivery receipt table records provider acceptance, provider message ID,
attempts, and redacted failure codes. `accepted` means Resend accepted the email;
it does not prove inbox delivery. Accepted receipts suppress repeated sends for
that registration. Resend's provider idempotency keys last 24 hours. Failed
receipts remain for investigation; there is no recurring background retry job.

## Validation

Run `node tests/paddle-pint-email.mjs` and `node tests/paddle-pint-returning.mjs`.
These use fake database/provider implementations and create no live email or
registration. Build the Pages function bundle as an additional deployment check.

To stop confirmation sending, remove `PADDLE_PINT_EMAIL_ENABLED` or change it to
`false`, then redeploy. Registration saving continues.

## Activation — November 12, 2026

- Resend verified `paddleandpin.com` after adding `resend._domainkey` TXT,
  `rsend` CNAME, and `send` CNAME at Hostinger. Existing records were retained.
- Created `Paddle + Pint signup confirmations`, sending access restricted to
  `paddleandpin.com`. Key material was transferred encrypted, never printed or
  saved locally as plaintext, then saved in Cloudflare Pages secrets.
- Applied migration 0002 to the original club-society database.
- Configured `RESEND_API_KEY` and `PADDLE_PINT_EMAIL_ENABLED=true` for production.
- Initial direct deployment: `b97e417f.club-society.pages.dev`.
- Resend accepted and reported delivered the setup sample to
  `craig@paddleandpin.com`, ID `01a1cfeb-576f-75ec-9505-6a2a9fefc041`.
- Checked production CORS and rejected invalid signup handling without creating
  a real event registration. New/returning signup integration is covered by the
  database/provider tests; the live sample was sent directly through Resend.
