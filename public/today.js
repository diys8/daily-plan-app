import { S, DAYNAMES, DAYFULL, TODAY_WD, BELL, PENCIL } from "./state.js";
import { fmt, esc, tagFromTitle } from "./util.js";
import {
  dayFor, workoutByCode, orderedBlocks, currentIdx,
  toggleItem, toggleExercise, setFeel, resumeExercise, markBlockDone,
  toggleNotify, enableReminders, allReminders, remOn, anyNotify,
  applyScope, reloadAndRender, sb, save, deleteBlockCascade
} from "./db.js";

/* ── helpers ──────────────────────────────────────────── */

function dayStripHtml() {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  let h = '<div class="day-strip">';
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const wd = d.getDay();
    const isToday = d.toDateString() === today.toDateString();
    const isActive = wd === S.viewWd;
    const cls = isActive ? "active" : isToday ? "today" : "";
    h += `<button class="day-pill ${cls}" data-wd="${wd}"><span class="dp-name">${DAYNAMES[wd]}</span><span class="dp-date">${d.getDate()}</span></button>`;
  }
  return h + "</div>";
}

function ringHtml(done, total) {
  if (total === 0) return "";
  const r = 15, c = 2 * Math.PI * r;
  const offset = c * (1 - done / total);
  return `<svg class="ring" viewBox="0 0 36 36"><circle cx="18" cy="18" r="${r}" fill="none" stroke="var(--line)" stroke-width="3"/><circle cx="18" cy="18" r="${r}" fill="none" stroke="var(--done)" stroke-width="3" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}" transform="rotate(-90 18 18)" stroke-linecap="round"/><text x="18" y="20.5" text-anchor="middle" font-size="10">${done}/${total}</text></svg>`;
}

function checklistView(b) {
  let h = "";
  b.checklist_item.forEach(ci => {
    const done = !!S.CHECKS[ci.id];
    h += `<div class="li ${done ? "done" : ""}" data-check="${ci.id}"><span class="box"></span><span>${esc(ci.text)}</span></div>`;
  });
  return h;
}

function movesHtml(code) {
  const w = workoutByCode(code); if (!w) return "";
  const main = w.exercise.filter(e => !e.is_footwork), foot = w.exercise.filter(e => e.is_footwork);
  const logRow = e => {
    const lg = S.LOGS[e.id] || { done: false, feel: "" };
    const chip = (v, label) => `<div class="copt ${lg.feel === v ? "on" : ""}" data-feel="${e.id}" data-feelv="${v}">${label}</div>`;
    return `<div class="mlog"><div class="li ${lg.done ? "done" : ""}" data-exdone="${e.id}"><span class="box"></span><span>Done</span></div>`
      + `<div class="chips" style="margin-top:8px">${chip("easy","Too easy")}${chip("right","Just right")}${chip("hard","Too hard")}</div></div>`;
  };
  const card = e => {
    if (e.paused) {
      return `<div class="move paused"><div class="mh"><span class="mn">${esc(e.name)}</span></div>`
        + `<div class="pausechip">${e.paused_reason ? `Paused — ${esc(e.paused_reason)}` : "Paused"}</div>`
        + (e.cue ? `<div class="mc">${esc(e.cue)}</div>` : "")
        + `<div style="margin-top:10px"><button class="btn ghost" data-resume="${e.id}">Resume</button></div></div>`;
    }
    return `<div class="move"><div class="mh"><span class="mn">${esc(e.name)}</span><span class="msr">${esc(e.scheme || "")}</span></div>`
      + (e.cue ? `<div class="mc">${esc(e.cue)}</div>` : "")
      + (e.breathing ? `<div class="mbr"><span class="mbrlab">Breathing</span><span>${esc(e.breathing)}</span></div>` : "")
      + `<div class="mtag">${e.demo_slug ? "Demo coming in a later step" : "Text guide"}</div>${logRow(e)}</div>`;
  };
  let h = main.map(card).join("");
  if (foot.length) h += `<div class="sec">Footwork &amp; agility</div>` + foot.map(card).join("");
  return h;
}

