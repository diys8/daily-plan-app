import { S, DAYNAMES, DAYFULL, SUPA_URL } from "./state.js";
import { esc, fmt, slugify, daysBetween } from "./util.js";
import {
  dayFor, workoutByCode, findBlock, reloadAndRender, sb, save, deleteBlockCascade,
  toggleExercise, setFeel, ensureSession, finishSession, markBlockDone, setSessionFeel,
  demoMode, demoSrc
} from "./db.js";

function shortName(w) { const n = w.name || ("Routine " + w.code); return n.split("—")[0].split("-")[0].trim() || n; }
function daysForRoutine(code) { return S.DATA.days.filter(d => d.block.some(b => b.workout === code)).map(d => d.weekday).sort((a, b) => a - b); }
function firstWorkoutBlock(code) { for (const d of S.DATA.days) { const b = d.block.find(x => x.workout === code); if (b) return b; } return null; }

export function renderHub() {
  let h = `<div class="screen-top"><div class="hi">Train</div></div>`;
  S.DATA.workouts.forEach(w => {
    const wds = daysForRoutine(w.code);
    const days = wds.length ? wds.map(d => DAYNAMES[d]).join(", ") : "Not scheduled";
    const foc = w.focus || "strength";
    const last = S.RECENT_SESSIONS[w.id];
    let lastStr = "Never run";
    if (last) {
      const ago = daysBetween(last.on_date, S.todayDate);
      if (ago === 0) lastStr = "Today";
      else if (ago === 1) lastStr = "Yesterday";
      else lastStr = ago + " days ago";
      if (last.feel) lastStr += " · felt " + last.feel;
    }
    h += `<div class="rcard" data-routine="${w.code}"><div class="rn">${esc(w.name || ('Routine ' + w.code))}</div>`
      + `<div class="rm"><span class="fchip ${foc}">${esc(foc)}</span><span>${days}</span><span>· ${w.exercise.length} moves</span></div>`
      + `<div class="rlast">${esc(lastStr)}</div><span class="rchev">›</span></div>`;
  });

  const weekOrder = [1, 2, 3, 4, 5, 6, 0];
  const thisWeek = [];
  weekOrder.forEach(wd => {
    S.DATA.workouts.forEach(w => {
      if (daysForRoutine(w.code).includes(wd)) thisWeek.push({ wd, name: w.name || ("Routine " + w.code) });
    });
  });
  if (thisWeek.length > 0) {
    h += `<div class="sec">This week</div>`;
    thisWeek.forEach(t => {
      h += `<div class="tw-row"><span class="tw-day">${DAYNAMES[t.wd]}</span><span>${esc(t.name)}</span></div>`;
    });
  }

  h += `<button class="dash" id="newRoutine">+ New routine</button>`;
  h += `<div class="foot">Pick the days a routine runs — its workout block lands on your schedule automatically.</div>`;
  document.getElementById("wrap").innerHTML = h;
  document.getElementById("newRoutine").onclick = newRoutine;
  document.querySelectorAll("[data-routine]").forEach(el => el.onclick = () => { S.routeCode = el.dataset.routine; S.exEditId = null; S.exNew = null; S.view = "routine"; S.render(); });
}

async function newRoutine() {
  const code = "R" + Date.now().toString(36).slice(-4);
  await save(sb.from("workout").insert({ person_id: S.DATA.person.id, code, name: "New routine", focus: "strength" }));
  await reloadAndRender();
  S.routeCode = code; S.exEditId = null; S.exNew = null; S.view = "routine"; S.render();
}

function exEditor(e) {
  const sec = e.section || "main";
  return `<div class="ed" data-exedit="${e.id || 'new'}">
    <div class="field"><label>Exercise</label><input class="inp" id="ex-name" value="${esc(e.name || '')}"></div>
    <div class="field"><label>Sets / reps (text)</label><input class="inp" id="ex-scheme" value="${esc(e.scheme || '')}" placeholder="e.g. 3 × 10 / side"></div>
    <div class="field"><label>Section</label><div class="chips" id="ex-secs">${[["warmup", "Warm-up"], ["main", "Main"], ["cooldown", "Cooldown"]].map(([k, l]) => `<div class="copt ${sec === k ? 'on' : ''}" data-exsec="${k}">${l}</div>`).join("")}</div></div>
    <div class="field"><label>Cue</label><input class="inp" id="ex-cue" value="${esc(e.cue || '')}" placeholder="a short form reminder"></div>
    <div class="edbtns"><button class="btn primary" id="ex-save">Save</button><button class="btn ghost" id="ex-cancel">Cancel</button>${e.__new ? '' : '<button class="btn danger" id="ex-del">Delete</button>'}</div>
  </div>`;
}

