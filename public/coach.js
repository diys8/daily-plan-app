import { S, SUPA_URL, SUPA_KEY } from "./state.js";
import { esc, slugify } from "./util.js";
import { sb, save, load } from "./db.js";

export function renderCoach() {
  let h = `<div class="screen-top"><div class="hi">Coach</div></div>`;
  h += `<div class="hint" style="margin:0 2px 12px">Ask for advice, or get a weekly progression review. Nothing changes until you approve.</div>`;
  h += `<textarea class="inp" id="coach-input" rows="3" placeholder="e.g. My left side feels weaker — how should I adjust?">${esc(S.coachDraft)}</textarea>`;
  h += `<div class="edbtns"><button class="btn primary" id="coach-ask">Ask the coach</button><button class="btn" id="coach-review">Review my week</button></div>`;

  if (S.coachBusy) {
    h += `<div class="hint" style="margin-top:14px">Thinking…</div>`;
  } else if (S.coachData) {
    if (S.coachData.ok === false) {
      h += `<div class="err" style="padding:16px 2px;text-align:left">${esc(S.coachData.error || "Something went wrong.")}</div>`;
    } else if (S.coachData.paused) {
      h += `<div class="coachbox">${esc(S.coachData.message || "")}</div>`;
    } else {
      if (S.coachData.lite_mode) { h += `<div class="badge">⚡ Lite mode (Haiku)</div>`; }
      else { h += `<div class="badge" style="color:var(--acc);border-color:rgba(242,149,44,.4)">Sonnet</div>`; }
      h += `<div class="coachbox">${esc(S.coachData.text || "")}</div>`;
      const b = S.coachData.budget || {};
      h += `<div class="hint" style="margin-top:10px">This month: $${(+(b.month_spent || 0)).toFixed(2)} of $${(+(b.month_allowance || 0)).toFixed(2)}</div>`;
      const prop = Array.isArray(S.coachData.proposal) ? S.coachData.proposal : [];
      if (prop.length) {
        h += `<div class="sec">Proposed changes</div>`;
        prop.forEach((op, i) => {
          if (op.type === "note") { h += `<div class="coachbox" style="margin-top:8px">${esc(op.text || "")}</div>`; return; }
          let label = "";
          if (op.type === "update_exercise") {
            const f = op.fields || {}; const parts = [];
            if (f.scheme !== undefined) parts.push("scheme → " + esc(f.scheme));
            if (f.load !== undefined) parts.push("load → " + esc(f.load));
            if (f.cue !== undefined) parts.push("cue → " + esc(f.cue));
            label = "Update " + esc(op.name || "") + ": " + parts.join(", ");
          } else if (op.type === "add_exercise") {
            label = "Add to " + esc(op.workout_code || "") + " (" + esc(op.section || "main") + "): " + esc(op.name || "") + " — " + esc(op.scheme || "");
          } else if (op.type === "remove_exercise") {
            label = "Remove " + esc(op.name || "");
          } else if (op.type === "pause_exercise") {
            label = "Pause " + esc(op.name || "") + (op.reason ? " — " + esc(op.reason) : "");
          } else if (op.type === "resume_exercise") {
            label = "Resume " + esc(op.name || "");
          }
          h += `<div class="itemed"><input type="checkbox" class="opck" data-op="${i}" checked><span style="flex:1;font-size:14px">${label}</span></div>`;
        });
        h += `<div class="edbtns"><button class="btn primary" id="coach-apply">Apply selected</button><button class="btn ghost" id="coach-dismiss">Dismiss</button></div>`;
      }
      if (S.coachApplied) {
        h += `<div class="mbr" style="margin-top:12px"><span>Applied ✓</span></div>`;
        h += `<div class="edbtns"><button class="btn primary" id="coach-backhub">Back to Workouts</button></div>`;
      }
    }
  }

  document.getElementById("wrap").innerHTML = h;

  const ta = document.getElementById("coach-input"); if (ta) ta.oninput = () => { S.coachDraft = ta.value; };
  const ask = document.getElementById("coach-ask"); if (ask) ask.onclick = () => callCoach("ask");
  const rev = document.getElementById("coach-review"); if (rev) rev.onclick = () => callCoach("review");
  const ap = document.getElementById("coach-apply"); if (ap) ap.onclick = applyProposal;
  const dis = document.getElementById("coach-dismiss"); if (dis) dis.onclick = () => { S.coachData = null; S.render(); };
  const bh = document.getElementById("coach-backhub"); if (bh) bh.onclick = () => { S.view = "hub"; S.render(); };
}

async function callCoach(mode) {
  S.coachMode = mode; S.coachBusy = true; S.coachData = null; S.coachApplied = false; S.render();
  const message = mode === "ask" ? S.coachDraft.trim() : "";
  if (mode === "ask" && !message) { S.coachBusy = false; S.coachData = { ok: false, error: "Type a question first." }; S.render(); return; }
  try {
    const r = await fetch(SUPA_URL + "/functions/v1/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY },
      body: JSON.stringify({ slug: S.SLUG, mode, message })
    });
    S.coachData = await r.json();
  } catch (e) { S.coachData = { ok: false, error: "Network error — try again." }; }
  S.coachBusy = false; S.render();
}

async function applyProposal() {
  const sel = [...document.querySelectorAll(".opck")].filter(c => c.checked).map(c => +c.dataset.op);
  const ops = sel.map(i => S.coachData.proposal[i]).filter(Boolean);
  for (const op of ops) {
    if (op.type === "update_exercise") {
      await save(sb.from("exercise").update(op.fields || {}).eq("id", op.exercise_id));
    } else if (op.type === "add_exercise") {
      const w = S.DATA.workouts.find(w => w.code === op.workout_code);
      if (w) { const sort = w.exercise.length; await save(sb.from("exercise").insert({ workout_id: w.id, name: op.name, scheme: op.scheme || "", cue: op.cue || "", section: op.section || "main", sort, demo_slug: slugify(op.name) })); }
    } else if (op.type === "remove_exercise") {
      await save(sb.from("exercise").delete().eq("id", op.exercise_id));
    } else if (op.type === "pause_exercise") {
      await save(sb.from("exercise").update({ paused: true, paused_reason: op.reason || "" }).eq("id", op.exercise_id));
    } else if (op.type === "resume_exercise") {
      await save(sb.from("exercise").update({ paused: false, paused_reason: "" }).eq("id", op.exercise_id));
    }
  }
  await load();
  S.coachApplied = true; S.coachData.proposal = []; S.render();
}