/* ── now card ─────────────────────────────────────────── */

function nowCardHtml(b, idx, total) {
  const isDone = !!S.BDONE[b.id];
  const ciTexts = new Set(b.checklist_item.map(ci => ci.text.trim().toLowerCase()));
  const showDetail = b.detail && !ciTexts.has(b.detail.trim().toLowerCase());
  let h = `<div class="now"><div class="now-label"><span class="pulse"></span>Now · ${fmt(b.time)}`;
  if (total > 1) h += ` · ${idx + 1} of ${total}`;
  h += `</div><div class="now-title">${esc(b.title)}</div>`;
  if (showDetail) h += `<div class="now-desc">${esc(b.detail)}</div>`;
  if (b.checklist_item.length) h += `<div class="now-checks">${checklistView(b)}</div>`;
  if (b.workout) h += movesHtml(b.workout);
  h += `<div class="now-actions"><button class="btn ${isDone ? "ghost" : "primary"}" data-done="${b.id}">${isDone ? "Done ✓ · undo" : "Mark done"}</button>`
    + `<button class="btn ghost" data-notify="${b.id}">${BELL} ${b.notify ? "On" : "Remind"}</button>`
    + `<button class="btn ghost" data-editblock="${b.id}">${PENCIL}</button></div></div>`;
  return h;
}

/* ── plain row + detail ───────────────────────────────── */

function blockRow(b) {
  const open = b.id === S.openId;
  const isDone = !!S.BDONE[b.id];
  const ci = b.checklist_item;
  const checked = ci.filter(c => S.CHECKS[c.id]).length;
  let meta = "";
  if (isDone) meta += '<span class="row-done-mark">✓</span>';
  if (ci.length) meta += `${checked}/${ci.length}`;
  if (b.workout) meta += (ci.length ? " · " : "") + "workout";
  meta += ` <span class="chev">${open ? "▾" : "▸"}</span>`;
  let h = `<div data-id="${b.id}"><div class="row-plain" data-open="${b.id}">`
    + `<span class="row-time">${fmt(b.time)}</span>`
    + `<span class="row-title">${esc(b.title)}</span>`
    + `<span class="row-meta">${meta}</span></div>`;
  if (open) h += `<div class="detail-wrap">${blockDetail(b)}</div>`;
  return h + "</div>";
}

function blockDetail(b) {
  const done = !!S.BDONE[b.id];
  const rem = !!b.notify;
  return `<div class="detail">${checklistView(b)}${b.workout ? movesHtml(b.workout) : ""}`
    + `<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">`
    + `<button class="btn ${rem ? "primary" : "ghost"}" data-notify="${b.id}">${BELL} ${rem ? "Reminder on" : "Remind me"}</button>`
    + `<button class="btn ${done ? "ghost" : "primary"}" data-done="${b.id}">${done ? "Done ✓ · undo" : "Mark done"}</button>`
    + `<button class="btn ghost" data-editblock="${b.id}" aria-label="Edit block">${PENCIL}</button>`
    + `</div></div>`;
}

/* ── editor ───────────────────────────────────────────── */

