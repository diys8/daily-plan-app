import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPA_URL = "https://nalxowbclhvopjqkvweh.supabase.co";
const SUPA_KEY = "sb_publishable_rILlPOqKrtUSP-gEuTETpg_smWK7jPU";
const sb = createClient(SUPA_URL, SUPA_KEY);
const VAPID_PUBLIC = "BAH7JJEtqN0Iy3z_es_I-LT9bWEqz_pgxg12RQHhZyq4-AcZ5TFhtSXZrBjzYlp_NgnEHcQ_KSwb3-ZlzO8DP08";
function urlB64(b){ const pad="=".repeat((4-b.length%4)%4); const s=(b+pad).replace(/-/g,"+").replace(/_/g,"/"); const raw=atob(s); const arr=new Uint8Array(raw.length); for(let i=0;i<raw.length;i++)arr[i]=raw.charCodeAt(i); return arr; }

const params = new URLSearchParams(location.search);
let SLUG = params.get("u");
if (SLUG) { try { localStorage.setItem("dp_slug", SLUG); } catch(e){} }
else { try { SLUG = localStorage.getItem("dp_slug"); } catch(e){} }
if (!SLUG) SLUG = "diyanah-7fx3k9";
const DAYNAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAYFULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const STYLE = `
:root{
  --bg:#0e1320; --card:#161d2e; --card2:#1d2740; --card3:#243154;
  --line:#2a3654; --ink:#f3f6fd; --mut:#a6b6d6; --dim:#728198;
  --food:#f4a63a; --work:#5aa0f0; --play:#40c99b; --rest:#b58cf0; --accent:#6aa8f5;
}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--ink);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:540px;margin:0 auto;padding:16px 15px 80px}
.top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:2px 2px 2px}
.hi{font-size:22px;font-weight:700;letter-spacing:-.01em}
.acts{display:flex;gap:8px}
.iconbtn{font-size:12px;font-weight:600;color:var(--mut);background:var(--card);border:1px solid var(--line);
  padding:7px 12px;border-radius:10px;cursor:pointer;white-space:nowrap}
.iconbtn.act{color:#fff;background:var(--accent);border-color:var(--accent)}
.chiprow{display:flex;align-items:center;gap:8px;margin:4px 2px 0}
.chip{font-size:12px;font-weight:600;color:var(--accent);background:rgba(106,168,245,.13);
  border:1px solid rgba(106,168,245,.3);padding:6px 12px;border-radius:20px;white-space:nowrap}
.daybar{display:flex;gap:7px;overflow-x:auto;padding:12px 2px 4px;-webkit-overflow-scrolling:touch}
.daybar::-webkit-scrollbar{display:none}
.daybtn{flex:0 0 auto;font-size:12px;font-weight:600;color:var(--mut);background:var(--card);
  border:1px solid var(--line);padding:8px 12px;border-radius:11px;cursor:pointer;white-space:nowrap;transition:.15s}
.daybtn.on{color:#fff;background:var(--accent);border-color:var(--accent);box-shadow:0 3px 12px rgba(106,168,245,.35)}
.t-food{--tc:var(--food)} .t-work{--tc:var(--work)} .t-play{--tc:var(--play)} .t-rest{--tc:var(--rest)}
.nowcard{background:linear-gradient(135deg,#1a2540,#151d31);border:1px solid var(--line);border-left:4px solid var(--tc);
  border-radius:16px;padding:16px 17px;margin:14px 0 6px;box-shadow:0 8px 26px rgba(0,0,0,.32)}
.nowcard .lab{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--tc);margin-bottom:9px}
.pulse{width:9px;height:9px;border-radius:50%;background:var(--tc);animation:pulse 1.8s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.78)}}
.nowcard .nt{font-size:21px;font-weight:700;line-height:1.2;letter-spacing:-.01em}
.nowcard .nd{font-size:14px;color:var(--mut);margin-top:6px;line-height:1.55}
.nowchecks{margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.08)}
.sec{font-size:11px;font-weight:700;letter-spacing:.11em;text-transform:uppercase;color:var(--dim);margin:26px 3px 11px;display:flex;align-items:center;gap:8px}
.sec::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--line),transparent)}
.block{position:relative;background:var(--card);border:1px solid var(--line);border-left:3px solid var(--tc,var(--line));
  border-radius:14px;padding:13px 14px;margin-bottom:10px;transition:.15s}
.block.cur{background:var(--card3);border-color:var(--tc);border-left-color:var(--tc);box-shadow:0 0 0 1px var(--tc),0 8px 24px rgba(0,0,0,.34)}
.block.past{opacity:.42}
.block.up{opacity:.72}
.block .row{display:flex;align-items:center;gap:12px;cursor:pointer}
.time{font-size:13px;font-weight:600;color:var(--mut);min-width:62px;font-variant-numeric:tabular-nums}
.block.cur .time{color:var(--tc)}
.bt{font-size:15px;font-weight:600;line-height:1.3}
.block.cur .bt{font-size:16.5px;font-weight:700;color:#fff}
.nowtag{display:inline-block;font-size:9.5px;font-weight:800;letter-spacing:.08em;color:#0e1320;background:var(--tc);padding:2px 7px;border-radius:6px;margin-left:8px;vertical-align:middle}
.meta{margin-left:auto;font-size:12px;font-weight:600;color:var(--dim);white-space:nowrap;display:flex;align-items:center;gap:6px}
.chev{color:var(--dim);font-size:12px}
.detail{margin:12px 0 2px;padding-top:12px;border-top:1px solid var(--line)}
.li{display:flex;align-items:flex-start;gap:11px;font-size:14px;color:var(--ink);padding:7px 0;line-height:1.45;cursor:pointer}
.box{width:20px;height:20px;border-radius:6px;border:2px solid var(--dim);flex:0 0 auto;margin-top:0;display:flex;align-items:center;justify-content:center;transition:.12s}
.li.done .box{background:var(--tc,var(--accent));border-color:var(--tc,var(--accent))}
.li.done .box::after{content:"✓";color:#0e1320;font-size:13px;font-weight:800}
.li.done span{color:var(--dim);text-decoration:line-through}
.move{background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:12px 13px;margin-top:10px}
.mh{display:flex;justify-content:space-between;gap:10px;align-items:baseline}
.mn{font-size:15px;font-weight:700}
.msr{font-size:12px;font-weight:600;color:var(--accent);background:rgba(106,168,245,.12);padding:3px 9px;border-radius:7px;white-space:nowrap}
.mc{font-size:13px;color:var(--mut);margin-top:7px;line-height:1.5}
.mbr{font-size:12.5px;color:var(--play);margin-top:8px;line-height:1.45;display:flex;gap:7px;align-items:baseline}
.mbrlab{font-size:9.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--play);border:1px solid rgba(64,201,155,.4);border-radius:5px;padding:2px 6px;flex:0 0 auto}
.mtag{font-size:10px;font-weight:700;color:var(--dim);margin-top:9px;text-transform:uppercase;letter-spacing:.06em}
.move.paused{opacity:.6}
.pausechip{display:inline-block;font-size:11px;font-weight:700;color:var(--food);border:1px solid rgba(244,166,58,.4);border-radius:6px;padding:2px 8px;margin-top:6px}
.mlog{margin-top:11px;padding-top:11px;border-top:1px solid var(--line)}
.goals{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:13px 15px;margin-top:6px}
.goals .g{font-size:13.5px;color:var(--mut);padding:5px 0;line-height:1.45;display:flex;gap:9px}
.goals .g::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--accent);margin-top:7px;flex:0 0 auto}
.foot{text-align:center;color:var(--dim);font-size:12px;margin-top:26px;line-height:1.6}
.load{color:var(--mut);text-align:center;padding:48px 0;font-size:14px}
.err{color:#f0888a;text-align:center;padding:32px 14px;font-size:14px;line-height:1.6}
input,textarea,select{font-family:inherit}
.ed{background:var(--card2);border:1px solid var(--line);border-left:3px solid var(--tc,var(--line));border-radius:14px;padding:13px 14px;margin-bottom:10px}
.field{display:flex;flex-direction:column;gap:5px;margin-bottom:11px}
.field label{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--dim)}
.inp{background:var(--bg);border:1px solid var(--line);border-radius:9px;color:var(--ink);font-size:15px;padding:9px 11px;width:100%}
.inp:focus{outline:none;border-color:var(--accent)}
.chips{display:flex;gap:7px;flex-wrap:wrap}
.copt{font-size:12px;font-weight:600;color:var(--mut);background:var(--bg);border:1px solid var(--line);padding:7px 12px;border-radius:9px;cursor:pointer}
.copt.on{color:#0e1320;background:var(--tc,var(--accent));border-color:var(--tc,var(--accent))}
.itemed{display:flex;gap:8px;align-items:center;margin-bottom:7px}
.itemed .inp{flex:1}
.xbtn{font-size:15px;color:var(--dim);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:8px 11px;cursor:pointer;flex:0 0 auto}
.linkbtn{font-size:13px;font-weight:600;color:var(--accent);background:none;border:none;cursor:pointer;padding:6px 0}
.edbtns{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.btn{font-size:13.5px;font-weight:600;padding:10px 15px;border-radius:10px;cursor:pointer;border:1px solid var(--line);background:var(--bg);color:var(--ink)}
.btn.primary{background:var(--accent);border-color:var(--accent);color:#0e1320}
.btn.danger{color:#f0888a;border-color:rgba(240,136,138,.4)}
.btn.ghost{color:var(--mut)}
.addblock{width:100%;text-align:center;font-size:13.5px;font-weight:600;color:var(--accent);background:rgba(106,168,245,.08);
  border:1px dashed rgba(106,168,245,.4);border-radius:12px;padding:13px;cursor:pointer;margin-top:4px}
.overlay{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;align-items:flex-end;justify-content:center;z-index:50}
.sheet{background:var(--card);border:1px solid var(--line);border-radius:18px 18px 0 0;width:100%;max-width:540px;max-height:88vh;overflow:auto;padding:18px 16px 26px}
.sheet h3{font-size:17px;font-weight:700;margin:2px 0 14px}
.applybar{display:flex;gap:8px;margin-top:6px}
.applybar .btn{flex:1}
.hint{font-size:12px;color:var(--dim);margin:-4px 0 10px;line-height:1.5}
/* workouts hub */
.screen-top{display:flex;align-items:center;gap:10px;margin:2px 2px 16px}
.backb{font-size:22px;line-height:1;color:var(--mut);background:var(--card);border:1px solid var(--line);border-radius:11px;width:40px;height:40px;cursor:pointer;flex:0 0 auto}
.screen-top .hi{flex:1}
.coachlink{font-size:13px;font-weight:600;color:var(--accent);background:none;border:none;cursor:pointer;white-space:nowrap}
.rcard{position:relative;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 34px 14px 15px;margin-bottom:10px;cursor:pointer;transition:.15s}
.rcard:active{background:var(--card3)}
.rchev{position:absolute;right:15px;top:50%;transform:translateY(-50%);color:var(--dim);font-size:24px;line-height:1}
.dtrow{display:flex;align-items:center;gap:10px;margin-bottom:7px}
.dtrow span{font-size:13px;color:var(--mut);min-width:96px}
.dtrow .inp{max-width:150px}
.rcard .rn{font-size:16px;font-weight:700;color:#fff;line-height:1.3}
.rcard .rm{margin-top:8px;font-size:12.5px;color:var(--dim);display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.fchip{font-size:11px;font-weight:700;color:var(--play);border:1px solid rgba(64,201,155,.4);border-radius:6px;padding:2px 8px}
.fchip.cardio{color:var(--work);border-color:rgba(90,160,240,.4)}
.fchip.mobility{color:var(--rest);border-color:rgba(181,140,240,.4)}
.dash{width:100%;text-align:center;font-size:13.5px;font-weight:600;color:var(--accent);background:rgba(106,168,245,.08);border:1px dashed rgba(106,168,245,.4);border-radius:12px;padding:13px;cursor:pointer;margin-top:2px}
.drow{display:flex;gap:6px;margin:10px 2px 4px;flex-wrap:wrap}
.dpill{width:38px;height:38px;border-radius:10px;border:1px solid var(--line);color:var(--dim);font-size:12px;font-weight:700;background:var(--card);cursor:pointer;display:flex;align-items:center;justify-content:center}
.dpill.on{background:var(--play);border-color:var(--play);color:#04241b}
.exrow{background:var(--card2);border:1px solid var(--line);border-radius:10px;padding:11px 12px;margin-bottom:7px;display:flex;align-items:center;gap:10px;cursor:pointer}
.exrow .en{font-size:14px;font-weight:600}
.exrow .es{margin-left:auto;font-size:11.5px;font-weight:600;color:var(--accent);background:rgba(106,168,245,.12);padding:2px 8px;border-radius:6px;white-space:nowrap}
.badge{display:inline-block;font-size:11px;font-weight:700;color:var(--play);border:1px solid rgba(64,201,155,.4);border-radius:6px;padding:2px 8px;margin-bottom:8px}
.coachbox{background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:12px 13px;margin-top:12px}
`;

