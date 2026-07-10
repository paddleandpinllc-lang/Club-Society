const ALLOWED_ORIGIN = "https://www.paddleandpin.com";
const ALLOWED_TYPES = new Set(["round_robin_event", "free_shirt_claim"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  const origin = request.headers.get("Origin");
  if (origin && origin !== ALLOWED_ORIGIN) {
    return json({ ok: false, error: "Origin not allowed" }, 403);
  }

  if (!env.DB) {
    return json({ ok: false, error: "Database binding DB is not configured" }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const spamError = validateAntiSpam(payload);
  if (spamError) return json({ ok: false, error: spamError }, 400);

  const validationError = validatePayload(payload);
  if (validationError) return json({ ok: false, error: validationError }, 400);

  try {
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

    return json({ ok: true, message: "Submission saved" }, 200);
  } catch (error) {
    console.error("Paddle + Pint submission save failed", error);
    return json({ ok: false, error: "Server/database error" }, 500);
  }
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") return "Invalid JSON body";
  if (!payload.type) return "Missing required field: type";
  if (!ALLOWED_TYPES.has(payload.type)) return "Invalid submission type";
  if (!payload.email) return "Missing required field: email";
  if (!isValidEmail(payload.email)) return "Invalid email";

  if (payload.type === "round_robin_event") {
    if (!payload.first_name) return "Missing required field: first_name";
    if (!payload.last_name) return "Missing required field: last_name";
    if (!payload.event_date) return "Missing required field: event_date";
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

function json(body, status) {
  return Response.json(body, {
    status,
    headers: corsHeaders,
  });
}