export function renderRoutine() {
  const w = workoutByCode(S.routeCode);
  if (!w) { S.view = "hub"; S.render(); return; }
  const foc = w.focus || "strength";
  const runWds = daysForRoutine(w.code);
  let h = `<div class="screen-top"><button class="backb" id="rBack">‹</button><input class="inp" id="r-name" value="${esc(w.name || '')}" style="flex:1;font-weight:700;font-size:16px"></div>`;
  h += `<div class="chips" style="margin:0 2px 6px">${["strength", "cardio", "mobility"].map(f => `<div class="copt ${f === foc ? 'on' : ''}" data-focus="${f}">${f}</div>`).join("")}</div>`;
  h += `<div class="sec">Runs on</div>`;
  h += `<div class="drow">`;
  [1, 2, 3, 4, 5, 6, 0].forEach(wd => { const on = runWds.includes(wd); h += `<div class="dpill ${on ? 'on' : ''}" data-day="${wd}">${DAYNAMES[wd][0]}</div>`; });
  h += `</div>`;
  if (runWds.length) {
    h += `<div style="margin:8px 2px 0">`;
    runWds.forEach(wd => { const b = dayFor(wd).block.find(x => x.workout === w.code); h += `<div class="dtrow"><span>${DAYFULL[wd]}</span><input class="inp" type="time" data-daytime="${wd}" value="${b ? b.time : '17:00'}"></div>`; });
    h += `</div>`;
  } else {
    h += `<div class="hint" style="margin:8px 2px 0">Tap a day to schedule this routine — you can set a different time for each.</div>`;
  }
  ["warmup", "main", "cooldown"].forEach(secKey => {
    const label = { warmup: "Warm-up", main: "Main", cooldown: "Cooldown / stretch" }[secKey];
    const exs = w.exercise.filter(e => (e.section || "main") === secKey);
    h += `<div class="sec">${label}</div>`;
    exs.forEach(e => {
      if (S.exEditId === e.id) { h += exEditor(e); return; }
      h += `<div class="exrow ${e.paused ? "paused" : ""}" data-ex="${e.id}" data-exsec="${secKey}"><span class="grip" data-grip="${e.id}">⋮⋮</span><span class="en">${esc(e.name)}${e.paused ? `<span style="color:var(--dim);font-weight:600"> · paused</span>` : ''}</span>${e.scheme ? `<span class="es">${esc(e.scheme)}</span>` : ''}</div>`;
    });
    if (S.exEditId === "new" && S.exNew && S.exNew.section === secKey) { h += exEditor(S.exNew); }
    h += `<button class="linkbtn" data-addex="${secKey}" style="color:var(--dim)">+ Add exercise</button>`;
  });
  h += `<div class="foot">Tap an exercise to edit it. Set/rep counts are a guide — the coach will fine-tune them later.</div>`;
  document.getElementById("wrap").innerHTML = h;

  document.getElementById("rBack").onclick = async () => { await saveRoutineName(); S.exEditId = null; S.exNew = null; S.view = "hub"; await reloadAndRender(); };
  const nm = document.getElementById("r-name"); if (nm) nm.onchange = saveRoutineName;
  document.querySelectorAll("[data-focus]").forEach(el => el.onclick = async () => { await save(sb.from("workout").update({ focus: el.dataset.focus }).eq("id", w.id)); await reloadAndRender(); });
  document.querySelectorAll("[data-day]").forEach(el => el.onclick = () => toggleRoutineDay(+el.dataset.day));
  document.querySelectorAll("[data-daytime]").forEach(el => el.onchange = () => updateRoutineDayTime(+el.dataset.daytime, el.value));
  document.querySelectorAll("[data-ex]").forEach(el => el.onclick = () => { S.exEditId = +el.dataset.ex; S.exNew = null; S.render(); });
  document.querySelectorAll("[data-addex]").forEach(el => el.onclick = () => { S.exNew = { section: el.dataset.addex, name: "", scheme: "", cue: "", __new: true }; S.exEditId = "new"; S.render(); });
  if (S.exEditId !== null) wireExEditor();
  setupDrag(w);
}

