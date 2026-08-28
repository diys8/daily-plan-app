import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function j(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...CORS, "content-type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const KEY = Deno.env.get("ANTHROPIC_API_KEY");
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  let body: any = {};
  try { body = await req.json(); } catch (_) {}
  const slug = body.slug;
  const message = (body.message || "").toString().slice(0, 2000);
  const history: { role: string; body: string }[] = Array.isArray(body.history) ? body.history.slice(-20) : [];

  if (!KEY) return j({ ok: false, error: "coach not configured (missing key)" }, 500);

  if (!slug) return j({ ok: false, error: "missing slug" }, 400);
  const { data: person } = await admin.from("person").select("*").eq("slug", slug).single();
  if (!person) return j({ ok: false, error: "unknown user" }, 404);

  const { data: cfg } = await admin.from("coach_config").select("*").eq("id", 1).single();
  const monthAllow = Number(cfg?.monthly_allowance_usd ?? 0.83);
  const yearCap = Number(cfg?.yearly_cap_usd ?? 10);
  const primary = cfg?.primary_model || "claude-sonnet-4-6";
  const fallback = cfg?.fallback_model || "claude-haiku-4-5-20251001";
  const PRICE: Record<string, { in: number; out: number }> = {
    [primary]: { in: Number(cfg?.primary_in ?? 3), out: Number(cfg?.primary_out ?? 15) },
    [fallback]: { in: Number(cfg?.fallback_in ?? 1), out: Number(cfg?.fallback_out ?? 5) },
  };

  const now = new Date();
  const ym = now.getUTCFullYear() + "-" + String(now.getUTCMonth() + 1).padStart(2, "0");
  const yr = String(now.getUTCFullYear());
  const { data: usageRows } = await admin.from("coach_usage").select("on_month,spent_usd").eq("person_id", person.id);
  let monthSpent = 0, yearSpent = 0;
  (usageRows || []).forEach((u: any) => {
    const s = Number(u.spent_usd) || 0;
    if (u.on_month === ym) monthSpent += s;
    if (String(u.on_month).startsWith(yr)) yearSpent += s;
  });

  if (yearSpent >= yearCap) {
    return j({ ok: true, paused: true, message: "You've hit your yearly coach budget. Ask Gong to raise it if you'd like to keep going." });
  }

  const lite = monthSpent >= 0.8 * monthAllow;
  const model = lite ? fallback : primary;

  const { data: goals } = await admin.from("goal").select("text").eq("person_id", person.id).order("sort");
  const { data: workouts } = await admin.from("workout").select("*, exercise(*)").eq("person_id", person.id);
  const since = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  const { data: logs } = await admin.from("exercise_log").select("exercise_id,on_date,done,feel").eq("person_id", person.id).gte("on_date", since);
  const { data: sessions } = await admin.from("workout_session").select("workout_id,on_date,feel,started_at,finished_at").eq("person_id", person.id).gte("on_date", since);
  const { data: days } = await admin.from("day").select("weekday, block(time, title, workout, tag)").eq("person_id", person.id).order("weekday");
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const schedule = (days || []).map((d: any) => ({
    day: dayNames[d.weekday],
    blocks: (d.block || []).map((b: any) => ({ time: b.time, title: b.title, workout: b.workout, tag: b.tag }))
  }));

  const context = {
    profile: { level: person.level, equipment: person.equipment, injuries: person.constraints, sports: person.sports },
    goals: (goals || []).map((g: any) => g.text),
    routines: (workouts || []).map((w: any) => ({
      code: w.code, name: w.name, focus: w.focus,
      exercises: (w.exercise || []).map((e: any) => ({
        id: e.id, name: e.name, section: e.section, scheme: e.scheme, load: e.load,
        is_footwork: e.is_footwork, paused: !!e.paused, paused_reason: e.paused_reason || ""
      }))
    })),
    recent_logs: logs || [],
    recent_sessions: (sessions || []).map((s: any) => ({
      workout_id: s.workout_id, on_date: s.on_date, feel: s.feel,
      duration_min: s.started_at && s.finished_at ? Math.round((new Date(s.finished_at).getTime() - new Date(s.started_at).getTime()) / 60000) : null
    })),
    schedule,
  };

  const sys = [
    "You are a certified sports dietitian and CSCS strength coach helping one client via a fitness app.",
    "Principles: human-centered and conservative. Prefer rep-ranges and 'reps in reserve' over fixed maxes. Start light, progress gradually, respect the client's injuries, equipment, level, and goals. Never prescribe machine-like fixed volume cold. Build in deloads.",
    "You are given the client's profile, goals, routines (with exercise ids; each exercise has a 'paused' flag and 'paused_reason'), recent per-exercise logs (done + how it felt: easy/right/hard/''), recent session summaries (overall feel, duration), and their weekly schedule.",
    "IMPORTANT: Propose AT MOST 5 changes. Never rewrite the whole routine at once — pick only the few highest-impact adjustments. If the client is just starting, a short note plus 1-3 small changes is ideal.",
    "To sideline an injured or painful exercise, use pause_exercise with a short reason. NEVER put status text like 'HOLD' or 'skip' into the sets/reps, and never overwrite an exercise's real numbers to signal a pause. To bring a paused exercise back, use resume_exercise.",
    "Add ONE movement per exercise. NEVER bundle multiple stretches or movements into a single exercise (e.g. a 'recovery stretches' entry listing three stretches is wrong — add three separate cooldown exercises).",
    "Every add_exercise and every exercise in create_routine MUST include a non-empty 'cue' — a short form reminder of how to do it.",
    "Output RAW JSON only. Do NOT wrap it in markdown code fences or add any prose outside the JSON. Shape exactly:",
    '{"text":"<=120 words plain-language explanation for the client","proposal":[ ops ]}',
    "Allowed ops:",
    '{"type":"update_exercise","exercise_id":<id>,"name":"<current name>","fields":{"scheme":"...","load":"...","cue":"..."}}',
    '{"type":"add_exercise","workout_code":"A","section":"warmup|main|cooldown","name":"...","scheme":"...","cue":"<required>"}',
    '{"type":"remove_exercise","exercise_id":<id>,"name":"<current name>"}',
    '{"type":"pause_exercise","exercise_id":<id>,"name":"<current name>","reason":"<short reason>"}',
    '{"type":"resume_exercise","exercise_id":<id>,"name":"<current name>"}',
    '{"type":"create_routine","name":"...","focus":"strength|cardio|mobility","exercises":[{"name":"...","section":"warmup|main|cooldown","scheme":"...","cue":"<required>"}]}',
    '{"type":"note","text":"advice with no data change"}',
    "Include only fields you want to change. Use only exercise ids that exist in the provided routines. If no change is warranted, return an empty proposal with a helpful text.",
  ].join("\n");

  const messages: { role: string; content: string }[] = [];
  for (const m of history.slice(0, -1)) {
    messages.push({ role: m.role === "user" ? "user" : "assistant", content: m.body });
  }
  const lastUser = message || "Give me coaching guidance.";
  messages.push({ role: "user", content: lastUser + "\n\nClient data (JSON):\n" + JSON.stringify(context) });

  async function callModel(m: string) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": KEY!, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: m, max_tokens: 4000, system: sys, messages }),
    });
    const jr = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(jr));
    return jr;
  }

  let resp: any, usedModel = model;
  try {
    resp = await callModel(model);
  } catch (e) {
    if (model !== fallback) {
      usedModel = fallback;
      try { resp = await callModel(fallback); } catch (e2) { return j({ ok: false, error: "coach call failed: " + String(e2) }, 502); }
    } else {
      return j({ ok: false, error: "coach call failed: " + String(e) }, 502);
    }
  }

  const inTok = resp.usage?.input_tokens || 0;
  const outTok = resp.usage?.output_tokens || 0;
  const p = PRICE[usedModel] || { in: 3, out: 15 };
  const cost = (inTok / 1e6) * p.in + (outTok / 1e6) * p.out;

  await admin.from("coach_usage").upsert({ person_id: person.id, on_month: ym, spent_usd: monthSpent + cost, updated_at: new Date().toISOString() }, { onConflict: "person_id,on_month" });

  let text = "", proposal: any[] = [];
  let raw = (resp.content || []).map((c: any) => c.text || "").join("").trim();
  raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/,"").trim();
  try {
    const a = raw.indexOf("{"); const b = raw.lastIndexOf("}");
    const parsed = JSON.parse(raw.slice(a, b + 1));
    text = parsed.text || "";
    proposal = Array.isArray(parsed.proposal) ? parsed.proposal : [];
  } catch (_) {
    text = "I couldn't format a clean plan that time — try again, or ask something more specific.";
    proposal = [];
  }

  return j({ ok: true, paused: false, text, proposal });
});
