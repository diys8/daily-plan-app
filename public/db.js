import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPA_URL, SUPA_KEY, VAPID_PUBLIC, S } from "./state.js";
import { todayStr, todayWd, urlB64, mins } from "./util.js";

export const sb = createClient(SUPA_URL, SUPA_KEY);

function showError(msg) {
  let el = document.getElementById("dp-toast");
  if (!el) { el = document.createElement("div"); el.id = "dp-toast"; el.className = "dp-toast"; document.body.appendChild(el); }
  el.textContent = msg;
  el.className = "dp-toast show";
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = "dp-toast", 4000);
}

export async function save(query) {
  const res = await query;
  if (res.error) { showError(res.error.message || "Save failed"); return null; }
  return res.data;
}

export async function load() {
  const { data: person, error: pe } = await sb.from("person").select("*").eq("slug", S.SLUG).single();
  if (pe || !person) throw new Error("Could not find this plan. Check the link.");
  const tz = person.timezone || undefined;
  const today = todayStr(tz);
  S.todayDate = today;
  S.todayWd = todayWd(tz);
  const { data: days } = await sb.from("day").select("*, block(*, checklist_item(*))").eq("person_id", person.id).order("weekday");
  const { data: workouts } = await sb.from("workout").select("*, exercise(*)").eq("person_id", person.id);
  const { data: goals } = await sb.from("goal").select("*").eq("person_id", person.id).order("sort");
  const { data: checks } = await sb.from("item_check").select("checklist_item_id,checked").eq("person_id", person.id).eq("on_date", today);
  const { data: ovr } = await sb.from("block_override").select("block_id,patch").eq("person_id", person.id).eq("on_date", today);
  const { data: bdone } = await sb.from("block_done").select("block_id,done").eq("person_id", person.id).eq("on_date", today);
  const { data: exlogs } = await sb.from("exercise_log").select("exercise_id,done,feel").eq("person_id", person.id).eq("on_date", today);
  const { data: sessions } = await sb.from("workout_session").select("*").eq("person_id", person.id).eq("on_date", today);
  days.forEach(d => { d.block.sort((a,b) => a.sort - b.sort); d.block.forEach(b => b.checklist_item.sort((x,y) => x.sort - y.sort)); });
  workouts.forEach(w => w.exercise.sort((a,b) => a.sort - b.sort));
  S.CHECKS = {}; (checks || []).forEach(c => S.CHECKS[c.checklist_item_id] = c.checked);
  S.OVR = {}; (ovr || []).forEach(o => S.OVR[o.block_id] = o.patch);
  S.BDONE = {}; (bdone || []).forEach(o => { if (o.done) S.BDONE[o.block_id] = true; });
  S.LOGS = {}; (exlogs || []).forEach(l => S.LOGS[l.exercise_id] = { done: !!l.done, feel: l.feel || "" });
  S.SESSIONS = {}; (sessions || []).forEach(s => S.SESSIONS[s.workout_id] = s);
  S.DATA = { person, days, workouts, goals };
}

export function dayFor(wd) { return S.DATA.days.find(d => d.weekday === wd); }
export function workoutByCode(code) { return S.DATA.workouts.find(w => w.code === code); }

export function eff(b) {
  if (S.viewWd === S.todayWd && S.OVR[b.id]) return Object.assign({}, b, S.OVR[b.id]);
  return b;
}

export function orderedBlocks(day) {
  return day.block.map(eff).slice().sort((a,b) => mins(a.time) - mins(b.time));
}

export function currentIdx(blocks) {
  if (S.viewWd !== S.todayWd) return -1;
  const now = new Date().getHours() * 60 + new Date().getMinutes();
  let idx = -1;
  blocks.forEach((b,i) => { if (mins(b.time) <= now) idx = i; });
  return idx;
}

export function findBlock(id) {
  for (const d of S.DATA.days) { const b = d.block.find(x => x.id === id); if (b) return b; }
  return null;
}

