# Daily Plan — Migration Plan

_Written 2026-08-24. Companion to `App_Build_Plan.md`, `Redesign_Build_Order.md` and the code review._

**Trigger:** Diyanah expects this to become more complicated, to serve more people than the two of us, and possibly to grow into a wider suite. That changes what the project needs from its tooling and its architecture.

---

## Status — 2026-08-26

**Migration A is go.** Decided 2026-08-26; development moves to Claude Code now, before the redesign is built. Start at **A1**.

The prompt to paste into the new Claude Code session is in **`Claude_Code_Handoff.md`** (same folder). It carries the repo, the Supabase project, the locked palette, the engineering rules, what shipped on 2026-08-26, and what is still open — so the new session does not rediscover any of it.

One thing carries across as an open action rather than a step: **`app_shell_update/` has not been pushed** to `github.com/diys8/daily-plan-app`. That push is also the A1 access check — if it succeeds, A1 is answered.

---

## 0. There are two migrations here, not one

They get bundled together in conversation and they should not be bundled in execution.

| | What moves | Size | Reversible? |
|---|---|---|---|
| **Migration A** | **How we build it.** Cowork → Claude Code, with a real repo, real files, real tests, and a deploy gate. | ~1 day | Yes, trivially |
| **Migration B** | **What it is.** Two hardcoded people → real accounts, isolated data, onboarding, and someone paying for the AI. | Weeks | No, not really |

**Do A first, then the redesign, then decide on B.** A is cheap, low-risk, and it makes B survivable. Doing B without A means changing the security model of a live app by hand-editing a database row with no test suite and no way to diff what changed. That is how people lose data.

---

## Migration A — Development moves to Claude Code

### Why, concretely

Not "because it is more professional". Five specific things the current setup cannot do:

1. **No history.** The entire app is one row in a database. Changes are tracked by copying that row to `app.js.bak.<stage>`. There is no diff, no record of what changed or why, and no way to see when a bug was introduced. A repo gives every change a message, an author, a date and a one-command revert.
2. **No branches.** Every edit lands in production the moment it is saved. There is no "try it and see" that does not affect the live app on her phone.
3. **Tests cannot run.** The build order asks for checks written before the feature — but there is nowhere for them to execute. In a repo they run automatically on every change.
4. **No gate before production.** Right now a typo ships instantly. That is a feature at two users and a liability at twenty.
5. **One conversation at a time.** Cowork is one thread on a phone. A repo can be worked on from several sessions, and the work is visible to anyone who opens it.

### What Cowork keeps doing

This session is the proof: design review, reading the code, planning, deciding, checking in from a phone. **Migration A moves the building, not the thinking.** She should still review from her phone — that has worked well and nothing about it changes.

### The one real architectural decision inside A

Today the app's logic is a row in the database, fetched by the page. That is why an edit reaches her phone in seconds with no deploy. Moving to real files breaks that, because the file loads via a URL with a query parameter and relative imports between modules will not resolve.

**Option A — move the app into the static site** (the existing `diys8/daily-plan-app` repo on Render).
Real files, ordinary imports, no bundler, no build step. Every change is a commit and a deploy of roughly a minute.

**Option B — keep the database row and add a bundler.**
Preserves the instant deploy. Costs a build step — the one piece of tooling that currently does not exist.

**Recommendation: Option A.** The instant-deploy-from-anywhere property is exactly what you should give up once the app has more than two users and a test suite worth waiting for. A minute is not slow, and a gate before production is the point. Option B keeps a convenience that stops being a convenience the moment a bad edit reaches a stranger's phone.

### Steps

**A1 — Take stock of the repo.** Confirm push access to `github.com/diys8/daily-plan-app`. Everything downstream depends on this, so check it first.

**A2 — Export what exists into files.**
- `app.js` (57,606 chars) and `sw-logic.js` from the `asset` table
- the `coach` and `notify` edge functions
- the 8 tracked migrations
- `App_Build_Plan.md`, `Redesign_Build_Order.md`, the code review, and this file, into `/docs`
Commit that verbatim as the first commit. **Do not clean anything up yet** — the first commit should be exactly what is running, so anything that breaks later is provably our change.

**A3 — Split it into modules.** By screen, following the shape it already has: `today.js`, `workout.js`, `train.js`, `coach.js`, `profile.js`, plus `db.js` (all database calls in one place), `render.js`, `dates.js`, `styles.css`. This is the moment F9 gets fixed — the stylesheet comes out of the logic file and the sections get names.

**A4 — Add the test harness.**
- **Vitest** for pure logic — the date rules, the recurrence/clash logic in `applyScope`, `esc()`, section grouping. These are the parts most likely to be silently wrong, and they need no browser.
- **Playwright** for journeys — the checks already written into each R-stage of the build order, run against a staging database.
- Both run with one command, and in GitHub Actions on every push.