function blockEditor(b) {
  const isNew = b.__new;
  let items = b.checklist_item.map((ci, ix) =>
    `<div class="itemed"><input class="inp itmtxt" data-id="${ci.id || ""}" value="${esc(ci.text)}"><button class="xbtn" data-rmitem="${ix}">✕</button></div>`).join("");
  return `<div class="ed" data-edit="${b.id}">
    <div class="field"><label>Time</label><input class="inp" id="ed-time" type="time" value="${b.time}"></div>
    <div class="field"><label>Activity</label><input class="inp" id="ed-title" value="${esc(b.title)}"></div>
    <div class="field"><label>Workout routine</label>
      <select class="inp" id="ed-workout"><option value="">None</option>${S.DATA.workouts.map(w => `<option value="${w.code}"${b.workout === w.code ? " selected" : ""}>${esc(w.name || ("Strength " + w.code))}</option>`).join("")}</select></div>
    <div class="field"><label>Checklist</label><div id="ed-items">${items}</div>
      <button class="linkbtn" id="ed-additem">+ Add item</button></div>
    <div class="field"><label>Apply to</label>
      <div class="chips" id="ed-scope">${isNew
      ? `<div class="copt on" data-scope="wd">Only ${DAYFULL[S.viewWd]}</div><div class="copt" data-scope="weekdays">Every weekday</div><div class="copt" data-scope="weekend">Every weekend</div><div class="copt" data-scope="all">Every day</div>`
      : (S.viewWd === TODAY_WD
        ? `<div class="copt on" data-scope="today">Only today</div><div class="copt" data-scope="wd">Every ${DAYFULL[S.viewWd]}</div><div class="copt" data-scope="weekdays">Every weekday</div><div class="copt" data-scope="weekend">Every weekend</div><div class="copt" data-scope="all">Every day</div>`
        : `<div class="copt on" data-scope="wd">Every ${DAYFULL[S.viewWd]}</div><div class="copt" data-scope="weekdays">Every weekday</div><div class="copt" data-scope="weekend">Every weekend</div><div class="copt" data-scope="all">Every day</div>`)}
      </div></div>
    <div class="edbtns">
      <button class="btn primary" id="ed-save">Save</button>
      <button class="btn ghost" id="ed-cancel">Cancel</button>
      ${isNew ? "" : '<button class="btn danger" id="ed-delete">Delete</button>'}
    </div></div>`;
}

/* ── sheets ───────────────────────────────────────────── */

function sheetHtml() {
  if (S.sheet.type === "apply") {
    const isNew = S.sheet.isNew;
    return `<div class="overlay" id="ov"><div class="sheet">
      <h3>Save "${esc(S.sheet.title)}" to…</h3>
      <div class="hint">at ${fmt(S.sheet.time)}</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${isNew ? "" : '<button class="btn" data-scope="today">Only today</button>'}
        <button class="btn" data-scope="wd">${isNew ? "Only " : "Every "}${DAYFULL[S.viewWd]}</button>
        <button class="btn" data-scope="weekdays">Every weekday (Mon–Fri)</button>
        <button class="btn" data-scope="weekend">Every weekend (Sat–Sun)</button>
        <button class="btn primary" data-scope="all">Every day</button>
      </div>
      <button class="btn ghost" style="width:100%;margin-top:10px" id="apply-cancel">Cancel</button>
    </div></div>`;
  }
  if (S.sheet.type === "reminders") {
    let ton = 0, ttot = 0; S.DATA.days.forEach(d => d.block.forEach(b => { ttot++; if (b.notify) ton++; }));
    const allOn = ttot > 0 && ton === ttot; const allOff = ton === 0;
    const status = allOn ? "All reminders are on." : allOff ? "All reminders are off." : `${ton} of ${ttot} blocks have reminders on.`;
    return `<div class="overlay" id="ov"><div class="sheet">
      <h3>Reminders</h3>
      <div class="hint">${remOn() ? ("Notifications are on for this phone. " + status + " Turn them on or off for every block at once below, or per-block from inside a block.") : "Turn on notifications first, then choose which blocks nudge you."}</div>
      ${remOn() ? "" : '<button class="btn primary" id="rem-enable" style="width:100%;margin-bottom:10px">Turn on notifications</button>'}
      <div class="applybar"><button class="btn ${allOff ? "primary" : ""}" id="rem-alloff">All off${allOff ? " ✓" : ""}</button><button class="btn ${allOn ? "primary" : ""}" id="rem-allon">All on${allOn ? " ✓" : ""}</button></div>
      <button class="btn ghost" style="width:100%;margin-top:8px" id="rem-close">Close</button>
    </div></div>`;
  }
  return "";
}

/* ── edit / save / delete ─────────────────────────────── */

function currentEditBlock() {
  if (S.editId === "new") return S.newBlock;
  const day = dayFor(S.viewWd);
  return day.block.find(b => b.id === S.editId);
}

