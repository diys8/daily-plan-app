import { S, DAYNAMES, DAYFULL, TODAY_WD, BELL, PENCIL } from "./state.js";
import { fmt, esc, tagFromTitle } from "./util.js";
import {
  dayFor, workoutByCode, orderedBlocks, currentIdx,
  toggleItem, toggleExercise, setFeel, resumeExercise, markBlockDone,
  toggleNotify, enableReminders, allReminders, remOn, anyNotify,
  applyScope, reloadAndRender, sb, deleteBlockCascade
} from "./db.js";

function checklistView(b) {
  let h = "";
  b.checklist_item.forEach(ci => {
    const done = !!S.CHECKS[ci.id];
    h += `<div class="li ${done ? 'done' : ''}" data-check="${ci.id}"><span class="box"></span><span>${esc(ci.text)}</span></div>`;
  });
  return h;
}

function movesHtml(code) {
  const w = workoutByCode(code); if (!w) return "";
  const main = w.exercise.filter(e => !e.is_footwork), foot = w.exercise.filter(e => e.is_footwork);
  const logRow = e => {
    const lg = S.LOGS[e.id] || { done: false, feel: "" };
    const chip = (v, label) => `<div class="copt ${lg.feel === v ? 'on' : ''}" data-feel="${e.id}" data-feelv="${v}">${label}</div>`;
    return `<div class="mlog"><div class="li ${lg.done ? 'done' : ''}" data-exdone="${e.id}"><span class="box"></span><span>Done</span></div>`
      + `<div class="chips" style="margin-top:8px">${chip('easy', 'Too easy')}${chip('right', 'Just right')}${chip('hard', 'Too hard')}</div></div>`;
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
      + `<div class="mtag">${e.demo_slug ? "Demo coming in a later step" : "Text guide"}</div>` + logRow(e) + `</div>`;
  };
  let h = main.map(card).join("");
  if (foot.length) h += `<div class="sec">Footwork &amp; agility</div>` + foot.map(card).join("");
  return h;
}

function blockDetail(b) {
  const done = !!S.BDONE[b.id];
  const rem = !!b.notify;
  return `<div class="detail">` + checklistView(b) + (b.workout ? movesHtml(b.workout) : "")
    + `<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">`
    + `<button class="btn ${rem ? 'primary' : 'ghost'}" data-notify="${b.id}">${BELL} ${rem ? 'Reminder on' : 'Remind me'}</button>`
    + `<button class="btn ${done ? 'ghost' : 'primary'}" data-done="${b.id}">${done ? 'Done ✓ · undo' : 'Mark done'}</button>`
    + `<button class="btn ghost" data-editblock="${b.id}" aria-label="Edit block">${PENCIL}</button>`
    + `</div></div>`;
}

function blockEditor(b) {
  const isNew = b.__new;
  const tag = b.tag || "work";
  let items = b.checklist_item.map((ci, ix) =>
    `<div class="itemed"><input class="inp itmtxt" data-id="${ci.id || ''}" value="${esc(ci.text)}"><button class="xbtn" data-rmitem="${ix}">✕</button></div>`).join("");
  return `<div class="ed t-${tag}" data-edit="${b.id}">
    <div class="field"><label>Time</label><input class="inp" id="ed-time" type="time" value="${b.time}"></div>
    <div class="field"><label>Activity</label><input class="inp" id="ed-title" value="${esc(b.title)}"></div>
    <div class="field"><label>Category <span style="color:var(--dim);font-weight:600">(auto)</span></label>
      <div class="chips" id="ed-chips">
        ${["food", "work", "play", "rest"].map(c => `<div class="copt t-${c} ${c === tag ? 'on' : ''}" data-cat="${c}">${c}</div>`).join("")}
      </div></div>
    <div class="field"><label>Workout routine</label>
      <select class="inp" id="ed-workout"><option value="">None</option>${S.DATA.workouts.map(w => `<option value="${w.code}"${b.workout === w.code ? ' selected' : ''}>${esc(w.name || ('Strength ' + w.code))}</option>`).join("")}</select></div>
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
      ${isNew ? '' : '<button class="btn danger" id="ed-delete">Delete</button>'}
    </div></div>`;
}

