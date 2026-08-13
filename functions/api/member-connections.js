export async function onRequest({ request, env }) {
  if (!env.DB) return Response.json({ ok:false, error:"Database unavailable" }, { status:500 });
  if (request.method === "OPTIONS") return new Response(null, { status:204, headers:cors(request) });
  if (request.method !== "POST") return Response.json({ ok:false, error:"Method not allowed" }, { status:405, headers:cors(request) });
  const body = await request.json().catch(() => ({}));
  await ensureTables(env.DB);
  const me = await env.DB.prepare("SELECT email, first_name, last_name FROM club_members WHERE email=? AND sync_token=?").bind(clean(body.email), String(body.syncToken || "")).first();
  if (!me) return Response.json({ ok:false, error:"Sign in again." }, { status:401, headers:cors(request) });
  const target = clean(body.targetEmail);
  if (body.action === "request") {
    if (!target || target === me.email) return Response.json({ ok:false, error:"Choose another member." }, { status:400, headers:cors(request) });
    await env.DB.prepare("INSERT INTO member_connections (requester_email,target_email,status,created_at,updated_at) VALUES (?,?, 'pending',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT(requester_email,target_email) DO UPDATE SET status='pending',updated_at=CURRENT_TIMESTAMP").bind(me.email,target).run();
  } else if (["approve","decline"].includes(body.action)) {
    await env.DB.prepare("UPDATE member_connections SET status=?,updated_at=CURRENT_TIMESTAMP WHERE requester_email=? AND target_email=?").bind(body.action === "approve" ? "approved" : "declined", target, me.email).run();
  } else if (body.action === "remove") {
    await env.DB.prepare("DELETE FROM member_connections WHERE (requester_email=? AND target_email=?) OR (requester_email=? AND target_email=?)").bind(me.email,target,target,me.email).run();
  } else if (body.action === "block") {
    await env.DB.prepare("INSERT OR IGNORE INTO member_blocks (blocker_email,blocked_email) VALUES (?,?)").bind(me.email,target).run();
    await env.DB.prepare("DELETE FROM member_connections WHERE (requester_email=? AND target_email=?) OR (requester_email=? AND target_email=?)").bind(me.email,target,target,me.email).run();
  }
  const rows = await env.DB.prepare(`SELECT c.requester_email,c.target_email,c.status,m.first_name,m.last_name FROM member_connections c JOIN club_members m ON m.email=CASE WHEN c.requester_email=? THEN c.target_email ELSE c.requester_email END WHERE c.requester_email=? OR c.target_email=?`).bind(me.email,me.email,me.email).all();
  return Response.json({ ok:true, connections:(rows.results||[]).map(row=>({ email:row.requester_email===me.email?row.target_email:row.requester_email, name:`${row.first_name||""} ${row.last_name||""}`.trim(), status:row.status, direction:row.target_email===me.email?"incoming":"outgoing" })) }, { headers:cors(request) });
}
function clean(v){return String(v||"").trim().toLowerCase().slice(0,320)}
function cors(request){const origin=request.headers.get("Origin");return {"Access-Control-Allow-Origin":origin||"https://clubsociety.app","Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type",Vary:"Origin"}}
async function ensureTables(db){await db.prepare("CREATE TABLE IF NOT EXISTS member_connections (requester_email TEXT NOT NULL,target_email TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(requester_email,target_email))").run();await db.prepare("CREATE TABLE IF NOT EXISTS member_blocks (blocker_email TEXT NOT NULL,blocked_email TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(blocker_email,blocked_email))").run();}