async function saveRoutineName() {
  const nm = document.getElementById("r-name"); if (!nm) return;
  const v = nm.value.trim(); const w = workoutByCode(S.routeCode);
  if (w && v && v !== w.name) {
    await save(sb.from("workout").update({ name: v }).eq("id", w.id));
    w.name = v;
    for (const d of S.DATA.days) {
      const b = d.block.find(x => x.workout === w.code);
      if (b) await save(sb.from("block").update({ title: shortName(w) }).eq("id", b.id));
    }
  }
}

async function toggleRoutineDay(wd) {
  const w = workoutByCode(S.routeCode); const day = dayFor(wd);
  const has = day.block.find(b => b.workout === w.code);
  if (has) {
    const { count } = await sb.from("block_done").select("*", { count: "exact", head: true }).eq("block_id", has.id);
    if (count > 0 && !confirm("This day has logged workout data. Remove it from " + DAYFULL[wd] + "?")) return;
    await deleteBlockCascade(has.id);
  } else {
    const t = (firstWorkoutBlock(w.code)?.time) || "17:00";
    await save(sb.from("block").insert({ day_id: day.id, sort: 99, time: t, title: shortName(w), tag: "play", detail: "", workout: w.code, notify: false }));
  }
  await reloadAndRender();
}

async function updateRoutineDayTime(wd, timeVal) {
  const w = workoutByCode(S.routeCode); const b = dayFor(wd).block.find(x => x.workout === w.code);
  if (b && timeVal) { await save(sb.from("block").update({ time: timeVal }).eq("id", b.id)); b.time = timeVal; }
}

function wireExEditor() {
  document.querySelectorAll("#ex-secs .copt").forEach(c => c.onclick = () => { document.querySelectorAll("#ex-secs .copt").forEach(x => x.classList.remove("on")); c.classList.add("on"); });
  document.getElementById("ex-cancel").onclick = () => { S.exEditId = null; S.exNew = null; S.render(); };
  document.getElementById("ex-save").onclick = onSaveExercise;
  const d = document.getElementById("ex-del"); if (d) d.onclick = onDeleteExercise;
}

async function onSaveExercise() {
  const w = workoutByCode(S.routeCode);
  const name = document.getElementById("ex-name").value.trim();
  if (!name) { alert("Name the exercise."); return; }
  const scheme = document.getElementById("ex-scheme").value.trim();
  const cue = document.getElementById("ex-cue").value.trim();
  if (!cue) { alert("Add a cue — it shows when there's no illustration."); return; }
  const section = document.querySelector("#ex-secs .copt.on")?.dataset.exsec || "main";
  if (S.exEditId === "new") { await save(sb.from("exercise").insert({ workout_id: w.id, name, scheme, cue, section, sort: w.exercise.length, demo_slug: slugify(name) })); }
  else { await save(sb.from("exercise").update({ name, scheme, cue, section }).eq("id", S.exEditId)); }
  S.exEditId = null; S.exNew = null; await reloadAndRender();
}

async function onDeleteExercise() {
  if (!confirm("Delete this exercise?")) return;
  await save(sb.from("exercise").delete().eq("id", S.exEditId));
  S.exEditId = null; S.exNew = null; await reloadAndRender();
}

/* ── drag reorder ────────────────────────────────────── */

