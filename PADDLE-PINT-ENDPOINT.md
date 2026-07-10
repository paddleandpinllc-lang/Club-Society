# Paddle + Pint Shopify Form Endpoint

This app now includes a Cloudflare Pages Function:

```text
POST /api/paddle-pint
```

Admins can also import saved round-robin submissions into Club Society events from:

```text
GET /api/paddle-pint?type=round_robin_event
```

The admin import requires this request header:

```text
X-Admin-Key: your ADMIN_SYNC_KEY value
```

Use this endpoint from the Paddle + Pin Shopify site:

```text
https://club-society.pages.dev/api/paddle-pint
```

If a custom production domain is attached to Cloudflare Pages later, use that same path on the custom domain:

```text
https://yourclubsocietydomain.com/api/paddle-pint
```

## Shopify Theme Editor Setup

In Shopify, open each Paddle + Pint page in the Theme Editor:

- Round Robin event signup page
- Free T-shirt claim page

Add or open the section:

```text
Club Society API Connector
```

Paste the live endpoint URL into:

```text
Club Society endpoint URL
```

Example Pages URL:

```text
https://club-society.pages.dev/api/paddle-pint
```

Example custom domain URL:

```text
https://yourclubsocietydomain.com/api/paddle-pint
```

Once this URL is filled in, the Shopify forms bypass Shopify customer segments and submit directly into the Club Society database.

## Cloudflare D1 Setup

Create or choose a Cloudflare D1 database for Club Society, then add it to the Cloudflare Pages project:

1. Cloudflare dashboard > Workers & Pages.
2. Open the Club Society Pages project.
3. Go to Settings > Bindings.
4. Add a D1 database binding.
5. Variable name must be:

```text
DB
```

6. Select the Club Society D1 database.
7. Redeploy the Pages project.

Run this migration in D1:

```text
migrations/0001_paddle_pint_submissions.sql
```

## Stored Table

```text
paddle_pint_submissions
```

## Allowed CORS Origin

Public form submissions are allowed from:

```text
https://www.paddleandpin.com
```

Protected admin imports are also allowed from the Club Society app:

```text
https://club-society.pages.dev
```

## Club Society Admin Import

T-shirt claims and event RSVPs both save into the same D1 table:

```text
paddle_pint_submissions
```

Round-robin event submissions can be pulled into the Club Society event roster:

1. In Cloudflare Pages, add an environment variable or secret named `ADMIN_SYNC_KEY`.
2. Redeploy the Pages project.
3. Open Club Society.
4. Go to Integrations > Paddle + Pint Shopify > Submission Sync.
5. Confirm the endpoint URL is:

```text
https://club-society.pages.dev/api/paddle-pint
```

6. Paste the same `ADMIN_SYNC_KEY` value into the admin sync key field.
7. Click `Import Paddle + Pint RSVPs`.
8. Go to Events and click `View RSVPs` on a Paddle + Pint event.

If a matching Paddle + Pint event for the submitted date does not exist yet, the app creates one automatically.

## Round Robin JSON

```json
{
  "type": "round_robin_event",
  "first_name": "Craig",
  "last_name": "Example",
  "email": "craig@example.com",
  "phone": "7065551234",
  "event_date": "Monday, July 13, 2026",
  "shirt_gender": "Men's",
  "shirt_size": "XL",
  "optional_shirt_choice": "Blue Collar Golfer Tee",
  "additional_players": [
    {
      "first_name": "Player",
      "last_name": "Two"
    }
  ],
  "notes": "Optional note",
  "source": "paddleandpin.com/pages/paddle-pint"
}
```

Required fields:

- `type`
- `first_name`
- `last_name`
- `email`
- `event_date`

## Free Shirt Claim JSON

```json
{
  "type": "free_shirt_claim",
  "name": "Craig Example",
  "email": "craig@example.com",
  "shirt_size": "XL",
  "selected_shirt": "Blue Collar Golfer Tee",
  "notes": "Optional note",
  "source": "paddleandpin.com/pages/paddle-pint-shirt-claim"
}
```

Required fields:

- `type`
- `name`
- `email`
- `shirt_size`
- `selected_shirt`

## Optional Anti-Spam Fields

The endpoint rejects submissions if any honeypot field is filled:

- `website`
- `company`
- `honeypot`
- `_gotcha`

The endpoint also rejects very fast submissions if one of these timestamp fields is provided and is less than two seconds old:

- `form_started_at`
- `started_at`
- `submission_started_at`
