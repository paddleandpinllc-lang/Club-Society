const LOGO = 'https://www.paddleandpin.com/cdn/shop/files/PP_NEW_CREST.png?v=1783532074&width=600';
const EVENT_URL = 'https://www.paddleandpin.com/pages/southmain';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

export function eventDateLabel(value) {
  // The form submits a calendar date, not an instant. Format in UTC to avoid
  // moving an ISO date to the previous evening in America/New_York.
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) throw new Error('Invalid event date');
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

export function buildConfirmation(payload) {
  const name = [payload.first_name, payload.last_name].map(v => String(v || '').trim()).filter(Boolean).join(' ');
  const date = eventDateLabel(payload.event_date);
  const guests = Array.isArray(payload.additional_players) ? payload.additional_players
    .map(player => [player?.first_name, player?.last_name].filter(Boolean).join(' ').trim()).filter(Boolean) : [];
  const guestText = guests.length ? `\nAdditional players: ${guests.join(', ')}\n` : '';
  const text = `You're in, ${name}!\n\nYour Paddle + Pint signup is confirmed.\n\nPlayer: ${name}\nEvent date: ${date}\nTime: 6:00 PM (Eastern Time)\nLocation: South Main Brewing Warehouse\n${guestText}\nThanks for making Monday a little less Monday. We look forward to seeing you on the court!\n\nQuestions or a change of plans? Reply to this email to reach Craig at craig@paddleandpin.com.\n\nEvent details: ${EVENT_URL}\n\nCheers,\nCraig & the Paddle + Pint crew`;
  const row = (label, value) => `<tr><td style="padding:10px 0;border-bottom:1px solid #dfdfd4;font-size:14px;line-height:23px;color:#56645c;vertical-align:top;width:96px;">${label}</td><td style="padding:10px 0;border-bottom:1px solid #dfdfd4;font-size:16px;line-height:23px;font-weight:bold;color:#10233f;">${escapeHtml(value)}</td></tr>`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Paddle + Pint signup confirmed</title></head>
<body style="margin:0;padding:0;background:#eeeee8;font-family:Arial,Helvetica,sans-serif;color:#10233f;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your Paddle + Pint signup for ${escapeHtml(date)} is confirmed. See you at 6:00 PM!</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eeeee8;"><tr><td align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;">
<tr><td align="center" style="padding:24px;background:#fbf5e4;border-top:6px solid #0b3d2e;"><img src="${escapeHtml(LOGO)}" width="190" alt="Paddle + Pint League" style="display:block;width:190px;max-width:100%;height:auto;border:0;"></td></tr>
<tr><td style="padding:30px 28px;background:#0b3d2e;color:#ffffff;"><p style="margin:0 0 10px;font-size:12px;font-weight:bold;letter-spacing:2px;color:#f4ce70;">SIGNUP CONFIRMED</p><h1 style="margin:0;font-size:32px;line-height:39px;color:#ffffff;">You’re in, ${escapeHtml(payload.first_name)}!</h1></td></tr>
<tr><td style="padding:28px;font-size:16px;line-height:26px;"><p style="margin:0 0 20px;">Thanks for signing up for Paddle + Pint! Here’s your game plan:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${row('Player', name)}${row('Event date', date)}${row('Time', '6:00 PM (Eastern Time)')}${row('Location', 'South Main Brewing Warehouse')}${guests.length ? row('Additional players', guests.join(', ')) : ''}</table>
<p style="margin:24px 0;">Thanks for making Monday a little less Monday. We look forward to seeing you on the court!</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#b63d10" style="border-radius:4px;mso-padding-alt:14px 24px;"><a href="${EVENT_URL}" style="display:inline-block;padding:14px 24px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;">View event details</a></td></tr></table>
<p style="margin:24px 0;">Questions or a change of plans? Just reply to this email and Craig will help you out.</p><p style="margin:0;">Cheers,<br><strong>Craig &amp; the Paddle + Pint crew</strong></p></td></tr>
<tr><td align="center" style="padding:20px 28px;background:#fbf5e4;font-size:12px;line-height:20px;color:#56645c;">This email confirms your Paddle + Pint event registration.<br><a href="mailto:craig@paddleandpin.com" style="color:#0b3d2e;">craig@paddleandpin.com</a></td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
  return {
    from: 'Paddle + Pint <info@paddleandpin.com>',
    reply_to: 'craig@paddleandpin.com',
    to: [String(payload.email).trim().toLowerCase()],
    subject: `Paddle + Pint signup confirmed — ${date}`,
    html,
    text,
    tags: [{name:'category',value:'paddle-pint-confirmation'}],
  };
}

export async function sendConfirmation(env, payload, submissionId, fetchEmail = fetch) {
  if (!env.RESEND_API_KEY || env.PADDLE_PINT_EMAIL_ENABLED !== 'true') return {status:'disabled'};
  if (!Number.isSafeInteger(Number(submissionId)) || Number(submissionId) <= 0) throw new Error('Missing saved submission ID');
  const message = buildConfirmation(payload);
  await env.DB.prepare(`INSERT OR IGNORE INTO paddle_pint_confirmation_emails (submission_id, status) VALUES (?, 'pending')`).bind(submissionId).run();
  const existing = await env.DB.prepare('SELECT status FROM paddle_pint_confirmation_emails WHERE submission_id = ?').bind(submissionId).first();
  if (existing?.status === 'accepted') return {status:'accepted'};

  for (let attempt = 0; attempt < 3; attempt++) {
    let status = 'network_error';
    let retry = true;
    try {
      const response = await fetchEmail('https://api.resend.com/emails', {
        method:'POST',
        headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`, 'Content-Type':'application/json', 'Idempotency-Key':`paddle-pint-signup/${submissionId}`},
        body:JSON.stringify(message),
        signal:AbortSignal.timeout(6000),
      });
      if (response.ok) {
        const result = await response.json();
        if (!result.id) throw new Error('Missing provider ID');
        await env.DB.prepare(`UPDATE paddle_pint_confirmation_emails SET status = 'accepted', provider_id = ?, attempts = attempts + 1, last_error = NULL, updated_at = CURRENT_TIMESTAMP WHERE submission_id = ?`).bind(result.id, submissionId).run();
        return {status:'accepted',id:result.id};
      }
      status = `resend_http_${response.status}`;
      retry = response.status === 429 || response.status >= 500;
    } catch {
      // Never log the API key, submitted contact information, or provider body.
    }
    await env.DB.prepare(`UPDATE paddle_pint_confirmation_emails SET status = 'failed', attempts = attempts + 1, last_error = ?, updated_at = CURRENT_TIMESTAMP WHERE submission_id = ?`).bind(status, submissionId).run();
    if (!retry || attempt === 2) {
      console.error('Paddle + Pint confirmation not accepted', {submissionId, status});
      return {status:'failed'};
    }
    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
  }
}
