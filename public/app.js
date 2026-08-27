import { S } from "./state.js";
import { load, syncTimezone } from "./db.js";
import { renderPlan } from "./today.js";
import { renderHub, renderRoutine } from "./workout.js";
import { renderCoach } from "./coach.js";

const params = new URLSearchParams(location.search);
let slug = params.get("u");
if (slug) { try { localStorage.setItem("dp_slug", slug); } catch (e) {} }
else { try { slug = localStorage.getItem("dp_slug"); } catch (e) {} }
if (!slug) slug = "diyanah-7fx3k9";
S.SLUG = slug;

function render() {
  if (S.view === "coach") { renderCoach(); return; }
  if (S.view === "hub") { renderHub(); return; }
  if (S.view === "routine") { renderRoutine(); return; }
  renderPlan();
}
S.render = render;

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
    openFromLink();
    render();
    syncTimezone();
  } catch (e) {
    document.getElementById("wrap").innerHTML = `<div class="err">${e.message}</div>`;
  }
})();

if ("serviceWorker" in navigator) { navigator.serviceWorker.register("sw.js").catch(() => {}); }