function readEditor() {
  const title = document.getElementById("ed-title").value.trim();
  const items = [...document.querySelectorAll("#ed-items .itmtxt")].map(i => ({ id: i.dataset.id ? +i.dataset.id : null, text: i.value.trim() })).filter(i => i.text);
  const wsel = document.getElementById("ed-workout");
  return { time: document.getElementById("ed-time").value, title, tag: tagFromTitle(title), workout: wsel ? wsel.value : "", items };
}

async function onSaveEditor() {
  const block = currentEditBlock(); if (!block) return;
  const vals = readEditor();
  if (!vals.title) { alert("Give the block a title."); return; }
  const scope = document.querySelector("#ed-scope .copt.on")?.dataset.scope || (block.__new ? "wd" : (S.viewWd === TODAY_WD ? "today" : "wd"));
  S.editId = null; S.newBlock = null; S.render();
  await applyScope(block, vals, scope);
  await reloadAndRender();
}

async function onDeleteBlock() {
  const block = currentEditBlock(); if (!block) return;
  if (!confirm("Delete this block?")) return;
  await deleteBlockCascade(block.id);
  S.editId = null; await reloadAndRender();
}

function addBlock() {
  S.newBlock = { __new: true, time: "12:00", title: "", tag: "work", detail: "", workout: null, checklist_item: [] };
  S.editId = "new"; S.render();
}

/* ── profile ──────────────────────────────────────────── */

async function onSaveProfile() {
  const equip = document.getElementById("pf-equip").value.trim();
  const con = document.getElementById("pf-con").value.trim();
  const sports = document.getElementById("pf-sports").value.trim();
  const level = document.getElementById("pf-level").value.trim();
  await save(sb.from("person").update({ equipment: equip, constraints: con, sports, level }).eq("id", S.DATA.person.id));
  const goals = [...document.querySelectorAll("#pf-goals .goaltxt")].map(i => ({ id: i.dataset.id ? +i.dataset.id : null, text: i.value.trim() })).filter(g => g.text);
  const keptIds = new Set(goals.filter(g => g.id).map(g => g.id));
  for (const ex of S.DATA.goals) { if (!keptIds.has(ex.id)) await save(sb.from("goal").delete().eq("id", ex.id)); }
  let sort = 0; for (const g of goals) { if (g.id) await save(sb.from("goal").update({ text: g.text, sort }).eq("id", g.id)); else await save(sb.from("goal").insert({ person_id: S.DATA.person.id, text: g.text, sort })); sort++; }
  await reloadAndRender();
}

export function renderProfile() {
  const p = S.DATA.person;
  const goals = S.DATA.goals;
  let h = `<div class="screen-top"><div class="hi">You</div></div>`;
  h += `<div class="field"><label>Equipment &amp; weights you have</label>
    <textarea class="inp" id="pf-equip" rows="3" placeholder="e.g. dumbbells 5/7.5/10kg, resistance bands, Bosu, yoga mat">${esc(p.equipment)}</textarea></div>`;
  h += `<div class="field"><label>Sports &amp; activities</label>
    <textarea class="inp" id="pf-sports" rows="2" placeholder="e.g. badminton; also tennis, running">${esc(p.sports)}</textarea></div>`;
  h += `<div class="field"><label>Training level / experience</label>
    <textarea class="inp" id="pf-level" rows="2" placeholder="e.g. train ~2x/week, comfy with bodyweight, newer to weights">${esc(p.level)}</textarea></div>`;
  h += `<div class="field"><label>Injuries / things to work around</label>
    <textarea class="inp" id="pf-con" rows="2" placeholder="e.g. gastritis, sensitive left knee">${esc(p.constraints)}</textarea></div>`;
  const goalsHtml = goals.map(g =>
    `<div class="itemed"><input class="inp goaltxt" data-id="${g.id}" value="${esc(g.text)}"><button class="xbtn" data-rmgoal="${g.id}">✕</button></div>`).join("");
  h += `<div class="field"><label>Fitness goals</label>
    <div class="hint">Write these however you like — e.g. "even out my weaker left side, especially shoulders &amp; legs."</div>
    <div id="pf-goals">${goalsHtml}</div>
    <button class="linkbtn" id="pf-addgoal">+ Add goal</button></div>`;
  h += `<div class="edbtns"><button class="btn primary" id="pf-save">Save</button></div>`;
  h += `<div class="foot">Your profile helps the coach give better advice.</div>`;
  document.getElementById("wrap").innerHTML = h;
  wireProfile();
}