export async function toggleItem(itemId) {
  const now = !S.CHECKS[itemId];
  S.CHECKS[itemId] = now;
  S.render();
  await save(sb.from("item_check").upsert(
    { person_id: S.DATA.person.id, checklist_item_id: itemId, on_date: S.todayDate, checked: now },
    { onConflict: "person_id,checklist_item_id,on_date" }));
}

export async function toggleExercise(exId) {
  const cur = S.LOGS[exId] || { done: false, feel: "" };
  const now = !cur.done;
  S.LOGS[exId] = { done: now, feel: cur.feel };
  S.render();
  await save(sb.from("exercise_log").upsert(
    { person_id: S.DATA.person.id, exercise_id: exId, on_date: S.todayDate, done: now, feel: cur.feel },
    { onConflict: "person_id,exercise_id,on_date" }));
}

export async function setFeel(exId, feelv) {
  const cur = S.LOGS[exId] || { done: false, feel: "" };
  const now = cur.feel === feelv ? "" : feelv;
  S.LOGS[exId] = { done: cur.done, feel: now };
  S.render();
  await save(sb.from("exercise_log").upsert(
    { person_id: S.DATA.person.id, exercise_id: exId, on_date: S.todayDate, done: cur.done, feel: now },
    { onConflict: "person_id,exercise_id,on_date" }));
}

export async function resumeExercise(id) {
  await save(sb.from("exercise").update({ paused: false, paused_reason: "" }).eq("id", id));
  await reloadAndRender();
}

export async function saveBlockTemplate(id, fields) {
  await save(sb.from("block").update(fields).eq("id", id));
}

export async function saveBlockToday(id, fields) {
  await save(sb.from("block_override").upsert(
    { person_id: S.DATA.person.id, block_id: id, on_date: S.todayDate, patch: fields },
    { onConflict: "person_id,block_id,on_date" }));
}

export async function reloadAndRender() { await load(); S.render(); }

export function remOn() {
  try { return Notification.permission === "granted" && localStorage.getItem("dp_rem") === "1"; }
  catch(e) { return false; }
}

export function anyNotify() {
  return !!(S.DATA && S.DATA.days.some(d => d.block.some(b => b.notify)));
}

export async function enableReminders() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) { alert("This browser doesn't support notifications."); return; }
  let perm = Notification.permission;
  if (perm !== "granted") perm = await Notification.requestPermission();
  if (perm !== "granted") { alert("Notifications weren't allowed. You can turn them on in your browser's site settings."); return; }
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64(VAPID_PUBLIC) });
  const j = sub.toJSON();
  await save(sb.from("push_subscription").upsert(
    { person_id: S.DATA.person.id, endpoint: sub.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth },
    { onConflict: "endpoint" }));
  try { localStorage.setItem("dp_rem", "1"); } catch(e) {}
  S.render();
  alert("Reminders are on — you'll get a nudge at each block. Keep the app installed on your home screen.");
}

export async function markBlockDone(id) {
  const now = !S.BDONE[id];
  if (now) S.BDONE[id] = true; else delete S.BDONE[id];
  S.render();
  await save(sb.from("block_done").upsert(
    { person_id: S.DATA.person.id, block_id: id, on_date: S.todayDate, done: now },
    { onConflict: "person_id,block_id,on_date" }));
}

export async function toggleNotify(id) {
  const blk = findBlock(id); if (!blk) return;
  const now = !blk.notify;
  blk.notify = now;
  S.render();
  await save(sb.from("block").update({ notify: now }).eq("id", id));
}

export async function allReminders(on) {
  const ids = [];
  S.DATA.days.forEach(d => d.block.forEach(b => { b.notify = on; ids.push(b.id); }));
  if (ids.length) await save(sb.from("block").update({ notify: on }).in("id", ids));
  S.sheet = null;
  await reloadAndRender();
}

export function daysForScope(scope) {
  if (scope === "weekdays") return [1,2,3,4,5];
  if (scope === "weekend") return [0,6];
  if (scope === "all") return [0,1,2,3,4,5,6];
  return [S.viewWd];
}