function setupDrag(w) {
  let dragEl = null, startY = 0, secKey = null;
  document.querySelectorAll("[data-grip]").forEach(grip => {
    grip.onclick = (ev) => ev.stopPropagation();
    grip.onpointerdown = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      dragEl = grip.closest("[data-ex]");
      if (!dragEl) return;
      secKey = dragEl.dataset.exsec;
      startY = ev.clientY;
      dragEl.classList.add("dragging");
      grip.setPointerCapture(ev.pointerId);
    };
    grip.onpointermove = (ev) => {
      if (!dragEl) return;
      const dy = ev.clientY - startY;
      const rh = dragEl.offsetHeight;
      if (Math.abs(dy) < rh * 0.6) return;
      const dir = dy > 0 ? 1 : -1;
      const siblings = [...document.querySelectorAll(`[data-exsec="${secKey}"]`)];
      const idx = siblings.indexOf(dragEl);
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= siblings.length) return;
      if (dir > 0) siblings[swapIdx].after(dragEl);
      else siblings[swapIdx].before(dragEl);
      startY = ev.clientY;
    };
    grip.onpointerup = async (ev) => {
      if (!dragEl) return;
      dragEl.classList.remove("dragging");
      dragEl = null;
      const rows = [...document.querySelectorAll(`[data-exsec="${secKey}"]`)];
      for (let i = 0; i < rows.length; i++) {
        const eid = +rows[i].dataset.ex;
        const ex = w.exercise.find(e => e.id === eid);
        if (ex && ex.sort !== i) {
          ex.sort = i;
          await save(sb.from("exercise").update({ sort: i }).eq("id", eid));
        }
      }
      secKey = null;
    };
  });
}

/* ── workout session view ────────────────────────────── */

export function renderWorkout() {
  const block = findBlock(S.workoutBlockId);
  if (!block || !block.workout) { S.view = "plan"; S.render(); return; }
  const w = workoutByCode(block.workout);
  if (!w) { S.view = "plan"; S.render(); return; }

  const sess = S.SESSIONS[w.id];
  if (sess && sess.finished_at) { S.view = "recap"; S.render(); return; }

  const isToday = S.viewWd === S.todayWd;
  const active = w.exercise.filter(e => !e.paused);
  const paused = w.exercise.filter(e => e.paused);
  const total = active.length;
  const doneCount = active.filter(e => S.LOGS[e.id]?.done).length;

  let h = `<div class="screen-top"><button class="backb" id="wkBack">‹</button>`
    + `<span class="wk-name">${esc(w.name || "Workout")}</span>`
    + `<button class="btn ghost" id="wkEdit">Edit</button></div>`;

  if (total > 0) {
    h += `<div class="wk-progress">`;
    active.forEach(e => { h += `<div class="wk-seg ${S.LOGS[e.id]?.done ? "done" : ""}"></div>`; });
    h += `</div><div class="wk-count">${doneCount} of ${total} done</div>`;
  }

  const sections = ["warmup", "main", "cooldown"];
  const secLabel = { warmup: "Warm-up", main: "Main", cooldown: "Cooldown" };

  sections.forEach(secKey => {
    const secActive = active.filter(e => (e.section || "main") === secKey);
    const secPaused = paused.filter(e => (e.section || "main") === secKey);
    if (secActive.length === 0 && secPaused.length === 0) return;

    const secDone = secActive.filter(e => S.LOGS[e.id]?.done).length;
    h += `<div class="wk-sec-hdr">${secLabel[secKey]} <span class="wk-sec-count">${secDone}/${secActive.length}</span></div>`;

    secActive.forEach(e => {
      const lg = S.LOGS[e.id] || { done: false, feel: "" };

      if (S.workoutExOpen === e.id) {
        h += `<div class="wk-card" data-wkex="${e.id}">`;
        const dm = demoMode(e.demo_slug);
        if (dm === "animate") {
          h += `<div class="demo-plate demo-anim">`
            + `<img class="f0" src="${demoSrc(e.demo_slug, "_0.png")}" alt="" onerror="this.style.display='none'">`
            + `<img class="f1" src="${demoSrc(e.demo_slug, "_1.png")}" alt="" onerror="this.parentNode.classList.add('no-f1')">`
            + `</div>`;
        } else if (dm === "static") {
          const sfx = S.DEMO_SET.has(e.demo_slug + "_0.png") ? "_0.png" : ".png";
          h += `<div class="demo-plate"><img src="${demoSrc(e.demo_slug, sfx)}" alt="" onerror="this.style.display='none'"></div>`;
        }
        h += `<div class="wk-card-name">${esc(e.name)}</div>`;
        if (e.scheme) h += `<div class="wk-card-scheme">${esc(e.scheme)}</div>`;
        if (e.cue) h += `<div class="wk-card-cue">${esc(e.cue)}</div>`;
        if (dm === "none") h += `<button class="btn ghost demo-req" data-reqdem="1">Request a demo</button>`;
        if (e.breathing) h += `<div class="wk-card-breath"><span>Breathing</span> ${esc(e.breathing)}</div>`;
        if (isToday) {
          h += `<div class="chips" style="margin:10px 0">`
            + `<div class="copt ${lg.feel === "easy" ? "on" : ""}" data-feel="${e.id}" data-feelv="easy">Too easy</div>`
            + `<div class="copt ${lg.feel === "right" ? "on" : ""}" data-feel="${e.id}" data-feelv="right">Just right</div>`
            + `<div class="copt ${lg.feel === "hard" ? "on" : ""}" data-feel="${e.id}" data-feelv="hard">Too hard</div></div>`;
          h += `<button class="btn ${lg.done ? "ghost" : "primary"}" data-exdone="${e.id}">${lg.done ? "Done ✓" : "Mark done"}</button>`;
        }
        h += `</div>`;
      } else {
        h += `<div class="wk-row ${lg.done ? "done" : ""}" data-wkex="${e.id}">`
          + `<span class="wk-dot ${lg.done ? "done" : ""}"></span>`
          + `<span class="wk-row-name">${esc(e.name)}</span>`
          + (e.scheme ? `<span class="wk-row-scheme">${esc(e.scheme)}</span>` : "")
          + `</div>`;
      }
    });

    if (secPaused.length > 0) {
      const reason = secPaused[0].paused_reason || "";
      h += `<div class="wk-paused">${secPaused.length} move${secPaused.length > 1 ? "s" : ""} paused`;
      if (reason) h += ` — ${esc(reason)}`;
      h += ` · <span class="wk-review" data-review="${w.code}">Review</span></div>`;
    }
  });

  if (w.exercise.length === 0) {
    h += `<div class="hint" style="margin:16px 2px">This routine has no exercises yet.</div>`;
    h += `<button class="btn primary" id="wkEdit2">Add exercises</button>`;
  } else if (total === 0 && paused.length > 0) {
    h += `<div class="hint" style="margin:16px 2px">All exercises are paused. Review them in the routine editor.</div>`;
  }

  if (isToday && total > 0) {
    h += `<button class="btn primary wk-finish" id="wkFinish">Finish workout</button>`;
  }

  document.getElementById("wrap").innerHTML = h;
  wireWorkout(w, isToday);
}