function wireProfile() {
  document.getElementById("pf-addgoal").onclick = () => {
    const box = document.getElementById("pf-goals");
    const d = document.createElement("div"); d.className = "itemed";
    d.innerHTML = `<input class="inp goaltxt" data-id="" value=""><button class="xbtn">✕</button>`;
    d.querySelector(".xbtn").onclick = () => d.remove(); box.appendChild(d); d.querySelector("input").focus();
  };
  document.querySelectorAll("#pf-goals .xbtn").forEach(x => x.onclick = () => x.closest(".itemed").remove());
  document.getElementById("pf-save").onclick = onSaveProfile;
}

/* ── main render ──────────────────────────────────────── */

export function renderPlan() {
  const day = dayFor(S.viewWd);
  const blocks = orderedBlocks(day);
  const cur = currentIdx(blocks);
  const isToday = S.viewWd === TODAY_WD;
  let done = 0; blocks.forEach(b => { if (S.BDONE[b.id]) done++; });
  const total = blocks.length;

  let h = dayStripHtml();

  if (isToday) {
    const dateStr = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    h += `<div class="today-hdr"><div><div class="today-eyebrow">${dateStr}</div><div class="today-h1">Your day</div></div>`
      + `<div class="hdr-right"><button class="btn-icon ${(remOn() && anyNotify()) ? "active" : ""}" id="remBtn" aria-label="Reminders">${BELL}</button>${ringHtml(done, total)}</div></div>`;
  } else {
    h += `<div class="today-hdr"><div><div class="today-eyebrow">${DAYFULL[S.viewWd]}</div><div class="today-h1">${esc(day.label || day.chip || DAYFULL[S.viewWd])}</div></div></div>`;
  }

  const past = (isToday && cur >= 0) ? blocks.slice(0, cur) : [];
  const current = (isToday && cur >= 0) ? blocks[cur] : null;
  const future = (isToday && cur >= 0) ? blocks.slice(cur + 1) : blocks;

  if (past.length > 0) {
    const pastDone = past.filter(b => S.BDONE[b.id]).length;
    const pastSkipped = past.length - pastDone;
    h += `<div class="fold-row" id="foldPast"><span class="fold-done">✓ ${pastDone} done</span>`;
    if (pastSkipped > 0) h += ` · ${pastSkipped} skipped`;
    h += `<span class="fold-arrow">${S.showPast ? "Hide ▾" : "Show ▸"}</span></div>`;
    if (S.showPast) {
      past.forEach(b => {
        if (S.editId === b.id) { h += blockEditor(b); return; }
        h += blockRow(b);
      });
    }
  }

  if (current && S.editId !== current.id) {
    h += nowCardHtml(current, cur, total);
  } else if (current && S.editId === current.id) {
    h += blockEditor(current);
  }

  if (future.length > 0 && isToday && cur >= 0) {
    h += `<div class="sec">Coming up</div>`;
  }

  future.forEach(b => {
    if (S.editId === b.id) { h += blockEditor(b); return; }
    h += blockRow(b);
  });

  if (S.editId === "new" && S.newBlock) { h += blockEditor(S.newBlock); }
  else { h += `<button class="addblock" id="addBlock">+ Add block</button>`; }

  if (S.sheet) h += sheetHtml();

  document.getElementById("wrap").innerHTML = h;
  wire();
}

/* ── wiring ───────────────────────────────────────────── */

