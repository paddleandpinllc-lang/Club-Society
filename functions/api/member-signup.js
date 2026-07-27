const APP_ORIGINS = new Set([
  "https://clubsociety.app",
  "https://www.clubsociety.app",
  "https://clubsocietyapp.com",
  "https://www.clubsocietyapp.com",
  "https://club-society.pages.dev",
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
  if (payload.action === "signin") {
    const signinError = validateSignin(payload);
    if (signinError) return json({ ok: false, error: signinError }, 400, corsHeaders);
    return signInMember(payload, env, corsHeaders);
  }
  if (payload.action === "save_app_state") {
    const syncError = validateAppStateSave(payload);
    if (syncError) return json({ ok: false, error: syncError }, 400, corsHeaders);
    return saveMemberAppState(payload, env, corsHeaders);
  }
  if (payload.action === "forgot_password") {
    const resetError = validatePasswordResetRequest(payload);
    if (resetError) return json({ ok: false, error: resetError }, 400, corsHeaders);
    return sendPasswordReset(payload, request, env, corsHeaders);
  }

  if (validationError) return json({ ok: false, error: validationError }, 400, corsHeaders);
  if (!env.DB) return json({ ok: false, error: "Database binding DB is not configured" }, 500, corsHeaders);

  const member = normalizeMember(payload);
  const token = await makeToken(member.email);
  const profileLink = makeProfileLink(request, env, token);

  try {
    await ensureMemberTable(env.DB);
    const syncToken = await makeToken(`${member.email}:sync`);
    await upsertMember(env.DB, member, token, payload.password, syncToken, payload.appState);

    let emailResult = { sent: false, warning: "" };
    try {
      emailResult = await sendConfirmationEmail(env, member, profileLink);
    } catch (error) {
      console.error("Club Society confirmation email failed", error);
      emailResult = { sent: false, warning: "Signup saved, but the verification email failed to send." };
    }
    return json({
      ok: true,
      message: emailResult.sent ? "Signup saved and confirmation email sent" : "Signup saved",
      emailSent: emailResult.sent,
      emailWarning: emailResult.warning || "",
      profileLink,
      syncToken,
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

    await env.DB.prepare(`
      UPDATE club_members
      SET email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP),
          updated_at = CURRENT_TIMESTAMP
      WHERE completion_token = ?
    `).bind(token).run();

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

async function signInMember(payload, env, corsHeaders) {
  if (!env.DB) return json({ ok: false, error: "Database binding DB is not configured" }, 500, corsHeaders);

  const email = cleanEmail(payload.email);
  try {
    await ensureMemberTable(env.DB);
    const result = await env.DB.prepare(`
      SELECT first_name, last_name, email, phone, sport, city, state, zip, password_hash, email_verified_at, app_state_json
      FROM club_members
      WHERE email = ?
      LIMIT 1
    `).bind(email).first();

    if (!result) {
      return json({ ok: false, error: "That email and password did not match." }, 401, corsHeaders);
    }

    if (!result.password_hash) {
      return json({
        ok: false,
        error: "This account exists, but no password has been set yet. Tap Join Now or Forgot password using this same email to create the cloud login.",
        needsPasswordSetup: true,
      }, 409, corsHeaders);
    }

    const passwordOk = await verifyPassword(payload.password, result.password_hash);
    if (!passwordOk) {
      return json({ ok: false, error: "That email and password did not match." }, 401, corsHeaders);
    }

    const syncToken = await makeToken(`${email}:sync`);
    await env.DB.prepare(`
      UPDATE club_members
      SET sync_token = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE email = ?
    `).bind(syncToken, email).run();

    return json({
      ok: true,
      emailVerified: Boolean(result.email_verified_at),
      syncToken,
      appState: safeJsonParse(result.app_state_json, {}),
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
    console.error("Club Society sign-in failed", error);
    return json({ ok: false, error: "Server error while signing in" }, 500, corsHeaders);
  }
}

async function sendPasswordReset(payload, request, env, corsHeaders) {
  const email = cleanEmail(payload.email);

  try {
    if (!env.DB) {
      return json({ ok: true, message: "If that email exists, reset instructions will be sent." }, 200, corsHeaders);
    }

    await ensureMemberTable(env.DB);
    const result = await env.DB.prepare(`
      SELECT first_name, last_name, email
      FROM club_members
      WHERE email = ?
      LIMIT 1
    `).bind(email).first();

    if (result) {
      const resetLink = makePasswordResetLink(request, env, result.email);
      await sendPasswordResetEmail(env, {
        firstName: result.first_name || "",
        lastName: result.last_name || "",
        email: result.email,
      }, resetLink);
    }

    return json({ ok: true, message: "If that email exists, reset instructions will be sent." }, 200, corsHeaders);
  } catch (error) {
    console.error("Club Society password reset request failed", error);
    return json({ ok: false, error: "Server error while starting password reset" }, 500, corsHeaders);
  }
}

async function saveMemberAppState(payload, env, corsHeaders) {
  if (!env.DB) return json({ ok: false, error: "Database binding DB is not configured" }, 500, corsHeaders);

  const email = cleanEmail(payload.email);
  const syncToken = cleanText(payload.syncToken);
  const appStateJson = JSON.stringify(sanitizeAppState(payload.appState));

  try {
    await ensureMemberTable(env.DB);
    const result = await env.DB.prepare(`
      SELECT id
      FROM club_members
      WHERE email = ? AND sync_token = ?
      LIMIT 1
    `).bind(email, syncToken).first();

    if (!result) return json({ ok: false, error: "Cloud sync is not authorized" }, 401, corsHeaders);

    await env.DB.prepare(`
      UPDATE club_members
      SET app_state_json = ?,
          app_state_updated_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE email = ?
    `).bind(appStateJson, email).run();

    return json({ ok: true, savedAt: new Date().toISOString() }, 200, corsHeaders);
  } catch (error) {
    console.error("Club Society app-state save failed", error);
    return json({ ok: false, error: "Server error while saving app data" }, 500, corsHeaders);
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
      password_hash TEXT,
      completion_token TEXT NOT NULL UNIQUE,
      sync_token TEXT,
      app_state_json TEXT,
      app_state_updated_at TEXT,
      email_verified_at TEXT,
      profile_completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
  await addColumnIfMissing(db, "club_members", "password_hash", "TEXT");
  await addColumnIfMissing(db, "club_members", "email_verified_at", "TEXT");
  await addColumnIfMissing(db, "club_members", "sync_token", "TEXT");
  await addColumnIfMissing(db, "club_members", "app_state_json", "TEXT");
  await addColumnIfMissing(db, "club_members", "app_state_updated_at", "TEXT");
  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_club_members_completion_token
    ON club_members (completion_token)
  `).run();
  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_club_members_sync_token
    ON club_members (email, sync_token)
  `).run();
}

async function addColumnIfMissing(db, table, column, type) {
  const columns = await db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = (columns.results || []).some((item) => item.name === column);
  if (!exists) await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run();
}

async function upsertMember(db, member, token, password, syncToken, appState = {}) {
  const passwordHash = await hashPassword(password);
  const appStateJson = safeAppStateJson(appState);
  await db.prepare(`
    INSERT INTO club_members (
      first_name, last_name, email, phone, sport, city, state, zip, password_hash, completion_token, sync_token, app_state_json, app_state_updated_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      phone = excluded.phone,
      sport = excluded.sport,
      city = excluded.city,
      state = excluded.state,
      zip = excluded.zip,
      password_hash = excluded.password_hash,
      completion_token = excluded.completion_token,
      sync_token = excluded.sync_token,
      app_state_json = excluded.app_state_json,
      app_state_updated_at = CURRENT_TIMESTAMP,
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
    passwordHash,
    token,
    syncToken,
    appStateJson
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

async function sendPasswordResetEmail(env, member, resetLink) {
  if (!env.BREVO_API_KEY || !env.BREVO_SENDER_EMAIL) return { sent: false };

  const body = {
    sender: {
      name: env.BREVO_SENDER_NAME || "Club Society",
      email: env.BREVO_SENDER_EMAIL,
    },
    to: [{ email: member.email, name: fullName(member) }],
    subject: "Reset your Club Society password",
    htmlContent: `
      <html>
        <body style="font-family:Arial,sans-serif;color:#0b2231;line-height:1.5;">
          <h2>Reset your Club Society password</h2>
          <p>Hi ${escapeHtml(member.firstName || "there")},</p>
          <p>Use the button below to return to Club Society and create a new password for your account.</p>
          <p>
            <a href="${escapeHtml(resetLink)}" style="display:inline-block;background:#f4b52b;color:#0b2231;padding:12px 18px;border-radius:999px;font-weight:bold;text-decoration:none;">
              Create New Password
            </a>
          </p>
          <p>If the button does not work, paste this link into your browser:</p>
          <p>${escapeHtml(resetLink)}</p>
        </body>
      </html>
    `,
    tags: ["club-society", "password-reset"],
  };

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
    console.error("Brevo password reset failed", response.status, text);
    return { sent: false };
  }

  return { sent: true };
}

function validateSignup(payload) {
  if (!payload || typeof payload !== "object") return "Invalid JSON body";
  if (!payload.email) return "Missing required field: email";
  if (!isValidEmail(payload.email)) return "Invalid email";
  if (!payload.password || String(payload.password).length < 8) return "Password must be at least 8 characters";
  return "";
}

function validatePasswordResetRequest(payload) {
  if (!payload || typeof payload !== "object") return "Invalid JSON body";
  if (!payload.email) return "Missing required field: email";
  if (!isValidEmail(payload.email)) return "Invalid email";
  return "";
}

function validateAppStateSave(payload) {
  if (!payload || typeof payload !== "object") return "Invalid JSON body";
  if (!payload.email) return "Missing required field: email";
  if (!isValidEmail(payload.email)) return "Invalid email";
  if (!payload.syncToken) return "Missing cloud sync token";
  if (!payload.appState || typeof payload.appState !== "object") return "Missing app state";
  if (JSON.stringify(payload.appState).length > 1500000) return "App state is too large to sync";
  return "";
}

function validateSignin(payload) {
  if (!payload || typeof payload !== "object") return "Invalid JSON body";
  if (!payload.email) return "Missing required field: email";
  if (!isValidEmail(payload.email)) return "Invalid email";
  if (!payload.password) return "Missing required field: password";
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

function sanitizeAppState(value) {
  const allowedKeys = new Set([
    "profiles",
    "societyFavorites",
    "societyFriends",
    "clubGroups",
    "casualMatches",
    "quickGames",
    "posts",
    "golfTeeTimes",
    "golfGroups",
    "golfMessages",
    "golfMatchIndex",
    "societyFriendFilter",
    "quickGameFilter",
    "casualMatchFilter",
    "courtFilter",
    "savedAt",
    "schemaVersion",
  ]);
  const clean = {};
  Object.entries(value || {}).forEach(([key, entry]) => {
    if (!allowedKeys.has(key)) return;
    clean[key] = entry;
  });
  return JSON.parse(JSON.stringify(clean));
}

function safeAppStateJson(value) {
  try {
    const jsonText = JSON.stringify(sanitizeAppState(value));
    if (jsonText.length > 500000) return "{}";
    return jsonText;
  } catch {
    return "{}";
  }
}

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function makeProfileLink(request, env, token) {
  const base = env.CLUB_SOCIETY_PROFILE_URL || new URL(request.url).origin;
  const url = new URL(base);
  url.searchParams.set("completeProfile", token);
  return url.toString();
}

function makePasswordResetLink(request, env, email) {
  const base = env.CLUB_SOCIETY_PROFILE_URL || new URL(request.url).origin;
  const url = new URL(base);
  url.searchParams.set("resetPassword", email);
  return url.toString();
}

async function makeToken(email) {
  const bytes = new TextEncoder().encode(`${email}:${Date.now()}:${crypto.randomUUID()}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 120000;
  const derived = await derivePasswordBits(password, salt, iterations);
  return `pbkdf2$${iterations}$${toBase64(salt)}$${toBase64(derived)}`;
}

async function verifyPassword(password, stored) {
  const [method, iterationText, saltText, hashText] = String(stored || "").split("$");
  if (method !== "pbkdf2" || !iterationText || !saltText || !hashText) return false;
  const salt = fromBase64(saltText);
  const iterations = Number(iterationText);
  const derived = await derivePasswordBits(password, salt, iterations);
  return timingSafeEqual(toBase64(derived), hashText);
}

async function derivePasswordBits(password, salt, iterations) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(String(password)),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );
  return new Uint8Array(bits);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

function toBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function fromBase64(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
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