function wireWorkout(w, isToday) {
  document.getElementById("wkBack").onclick = () => { S.view = "plan"; S.workoutBlockId = null; S.workoutExOpen = null; S.render(); };
  const editBtn = document.getElementById("wkEdit") || document.getElementById("wkEdit2");
  if (editBtn) editBtn.onclick = () => { S.routeCode = w.code; S.exEditId = null; S.exNew = null; S.view = "routine"; S.render(); };

  document.querySelectorAll("[data-wkex]").forEach(el => el.onclick = () => {
    const id = +el.dataset.wkex;
    S.workoutExOpen = (S.workoutExOpen === id) ? null : id;
    S.render();
  });

  if (isToday) {
    document.querySelectorAll("[data-feel]").forEach(el => el.onclick = (ev) => { ev.stopPropagation(); setFeel(+el.dataset.feel, el.dataset.feelv); });
    document.querySelectorAll("[data-exdone]").forEach(el => el.onclick = async (ev) => {
      ev.stopPropagation();
      await ensureSession(w.id);
      await toggleExercise(+el.dataset.exdone);
      const allActive = w.exercise.filter(e => !e.paused);
      if (allActive.length > 0 && allActive.every(e => S.LOGS[e.id]?.done)) {
        await finishSession(w.id);
        S.view = "recap"; S.workoutExOpen = null;
        if (S.workoutBlockId && !S.BDONE[S.workoutBlockId]) await markBlockDone(S.workoutBlockId);
        else S.render();
      }
    });

    const fin = document.getElementById("wkFinish");
    if (fin) fin.onclick = async () => {
      await ensureSession(w.id);
      await finishSession(w.id);
      S.view = "recap"; S.workoutExOpen = null;
      if (S.workoutBlockId && !S.BDONE[S.workoutBlockId]) await markBlockDone(S.workoutBlockId);
      else S.render();
    };
  }

  document.querySelectorAll("[data-review]").forEach(el => el.onclick = () => { S.routeCode = el.dataset.review; S.exEditId = null; S.exNew = null; S.view = "routine"; S.render(); });
  document.querySelectorAll("[data-reqdem]").forEach(el => el.onclick = (ev) => { ev.stopPropagation(); S.view = "profile"; S.render(); });
}

