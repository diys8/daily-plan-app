export const SUPA_URL = "https://nalxowbclhvopjqkvweh.supabase.co";
export const SUPA_KEY = "sb_publishable_rILlPOqKrtUSP-gEuTETpg_smWK7jPU";
export const VAPID_PUBLIC = "BAH7JJEtqN0Iy3z_es_I-LT9bWEqz_pgxg12RQHhZyq4-AcZ5TFhtSXZrBjzYlp_NgnEHcQ_KSwb3-ZlzO8DP08";
export const DAYNAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
export const DAYFULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
export const BELL = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
export const PENCIL = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';

export const S = {
  DATA: null,
  viewWd: new Date().getDay(),
  todayWd: new Date().getDay(),
  todayDate: null,
  openId: null,
  editMode: false,
  editId: null,
  sheet: null,
  CHECKS: {},
  LOGS: {},
  OVR: {},
  BDONE: {},
  SESSIONS: {},
  RECENT_SESSIONS: {},
  DEMO_SET: new Set(),
  newBlock: null,
  view: "plan",
  routeCode: null,
  exEditId: null,
  exNew: null,
  workoutBlockId: null,
  workoutExOpen: null,
  coachBusy: false,
  coachDraft: "",
  coachMessages: [],
  coachProposal: null,
  coachApplied: false,
  SLUG: null,
  showPast: false,
  render: () => {},
};