function sheetHtml() {
  if (S.sheet.type === "apply") {
    const isNew = S.sheet.isNew;
    return `<div class="overlay" id="ov"><div class="sheet">
      <h3>Save "${esc(S.sheet.title)}" to…</h3>
      <div class="hint">at ${fmt(S.sheet.time)}</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${isNew ? '' : `<button class="btn" data-scope="today">Only today</button>`}
        <button class="btn" data-scope="wd">${isNew ? 'Only ' : 'Every '}${DAYFULL[S.viewWd]}</button>
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
      <div class="hint">${remOn() ? ('Notifications are on for this phone. ' + status + ' Turn them on or off for every block at once below, or per-block from inside a block.') : 'Turn on notifications first, then choose which blocks nudge you.'}</div>
      ${remOn() ? '' : `<button class="btn primary" id="rem-enable" style="width:100%;margin-bottom:10px">Turn on notifications</button>`}
      <div class="applybar"><button class="btn ${allOff ? 'primary' : ''}" id="rem-alloff">All off${allOff ? ' ✓' : ''}</button><button class="btn ${allOn ? 'primary' : ''}" id="rem-allon">All on${allOn ? ' ✓' : ''}</button></div>
      <button class="btn ghost" style="width:100%;margin-top:8px" id="rem-close">Close</button>
    </div></div>`;
  }
  if (S.sheet.type === "profile") {
    const p = S.DATA.person;
    const goals = S.DATA.goals.map((g, ix) => `<div class="itemed"><input class="inp goaltxt" data-id="${g.id}" value="${esc(g.text)}"><button class="xbtn" data-rmgoal="${g.id}">✕</button></div>`).join("");
    return `<div class="overlay" id="ov"><div class="sheet">
      <h3>Your profile</h3>
      <div class="field"><label>Equipment &amp; weights you have</label>
        <textarea class="inp" id="pf-equip" rows="3" placeholder="e.g. dumbbells 5/7.5/10kg, resistance bands, Bosu, yoga mat">${esc(p.equipment)}</textarea></div>
      <div class="field"><label>Sports &amp; activities</label>
        <textarea class="inp" id="pf-sports" rows="2" placeholder="e.g. badminton; also tennis, running">${esc(p.sports)}</textarea></div>
      <div class="field"><label>Training level / experience</label>
        <textarea class="inp" id="pf-level" rows="2" placeholder="e.g. train ~2x/week, comfy with bodyweight, newer to weights">${esc(p.level)}</textarea></div>
      <div class="field"><label>Injuries / things to work around</label>
        <textarea class="inp" id="pf-con" rows="2" placeholder="e.g. gastritis, sensitive left knee">${esc(p.constraints)}</textarea></div>
      <div class="field"><label>Fitness goals</label>
        <div class="hint">Write these however you like — e.g. "even out my weaker left side, especially shoulders &amp; legs."</div>
        <div id="pf-goals">${goals}</div>
        <button class="linkbtn" id="pf-addgoal">+ Add goal</button></div>
      <div class="edbtns"><button class="btn primary" id="pf-save">Save</button><button class="btn ghost" id="pf-cancel">Close</button></div>
    </div></div>`;
  }
  return "";
}

function currentEditBlock() {
  if (S.editId === "new") return S.newBlock;
  const day = dayFor(S.viewWd);
  return day.block.find(b => b.id === S.editId);
}

