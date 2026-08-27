import { S, DAYNAMES, DAYFULL } from "./state.js";
import { esc } from "./util.js";
import {
  dayFor, workoutByCode, reloadAndRender, sb, deleteBlockCascade
} from "./db.js";

function shortName(w) { const n = w.name || ("Routine " + w.code); return n.split("—")[0].split("-")[0].trim() || n; }
function daysForRoutine(code) { return S.DATA.days.filter(d => d.block.some(b => b.workout === code)).map(d => d.weekday).sort((a, b) => a - b); }
function firstWorkoutBlock(code) { for (const d of S.DATA.days) { const b = d.block.find(x => x.workout === code); if (b) return b; } return null; }

export function renderHub() {
  let h = `<div class="screen-top"><button class="backb" id="hubBack">‹</button><div class="hi">Workouts</div><button class="coachlink" id="coachBtn">✨ Ask the coach</button></div>`;
  S.DATA.workouts.forEach(w => {
    const wds = daysForRoutine(w.code);
    const days = wds.length ? wds.map(d => DAYNAMES[d]).join(", ") : "Not scheduled";
    const foc = w.focus || "strength";
    h += `<div class="rcard" data-routine="${w.code}"><div class="rn">${esc(w.name || ('Routine ' + w.code))}</div>`
      + `<div class="rm"><span class="fchip ${foc}">${esc(foc)}</span><span>${days}</span><span>· ${w.exercise.length} moves</span></div><span class="rchev">›</span></div>`;
  });
  h += `<button class="dash" id="newRoutine">+ New routine</button>`;
  h += `<div class="foot">Pick the days a routine runs — its workout block lands on your schedule automatically.</div>`;
  document.getElementById("wrap").innerHTML = h;
  document.getElementById("hubBack").onclick = () => { S.view = "plan"; S.render(); };
  document.getElementById("coachBtn").onclick = () => { S.view = "coach"; S.coachData = null; S.coachBusy = false; S.coachApplied = false; S.render(); };
  document.getElementById("newRoutine").onclick = newRoutine;
  document.querySelectorAll("[data-routine]").forEach(el => el.onclick = () => { S.routeCode = el.dataset.routine; S.exEditId = null; S.exNew = null; S.view = "routine"; S.render(); });
}

async function newRoutine() {
  const code = "R" + Date.now().toString(36).slice(-4);
  await sb.from("workout").insert({ person_id: S.DATA.person.id, code, name: "New routine", focus: "strength" });
  await reloadAndRender();
  S.routeCode = code; S.exEditId = null; S.exNew = null; S.view = "routine"; S.render();
}

function exEditor(e) {
  const sec = e.section || "main";
  return `<div class="ed" data-exedit="${e.id || 'new'}">
    <div class="field"><label>Exercise</label><input class="inp" id="ex-name" value="${esc(e.name || '')}"></div>
    <div class="field"><label>Sets / reps (text)</label><input class="inp" id="ex-scheme" value="${esc(e.scheme || '')}" placeholder="e.g. 3 × 10 / side"></div>
    <div class="field"><label>Section</label><div class="chips" id="ex-secs">${[["warmup", "Warm-up"], ["main", "Main"], ["cooldown", "Cooldown"]].map(([k, l]) => `<div class="copt ${sec === k ? 'on' : ''}" data-exsec="${k}">${l}</div>`).join("")}</div></div>
    <div class="field"><label>Cue (optional)</label><input class="inp" id="ex-cue" value="${esc(e.cue || '')}" placeholder="a short form reminder"></div>
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
      h += `<div class="exrow" data-ex="${e.id}"><span class="en">${esc(e.name)}${e.paused ? `<span style="color:var(--dim);font-weight:600"> · paused</span>` : ''}</span>${e.scheme ? `<span class="es">${esc(e.scheme)}</span>` : ''}</div>`;
    });
    if (S.exEditId === "new" && S.exNew && S.exNew.section === secKey) { h += exEditor(S.exNew); }
    h += `<button class="linkbtn" data-addex="${secKey}">+ Add exercise</button>`;
  });
  h += `<div class="foot">Tap an exercise to edit it. Set/rep counts are a guide — the coach will fine-tune them later.</div>`;
  document.getElementById("wrap").innerHTML = h;

  document.getElementById("rBack").onclick = async () => { await saveRoutineName(); S.exEditId = null; S.exNew = null; S.view = "hub"; await reloadAndRender(); };
  const nm = document.getElementById("r-name"); if (nm) nm.onchange = saveRoutineName;
  document.querySelectorAll("[data-focus]").forEach(el => el.onclick = async () => { await sb.from("workout").update({ focus: el.dataset.focus }).eq("id", w.id); await reloadAndRender(); });
  document.querySelectorAll("[data-day]").forEach(el => el.onclick = () => toggleRoutineDay(+el.dataset.day));
  document.querySelectorAll("[data-daytime]").forEach(el => el.onchange = () => updateRoutineDayTime(+el.dataset.daytime, el.value));
  document.querySelectorAll("[data-ex]").forEach(el => el.onclick = () => { S.exEditId = +el.dataset.ex; S.exNew = null; S.render(); });
  document.querySelectorAll("[data-addex]").forEach(el => el.onclick = () => { S.exNew = { section: el.dataset.addex, name: "", scheme: "", cue: "", __new: true }; S.exEditId = "new"; S.render(); });
  if (S.exEditId !== null) wireExEditor();
}

async function saveRoutineName() {
  const nm = document.getElementById("r-name"); if (!nm) return;
  const v = nm.value.trim(); const w = workoutByCode(S.routeCode);
  if (w && v && v !== w.name) { await sb.from("workout").update({ name: v }).eq("id", w.id); w.name = v; }
}

async function toggleRoutineDay(wd) {
  const w = workoutByCode(S.routeCode); const day = dayFor(wd);
  const has = day.block.find(b => b.workout === w.code);
  if (has) { await deleteBlockCascade(has.id); }
  else {
    const t = (firstWorkoutBlock(w.code)?.time) || "17:00";
    await sb.from("block").insert({ day_id: day.id, sort: 99, time: t, title: shortName(w), tag: "play", detail: "", workout: w.code, notify: false });
  }
  await reloadAndRender();
}

async function updateRoutineDayTime(wd, timeVal) {
  const w = workoutByCode(S.routeCode); const b = dayFor(wd).block.find(x => x.workout === w.code);
  if (b && timeVal) { await sb.from("block").update({ time: timeVal }).eq("id", b.id); b.time = timeVal; }
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
  const section = document.querySelector("#ex-secs .copt.on")?.dataset.exsec || "main";
  if (S.exEditId === "new") { await sb.from("exercise").insert({ workout_id: w.id, name, scheme, cue, section, sort: w.exercise.length }); }
  else { await sb.from("exercise").update({ name, scheme, cue, section }).eq("id", S.exEditId); }
  S.exEditId = null; S.exNew = null; await reloadAndRender();
}

async function onDeleteExercise() {
  if (!confirm("Delete this exercise?")) return;
  await sb.from("exercise").delete().eq("id", S.exEditId);
  S.exEditId = null; S.exNew = null; await reloadAndRender();
}
