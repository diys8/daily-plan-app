import { S, SUPA_URL, SUPA_KEY } from "./state.js";
import { esc, slugify } from "./util.js";
import { sb, save, load } from "./db.js";

const QUICK = [
  { label: "Review my week", msg: "Review my recent training and propose next week's progression. Keep it to a few focused, safe changes (max 5)." },
  { label: "Make it harder", msg: "I'm ready for more challenge. Suggest progressions for my current routines." },
  { label: "I'm travelling", msg: "I'll be travelling soon with limited equipment. How should I adapt my training?" },
  { label: "Something hurts", msg: "Something is bothering me — I'll describe it. What should I adjust?" },
];

export function renderCoach() {
  let h = `<div class="screen-top"><div class="hi">Coach</div></div>`;

  if (S.coachMessages.length === 0 && !S.coachBusy) {
    h += `<div class="coach-empty">Ask for advice, or get a weekly review. Nothing changes until you approve.</div>`;
    h += `<div class="coach-quicks">`;
    QUICK.forEach((q, i) => { h += `<button class="btn ghost coach-qbtn" data-quick="${i}">${esc(q.label)}</button>`; });
    h += `</div>`;
  }

  S.coachMessages.forEach(m => {
    if (m.role === "user") {
      h += `<div class="cmsg cmsg-user">${esc(m.body)}</div>`;
    } else {
      h += `<div class="cmsg cmsg-coach">${esc(m.body)}</div>`;
    }
  });

  if (S.coachBusy) {
    h += `<div class="cmsg cmsg-coach" style="color:var(--dim)">Thinking…</div>`;
  }

  if (S.coachProposal && S.coachProposal.length > 0 && !S.coachApplied) {
    h += `<div class="sec">Proposed changes</div>`;
    S.coachProposal.forEach((op, i) => {
      h += `<div class="prop-row"><input type="checkbox" class="opck" data-op="${i}" checked><span class="prop-label">${propLabel(op)}</span></div>`;
    });
    const cnt = S.coachProposal.length;
    h += `<div class="edbtns"><button class="btn primary" id="coach-apply">Apply ${cnt} change${cnt > 1 ? "s" : ""}</button><button class="btn ghost" id="coach-dismiss">Dismiss</button></div>`;
  }

  if (S.coachApplied) {
    h += `<div class="coach-applied">Applied ✓</div>`;
  }

  h += `<div class="coach-bar"><textarea class="inp coach-ta" id="coach-input" rows="1" placeholder="Ask something…">${esc(S.coachDraft)}</textarea>`
    + `<button class="btn primary coach-send" id="coach-ask">Send</button></div>`;

  document.getElementById("wrap").innerHTML = h;
  wireCoach();
}

function propLabel(op) {
  if (op.type === "note") return esc(op.text || "");
  if (op.type === "update_exercise") {
    const f = op.fields || {}; const parts = [];
    if (f.scheme !== undefined) parts.push("scheme → " + esc(f.scheme));
    if (f.load !== undefined) parts.push("load → " + esc(f.load));
    if (f.cue !== undefined) parts.push("cue → " + esc(f.cue));
    return "Update " + esc(op.name || "") + ": " + parts.join(", ");
  }
  if (op.type === "add_exercise") return "Add " + esc(op.name || "") + " to " + esc(op.section || "main");
  if (op.type === "remove_exercise") return "Remove " + esc(op.name || "");
  if (op.type === "pause_exercise") return "Pause " + esc(op.name || "") + (op.reason ? " — " + esc(op.reason) : "");
  if (op.type === "resume_exercise") return "Resume " + esc(op.name || "");
  if (op.type === "create_routine") return "New routine: " + esc(op.name || "") + " (" + (op.exercises || []).length + " moves)";
  return esc(JSON.stringify(op));
}

function wireCoach() {
  const ta = document.getElementById("coach-input");
  if (ta) {
    ta.oninput = () => { S.coachDraft = ta.value; autoGrow(ta); };
    autoGrow(ta);
  }
  document.getElementById("coach-ask")?.addEventListener("click", () => sendMessage(S.coachDraft.trim()));
  document.querySelectorAll("[data-quick]").forEach(el => el.onclick = () => {
    const q = QUICK[+el.dataset.quick];
    if (q) sendMessage(q.msg);
  });
  document.getElementById("coach-apply")?.addEventListener("click", applyProposal);
  document.getElementById("coach-dismiss")?.addEventListener("click", () => { S.coachProposal = null; S.render(); });

  const wrap = document.getElementById("wrap");
  if (wrap) wrap.scrollTop = wrap.scrollHeight;
}