**A5 — Stop testing in production.** A second free Supabase project as `staging`, seeded from a snapshot. All development points at staging; production is only ever reached by a deploy.

**A6 — One deploy command.** Runs the tests, and only if they pass, ships. Whether that writes to the asset row (Option B) or pushes to the repo (Option A) is settled by the decision above.

**A7 — A `CLAUDE.md` in the repo root.** The engineering rules, the palette, the do-not-relitigate list, the deploy and rollback procedure. So any future session — hers, mine, or someone else's — starts with the context this one built rather than rediscovering it.

### What she needs to do
- Confirm GitHub access (A1).
- Approve creating a second free Supabase project for staging.
- Nothing else. The workflow from her side is unchanged: review on the phone, say yes or no.

---

## Migration B — From two people to many

**Do not start this until Migration A and the redesign are done.** Not caution for its own sake: B rewrites the security model, and doing that without tests is the highest-risk thing in this whole document.

### What "more people" actually means — the fork that changes everything

**B-friends — a handful of people you know.** Ten or twenty. You know their names.
**B-product — strangers can sign up.**

These are not the same project. The honest gap between them:

| | B-friends | B-product |
|---|---|---|
| Sign-in | Magic link, no passwords | Same, plus account recovery, support |
| Who pays for the AI coach | **You do** | They do — needs billing |
| Legal | Informal | Privacy policy, data deletion, health-data duty of care |
| Exercise illustrations | Yours, reused | **Needs licensing or per-user generation at scale** |
| When it breaks | You hear about it at dinner | Support inbox, error monitoring, on-call |
| Effort beyond B-friends | — | Several times over |

**This is the decision to make before any of B gets built,** and it is a product decision, not a technical one.

### B1 — Real identity (both branches need this)
Supabase Auth with email magic links. A `profile` row per authenticated user. **Every table's access rule changes from "anyone may do anything" to "only the signed-in owner".** This is finding F1 from the code review, solved properly rather than patched. The private-link model retires; existing links keep working during a transition window so nobody is locked out mid-move.

### B2 — Data becomes per-user
Today `person_id` exists but nothing enforces it. Every query, policy and edge function gets scoped to the signed-in user. Diyanah's and Gong's rows migrate to real accounts with their history intact — that migration gets its own tested script and a verified backup before it runs.

### B3 — A new user has to get somewhere
Right now a plan is seeded by hand. A new user signs up to an empty app. That needs an onboarding flow: goals, equipment, injuries, days available — then the coach builds a starting plan. **This is the biggest new product surface in B**, and it is the thing that decides whether anyone stays past day one.

### B4 — Somebody has to pay for the coach
The Anthropic key is yours. Today the budget is one shared row capped at roughly $0.83 a month, and the observed cost is about $0.006 a call. **With N users, every conversation spends your money.** Per-user allowances, a hard cap that fails politely, and — for B-product — billing before launch, not after. Decide the answer to "who pays" before writing any of B.

### B5 — The illustration problem gets much bigger
Her set covers 16 of 22 of *her* moves. Other people do different exercises. The needs-a-demo queue works when one person fills it in batches; it does not work when a hundred people each hit a gap. **B-product needs either a licensed library with clear image rights or automated generation with a review step** — and the licensing question the code review left open becomes blocking rather than optional.

### B6 — Operations
Error monitoring, real backups with a tested restore, and a way for a user to export or delete their data. F6 and F7 from the code review stop being nice-to-have.

---

## Recommended order

| | | Gate before starting |
|---|---|---|
| **1** | **Migration A** — repo, modules, tests, staging, deploy gate | Confirm GitHub access |
| **2** | **Stage R0** — the safety fixes, now with tests behind them | A complete |
| **3** | **R1–R7** — the redesign | R0 green |
| **4** | **Decide B-friends or B-product** | Redesign live and used for a few weeks |
| **5** | **Migration B** — identity, per-user data, onboarding, budget | The decision above |

The gap between 3 and 4 is deliberate. Use the redesigned app for a while first. The answer to "should other people have this" is much clearer once the thing they would be given actually exists.

---

## What this changes in the existing documents

- `Redesign_Build_Order.md` stays exactly as written. It just executes inside a repo with tests instead of against a database row by hand — which is what its "checks to write first" always assumed.
- Stage R0's F1 (closing the database) becomes a **stopgap** rather than the final answer: lock it down now, replace it properly with real auth in B1.
- The demo problem (§R3.1) escalates from "an open question" to **"blocking"** if the answer to the fork is B-product.