let DATA = null;
let viewWd = new Date().getDay();
let openId = null;
let editMode = false;
let editId = null;
let sheet = null;
let CHECKS = {};
let LOGS = {};
let OVR = {};
let BDONE = {};
let newBlock = null;
let view = "plan";
let routeCode = null;
let exEditId = null;
let exNew = null;
let coachMode = "ask"; let coachBusy = false; let coachData = null; let coachApplied = false;
let coachDraft = "";
const BELL = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
const PENCIL = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const TODAY_WD = new Date().getDay();
function todayStr(){ const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }

function injectStyle(){
  let el = document.getElementById("dp-style");
  if (!el){ el = document.createElement("style"); el.id="dp-style"; document.head.appendChild(el); }
  el.textContent = STYLE;
}
function fmt(t){ const p=t.split(":"); let h=+p[0]; const m=p[1]; const ap=h<12?"am":"pm"; let hh=h%12; if(hh===0)hh=12; return hh+":"+m+ap; }
function mins(t){ const p=t.split(":"); return (+p[0])*60+(+p[1]); }
function esc(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }

const RULES = [
  ["food",["breakfast","lunch","dinner","meal","snack","eat","smoothie","whey","protein","food","coffee","supplement","creatine","magnesium","beetroot","yogurt","fruit","banana"]],
  ["play",["badminton","workout","strength","coach","training","match","game","gym","cardio","footwork","session","exercise","run","play","stretch"]],
  ["rest",["wake","wind down","sleep","nap","relax","recovery","bed","rest"]],
  ["work",["work","job","application","study","project","simnara","call","email","meeting","focus","admin","practical","flex","catch"]],
];
function tagFromTitle(title){
  const t=(title||"").toLowerCase();
  for(const [tag,words] of RULES){ if(words.some(w=>t.includes(w))) return tag; }
  return "work";
}