function readEditor() {
  const cat = document.querySelector("#ed-chips .copt.on")?.dataset.cat || "work";
  const items = [...document.querySelectorAll("#ed-items .itmtxt")].map(i => ({ id: i.dataset.id ? +i.dataset.id : null, text: i.value.trim() })).filter(i => i.text);
  const wsel = document.getElementById("ed-workout");
  return { time: document.getElementById("ed-time").value, title: document.getElementById("ed-title").value.trim(), tag: cat, workout: wsel ? wsel.value : "", items };
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

async function onSaveProfile() {
  const equip = document.getElementById("pf-equip").value.trim();
  const con = document.getElementById("pf-con").value.trim();
  const sports = document.getElementById("pf-sports").value.trim();
  const level = document.getElementById("pf-level").value.trim();
  await sb.from("person").update({ equipment: equip, constraints: con, sports, level }).eq("id", S.DATA.person.id);
  const goals = [...document.querySelectorAll("#pf-goals .goaltxt")].map(i => ({ id: i.dataset.id ? +i.dataset.id : null, text: i.value.trim() })).filter(g => g.text);
  const keptIds = new Set(goals.filter(g => g.id).map(g => g.id));
  for (const ex of S.DATA.goals) { if (!keptIds.has(ex.id)) await sb.from("goal").delete().eq("id", ex.id); }
  let sort = 0; for (const g of goals) { if (g.id) await sb.from("goal").update({ text: g.text, sort }).eq("id", g.id); else await sb.from("goal").insert({ person_id: S.DATA.person.id, text: g.text, sort }); sort++; }
  S.sheet = null; await reloadAndRender();
}

function wireEditor() {
  const ed = document.querySelector("[data-edit]"); if (!ed) return;
  document.querySelectorAll("#ed-chips .copt").forEach(c => c.onclick = () => {
    document.querySelectorAll("#ed-chips .copt").forEach(x => x.classList.remove("on"));
    c.classList.add("on"); ed.dataset.cat = c.dataset.cat; ed.className = "ed t-" + c.dataset.cat; ed.dataset.edit = S.editId;
  });
  const title = document.getElementById("ed-title");
  if (title) title.oninput = () => { if (!ed.dataset.cat) { const t = tagFromTitle(title.value); document.querySelectorAll("#ed-chips .copt").forEach(x => x.classList.toggle("on", x.dataset.cat === t)); ed.className = "ed t-" + t; } };
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
  if (S.sheet.type === "profile") {
    document.getElementById("pf-cancel").onclick = () => { S.sheet = null; S.render(); };
    document.getElementById("pf-addgoal").onclick = () => {
      const box = document.getElementById("pf-goals");
      const d = document.createElement("div"); d.className = "itemed";
      d.innerHTML = `<input class="inp goaltxt" data-id="" value=""><button class="xbtn">✕</button>`;
      d.querySelector(".xbtn").onclick = () => d.remove(); box.appendChild(d); d.querySelector("input").focus();
    };
    document.querySelectorAll("#pf-goals .xbtn").forEach(x => x.onclick = () => x.closest(".itemed").remove());
    document.getElementById("pf-save").onclick = onSaveProfile;
  }
}

export function renderPlan() {
  const day = dayFor(S.viewWd);
  const blocks = orderedBlocks(day);
  const cur = currentIdx(blocks);
  let h = "";

  h += `<div class="top"><div class="hi">Hi ${esc(S.DATA.person.name.split(" ")[0])}</div>`
    + `<div class="acts"><button class="iconbtn ${(remOn() && anyNotify()) ? 'act' : ''}" id="remBtn" aria-label="Reminders">${BELL}</button>`
    + `<button class="iconbtn" id="workoutsBtn">Workouts</button><button class="iconbtn" id="profileBtn">Profile</button></div></div>`;
  h += `<div class="chiprow"><div class="chip">${esc(day.chip)}</div></div>`;

  h += `<div class="daybar">`;
  for (let i = 0; i < 7; i++) {
    const wd = (TODAY_WD + i) % 7;
    h += `<div class="daybtn ${wd === S.viewWd ? 'on' : ''}" data-wd="${wd}">${DAYNAMES[wd]}${i === 0 ? ' · today' : ''}</div>`;
  }
  h += `</div>`;

  if (cur >= 0 && S.editId === null) {
    const b = blocks[cur];
    h += `<div class="nowcard t-${b.tag}"><div class="lab"><span class="pulse"></span>Now · ${fmt(b.time)}</div>`
      + `<div class="nt">${esc(b.title)}</div>`
      + (b.detail ? `<div class="nd">${esc(b.detail)}</div>` : "")
      + (b.checklist_item.length ? `<div class="nowchecks" data-cur="1">${checklistView(b)}</div>` : "")
      + `</div>`;
  }

  h += `<div class="sec">${S.viewWd === TODAY_WD ? "Today" : DAYNAMES[S.viewWd]} · ${esc(day.label)}</div>`;

  blocks.forEach((b, i) => {
    if (S.editId === b.id) { h += blockEditor(b); return; }
    const open = b.id === S.openId;
    const dim = (S.viewWd === TODAY_WD && cur >= 0 && !open) ? (i < cur ? ' past' : (i > cur ? ' up' : '')) : '';
    h += `<div class="block t-${b.tag} ${(i === cur) ? 'cur' : ''}${dim}" data-id="${b.id}">`
      + `<div class="row" data-open="${b.id}">`
      + `<span class="time">${fmt(b.time)}</span>`
      + `<span class="bt">${esc(b.title)}${(i === cur) ? '<span class="nowtag">NOW</span>' : ''}</span>`
      + `<span class="meta">${(S.BDONE[b.id]) ? '<span style="color:var(--play);font-weight:800">✓ </span>' : ''}${(b.checklist_item.length ? b.checklist_item.length : '') + (b.workout ? (b.checklist_item.length ? ' · ' : '') + 'workout' : '')}<span class="chev">${open ? '▾' : '▸'}</span></span>`
      + `</div>`
      + (open ? blockDetail(b) : "")
      + `</div>`;
  });

  if (S.editId === "new" && S.newBlock) { h += blockEditor(S.newBlock); }
  else { h += `<button class="addblock" id="addBlock">+ Add block</button>`; }

  h += `<div class="foot">Tap a block to open it — tick items, set a reminder, or edit.</div>`;

  if (S.sheet) { h += sheetHtml(); }

  document.getElementById("wrap").innerHTML = h;
  wire();
}

function wire() {
  document.querySelectorAll(".daybtn").forEach(el => el.onclick = () => { S.viewWd = +el.dataset.wd; S.openId = null; S.editId = null; S.newBlock = null; S.render(); });
  const pb = document.getElementById("profileBtn"); if (pb) pb.onclick = () => { S.sheet = { type: "profile" }; S.render(); };
  const rb = document.getElementById("remBtn"); if (rb) rb.onclick = () => { S.sheet = { type: "reminders" }; S.render(); };
  const wb = document.getElementById("workoutsBtn"); if (wb) wb.onclick = () => { S.view = "hub"; S.render(); };

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
