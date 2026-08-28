export function todayStr(tz) {
  const d = new Date();
  if (tz) {
    const p = {};
    new Intl.DateTimeFormat("en", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(d).forEach(x => p[x.type] = x.value);
    return `${p.year}-${p.month}-${p.day}`;
  }
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}

export function todayWd(tz) {
  const d = new Date();
  if (tz) {
    const name = new Intl.DateTimeFormat("en", { timeZone: tz, weekday: "short" }).format(d);
    const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return map[name] ?? d.getDay();
  }
  return d.getDay();
}

export function fmt(t) {
  const p = t.split(":");
  let h = +p[0];
  const m = p[1];
  const ap = h < 12 ? "am" : "pm";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return hh + ":" + m + ap;
}

export function mins(t) {
  const p = t.split(":");
  return (+p[0]) * 60 + (+p[1]);
}

export function slugify(name) {
  return (name || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export function daysBetween(a, b) {
  return Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
}

export function esc(s) {
  return (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

export function urlB64(b) {
  const pad = "=".repeat((4 - b.length % 4) % 4);
  const s = (b + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(s);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export const RULES = [
  ["food",["breakfast","lunch","dinner","meal","snack","eat","smoothie","whey","protein","food","coffee","supplement","creatine","magnesium","beetroot","yogurt","fruit","banana"]],
  ["play",["badminton","workout","strength","coach","training","match","game","gym","cardio","footwork","session","exercise","run","play","stretch"]],
  ["rest",["wake","wind down","sleep","nap","relax","recovery","bed","rest"]],
  ["work",["work","job","application","study","project","simnara","call","email","meeting","focus","admin","practical","flex","catch"]],
];

export function tagFromTitle(title) {
  const t = (title || "").toLowerCase();
  for (const [tag, words] of RULES) { if (words.some(w => t.includes(w))) return tag; }
  return "work";
}