export async function syncItemsToBlock(block, items) {
  const existing = block.checklist_item || [];
  const keptIds = new Set(items.filter(i => i.id).map(i => i.id));
  for (const ex of existing) { if (!keptIds.has(ex.id)) await save(sb.from("checklist_item").delete().eq("id", ex.id)); }
  let s = 0;
  for (const it of items) {
    if (it.id) await save(sb.from("checklist_item").update({ text: it.text, sort: s }).eq("id", it.id));
    else await save(sb.from("checklist_item").insert({ block_id: block.id, text: it.text, sort: s }));
    s++;
  }
}

export async function insertBlockOnDay(day, vals) {
  const nb = await save(sb.from("block").insert({
    day_id: day.id, sort: 99, time: vals.time, title: vals.title, tag: vals.tag,
    detail: "", workout: vals.workout || null, notify: false
  }).select().single());
  if (!nb) return;
  let s = 0;
  for (const it of vals.items) { await save(sb.from("checklist_item").insert({ block_id: nb.id, text: it.text, sort: s++ })); }
}

export async function applyScope(block, vals, scope) {
  const editing = block && !block.__new;
  if (scope === "today") {
    if (editing) {
      await saveBlockToday(block.id, { time: vals.time, title: vals.title, tag: vals.tag, detail: block.detail || "", workout: vals.workout || null });
      await syncItemsToBlock(block, vals.items);
    } else {
      await insertBlockOnDay(dayFor(S.viewWd), vals);
    }
    return;
  }
  const wds = daysForScope(scope);
  for (const wd of wds) {
    const day = dayFor(wd);
    if (editing && wd === S.viewWd) {
      await saveBlockTemplate(block.id, { time: vals.time, title: vals.title, tag: vals.tag, workout: vals.workout || null });
      await syncItemsToBlock(block, vals.items);
      continue;
    }
    let existing;
    if (editing) { existing = day.block.find(b => b.id !== block.id && b.title === block.title); }
    else { existing = day.block.find(b => b.time === vals.time); }
    if (!existing) {
      await insertBlockOnDay(day, vals);
    } else if (!editing && existing.title !== vals.title) {
      await save(sb.from("block").update({ title: existing.title + " + " + vals.title }).eq("id", existing.id));
      let s = existing.checklist_item.length;
      for (const it of vals.items) { await save(sb.from("checklist_item").insert({ block_id: existing.id, text: it.text, sort: s++ })); }
    } else {
      await save(sb.from("block").update({ time: vals.time, title: vals.title, tag: vals.tag, workout: vals.workout || null }).eq("id", existing.id));
      await syncItemsToBlock(existing, vals.items);
    }
  }
}

export async function deleteBlockCascade(id) {
  await save(sb.from("block_done").delete().eq("block_id", id));
  await save(sb.from("block_override").delete().eq("block_id", id));
  const items = await save(sb.from("checklist_item").select("id").eq("block_id", id));
  if (items) { for (const it of items) { await save(sb.from("item_check").delete().eq("checklist_item_id", it.id)); } }
  await save(sb.from("checklist_item").delete().eq("block_id", id));
  await save(sb.from("block").delete().eq("id", id));
}

export async function ensureSession(workoutId) {
  if (S.SESSIONS[workoutId]) return;
  const sess = await save(sb.from("workout_session").upsert(
    { person_id: S.DATA.person.id, workout_id: workoutId, on_date: S.todayDate, started_at: new Date().toISOString() },
    { onConflict: "person_id,workout_id,on_date" }
  ).select().single());
  if (sess) S.SESSIONS[workoutId] = sess;
}

export async function finishSession(workoutId) {
  await save(sb.from("workout_session").upsert(
    { person_id: S.DATA.person.id, workout_id: workoutId, on_date: S.todayDate, finished_at: new Date().toISOString() },
    { onConflict: "person_id,workout_id,on_date" }
  ));
}

export async function syncTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && S.DATA && S.DATA.person && S.DATA.person.timezone !== tz) {
      await save(sb.from("person").update({ timezone: tz }).eq("id", S.DATA.person.id));
      S.DATA.person.timezone = tz;
    }
  } catch(e) {}
}
