import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const WDMAP: Record<string, number> = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: secrets } = await admin.from("app_secret").select("name,value");
  const S: Record<string,string> = {}; (secrets||[]).forEach((s:any)=>S[s.name]=s.value);
  const provided = url.searchParams.get("k") || req.headers.get("x-cron-secret") || "";
  if (provided !== S.cron_secret) return new Response("forbidden", { status: 403 });

  const debug = url.searchParams.get("debug") === "1";
  const tOverride = url.searchParams.get("t");

  try { webpush.setVapidDetails(S.vapid_subject, S.vapid_public, S.vapid_private); } catch (_) {}

  const { data: people } = await admin.from("person").select("id,timezone");
  const { data: subs } = await admin.from("push_subscription").select("*");
  const subsBy: Record<number, any[]> = {}; (subs||[]).forEach((s:any)=>{ (subsBy[s.person_id]=subsBy[s.person_id]||[]).push(s); });

  const matched:any[] = []; const results:any[] = [];
  for (const p of (people||[])) {
    const tz = p.timezone || "UTC";
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour:"2-digit", minute:"2-digit", weekday:"short", hour12:false }).formatToParts(now);
    const hh = (parts.find(x=>x.type==="hour")!.value).padStart(2,"0");
    const mm = (parts.find(x=>x.type==="minute")!.value).padStart(2,"0");
    const wd = WDMAP[parts.find(x=>x.type==="weekday")!.value];
    const hhmm = tOverride || (hh+":"+mm);
    const dparts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year:"numeric", month:"2-digit", day:"2-digit" }).formatToParts(now);
    const dateStr = dparts.find(x=>x.type==="year")!.value+"-"+dparts.find(x=>x.type==="month")!.value+"-"+dparts.find(x=>x.type==="day")!.value;

    const { data: day } = await admin.from("day").select("id").eq("person_id", p.id).eq("weekday", wd).single();
    if (!day) continue;
    const { data: blocks } = await admin.from("block").select("id,time,title,detail,notify").eq("day_id", day.id);
    const { data: ovr } = await admin.from("block_override").select("block_id,patch").eq("person_id", p.id).eq("on_date", dateStr);
    const { data: done } = await admin.from("block_done").select("block_id,done").eq("person_id", p.id).eq("on_date", dateStr);
    const ovrBy: Record<number, any> = {}; (ovr||[]).forEach((o:any)=>ovrBy[o.block_id]=o.patch);
    const doneSet = new Set((done||[]).filter((d:any)=>d.done).map((d:any)=>d.block_id));

    for (const b of (blocks||[])) {
      const eff = Object.assign({}, b, ovrBy[b.id]||{});
      if (eff.notify === false) continue;
      if (doneSet.has(b.id)) continue;
      if (eff.time !== hhmm) continue;
      matched.push({ person:p.id, block:b.id, time:eff.time, title:eff.title });
      if (debug) continue;
      const payload = JSON.stringify({ title: eff.title, body: eff.detail || "It's time.", tag: "dp-"+b.id });
      for (const s of (subsBy[p.id]||[])) {
        try {
          await webpush.sendNotification({ endpoint:s.endpoint, keys:{ p256dh:s.p256dh, auth:s.auth } }, payload);
          results.push({ block:b.id, ok:true });
        } catch (e:any) {
          results.push({ block:b.id, err: String(e.statusCode||e.message||e) });
          if (e.statusCode === 404 || e.statusCode === 410) await admin.from("push_subscription").delete().eq("endpoint", s.endpoint);
        }
      }
    }
  }
  return new Response(JSON.stringify({ matched, results }), { headers: { "content-type": "application/json" } });
});