async function load(){
  const { data: person, error: pe } = await sb.from("person").select("*").eq("slug", SLUG).single();
  if (pe || !person) throw new Error("Could not find this plan. Check the link.");
  const { data: days } = await sb.from("day").select("*, block(*, checklist_item(*))").eq("person_id", person.id).order("weekday");
  const { data: workouts } = await sb.from("workout").select("*, exercise(*)").eq("person_id", person.id);
  const { data: goals } = await sb.from("goal").select("*").eq("person_id", person.id).order("sort");
  const { data: checks } = await sb.from("item_check").select("checklist_item_id,checked").eq("person_id", person.id).eq("on_date", todayStr());
  const { data: ovr } = await sb.from("block_override").select("block_id,patch").eq("person_id", person.id).eq("on_date", todayStr());
  const { data: bdone } = await sb.from("block_done").select("block_id,done").eq("person_id", person.id).eq("on_date", todayStr());
  const { data: exlogs } = await sb.from("exercise_log").select("exercise_id,done,feel").eq("person_id", person.id).eq("on_date", todayStr());
  days.forEach(d => { d.block.sort((a,b)=>a.sort-b.sort); d.block.forEach(b=>b.checklist_item.sort((x,y)=>x.sort-y.sort)); });
  workouts.forEach(w => w.exercise.sort((a,b)=>a.sort-b.sort));
  CHECKS = {}; (checks||[]).forEach(c=>CHECKS[c.checklist_item_id]=c.checked);
  OVR = {}; (ovr||[]).forEach(o=>OVR[o.block_id]=o.patch);
  BDONE = {}; (bdone||[]).forEach(o=>{ if(o.done) BDONE[o.block_id]=true; });
  LOGS = {}; (exlogs||[]).forEach(l=>LOGS[l.exercise_id]={ done:!!l.done, feel:l.feel||"" });
  DATA = { person, days, workouts, goals };
}

function dayFor(wd){ return DATA.days.find(d=>d.weekday===wd); }
function workoutByCode(code){ return DATA.workouts.find(w=>w.code===code); }
function eff(b){
  if (viewWd===TODAY_WD && OVR[b.id]) return Object.assign({}, b, OVR[b.id]);
  return b;
}
function orderedBlocks(day){
  return day.block.map(eff).slice().sort((a,b)=>mins(a.time)-mins(b.time));
}
function currentIdx(blocks){
  if (viewWd!==TODAY_WD) return -1;
  const now=new Date().getHours()*60+new Date().getMinutes();
  let idx=-1; blocks.forEach((b,i)=>{ if(mins(b.time)<=now) idx=i; }); return idx;
}

async function toggleItem(itemId){
  const now = !CHECKS[itemId];
  CHECKS[itemId] = now;
  render();
  await sb.from("item_check").upsert({ person_id:DATA.person.id, checklist_item_id:itemId, on_date:todayStr(), checked:now },
    { onConflict:"person_id,checklist_item_id,on_date" });
}
async function toggleExercise(exId){
  const cur = LOGS[exId] || { done:false, feel:"" };
  const now = !cur.done;
  LOGS[exId] = { done:now, feel:cur.feel };
  render();
  await sb.from("exercise_log").upsert({ person_id:DATA.person.id, exercise_id:exId, on_date:todayStr(), done:now, feel:cur.feel },
    { onConflict:"person_id,exercise_id,on_date" });
}
async function setFeel(exId, feelv){
  const cur = LOGS[exId] || { done:false, feel:"" };
  const now = cur.feel===feelv ? "" : feelv;
  LOGS[exId] = { done:cur.done, feel:now };
  render();
  await sb.from("exercise_log").upsert({ person_id:DATA.person.id, exercise_id:exId, on_date:todayStr(), done:cur.done, feel:now },
    { onConflict:"person_id,exercise_id,on_date" });
}
async function resumeExercise(id){
  await sb.from("exercise").update({ paused:false, paused_reason:"" }).eq("id", id);
  await reloadAndRender();
}
async function saveBlockTemplate(id, fields){ await sb.from("block").update(fields).eq("id", id); }
async function saveBlockToday(id, fields){
  await sb.from("block_override").upsert({ person_id:DATA.person.id, block_id:id, on_date:todayStr(), patch:fields },
    { onConflict:"person_id,block_id,on_date" });
}
async function reloadAndRender(){ await load(); render(); }

function remOn(){ try{ return Notification.permission==="granted" && localStorage.getItem("dp_rem")==="1"; }catch(e){ return false; } }
function anyNotify(){ return !!(DATA && DATA.days.some(d=>d.block.some(b=>b.notify))); }
async function enableReminders(){
  if(!("serviceWorker" in navigator) || !("PushManager" in window)){ alert("This browser doesn't support notifications."); return; }
  let perm = Notification.permission;
  if(perm!=="granted") perm = await Notification.requestPermission();
  if(perm!=="granted"){ alert("Notifications weren't allowed. You can turn them on in your browser's site settings."); return; }
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if(!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey: urlB64(VAPID_PUBLIC) });
  const j = sub.toJSON();
  await sb.from("push_subscription").upsert({ person_id:DATA.person.id, endpoint:sub.endpoint, p256dh:j.keys.p256dh, auth:j.keys.auth }, { onConflict:"endpoint" });
  try{ localStorage.setItem("dp_rem","1"); }catch(e){}
  render();
  alert("Reminders are on — you'll get a nudge at each block. Keep the app installed on your home screen.");
}
async function markBlockDone(id){
  const now = !BDONE[id]; if(now) BDONE[id]=true; else delete BDONE[id]; render();
  await sb.from("block_done").upsert({ person_id:DATA.person.id, block_id:id, on_date:todayStr(), done:now }, { onConflict:"person_id,block_id,on_date" });
}
function findBlock(id){ for(const d of DATA.days){ const b=d.block.find(x=>x.id===id); if(b) return b; } return null; }
async function toggleNotify(id){
  const blk = findBlock(id); if(!blk) return;
  const now = !blk.notify; blk.notify = now; render();
  await sb.from("block").update({ notify: now }).eq("id", id);
}
async function allReminders(on){
  const ids=[]; DATA.days.forEach(d=>d.block.forEach(b=>{ b.notify=on; ids.push(b.id); }));
  if(ids.length) await sb.from("block").update({ notify:on }).in("id", ids);
  sheet=null; await reloadAndRender();
}

function checklistView(b, tc){
  let h="";
  b.checklist_item.forEach(ci=>{
    const done = !!CHECKS[ci.id];
    h += `<div class="li ${done?'done':''}" data-check="${ci.id}"><span class="box"></span><span>${esc(ci.text)}</span></div>`;
  });
  return h;
}
function movesHtml(code){
  const w=workoutByCode(code); if(!w) return "";
  const main=w.exercise.filter(e=>!e.is_footwork), foot=w.exercise.filter(e=>e.is_footwork);
  const logRow=e=>{ const lg=LOGS[e.id]||{done:false,feel:""};
    const chip=(v,label)=>`<div class="copt ${lg.feel===v?'on':''}" data-feel="${e.id}" data-feelv="${v}">${label}</div>`;
    return `<div class="mlog"><div class="li ${lg.done?'done':''}" data-exdone="${e.id}"><span class="box"></span><span>Done</span></div>`
      +`<div class="chips" style="margin-top:8px">${chip('easy','Too easy')}${chip('right','Just right')}${chip('hard','Too hard')}</div></div>`; };
  const card=e=>{
    if(e.paused){
      return `<div class="move paused"><div class="mh"><span class="mn">${esc(e.name)}</span></div>`
        +`<div class="pausechip">${e.paused_reason?`Paused — ${esc(e.paused_reason)}`:"Paused"}</div>`
        +(e.cue?`<div class="mc">${esc(e.cue)}</div>`:"")
        +`<div style="margin-top:10px"><button class="btn ghost" data-resume="${e.id}">Resume</button></div></div>`;
    }
    return `<div class="move"><div class="mh"><span class="mn">${esc(e.name)}</span><span class="msr">${esc(e.scheme||"")}</span></div>`
    +(e.cue?`<div class="mc">${esc(e.cue)}</div>`:"")
    +(e.breathing?`<div class="mbr"><span class="mbrlab">Breathing</span><span>${esc(e.breathing)}</span></div>`:"")
    +`<div class="mtag">${e.demo_slug?"Demo coming in a later step":"Text guide"}</div>`+logRow(e)+`</div>`;
  };
  let h=main.map(card).join("");
  if(foot.length) h+=`<div class="sec">Footwork &amp; agility</div>`+foot.map(card).join("");
  return h;
}
function blockDetail(b){
  const done = !!BDONE[b.id];
  const rem = !!b.notify;
  return `<div class="detail">`+checklistView(b)+ (b.workout?movesHtml(b.workout):"")
    + `<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">`
    + `<button class="btn ${rem?'primary':'ghost'}" data-notify="${b.id}">${BELL} ${rem?'Reminder on':'Remind me'}</button>`
    + `<button class="btn ${done?'ghost':'primary'}" data-done="${b.id}">${done?'Done ✓ · undo':'Mark done'}</button>`
    + `<button class="btn ghost" data-editblock="${b.id}" aria-label="Edit block">${PENCIL}</button>`
    + `</div></div>`;
}

