const SHOPIFY_ORIGIN = "https://www.paddleandpin.com";
const ALLOWED_ORIGINS = new Set([
  "null",
  SHOPIFY_ORIGIN,
  "https://clubsociety.app",
  "https://www.clubsociety.app",
  "https://clubsocietyapp.com",
  "https://www.clubsocietyapp.com",
  "https://club-society.pages.dev",
]);
const ALLOWED_TYPES = new Set(["round_robin_event", "free_shirt_claim"]);

function corsHeadersFor(request) {
  const origin = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : SHOPIFY_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
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
    return listSubmissions(request, env, corsHeaders);
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405, corsHeaders);
  }

  const origin = request.headers.get("Origin");
  if (origin && origin !== SHOPIFY_ORIGIN) {
    return json({ ok: false, error: "Origin not allowed" }, 403, corsHeaders);
  }

  if (!env.DB) {
    return json({ ok: false, error: "Database binding DB is not configured" }, 500, corsHeaders);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body" }, 400, corsHeaders);
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return json({ ok: false, error: 'Invalid JSON body' }, 400, corsHeaders);
  }

  const spamError = validateAntiSpam(payload);
  if (spamError) return json({ ok: false, error: spamError }, 400, corsHeaders);

  const validationError = validatePayload(payload);
  if (validationError) return json({ ok: false, error: validationError }, 400, corsHeaders);

  try {
    if (payload.type === 'round_robin_event' && payload.returning_player === true) {
      // Resolve only on the server. Never return a player profile to the browser.
      const previous = await env.DB.prepare(`
        SELECT first_name, last_name FROM paddle_pint_submissions
        WHERE type = 'round_robin_event' AND lower(trim(email)) = ?
          AND trim(coalesce(first_name, '')) <> '' AND trim(coalesce(last_name, '')) <> ''
        ORDER BY id DESC LIMIT 1
      `).bind(cleanEmail(payload.email)).first();
      if (!previous) {
        return json({ ok: false, error: 'Quick signup could not be completed. Please use First time / full signup below.' }, 422, corsHeaders);
      }
      payload.first_name = previous.first_name;
      payload.last_name = previous.last_name;
      payload.name = null;
      payload.phone = null;
      payload.shirt_gender = null;
      payload.shirt_size = null;
      payload.optional_shirt_choice = null;
      payload.selected_shirt = null;
      payload.notes = 'Returning player RSVP. No shirt requested. ' + (payload.notes || '');
    }
    await env.DB.prepare(`
      INSERT INTO paddle_pint_submissions (
        type,
        first_name,
        last_name,
        name,
        email,
        phone,
        event_date,
        shirt_gender,
        shirt_size,
        optional_shirt_choice,
        selected_shirt,
        additional_players_json,
        notes,
        source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      cleanText(payload.type),
      cleanText(payload.first_name),
      cleanText(payload.last_name),
      cleanText(payload.name),
      cleanEmail(payload.email),
      cleanText(payload.phone),
      cleanText(payload.event_date),
      cleanText(payload.shirt_gender),
      cleanText(payload.shirt_size),
      cleanText(payload.optional_shirt_choice),
      cleanText(payload.selected_shirt),
      JSON.stringify(Array.isArray(payload.additional_players) ? payload.additional_players : []),
      cleanText(payload.notes),
      cleanText(payload.source)
    ).run();

    return json({ ok: true, message: "Submission saved" }, 200, corsHeaders);
  } catch (error) {
    console.error("Paddle + Pint submission save failed", error);
    return json({ ok: false, error: "Server/database error" }, 500, corsHeaders);
  }
}

async function listSubmissions(request, env, corsHeaders) {
  if (!env.DB) {
    return json({ ok: false, error: "Database binding DB is not configured" }, 500, corsHeaders);
  }

  if (!env.ADMIN_SYNC_KEY) {
    return json({ ok: false, error: "Admin sync key is not configured" }, 500, corsHeaders);
  }

  const url = new URL(request.url);
  const submittedKey = request.headers.get("X-Admin-Key") || url.searchParams.get("admin_key");
  if (submittedKey !== env.ADMIN_SYNC_KEY) {
    return json({ ok: false, error: "Unauthorized" }, 401, corsHeaders);
  }

  const type = url.searchParams.get("type");
  if (type && !ALLOWED_TYPES.has(type)) {
    return json({ ok: false, error: "Invalid submission type" }, 400, corsHeaders);
  }

  try {
    const baseSql = `
      SELECT
        id,
        type,
        first_name,
        last_name,
        name,
        email,
        phone,
        event_date,
        shirt_gender,
        shirt_size,
        optional_shirt_choice,
        selected_shirt,
        additional_players_json,
        notes,
        source,
        created_at,
        created_at AS signup_date
      FROM paddle_pint_submissions
    `;
    const statement = type
      ? env.DB.prepare(`${baseSql} WHERE type = ? ORDER BY id DESC LIMIT 250`).bind(type)
      : env.DB.prepare(`${baseSql} ORDER BY id DESC LIMIT 250`);
    const result = await statement.all();
    return json({ ok: true, submissions: result.results || [] }, 200, corsHeaders);
  } catch (error) {
    console.error("Paddle + Pint submission list failed", error);
    return json({ ok: false, error: "Server/database error" }, 500, corsHeaders);
  }
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") return "Invalid JSON body";
  if (!payload.type) return "Missing required field: type";
  if (!ALLOWED_TYPES.has(payload.type)) return "Invalid submission type";
  if (!payload.email) return "Missing required field: email";
  if (!isValidEmail(payload.email)) return "Invalid email";

  if (payload.type === "round_robin_event") {
    if (payload.returning_player !== true) {
      if (!cleanText(payload.first_name)) return "Missing required field: first_name";
      if (!cleanText(payload.last_name)) return "Missing required field: last_name";
    }
    if (!payload.event_date) return "Missing required field: event_date";
    if (payload.returning_player === true) {
      const date = new Date(payload.event_date);
      if (Number.isNaN(date.getTime()) || date.getUTCDay() !== 1 || date.getUTCDate() > 14) return "Choose a first or second Monday.";
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      if (date.toISOString().slice(0, 10) < today) return "Choose an upcoming event date.";
      if (!Array.isArray(payload.additional_players) || payload.additional_players.length > 6) return "Add up to six guests.";
      if (payload.additional_players.some(player => !player || !cleanText(player.first_name) || !cleanText(player.last_name))) return "Enter each guest\u0027s first and last name.";
    }
  }

  if (payload.type === "free_shirt_claim") {
    if (!payload.name) return "Missing required field: name";
    if (!payload.shirt_size) return "Missing required field: shirt_size";
    if (!payload.selected_shirt) return "Missing required field: selected_shirt";
  }

  return "";
}

function validateAntiSpam(payload) {
  const honeypot = payload.website || payload.company || payload.honeypot || payload._gotcha;
  if (honeypot) return "Spam check failed";

  const startedAt = payload.form_started_at || payload.started_at || payload.submission_started_at;
  if (!startedAt) return "";

  const started = Date.parse(startedAt);
  if (Number.isNaN(started)) return "";

  if (Date.now() - started < 2000) return "Submission was too fast";
  return "";
}

function cleanText(value) {
  if (value == null) return null;
  return String(value).trim().slice(0, 1000);
}

function cleanEmail(value) {
  return String(value || "").trim().toLowerCase().slice(0, 320);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function json(body, status, headers) {
  return Response.json(body, {
    status,
    headers,
  });
}

