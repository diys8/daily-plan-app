import { S } from "./state.js";
import { load, syncTimezone } from "./db.js";
import { renderPlan, renderProfile } from "./today.js";
import { renderHub, renderRoutine, renderWorkout, renderRecap } from "./workout.js";
import { renderCoach } from "./coach.js";

const params = new URLSearchParams(location.search);
let slug = params.get("u");
if (slug) { try { localStorage.setItem("dp_slug", slug); } catch (e) {} }
else { try { slug = localStorage.getItem("dp_slug"); } catch (e) {} }
if (!slug) slug = "diyanah-7fx3k9";
S.SLUG = slug;

let lastView = null;
function render() {
  const sy = (S.view === lastView) ? window.scrollY : 0;
  lastView = S.view;
  if (S.view === "coach") renderCoach();
  else if (S.view === "hub") renderHub();
  else if (S.view === "routine") renderRoutine();
  else if (S.view === "workout") renderWorkout();
  else if (S.view === "recap") renderRecap();
  else if (S.view === "profile") renderProfile();
  else renderPlan();
  updateTabs();
  window.scrollTo(0, sy);
}
S.render = render;

function updateTabs() {
  document.querySelectorAll(".tab").forEach(t => {
    const tab = t.dataset.tab;
    const active = (tab === "plan" && (S.view === "plan" || S.view === "workout" || S.view === "recap")) ||
                   (tab === "hub" && (S.view === "hub" || S.view === "routine")) ||
                   (tab === "coach" && S.view === "coach") ||
                   (tab === "profile" && S.view === "profile");
    t.classList.toggle("active", active);
  });
}

document.querySelectorAll(".tab").forEach(t => {
  t.onclick = () => {
    const tab = t.dataset.tab;
    if (tab === "plan") S.view = "plan";
    else if (tab === "hub") S.view = "hub";
    else if (tab === "coach") { S.view = "coach"; S.coachData = null; S.coachBusy = false; S.coachApplied = false; }
    else if (tab === "profile") S.view = "profile";
    S.render();
  };
});

function openFromLink() {
  const bid = +(params.get("b") || 0);
  if (!bid || !S.DATA) return;
  for (const d of S.DATA.days) {
    if (d.block.some(x => x.id === bid)) { S.viewWd = d.weekday; S.openId = bid; S.view = "plan"; return; }
  }
}

(async () => {
  try {
    await load();
    if (S.viewWd !== S.todayWd && S.viewWd === new Date().getDay()) S.viewWd = S.todayWd;
    openFromLink();
    render();
    syncTimezone();
  } catch (e) {
    document.getElementById("wrap").innerHTML = `<div class="err">${e.message}</div>`;
  }
})();

if ("serviceWorker" in navigator) { navigator.serviceWorker.register("sw.js").catch(() => {}); }