function blockEditor(b){
  const isNew = b.__new;
  const tag = b.tag||"work";
  let items = b.checklist_item.map((ci,ix)=>
    `<div class="itemed"><input class="inp itmtxt" data-id="${ci.id||''}" value="${esc(ci.text)}"><button class="xbtn" data-rmitem="${ix}">✕</button></div>`).join("");
  return `<div class="ed t-${tag}" data-edit="${b.id}">
    <div class="field"><label>Time</label><input class="inp" id="ed-time" type="time" value="${b.time}"></div>
    <div class="field"><label>Activity</label><input class="inp" id="ed-title" value="${esc(b.title)}"></div>
    <div class="field"><label>Category <span style="color:var(--dim);font-weight:600">(auto)</span></label>
      <div class="chips" id="ed-chips">
        ${["food","work","play","rest"].map(c=>`<div class="copt t-${c} ${c===tag?'on':''}" data-cat="${c}">${c}</div>`).join("")}
      </div></div>
    <div class="field"><label>Workout routine</label>
      <select class="inp" id="ed-workout"><option value="">None</option>${DATA.workouts.map(w=>`<option value="${w.code}"${b.workout===w.code?' selected':''}>${esc(w.name||('Strength '+w.code))}</option>`).join("")}</select></div>
    <div class="field"><label>Checklist</label><div id="ed-items">${items}</div>
      <button class="linkbtn" id="ed-additem">+ Add item</button></div>
    <div class="field"><label>Apply to</label>
      <div class="chips" id="ed-scope">${isNew
        ? `<div class="copt on" data-scope="wd">Only ${DAYFULL[viewWd]}</div><div class="copt" data-scope="weekdays">Every weekday</div><div class="copt" data-scope="weekend">Every weekend</div><div class="copt" data-scope="all">Every day</div>`
        : (viewWd===TODAY_WD
          ? `<div class="copt on" data-scope="today">Only today</div><div class="copt" data-scope="wd">Every ${DAYFULL[viewWd]}</div><div class="copt" data-scope="weekdays">Every weekday</div><div class="copt" data-scope="weekend">Every weekend</div><div class="copt" data-scope="all">Every day</div>`
          : `<div class="copt on" data-scope="wd">Every ${DAYFULL[viewWd]}</div><div class="copt" data-scope="weekdays">Every weekday</div><div class="copt" data-scope="weekend">Every weekend</div><div class="copt" data-scope="all">Every day</div>`)}
      </div></div>
    <div class="edbtns">
      <button class="btn primary" id="ed-save">Save</button>
      <button class="btn ghost" id="ed-cancel">Cancel</button>
      ${isNew?'':'<button class="btn danger" id="ed-delete">Delete</button>'}
    </div></div>`;
}

function render(){
  if(view==="coach"){ renderCoach(); return; }
  if(view==="hub"){ renderHub(); return; }
  if(view==="routine"){ renderRoutine(); return; }
  const day = dayFor(viewWd);
  const blocks = orderedBlocks(day);
  const cur = currentIdx(blocks);
  let h="";

  h += `<div class="top"><div class="hi">Hi ${esc(DATA.person.name.split(" ")[0])}</div>`
    + `<div class="acts"><button class="iconbtn ${(remOn()&&anyNotify())?'act':''}" id="remBtn" aria-label="Reminders">${BELL}</button>`
    + `<button class="iconbtn" id="workoutsBtn">Workouts</button><button class="iconbtn" id="profileBtn">Profile</button></div></div>`;
  h += `<div class="chiprow"><div class="chip">${esc(day.chip)}</div></div>`;

  h += `<div class="daybar">`;
  for(let i=0;i<7;i++){ const wd=(TODAY_WD+i)%7;
    h += `<div class="daybtn ${wd===viewWd?'on':''}" data-wd="${wd}">${DAYNAMES[wd]}${i===0?' · today':''}</div>`; }
  h += `</div>`;

  if(cur>=0 && editId===null){
    const b=blocks[cur];
    h += `<div class="nowcard t-${b.tag}"><div class="lab"><span class="pulse"></span>Now · ${fmt(b.time)}</div>`
      + `<div class="nt">${esc(b.title)}</div>`
      + (b.detail?`<div class="nd">${esc(b.detail)}</div>`:"")
      + (b.checklist_item.length?`<div class="nowchecks" data-cur="1">${checklistView(b)}</div>`:"")
      + `</div>`;
  }

  h += `<div class="sec">${viewWd===TODAY_WD?"Today":DAYNAMES[viewWd]} · ${esc(day.label)}</div>`;

  blocks.forEach((b,i)=>{
    if(editId===b.id){ h += blockEditor(b); return; }
    const open = b.id===openId;
    const dim = (viewWd===TODAY_WD && cur>=0 && !open) ? (i<cur?' past':(i>cur?' up':'')) : '';
    h += `<div class="block t-${b.tag} ${(i===cur)?'cur':''}${dim}" data-id="${b.id}">`
      + `<div class="row" data-open="${b.id}">`
      + `<span class="time">${fmt(b.time)}</span>`
      + `<span class="bt">${esc(b.title)}${(i===cur)?'<span class="nowtag">NOW</span>':''}</span>`
      + `<span class="meta">${(BDONE[b.id])?'<span style="color:var(--play);font-weight:800">✓ </span>':''}${(b.checklist_item.length?b.checklist_item.length:'')+(b.workout?(b.checklist_item.length?' · ':'')+'workout':'')}<span class="chev">${open?'▾':'▸'}</span></span>`
      + `</div>`
      + (open?blockDetail(b):"")
      + `</div>`;
  });

  if(editId==="new" && newBlock){ h += blockEditor(newBlock); }
  else { h += `<button class="addblock" id="addBlock">+ Add block</button>`; }

  h += `<div class="foot">Tap a block to open it — tick items, set a reminder, or edit.</div>`;

  if(sheet){ h += sheetHtml(); }

  document.getElementById("wrap").innerHTML = h;
  wire();
}

