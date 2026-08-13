const APP_ORIGINS = new Set(["https://clubsociety.app", "https://www.clubsociety.app", "https://club-society.pages.dev"]);

export async function onRequest({ request, env }) {
  const origin = request.headers.get("Origin");
  const headers = { "Access-Control-Allow-Origin": APP_ORIGINS.has(origin) ? origin : "https://clubsociety.app", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405, headers);
  if (!env.DB) return json({ ok: false, error: "Database binding DB is not configured" }, 500, headers);
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "Invalid request" }, 400, headers); }
  try {
    await ensureTables(env.DB);
    const member = await authorize(env.DB, body.email, body.syncToken);
    if (!member) return json({ ok: false, error: "Sign in again before using shared events." }, 401, headers);
    if (body.action === "save") return saveEvent(env.DB, member, body.event, headers);
    if (body.action === "join") return joinEvent(env.DB, member, body, headers);
    if (body.action === "get") return getEvent(env.DB, member, body, headers);
    return json({ ok: false, error: "Unknown event action" }, 400, headers);
  } catch (error) {
    console.error("Shared member event failed", error);
    return json({ ok: false, error: "Shared event could not be updated" }, 500, headers);
  }
}

async function saveEvent(db, member, event, headers) {
  const clean = sanitizeEvent(event);
  if (!clean.eventName || !clean.matches.length) return json({ ok: false, error: "Event name and matches are required." }, 400, headers);
  let id = clean.sharedEventId || "";
  let existing = id ? await db.prepare("SELECT * FROM member_hosted_events WHERE id = ? LIMIT 1").bind(id).first() : null;
  if (existing) {
    const joined = await db.prepare("SELECT member_email FROM member_hosted_event_members WHERE event_id = ? AND member_email = ? LIMIT 1").bind(id, member.email).first();
    if (existing.host_email !== member.email && !joined) return json({ ok: false, error: "Join this event before updating scores." }, 403, headers);
    await db.prepare("UPDATE member_hosted_events SET event_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(JSON.stringify({ ...clean, sharedEventId: id, joinCode: existing.join_code }), id).run();
  } else {
    id = crypto.randomUUID();
    const joinCode = makeJoinCode();
    clean.sharedEventId = id;
    clean.joinCode = joinCode;
    await db.prepare("INSERT INTO member_hosted_events (id, event_name, join_code, passcode, host_email, event_json) VALUES (?, ?, ?, ?, ?, ?)").bind(id, clean.eventName.toLowerCase(), joinCode, clean.passcode, member.email, JSON.stringify(clean)).run();
    await addMember(db, id, member.email, "host");
    existing = { join_code: joinCode };
  }
  const saved = await db.prepare("SELECT event_json, join_code, updated_at FROM member_hosted_events WHERE id = ?").bind(id).first();
  return json({ ok: true, event: { ...JSON.parse(saved.event_json), id, sharedEventId: id, joinCode: saved.join_code, updatedAt: saved.updated_at } }, 200, headers);
}

async function joinEvent(db, member, body, headers) {
  const key = String(body.eventKey || "").trim();
  const event = await db.prepare("SELECT * FROM member_hosted_events WHERE upper(join_code) = upper(?) OR event_name = lower(?) ORDER BY updated_at DESC LIMIT 1").bind(key, key).first();
  if (!event) return json({ ok: false, error: "No shared event matched that name or join code." }, 404, headers);
  if (event.passcode && event.passcode !== String(body.passcode || "").trim()) return json({ ok: false, error: "That event passcode is not correct." }, 403, headers);
  await addMember(db, event.id, member.email, "player");
  const data = JSON.parse(event.event_json);
  delete data.passcode;
  return json({ ok: true, event: { ...data, id: event.id, sharedEventId: event.id, joinCode: event.join_code, updatedAt: event.updated_at } }, 200, headers);
}

async function getEvent(db, member, body, headers) {
  const id = text(body.eventId, 100);
  const joined = await db.prepare("SELECT member_email FROM member_hosted_event_members WHERE event_id = ? AND member_email = ? LIMIT 1").bind(id, member.email).first();
  if (!joined) return json({ ok: false, error: "Join this event to view its live scores." }, 403, headers);
  const event = await db.prepare("SELECT event_json, join_code, host_email, updated_at FROM member_hosted_events WHERE id = ? LIMIT 1").bind(id).first();
  if (!event) return json({ ok: false, error: "Shared event not found." }, 404, headers);
  const data = JSON.parse(event.event_json);
  if (event.host_email !== member.email) delete data.passcode;
  return json({ ok: true, event: { ...data, id, sharedEventId: id, joinCode: event.join_code, updatedAt: event.updated_at } }, 200, headers);
}

async function authorize(db, email, token) {
  return db.prepare("SELECT email FROM club_members WHERE email = ? AND sync_token = ? LIMIT 1").bind(String(email || "").toLowerCase(), String(token || "")).first();
}

async function addMember(db, eventId, email, role) {
  await db.prepare("INSERT INTO member_hosted_event_members (event_id, member_email, role) VALUES (?, ?, ?) ON CONFLICT(event_id, member_email) DO UPDATE SET role = CASE WHEN role = 'host' THEN role ELSE excluded.role END").bind(eventId, email, role).run();
}

function sanitizeEvent(event = {}) {
  const matches = Array.isArray(event.matches) ? event.matches.slice(0, 500).map((match) => ({ id: text(match.id, 100), round: Number(match.round) || 1, playerA: text(match.playerA), playerB: text(match.playerB), scoreA: text(match.scoreA, 20), scoreB: text(match.scoreB, 20), winner: text(match.winner) })) : [];
  return { sharedEventId: text(event.sharedEventId, 100), joinCode: text(event.joinCode, 20), eventName: text(event.eventName), passcode: text(event.passcode, 100), format: event.format === "tournament" ? "tournament" : "round-robin", playType: event.playType === "doubles" ? "doubles" : "singles", courts: text(event.courts, 10), participants: Array.isArray(event.participants) ? event.participants.slice(0, 250).map((item) => text(item)) : [], matches, updatedAt: new Date().toISOString() };
}

function text(value, length = 300) { return String(value ?? "").trim().slice(0, length); }
function makeJoinCode() { return crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase(); }
function json(body, status, headers) { return Response.json(body, { status, headers }); }

async function ensureTables(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS member_hosted_events (id TEXT PRIMARY KEY, event_name TEXT NOT NULL, join_code TEXT NOT NULL UNIQUE, passcode TEXT, host_email TEXT NOT NULL, event_json TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS member_hosted_event_members (event_id TEXT NOT NULL, member_email TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'player', joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (event_id, member_email))`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_member_hosted_events_name ON member_hosted_events(event_name)").run();
}