function autoGrow(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

async function sendMessage(text) {
  if (!text || S.coachBusy) return;
  S.coachDraft = "";
  S.coachBusy = true;
  S.coachApplied = false;
  S.coachProposal = null;

  const userMsg = { role: "user", body: text, created_at: new Date().toISOString() };
  S.coachMessages.push(userMsg);
  S.render();

  await save(sb.from("coach_message").insert({ person_id: S.DATA.person.id, role: "user", body: text }));

  try {
    const history = S.coachMessages.filter(m => m.role && m.body).slice(-20).map(m => ({ role: m.role, body: m.body }));
    const r = await fetch(SUPA_URL + "/functions/v1/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY },
      body: JSON.stringify({ slug: S.SLUG, message: text, history })
    });
    const data = await r.json();

    let replyText = "";
    let proposal = [];

    if (data.ok === false) {
      replyText = data.error || "Something went wrong.";
    } else if (data.paused) {
      replyText = data.message || "Coach is paused.";
    } else {
      replyText = data.text || "";
      proposal = Array.isArray(data.proposal) ? data.proposal : [];
    }

    const assistantMsg = { role: "assistant", body: replyText, proposal: proposal.length ? proposal : null, created_at: new Date().toISOString() };
    S.coachMessages.push(assistantMsg);
    if (proposal.length) S.coachProposal = proposal;

    await save(sb.from("coach_message").insert({
      person_id: S.DATA.person.id, role: "assistant", body: replyText,
      proposal: proposal.length ? JSON.stringify(proposal) : null
    }));
  } catch (e) {
    const errMsg = { role: "assistant", body: "Network error — try again.", created_at: new Date().toISOString() };
    S.coachMessages.push(errMsg);
    await save(sb.from("coach_message").insert({ person_id: S.DATA.person.id, role: "assistant", body: errMsg.body }));
  }

  S.coachBusy = false;
  S.render();
}

async function applyProposal() {
  const sel = [...document.querySelectorAll(".opck")].filter(c => c.checked).map(c => +c.dataset.op);
  if (sel.length === 0) return;
  const ops = sel.map(i => S.coachProposal[i]).filter(Boolean);
  for (const op of ops) {
    if (op.type === "update_exercise") {
      await save(sb.from("exercise").update(op.fields || {}).eq("id", op.exercise_id));
    } else if (op.type === "add_exercise") {
      const w = S.DATA.workouts.find(w => w.code === op.workout_code);
      if (w) {
        const sort = w.exercise.length;
        await save(sb.from("exercise").insert({
          workout_id: w.id, name: op.name, scheme: op.scheme || "",
          cue: op.cue || "", section: op.section || "main", sort, demo_slug: slugify(op.name)
        }));
      }
    } else if (op.type === "remove_exercise") {
      await save(sb.from("exercise").delete().eq("id", op.exercise_id));
    } else if (op.type === "pause_exercise") {
      await save(sb.from("exercise").update({ paused: true, paused_reason: op.reason || "" }).eq("id", op.exercise_id));
    } else if (op.type === "resume_exercise") {
      await save(sb.from("exercise").update({ paused: false, paused_reason: "" }).eq("id", op.exercise_id));
    } else if (op.type === "create_routine") {
      if (!op.name || !Array.isArray(op.exercises) || op.exercises.length === 0) continue;
      const code = "R" + Date.now().toString(36).slice(-4);
      const res = await save(sb.from("workout").insert({
        person_id: S.DATA.person.id, code, name: op.name, focus: op.focus || "strength"
      }).select().single());
      if (res) {
        let sort = 0;
        for (const ex of op.exercises) {
          await save(sb.from("exercise").insert({
            workout_id: res.id, name: ex.name, scheme: ex.scheme || "",
            cue: ex.cue || "", section: ex.section || "main", sort: sort++, demo_slug: slugify(ex.name)
          }));
        }
      }
    }
  }
  await load();
  S.coachApplied = true;
  S.coachProposal = null;
  S.render();
}
