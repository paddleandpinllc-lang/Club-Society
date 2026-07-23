const APP_ORIGINS = new Set([
  "https://clubsociety.app",
  "https://club-society.pages.dev",
  "https://www.clubsociety.app",
]);

function corsHeadersFor(request) {
  const origin = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": APP_ORIGINS.has(origin) ? origin : "https://clubsociety.app",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export async function onRequest(context) {
  const { request, env } = context;
  const corsHeaders = corsHeadersFor(request);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method === "GET") {
    return getMemberByToken(request, env, corsHeaders);
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405, corsHeaders);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body" }, 400, corsHeaders);
  }

  const validationError = validateSignup(payload);
  if (validationError) return json({ ok: false, error: validationError }, 400, corsHeaders);

  const member = normalizeMember(payload);
  const token = await makeToken(member.email);
  const profileLink = makeProfileLink(request, env, token);

  try {
    if (env.DB) {
      await ensureMemberTable(env.DB);
      await upsertMember(env.DB, member, token);
    }

    const emailResult = await sendConfirmationEmail(env, member, profileLink);
    return json({
      ok: true,
      message: emailResult.sent ? "Signup saved and confirmation email sent" : "Signup saved",
      emailSent: emailResult.sent,
      emailWarning: emailResult.warning || "",
      profileLink,
    }, 200, corsHeaders);
  } catch (error) {
    console.error("Club Society member signup failed", error);
    return json({ ok: false, error: "Server error while saving signup" }, 500, corsHeaders);
  }
}

async function getMemberByToken(request, env, corsHeaders) {
  if (!env.DB) return json({ ok: false, error: "Database binding DB is not configured" }, 500, corsHeaders);

  const token = new URL(request.url).searchParams.get("token");
  if (!token) return json({ ok: false, error: "Missing profile token" }, 400, corsHeaders);

  try {
    await ensureMemberTable(env.DB);
    const result = await env.DB.prepare(`
      SELECT first_name, last_name, email, phone, sport, city, state, zip
      FROM club_members
      WHERE completion_token = ?
      LIMIT 1
    `).bind(token).first();

    if (!result) return json({ ok: false, error: "Profile link not found" }, 404, corsHeaders);

    return json({
      ok: true,
      member: {
        firstName: result.first_name || "",
        lastName: result.last_name || "",
        email: result.email || "",
        phone: result.phone || "",
        sport: result.sport || "both",
        city: result.city || "Watkinsville",
        state: result.state || "GA",
        zip: result.zip || "30677",
      },
    }, 200, corsHeaders);
  } catch (error) {
    console.error("Club Society profile token lookup failed", error);
    return json({ ok: false, error: "Server error while loading profile" }, 500, corsHeaders);
  }
}

async function ensureMemberTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS club_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT,
      last_name TEXT,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      sport TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      completion_token TEXT NOT NULL UNIQUE,
      profile_completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_club_members_completion_token
    ON club_members (completion_token)
  `).run();
}

async function upsertMember(db, member, token) {
  await db.prepare(`
    INSERT INTO club_members (
      first_name, last_name, email, phone, sport, city, state, zip, completion_token, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      phone = excluded.phone,
      sport = excluded.sport,
      city = excluded.city,
      state = excluded.state,
      zip = excluded.zip,
      completion_token = excluded.completion_token,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    member.firstName,
    member.lastName,
    member.email,
    member.phone,
    member.sport,
    member.city,
    member.state,
    member.zip,
    token
  ).run();
}

async function sendConfirmationEmail(env, member, profileLink) {
  if (!env.BREVO_API_KEY) return { sent: false, warning: "BREVO_API_KEY is not configured" };
  if (!env.BREVO_SENDER_EMAIL) return { sent: false, warning: "BREVO_SENDER_EMAIL is not configured" };

  const body = {
    sender: {
      name: env.BREVO_SENDER_NAME || "Club Society",
      email: env.BREVO_SENDER_EMAIL,
    },
    to: [{ email: member.email, name: fullName(member) }],
    subject: "Complete your Club Society profile",
    params: {
      first_name: member.firstName || "there",
      profile_link: profileLink,
    },
    tags: ["club-society", "profile-confirmation"],
  };

  if (env.BREVO_TEMPLATE_ID) {
    body.templateId = Number(env.BREVO_TEMPLATE_ID);
  } else {
    body.htmlContent = `
      <html>
        <body style="font-family:Arial,sans-serif;color:#0b2231;line-height:1.5;">
          <h2>Welcome to Club Society</h2>
          <p>Hi ${escapeHtml(member.firstName || "there")},</p>
          <p>Complete your profile so local players can connect with you for pickleball, golf, events, and social play.</p>
          <p>
            <a href="${escapeHtml(profileLink)}" style="display:inline-block;background:#f4b52b;color:#0b2231;padding:12px 18px;border-radius:999px;font-weight:bold;text-decoration:none;">
              Complete My Profile
            </a>
          </p>
          <p>If the button does not work, paste this link into your browser:</p>
          <p>${escapeHtml(profileLink)}</p>
        </body>
      </html>
    `;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Brevo send failed", response.status, text);
    return { sent: false, warning: `Brevo send failed with status ${response.status}` };
  }

  return { sent: true };
}

function validateSignup(payload) {
  if (!payload || typeof payload !== "object") return "Invalid JSON body";
  if (!payload.email) return "Missing required field: email";
  if (!isValidEmail(payload.email)) return "Invalid email";
  return "";
}

function normalizeMember(payload) {
  return {
    firstName: cleanText(payload.firstName || payload.first_name),
    lastName: cleanText(payload.lastName || payload.last_name),
    email: cleanEmail(payload.email),
    phone: cleanText(payload.phone),
    sport: cleanText(payload.sport || "both"),
    city: cleanText(payload.city || "Watkinsville"),
    state: cleanText(payload.state || "GA"),
    zip: cleanText(payload.zip || "30677"),
  };
}

function makeProfileLink(request, env, token) {
  const base = env.CLUB_SOCIETY_PROFILE_URL || new URL(request.url).origin;
  const url = new URL(base);
  url.searchParams.set("completeProfile", token);
  return url.toString();
}

async function makeToken(email) {
  const bytes = new TextEncoder().encode(`${email}:${Date.now()}:${crypto.randomUUID()}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fullName(member) {
  return `${member.firstName || ""} ${member.lastName || ""}`.trim() || member.email;
}

function cleanText(value) {
  return String(value || "").trim().slice(0, 1000);
}

function cleanEmail(value) {
  return String(value || "").trim().toLowerCase().slice(0, 320);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function json(body, status, headers) {
  return Response.json(body, { status, headers });
}