/* ── recap view ─────────────────────────────────────────── */

function fmtClock(d) {
  return fmt(String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"));
}

export function renderRecap() {
  const block = findBlock(S.workoutBlockId);
  if (!block || !block.workout) { S.view = "plan"; S.render(); return; }
  const w = workoutByCode(block.workout);
  if (!w) { S.view = "plan"; S.render(); return; }
  const sess = S.SESSIONS[w.id];
  if (!sess || !sess.finished_at) { S.view = "workout"; S.render(); return; }

  const active = w.exercise.filter(e => !e.paused);
  const paused = w.exercise.filter(e => e.paused);
  const doneCount = active.filter(e => S.LOGS[e.id]?.done).length;
  const total = active.length;
  const skipped = active.filter(e => !S.LOGS[e.id]?.done);

  let minStr = "—";
  let timeRange = "";
  if (sess.started_at && sess.finished_at) {
    const ms = new Date(sess.finished_at).getTime() - new Date(sess.started_at).getTime();
    if (ms > 0 && !isNaN(ms)) minStr = Math.round(ms / 60000) + " min";
    timeRange = fmtClock(new Date(sess.started_at)) + " → " + fmtClock(new Date(sess.finished_at));
  }

  const dp = (sess.on_date || S.todayDate).split("-");
  const dateStr = new Date(+dp[0], +dp[1] - 1, +dp[2])
    .toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  let h = `<div class="recap">`;
  h += `<div class="recap-head"><div class="recap-name">${esc(w.name || "Workout")}</div><div class="recap-badge">Done ✓</div></div>`;
  h += `<div class="recap-meta">${dateStr}`;
  if (timeRange) h += ` · ${timeRange}`;
  h += `</div>`;

  h += `<div class="recap-stats">`;
  h += `<div class="recap-stat"><span class="recap-val">${minStr}</span></div>`;
  h += `<div class="recap-stat"><span class="recap-val">${doneCount}/${total}</span><span class="recap-lbl">moves</span></div>`;
  h += `<div class="recap-stat"><span class="recap-val">${paused.length}</span><span class="recap-lbl">paused</span></div>`;
  h += `</div>`;

  const secLabel = { warmup: "Warm-up", main: "Main", cooldown: "Cooldown" };
  ["warmup", "main", "cooldown"].forEach(secKey => {
    const secActive = active.filter(e => (e.section || "main") === secKey);
    if (secActive.length === 0) return;
    const secDone = secActive.filter(e => S.LOGS[e.id]?.done).length;
    h += `<div class="recap-sec">${secLabel[secKey]} <span>${secDone}/${secActive.length}</span></div>`;
    secActive.forEach(e => {
      const d = S.LOGS[e.id]?.done;
      h += `<div class="recap-ex"><span class="recap-dot ${d ? "done" : ""}"></span><span>${esc(e.name)}</span>`;
      if (!d) h += `<span class="recap-skip">skipped</span>`;
      h += `</div>`;
    });
  });

  if (skipped.length > 0) {
    h += `<div class="recap-skipped">Skipped: ${skipped.map(e => esc(e.name)).join(", ")}</div>`;
  }

  if (doneCount === 0 && total > 0) {
    h += `<div class="recap-note">Nothing logged this session.</div>`;
  }

  h += `<div class="recap-feel">How did the session go?</div>`;
  h += `<div class="chips recap-feels">`;
  ["easy", "solid", "rough"].forEach(f => {
    h += `<div class="copt ${sess.feel === f ? "on" : ""}" data-sfeel="${f}">${f[0].toUpperCase() + f.slice(1)}</div>`;
  });
  h += `</div>`;

  h += `<div class="recap-foot">Saved as you went.</div>`;
  h += `<button class="btn primary" id="recapBack" style="width:100%">Back to today</button>`;
  h += `</div>`;

  document.getElementById("wrap").innerHTML = h;
  wireRecap(w);
}

function wireRecap(w) {
  document.getElementById("recapBack").onclick = () => {
    S.view = "plan"; S.workoutBlockId = null; S.workoutExOpen = null; S.render();
  };
  document.querySelectorAll("[data-sfeel]").forEach(el => el.onclick = () => {
    setSessionFeel(w.id, el.dataset.sfeel);
  });
}