function wireEditor() {
  const ed = document.querySelector("[data-edit]"); if (!ed) return;
  const add = document.getElementById("ed-additem"); if (add) add.onclick = () => {
    const box = document.getElementById("ed-items");
    const d = document.createElement("div"); d.className = "itemed";
    d.innerHTML = `<input class="inp itmtxt" data-id="" value=""><button class="xbtn">✕</button>`;
    d.querySelector(".xbtn").onclick = () => d.remove(); box.appendChild(d); d.querySelector("input").focus();
  };
  document.querySelectorAll("#ed-items .xbtn").forEach(x => x.onclick = () => x.closest(".itemed").remove());
  document.querySelectorAll("#ed-scope .copt").forEach(c => c.onclick = () => { document.querySelectorAll("#ed-scope .copt").forEach(x => x.classList.remove("on")); c.classList.add("on"); });
  document.getElementById("ed-cancel").onclick = () => { S.editId = null; S.newBlock = null; S.render(); };
  document.getElementById("ed-save").onclick = onSaveEditor;
  const del = document.getElementById("ed-delete"); if (del) del.onclick = onDeleteBlock;
}

function wireSheet() {
  if (S.sheet.type === "apply") {
    document.getElementById("apply-cancel").onclick = () => { S.sheet = null; S.render(); };
    document.querySelectorAll("[data-scope]").forEach(el => el.onclick = async () => {
      const scope = el.dataset.scope; const s = S.sheet; const b = currentEditBlock();
      S.sheet = null; S.editId = null; S.newBlock = null; S.render();
      await applyScope(b, s.vals, scope); await reloadAndRender();
    });
  }
  if (S.sheet.type === "reminders") {
    const en = document.getElementById("rem-enable"); if (en) en.onclick = async () => { await enableReminders(); S.sheet = { type: "reminders" }; S.render(); };
    const on = document.getElementById("rem-allon"); if (on) on.onclick = () => allReminders(true);
    const off = document.getElementById("rem-alloff"); if (off) off.onclick = () => allReminders(false);
    document.getElementById("rem-close").onclick = () => { S.sheet = null; S.render(); };
  }
}

function wire() {
  document.querySelectorAll(".day-pill").forEach(el => el.onclick = () => { S.viewWd = +el.dataset.wd; S.openId = null; S.editId = null; S.newBlock = null; S.showPast = false; S.render(); });
  const rb = document.getElementById("remBtn"); if (rb) rb.onclick = () => { S.sheet = { type: "reminders" }; S.render(); };
  const fp = document.getElementById("foldPast"); if (fp) fp.onclick = () => { S.showPast = !S.showPast; S.render(); };

  document.querySelectorAll("[data-open]").forEach(el => el.onclick = () => { const id = +el.dataset.open; S.openId = (S.openId === id ? null : id); S.render(); });
  document.querySelectorAll("[data-check]").forEach(el => el.onclick = (ev) => { ev.stopPropagation(); toggleItem(+el.dataset.check); });
  document.querySelectorAll("[data-exdone]").forEach(el => el.onclick = (ev) => { ev.stopPropagation(); toggleExercise(+el.dataset.exdone); });
  document.querySelectorAll("[data-feel]").forEach(el => el.onclick = (ev) => { ev.stopPropagation(); setFeel(+el.dataset.feel, el.dataset.feelv); });
  document.querySelectorAll("[data-resume]").forEach(el => el.onclick = (ev) => { ev.stopPropagation(); resumeExercise(+el.dataset.resume); });
  document.querySelectorAll("[data-done]").forEach(el => el.onclick = (ev) => { ev.stopPropagation(); markBlockDone(+el.dataset.done); });
  document.querySelectorAll("[data-notify]").forEach(el => el.onclick = (ev) => { ev.stopPropagation(); toggleNotify(+el.dataset.notify); });
  document.querySelectorAll("[data-editblock]").forEach(el => el.onclick = (ev) => { ev.stopPropagation(); S.editId = +el.dataset.editblock; S.openId = null; S.render(); });
  const ab = document.getElementById("addBlock"); if (ab) ab.onclick = addBlock;
  if (S.editId !== null) wireEditor();
  if (S.sheet) wireSheet();
}