function sheetHtml(){
  if(sheet.type==="apply"){
    const isNew = sheet.isNew;
    return `<div class="overlay" id="ov"><div class="sheet">
      <h3>Save "${esc(sheet.title)}" to…</h3>
      <div class="hint">at ${fmt(sheet.time)}</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${isNew?'':`<button class="btn" data-scope="today">Only today</button>`}
        <button class="btn" data-scope="wd">${isNew?'Only ':'Every '}${DAYFULL[viewWd]}</button>
        <button class="btn" data-scope="weekdays">Every weekday (Mon–Fri)</button>
        <button class="btn" data-scope="weekend">Every weekend (Sat–Sun)</button>
        <button class="btn primary" data-scope="all">Every day</button>
      </div>
      <button class="btn ghost" style="width:100%;margin-top:10px" id="apply-cancel">Cancel</button>
    </div></div>`;
  }
  if(sheet.type==="reminders"){
    let ton=0, ttot=0; DATA.days.forEach(d=>d.block.forEach(b=>{ ttot++; if(b.notify) ton++; }));
    const allOn = ttot>0 && ton===ttot; const allOff = ton===0;
    const status = allOn?"All reminders are on.":allOff?"All reminders are off.":`${ton} of ${ttot} blocks have reminders on.`;
    return `<div class="overlay" id="ov"><div class="sheet">
      <h3>Reminders</h3>
      <div class="hint">${remOn()?('Notifications are on for this phone. '+status+' Turn them on or off for every block at once below, or per-block from inside a block.'):'Turn on notifications first, then choose which blocks nudge you.'}</div>
      ${remOn()?'':`<button class="btn primary" id="rem-enable" style="width:100%;margin-bottom:10px">Turn on notifications</button>`}
      <div class="applybar"><button class="btn ${allOff?'primary':''}" id="rem-alloff">All off${allOff?' ✓':''}</button><button class="btn ${allOn?'primary':''}" id="rem-allon">All on${allOn?' ✓':''}</button></div>
      <button class="btn ghost" style="width:100%;margin-top:8px" id="rem-close">Close</button>
    </div></div>`;
  }
  if(sheet.type==="profile"){
    const p=DATA.person;
    const goals = DATA.goals.map((g,ix)=>`<div class="itemed"><input class="inp goaltxt" data-id="${g.id}" value="${esc(g.text)}"><button class="xbtn" data-rmgoal="${g.id}">✕</button></div>`).join("");
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

function wire(){
  document.querySelectorAll(".daybtn").forEach(el=>el.onclick=()=>{ viewWd=+el.dataset.wd; openId=null; editId=null; newBlock=null; render(); });
  const pb=document.getElementById("profileBtn"); if(pb) pb.onclick=()=>{ sheet={type:"profile"}; render(); };
  const rb=document.getElementById("remBtn"); if(rb) rb.onclick=()=>{ sheet={type:"reminders"}; render(); };
  const wb=document.getElementById("workoutsBtn"); if(wb) wb.onclick=()=>{ view="hub"; render(); };

  document.querySelectorAll("[data-open]").forEach(el=>el.onclick=()=>{ const id=+el.dataset.open; openId=(openId===id?null:id); render(); });
  document.querySelectorAll("[data-check]").forEach(el=>el.onclick=(ev)=>{ ev.stopPropagation(); toggleItem(+el.dataset.check); });
  document.querySelectorAll("[data-exdone]").forEach(el=>el.onclick=(ev)=>{ ev.stopPropagation(); toggleExercise(+el.dataset.exdone); });
  document.querySelectorAll("[data-feel]").forEach(el=>el.onclick=(ev)=>{ ev.stopPropagation(); setFeel(+el.dataset.feel, el.dataset.feelv); });
  document.querySelectorAll("[data-resume]").forEach(el=>el.onclick=(ev)=>{ ev.stopPropagation(); resumeExercise(+el.dataset.resume); });
  document.querySelectorAll("[data-done]").forEach(el=>el.onclick=(ev)=>{ ev.stopPropagation(); markBlockDone(+el.dataset.done); });
  document.querySelectorAll("[data-notify]").forEach(el=>el.onclick=(ev)=>{ ev.stopPropagation(); toggleNotify(+el.dataset.notify); });
  document.querySelectorAll("[data-editblock]").forEach(el=>el.onclick=(ev)=>{ ev.stopPropagation(); editId=+el.dataset.editblock; openId=null; render(); });
  const ab=document.getElementById("addBlock"); if(ab) ab.onclick=addBlock;
  if(editId!==null) wireEditor();
  if(sheet) wireSheet();
}

function wireEditor(){
  const ed=document.querySelector("[data-edit]"); if(!ed) return;
  document.querySelectorAll("#ed-chips .copt").forEach(c=>c.onclick=()=>{
    document.querySelectorAll("#ed-chips .copt").forEach(x=>x.classList.remove("on"));
    c.classList.add("on"); ed.dataset.cat=c.dataset.cat; ed.className="ed t-"+c.dataset.cat; ed.dataset.edit=editId;
  });
  const title=document.getElementById("ed-title");
  if(title) title.oninput=()=>{ if(!ed.dataset.cat){ const t=tagFromTitle(title.value);
    document.querySelectorAll("#ed-chips .copt").forEach(x=>x.classList.toggle("on",x.dataset.cat===t)); ed.className="ed t-"+t; } };
  const add=document.getElementById("ed-additem"); if(add) add.onclick=()=>{
    const box=document.getElementById("ed-items");
    const d=document.createElement("div"); d.className="itemed";
    d.innerHTML=`<input class="inp itmtxt" data-id="" value=""><button class="xbtn">✕</button>`;
    d.querySelector(".xbtn").onclick=()=>d.remove(); box.appendChild(d); d.querySelector("input").focus();
  };
  document.querySelectorAll("#ed-items .xbtn").forEach(x=>x.onclick=()=>x.closest(".itemed").remove());
  document.querySelectorAll("#ed-scope .copt").forEach(c=>c.onclick=()=>{ document.querySelectorAll("#ed-scope .copt").forEach(x=>x.classList.remove("on")); c.classList.add("on"); });
  document.getElementById("ed-cancel").onclick=()=>{ editId=null; newBlock=null; render(); };
  document.getElementById("ed-save").onclick=onSaveEditor;
  const del=document.getElementById("ed-delete"); if(del) del.onclick=onDeleteBlock;
}

function readEditor(){
  const ed=document.querySelector("[data-edit]");
  const cat = document.querySelector("#ed-chips .copt.on")?.dataset.cat || "work";
  const items=[...document.querySelectorAll("#ed-items .itmtxt")].map(i=>({id:i.dataset.id?+i.dataset.id:null,text:i.value.trim()})).filter(i=>i.text);
  const wsel=document.getElementById("ed-workout");
  return { time:document.getElementById("ed-time").value, title:document.getElementById("ed-title").value.trim(), tag:cat, workout:wsel?wsel.value:"", items };
}

async function persistBlock(block, vals, scope){
  if(scope==="today"){
    await saveBlockToday(block.id,{time:vals.time,title:vals.title,tag:vals.tag,detail:block.detail||"",workout:vals.workout||null});
  } else {
    await saveBlockTemplate(block.id,{time:vals.time,title:vals.title,tag:vals.tag,workout:vals.workout||null});
  }
  const existing=block.checklist_item.slice();
  const keptIds=new Set(vals.items.filter(i=>i.id).map(i=>i.id));
  for(const ex of existing){ if(!keptIds.has(ex.id)) await sb.from("checklist_item").delete().eq("id",ex.id); }
  let sort=0;
  for(const it of vals.items){
    if(it.id) await sb.from("checklist_item").update({text:it.text,sort}).eq("id",it.id);
    else await sb.from("checklist_item").insert({block_id:block.id,text:it.text,sort});
    sort++;
  }
}

function currentEditBlock(){ if(editId==="new") return newBlock; const day=dayFor(viewWd); return day.block.find(b=>b.id===editId); }

async function onSaveEditor(){
  const block=currentEditBlock(); if(!block) return;
  const vals=readEditor();
  if(!vals.title){ alert("Give the block a title."); return; }
  const scope=document.querySelector("#ed-scope .copt.on")?.dataset.scope || (block.__new?"wd":(viewWd===TODAY_WD?"today":"wd"));
  editId=null; newBlock=null; render();
  await applyScope(block, vals, scope);
  await reloadAndRender();
}

function daysForScope(scope){
  if(scope==="weekdays") return [1,2,3,4,5];
  if(scope==="weekend") return [0,6];
  if(scope==="all") return [0,1,2,3,4,5,6];
  return [viewWd];
}
async function syncItemsToBlock(block, items){
  const existing = block.checklist_item || [];
  const keptIds = new Set(items.filter(i=>i.id).map(i=>i.id));
  for(const ex of existing){ if(!keptIds.has(ex.id)) await sb.from("checklist_item").delete().eq("id", ex.id); }
  let s=0;
  for(const it of items){
    if(it.id) await sb.from("checklist_item").update({ text:it.text, sort:s }).eq("id", it.id);
    else await sb.from("checklist_item").insert({ block_id:block.id, text:it.text, sort:s });
    s++;
  }
}
async function insertBlockOnDay(day, vals){
  const { data:nb } = await sb.from("block").insert({ day_id:day.id, sort:99, time:vals.time, title:vals.title, tag:vals.tag, detail:"", workout:vals.workout||null, notify:false }).select().single();
  let s=0; for(const it of vals.items){ await sb.from("checklist_item").insert({ block_id:nb.id, text:it.text, sort:s++ }); }
}
async function applyScope(block, vals, scope){
  const editing = block && !block.__new;
  if(scope==="today"){
    if(editing){
      await saveBlockToday(block.id, { time:vals.time, title:vals.title, tag:vals.tag, detail:block.detail||"", workout:vals.workout||null });
      await syncItemsToBlock(block, vals.items);
    } else {
      await insertBlockOnDay(dayFor(viewWd), vals);
    }
    return;
  }
  const wds = daysForScope(scope);
  for(const wd of wds){
    const day = dayFor(wd);
    if(editing && wd===viewWd){
      await saveBlockTemplate(block.id, { time:vals.time, title:vals.title, tag:vals.tag, workout:vals.workout||null });
      await syncItemsToBlock(block, vals.items);
      continue;
    }
    let existing;
    if(editing){ existing = day.block.find(b => b.id!==block.id && b.title===block.title); }
    else { existing = day.block.find(b => b.time===vals.time); }
    if(!existing){
      await insertBlockOnDay(day, vals);
    } else if(!editing && existing.title!==vals.title){
      await sb.from("block").update({ title: existing.title + " + " + vals.title }).eq("id", existing.id);
      let s = existing.checklist_item.length;
      for(const it of vals.items){ await sb.from("checklist_item").insert({ block_id:existing.id, text:it.text, sort:s++ }); }
    } else {
      await sb.from("block").update({ time:vals.time, title:vals.title, tag:vals.tag, workout:vals.workout||null }).eq("id", existing.id);
      await syncItemsToBlock(existing, vals.items);
    }
  }
}

async function onDeleteBlock(){
  const block=currentEditBlock(); if(!block) return;
  if(!confirm("Delete this block?")) return;
  await sb.from("block").delete().eq("id",block.id);
  editId=null; await reloadAndRender();
}

function addBlock(){
  newBlock={ __new:true, time:"12:00", title:"", tag:"work", detail:"", workout:null, checklist_item:[] };
  editId="new"; render();
}

function wireSheet(){
  if(sheet.type==="apply"){
    document.getElementById("apply-cancel").onclick=()=>{ sheet=null; render(); };
    document.querySelectorAll("[data-scope]").forEach(el=>el.onclick=async()=>{ const scope=el.dataset.scope; const s=sheet; const b=currentEditBlock(); sheet=null; editId=null; newBlock=null; render(); await applyScope(b,s.vals,scope); await reloadAndRender(); });
  }
  if(sheet.type==="reminders"){
    const en=document.getElementById("rem-enable"); if(en) en.onclick=async()=>{ await enableReminders(); sheet={type:"reminders"}; render(); };
    const on=document.getElementById("rem-allon"); if(on) on.onclick=()=>allReminders(true);
    const off=document.getElementById("rem-alloff"); if(off) off.onclick=()=>allReminders(false);
    document.getElementById("rem-close").onclick=()=>{ sheet=null; render(); };
  }
  if(sheet.type==="profile"){
    document.getElementById("pf-cancel").onclick=()=>{ sheet=null; render(); };
    document.getElementById("pf-addgoal").onclick=()=>{ const box=document.getElementById("pf-goals");
      const d=document.createElement("div"); d.className="itemed";
      d.innerHTML=`<input class="inp goaltxt" data-id="" value=""><button class="xbtn">✕</button>`;
      d.querySelector(".xbtn").onclick=()=>d.remove(); box.appendChild(d); d.querySelector("input").focus(); };
    document.querySelectorAll("#pf-goals .xbtn").forEach(x=>x.onclick=()=>x.closest(".itemed").remove());
    document.getElementById("pf-save").onclick=onSaveProfile;
  }
}

async function onSaveProfile(){
  const equip=document.getElementById("pf-equip").value.trim();
  const con=document.getElementById("pf-con").value.trim();
  const sports=document.getElementById("pf-sports").value.trim();
  const level=document.getElementById("pf-level").value.trim();
  await sb.from("person").update({equipment:equip,constraints:con,sports,level}).eq("id",DATA.person.id);
  const goals=[...document.querySelectorAll("#pf-goals .goaltxt")].map(i=>({id:i.dataset.id?+i.dataset.id:null,text:i.value.trim()})).filter(g=>g.text);
  const keptIds=new Set(goals.filter(g=>g.id).map(g=>g.id));
  for(const ex of DATA.goals){ if(!keptIds.has(ex.id)) await sb.from("goal").delete().eq("id",ex.id); }
  let sort=0; for(const g of goals){ if(g.id) await sb.from("goal").update({text:g.text,sort}).eq("id",g.id); else await sb.from("goal").insert({person_id:DATA.person.id,text:g.text,sort}); sort++; }
  sheet=null; await reloadAndRender();
}

/* ---------- workouts hub ---------- */
function shortName(w){ const n=w.name||("Routine "+w.code); return n.split("—")[0].split("-")[0].trim()||n; }
function daysForRoutine(code){ return DATA.days.filter(d=>d.block.some(b=>b.workout===code)).map(d=>d.weekday).sort((a,b)=>a-b); }
function firstWorkoutBlock(code){ for(const d of DATA.days){ const b=d.block.find(x=>x.workout===code); if(b) return b; } return null; }

function renderHub(){
  let h = `<div class="screen-top"><button class="backb" id="hubBack">‹</button><div class="hi">Workouts</div><button class="coachlink" id="coachBtn">✨ Ask the coach</button></div>`;
  DATA.workouts.forEach(w=>{
    const wds=daysForRoutine(w.code);
    const days = wds.length?wds.map(d=>DAYNAMES[d]).join(", "):"Not scheduled";
    const foc=w.focus||"strength";
    h += `<div class="rcard" data-routine="${w.code}"><div class="rn">${esc(w.name||('Routine '+w.code))}</div>`
      + `<div class="rm"><span class="fchip ${foc}">${esc(foc)}</span><span>${days}</span><span>· ${w.exercise.length} moves</span></div><span class="rchev">›</span></div>`;
  });
  h += `<button class="dash" id="newRoutine">+ New routine</button>`;
  h += `<div class="foot">Pick the days a routine runs — its workout block lands on your schedule automatically.</div>`;
  document.getElementById("wrap").innerHTML=h;
  document.getElementById("hubBack").onclick=()=>{ view="plan"; render(); };
  document.getElementById("coachBtn").onclick=()=>{ view="coach"; coachData=null; coachBusy=false; coachApplied=false; render(); };
  document.getElementById("newRoutine").onclick=newRoutine;
  document.querySelectorAll("[data-routine]").forEach(el=>el.onclick=()=>{ routeCode=el.dataset.routine; exEditId=null; exNew=null; view="routine"; render(); });
}

async function newRoutine(){
  const code = "R"+Date.now().toString(36).slice(-4);
  await sb.from("workout").insert({ person_id:DATA.person.id, code, name:"New routine", focus:"strength" });
  await load(); routeCode=code; exEditId=null; exNew=null; view="routine"; render();
}

function exEditor(e){
  const sec=e.section||"main";
  return `<div class="ed" data-exedit="${e.id||'new'}">
    <div class="field"><label>Exercise</label><input class="inp" id="ex-name" value="${esc(e.name||'')}"></div>
    <div class="field"><label>Sets / reps (text)</label><input class="inp" id="ex-scheme" value="${esc(e.scheme||'')}" placeholder="e.g. 3 × 10 / side"></div>
    <div class="field"><label>Section</label><div class="chips" id="ex-secs">${[["warmup","Warm-up"],["main","Main"],["cooldown","Cooldown"]].map(([k,l])=>`<div class="copt ${sec===k?'on':''}" data-exsec="${k}">${l}</div>`).join("")}</div></div>
    <div class="field"><label>Cue (optional)</label><input class="inp" id="ex-cue" value="${esc(e.cue||'')}" placeholder="a short form reminder"></div>
    <div class="edbtns"><button class="btn primary" id="ex-save">Save</button><button class="btn ghost" id="ex-cancel">Cancel</button>${e.__new?'':'<button class="btn danger" id="ex-del">Delete</button>'}</div>
  </div>`;
}

function renderRoutine(){
  const w=workoutByCode(routeCode);
  if(!w){ view="hub"; render(); return; }
  const foc=w.focus||"strength";
  const runWds=daysForRoutine(w.code);
  let h=`<div class="screen-top"><button class="backb" id="rBack">‹</button><input class="inp" id="r-name" value="${esc(w.name||'')}" style="flex:1;font-weight:700;font-size:16px"></div>`;
  h+=`<div class="chips" style="margin:0 2px 6px">${["strength","cardio","mobility"].map(f=>`<div class="copt ${f===foc?'on':''}" data-focus="${f}">${f}</div>`).join("")}</div>`;
  h+=`<div class="sec">Runs on</div>`;
  h+=`<div class="drow">`;
  [1,2,3,4,5,6,0].forEach(wd=>{ const on=runWds.includes(wd); h+=`<div class="dpill ${on?'on':''}" data-day="${wd}">${DAYNAMES[wd][0]}</div>`; });
  h+=`</div>`;
  if(runWds.length){
    h+=`<div style="margin:8px 2px 0">`;
    runWds.forEach(wd=>{ const b=dayFor(wd).block.find(x=>x.workout===w.code); h+=`<div class="dtrow"><span>${DAYFULL[wd]}</span><input class="inp" type="time" data-daytime="${wd}" value="${b?b.time:'17:00'}"></div>`; });
    h+=`</div>`;
  } else {
    h+=`<div class="hint" style="margin:8px 2px 0">Tap a day to schedule this routine — you can set a different time for each.</div>`;
  }
  ["warmup","main","cooldown"].forEach(secKey=>{
    const label={warmup:"Warm-up",main:"Main",cooldown:"Cooldown / stretch"}[secKey];
    const exs=w.exercise.filter(e=>(e.section||"main")===secKey);
    h+=`<div class="sec">${label}</div>`;
    exs.forEach(e=>{
      if(exEditId===e.id){ h+=exEditor(e); return; }
      h+=`<div class="exrow" data-ex="${e.id}"><span class="en">${esc(e.name)}${e.paused?`<span style="color:var(--dim);font-weight:600"> · paused</span>`:''}</span>${e.scheme?`<span class="es">${esc(e.scheme)}</span>`:''}</div>`;
    });
    if(exEditId==="new" && exNew && exNew.section===secKey){ h+=exEditor(exNew); }
    h+=`<button class="linkbtn" data-addex="${secKey}">+ Add exercise</button>`;
  });
  h+=`<div class="foot">Tap an exercise to edit it. Set/rep counts are a guide — the coach will fine-tune them later.</div>`;
  document.getElementById("wrap").innerHTML=h;

  document.getElementById("rBack").onclick=async()=>{ await saveRoutineName(); exEditId=null; exNew=null; view="hub"; await reloadAndRender(); };
  const nm=document.getElementById("r-name"); if(nm) nm.onchange=saveRoutineName;
  document.querySelectorAll("[data-focus]").forEach(el=>el.onclick=async()=>{ await sb.from("workout").update({focus:el.dataset.focus}).eq("id",w.id); await reloadAndRender(); });
  document.querySelectorAll("[data-day]").forEach(el=>el.onclick=()=>toggleRoutineDay(+el.dataset.day));
  document.querySelectorAll("[data-daytime]").forEach(el=>el.onchange=()=>updateRoutineDayTime(+el.dataset.daytime, el.value));
  document.querySelectorAll("[data-ex]").forEach(el=>el.onclick=()=>{ exEditId=+el.dataset.ex; exNew=null; render(); });
  document.querySelectorAll("[data-addex]").forEach(el=>el.onclick=()=>{ exNew={section:el.dataset.addex,name:"",scheme:"",cue:"",__new:true}; exEditId="new"; render(); });
  if(exEditId!==null) wireExEditor();
}

async function saveRoutineName(){ const nm=document.getElementById("r-name"); if(!nm) return; const v=nm.value.trim(); const w=workoutByCode(routeCode); if(w && v && v!==w.name){ await sb.from("workout").update({name:v}).eq("id",w.id); w.name=v; } }

async function deleteBlockCascade(id){
  await sb.from("block_done").delete().eq("block_id",id);
  await sb.from("block_override").delete().eq("block_id",id);
  const { data:items } = await sb.from("checklist_item").select("id").eq("block_id",id);
  if(items){ for(const it of items){ await sb.from("item_check").delete().eq("checklist_item_id",it.id); } }
  await sb.from("checklist_item").delete().eq("block_id",id);
  await sb.from("block").delete().eq("id",id);
}
async function toggleRoutineDay(wd){
  const w=workoutByCode(routeCode); const day=dayFor(wd);
  const has=day.block.find(b=>b.workout===w.code);
  if(has){ await deleteBlockCascade(has.id); }
  else{
    const t=(firstWorkoutBlock(w.code)?.time)||"17:00";
    await sb.from("block").insert({ day_id:day.id, sort:99, time:t, title:shortName(w), tag:"play", detail:"", workout:w.code, notify:false });
  }
  await reloadAndRender();
}
async function updateRoutineDayTime(wd, timeVal){
  const w=workoutByCode(routeCode); const b=dayFor(wd).block.find(x=>x.workout===w.code);
  if(b && timeVal){ await sb.from("block").update({ time:timeVal }).eq("id", b.id); b.time=timeVal; }
}

function wireExEditor(){
  document.querySelectorAll("#ex-secs .copt").forEach(c=>c.onclick=()=>{ document.querySelectorAll("#ex-secs .copt").forEach(x=>x.classList.remove("on")); c.classList.add("on"); });
  document.getElementById("ex-cancel").onclick=()=>{ exEditId=null; exNew=null; render(); };
  document.getElementById("ex-save").onclick=onSaveExercise;
  const d=document.getElementById("ex-del"); if(d) d.onclick=onDeleteExercise;
}
async function onSaveExercise(){
  const w=workoutByCode(routeCode);
  const name=document.getElementById("ex-name").value.trim();
  if(!name){ alert("Name the exercise."); return; }
  const scheme=document.getElementById("ex-scheme").value.trim();
  const cue=document.getElementById("ex-cue").value.trim();
  const section=document.querySelector("#ex-secs .copt.on")?.dataset.exsec||"main";
  if(exEditId==="new"){ await sb.from("exercise").insert({ workout_id:w.id, name, scheme, cue, section, sort:w.exercise.length }); }
  else { await sb.from("exercise").update({ name, scheme, cue, section }).eq("id",exEditId); }
  exEditId=null; exNew=null; await reloadAndRender();
}
async function onDeleteExercise(){
  if(!confirm("Delete this exercise?")) return;
  await sb.from("exercise").delete().eq("id",exEditId);
  exEditId=null; exNew=null; await reloadAndRender();
}

/* ---------- coach ---------- */
function renderCoach(){
  let h = `<div class="screen-top"><button class="backb" id="coachBack">‹</button><div class="hi">Coach</div></div>`;
  h += `<div class="hint" style="margin:0 2px 12px">Ask for advice, or get a weekly progression review. Nothing changes until you approve.</div>`;
  h += `<textarea class="inp" id="coach-input" rows="3" placeholder="e.g. My left side feels weaker — how should I adjust?">${esc(coachDraft)}</textarea>`;
  h += `<div class="edbtns"><button class="btn primary" id="coach-ask">Ask the coach</button><button class="btn" id="coach-review">Review my week</button></div>`;

  if(coachBusy){
    h += `<div class="hint" style="margin-top:14px">Thinking…</div>`;
  } else if(coachData){
    if(coachData.ok===false){
      h += `<div class="err" style="padding:16px 2px;text-align:left">${esc(coachData.error||"Something went wrong.")}</div>`;
    } else if(coachData.paused){
      h += `<div class="coachbox">${esc(coachData.message||"")}</div>`;
    } else {
      if(coachData.lite_mode){ h += `<div class="badge">⚡ Lite mode (Haiku)</div>`; }
      else { h += `<div class="badge" style="color:var(--accent);border-color:rgba(106,168,245,.4)">Sonnet</div>`; }
      h += `<div class="coachbox">${esc(coachData.text||"")}</div>`;
      const b = coachData.budget||{};
      h += `<div class="hint" style="margin-top:10px">This month: $${(+(b.month_spent||0)).toFixed(2)} of $${(+(b.month_allowance||0)).toFixed(2)}</div>`;
      const prop = Array.isArray(coachData.proposal)?coachData.proposal:[];
      if(prop.length){
        h += `<div class="sec">Proposed changes</div>`;
        prop.forEach((op,i)=>{
          if(op.type==="note"){ h += `<div class="coachbox" style="margin-top:8px">${esc(op.text||"")}</div>`; return; }
          let label="";
          if(op.type==="update_exercise"){
            const f=op.fields||{}; const parts=[];
            if(f.scheme!==undefined) parts.push("scheme → "+esc(f.scheme));
            if(f.load!==undefined) parts.push("load → "+esc(f.load));
            if(f.cue!==undefined) parts.push("cue → "+esc(f.cue));
            label="Update "+esc(op.name||"")+": "+parts.join(", ");
          } else if(op.type==="add_exercise"){
            label="Add to "+esc(op.workout_code||"")+" ("+esc(op.section||"main")+"): "+esc(op.name||"")+" — "+esc(op.scheme||"");
          } else if(op.type==="remove_exercise"){
            label="Remove "+esc(op.name||"");
          } else if(op.type==="pause_exercise"){
            label="Pause "+esc(op.name||"")+(op.reason?" — "+esc(op.reason):"");
          } else if(op.type==="resume_exercise"){
            label="Resume "+esc(op.name||"");
          }
          h += `<div class="itemed"><input type="checkbox" class="opck" data-op="${i}" checked><span style="flex:1;font-size:14px">${label}</span></div>`;
        });
        h += `<div class="edbtns"><button class="btn primary" id="coach-apply">Apply selected</button><button class="btn ghost" id="coach-dismiss">Dismiss</button></div>`;
      }
      if(coachApplied){
        h += `<div class="mbr" style="margin-top:12px"><span>Applied ✓</span></div>`;
        h += `<div class="edbtns"><button class="btn primary" id="coach-backhub">Back to Workouts</button></div>`;
      }
    }
  }

  document.getElementById("wrap").innerHTML = h;

  document.getElementById("coachBack").onclick=()=>{ view="hub"; render(); };
  const ta=document.getElementById("coach-input"); if(ta) ta.oninput=()=>{ coachDraft=ta.value; };
  const ask=document.getElementById("coach-ask"); if(ask) ask.onclick=()=>callCoach("ask");
  const rev=document.getElementById("coach-review"); if(rev) rev.onclick=()=>callCoach("review");
  const ap=document.getElementById("coach-apply"); if(ap) ap.onclick=applyProposal;
  const dis=document.getElementById("coach-dismiss"); if(dis) dis.onclick=()=>{ coachData=null; render(); };
  const bh=document.getElementById("coach-backhub"); if(bh) bh.onclick=()=>{ view="hub"; render(); };
}

async function callCoach(mode){
  coachMode=mode; coachBusy=true; coachData=null; coachApplied=false; render();
  const message = mode==="ask" ? coachDraft.trim() : "";
  if(mode==="ask" && !message){ coachBusy=false; coachData={ok:false,error:"Type a question first."}; render(); return; }
  try{
    const r = await fetch(SUPA_URL + "/functions/v1/coach", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "apikey":SUPA_KEY, "Authorization":"Bearer "+SUPA_KEY },
      body: JSON.stringify({ slug:SLUG, mode, message })
    });
    coachData = await r.json();
  }catch(e){ coachData = { ok:false, error:"Network error — try again." }; }
  coachBusy=false; render();
}

async function applyProposal(){
  const sel = [...document.querySelectorAll(".opck")].filter(c=>c.checked).map(c=>+c.dataset.op);
  const ops = sel.map(i=>coachData.proposal[i]).filter(Boolean);
  for(const op of ops){
    if(op.type==="update_exercise"){
      await sb.from("exercise").update(op.fields||{}).eq("id", op.exercise_id);
    } else if(op.type==="add_exercise"){
      const w = DATA.workouts.find(w=>w.code===op.workout_code);
      if(w){ const sort=w.exercise.length; await sb.from("exercise").insert({ workout_id:w.id, name:op.name, scheme:op.scheme||"", cue:op.cue||"", section:op.section||"main", sort }); }
    } else if(op.type==="remove_exercise"){
      await sb.from("exercise").delete().eq("id", op.exercise_id);
    } else if(op.type==="pause_exercise"){
      await sb.from("exercise").update({ paused:true, paused_reason: op.reason||"" }).eq("id", op.exercise_id);
    } else if(op.type==="resume_exercise"){
      await sb.from("exercise").update({ paused:false, paused_reason:"" }).eq("id", op.exercise_id);
    }
  }
  await load();
  coachApplied=true; coachData.proposal=[]; render();
}

async function syncTimezone(){
  try{
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(tz && DATA && DATA.person && DATA.person.timezone!==tz){
      await sb.from("person").update({ timezone:tz }).eq("id", DATA.person.id);
      DATA.person.timezone = tz;
    }
  }catch(e){}
}

function openFromLink(){
  const bid = +(params.get("b")||0);
  if(!bid || !DATA) return;
  for(const d of DATA.days){ if(d.block.some(x=>x.id===bid)){ viewWd=d.weekday; openId=bid; view="plan"; return; } }
}
(async()=>{ injectStyle(); try{ await load(); openFromLink(); render(); syncTimezone(); }catch(e){ document.getElementById("wrap").innerHTML=`<div class="err">${e.message}</div>`; } })();
if("serviceWorker" in navigator){ navigator.serviceWorker.register("sw.js").catch(()=>{}); }
