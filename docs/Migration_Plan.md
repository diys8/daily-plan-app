# Daily Plan — Migration Plan

_Written 2026-08-24. Companion to `App_Build_Plan.md`, `Redesign_Build_Order.md` and the code review._

**Trigger:** Diyanah expects this to become more complicated, to serve more people than the two of us, and possibly to grow into a wider suite. That changes what the project needs from its tooling and its architecture.

---

## Status — 2026-08-28 (updated end of redesign session)

**Migration A complete. Redesign R1–R7 complete. Commits not yet pushed.**

| Step | State |
|---|---|
| **A1** — take stock of the repo | **Done.** Push access confirmed. |
| **A2** — export what exists into files | **Done.** Commit `32e6e23`. |
| **A3** — split into modules | **Done.** Seven ES modules. |
| **A4** — Vitest test runner | **Done.** 34 tests passing. |
| **A7** — Render publish dir | **Done.** Set to `public/`. |
| **R1** — Design system + Today | **Done.** Commit `6237ba6`. |
| **R2** — Workout as its own screen | **Done.** Commit `bd7667f`. |
| **R3** — Exercise demos + resolution ladder | **Done.** Commit `b712a31`. |
| **R4** — Finishing a workout (recap) | **Done.** Commit `ed53982`. |
| **R5** — Train hub + routine editor | **Done.** Commit `10a4100`. |
| **R6** — Coach thread + quick prompts | **Done.** Commit `632b55c`. Edge function v4 deployed. |
| **R7** — Profile overhaul + SW cache bump | **Done.** Commit `301f5ef`. Shell files not yet pushed. |

**10 local commits ahead of origin/main — need a `git push` and Render deploy.**

### What was done

**A1 — push access confirmed.** Git is installed and signed in as `diys8` with the credential saved in Windows. Verified by a rehearsal push that GitHub accepted; nothing was written. Nothing was needed from Diyanah.

**The install fix shipped.** `app_shell_update/` was pushed as commit `74163bf` and deployed — the four PNG icons, the maskable icon, the apple-touch icon and the five install meta tags. All eight files confirmed serving live. The phone steps in `app_shell_update/HOW_TO_PUSH.md` were completed.

**A2 — snapshot committed,** `32e6e23`, 21 files, nothing cleaned up:
- `src/app.js` and `src/sw-logic.js`, out of the `asset` table
- `supabase/migrations/` — all **9** tracked migrations (the plan said 8; the ninth is the R0 lockdown)
- `supabase/functions/` — `asset`, `notify`, `coach`
- `docs/` — the four plans plus the code review, saved from its artifact as a real file

**Verification:** `app.js`, `sw-logic.js` and all nine migrations match the database **byte-for-byte** (MD5 compared against `md5(convert_to(...,'UTF8'))` server-side). The three edge functions are faithful transcriptions but Supabase exposes **no checksum for function source**, so they are unverified reference copies until deployed from the repo. This limitation is recorded in `supabase/functions/README.md`.

### What A2 turned up

**1. Render was never being told about pushes.** Auto-deploy shows as enabled, branch `main`, trigger on commit — but the service had exactly **one deploy in its history**, the manual one from 21 August. The install-fix push produced no deploy; it had to be triggered by hand through the Render API. Most likely the repo was connected by public URL rather than through Render's GitHub app, so no webhook exists. **A6 ("one deploy command") would have silently done nothing.** Not yet repaired.

**2. There are five edge functions, not two.** `asset`, `notify` and `coach` are load-bearing. `app` and `publish` are dead scaffolding from before the move to Render — see the security section below. **No secret is hardcoded in any of the five**; keys come from environment variables or the `app_secret` table.

**3. `updated_at` on the `asset` table does not change on write.** Those timestamps are currently the closest thing the project has to a changelog and they are wrong — `app.js` reads 22 August for content edited on the 26th. A repo replaces them.

### Security — found 2026-08-26, NOT yet fixed

**Three front doors reach the production database, not one:**

| | What | State |
|---|---|---|
| 1 | The real app on Render | Current code. Fine. |
| 2 | Edge function `app` | A complete, working copy of Daily Plan frozen at **21 August**, carrying a working publishable key, pointed at the live database. Answers 200. |
| 3 | Public storage bucket `app` | The same stale copy at a third address, uploaded 21 August. |

`publish` can rewrite #3 at any time: `verify_jwt` is off and it runs with the **service-role key**, so any anonymous caller can trigger it.

Nothing in the live app references `app`, `publish` or the bucket — checked every reference in `app.js`, `sw-logic.js` and `index.html`.

**RETIRED 2026-08-26, approved by Diyanah.** Full content archived first to `Health/_archive/dead_supabase_functions_2026-08-26/` (8 files + a README), verified readable.

- `app` and `publish` — replaced with a 410 stub and `verify_jwt` switched **on**. Both now return 401 to anonymous callers instead of serving the app. They could not be deleted outright: this MCP connection exposes no delete tool for edge functions. **Two clicks remain for Diyanah** in the Supabase dashboard → Edge Functions → delete `app` and `publish`. They are inert until then.
- The storage bucket `app` — set to **private**. Deleting the objects was refused by Supabase's `storage.protect_delete()` trigger, which requires the Storage API and its key. Private achieves the same closure. The four objects still exist in the bucket; delete them from the dashboard when convenient.

**Verified after the change:** `app` 401, `publish` 401, `asset` 200, `coach` reachable, `notify` reachable, the live site 200. Nothing that works was touched.

**One correction to the original assessment:** the *bucket* copy was never a working app. Supabase serves storage HTML as `text/plain` under `default-src 'none'; sandbox`, so it rendered as text rather than executing. It exposed file contents, not a functioning front door. The **edge function** copy was the real one — it served `text/html` and did run.

**But the leftovers are not the real exposure.** Confirmed live from `pg_policies`: `anon` still holds **SELECT on 13 tables, INSERT on 12, UPDATE on 11, DELETE on 7**. Because `person` is readable with `using (true)`, anyone holding the key — which is published in the page source by design — can list every person row and obtain **both private slugs**. The private-link model is doing no work. This is **F1**, still open, and it is a build task (R0), not a quick patch.

### Landmine — read before the next deploy

`docs/`, `src/` and `supabase/` are safe **only because nothing has deployed since the snapshot landed.** Render publishes the repo root, so the next deploy — by hand, or by a repaired auto-deploy firing on its own — publishes the migrations, the function source and the planning documents at the app's public address. Verified 404 at the time of writing.

**The Render reconnection and the move of the site files into their own folder must happen together, before anything deploys.**

### Foundation audit — 2026-08-26

Ran against the repo. **8 pass / 2 partial / 8 missing → 12 pass / 1 partial / 5 missing** after fixing what could be fixed in files (commit `a149285`): `.gitignore`, `README.md`, `.env.example`, `DECISIONS.md`.

**Still missing, and why it's acceptable for now:** CI, a linter, automated tests and a lockfile are migration steps A4 and A5, already scheduled. An incident runbook only starts to matter when people wait on the app.

**The one remaining floor item:** GitHub dependency alerts. That is a repository setting, not a file — and there is no dependency manifest for it to scan yet, since the browser loads `supabase-js` straight from a URL and the edge functions use `jsr:`/`npm:` specifiers. Worth switching on regardless.

**Ranked by consequence, the audit's own conclusion:**
1. **Nothing backs up the data.** Free plan, no restorable backups, no export anywhere, and **no restore has ever been performed**. This is F7, and it outranks everything because it is the only finding where the loss is permanent.
2. **F1** — the open database.
3. **Nothing is watching.** No error monitoring. A failing coach or silent notifications would look perfectly healthy to an uptime check.
4. No tests, no staging — nothing could currently tell us a change broke something.

**What the audit could not see:** it checks whether things are *configured*, not whether they are *right*. There are no tests, so there is nothing to assess. Supabase's own security advisor returns almost nothing — the wide-open `anon` policies read to it as a deliberate choice, not a fault. **F1 is invisible to automated checking.**

### Next session, in order

1. ~~Delete the three leftovers.~~ **Done 2026-08-26** — retired and verified. Two dashboard clicks remain to delete the stubs properly.
2. **Backups + a tested restore (F7).** Promoted above F1 by the audit: it is the only permanent loss.
3. **F1** — the real security work.
4. **The folder move + reconnect Render** — together, before any deploy.
5. **Re-cut the icons** to the new amber `#f2952c`; they still carry `#e3953b`. Deploy with the folder move.
6. **A3** — split `app.js` into modules.

The docs in `docs/` inside the repo are a copy taken at `32e6e23` and are now one revision behind this file. Re-sync them when convenient.

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

**A1 — Take stock of the repo. ✅ DONE 2026-08-26.** Confirm push access to `github.com/diys8/daily-plan-app`. Everything downstream depends on this, so check it first.

**A2 — Export what exists into files. ✅ DONE 2026-08-26 — commit `32e6e23`.** Nine migrations, not eight. Five edge functions, not two — three committed, two dead and pending deletion.
- `app.js` (57,606 chars) and `sw-logic.js` from the `asset` table
- the `coach` and `notify` edge functions
- the 8 tracked migrations
- `App_Build_Plan.md`, `Redesign_Build_Order.md`, the code review, and this file, into `/docs`
Commit that verbatim as the first commit. **Do not clean anything up yet** — the first commit should be exactly what is running, so anything that breaks later is provably our change.

**A3 — Split it into modules. ⬅ NEXT.** By screen, following the shape it already has: `today.js`, `workout.js`, `train.js`, `coach.js`, `profile.js`, plus `db.js` (all database calls in one place), `render.js`, `dates.js`, `styles.css`. This is the moment F9 gets fixed — the stylesheet comes out of the logic file and the sections get names.

**A4 — Add the test harness.**
- **Vitest** for pure logic — the date rules, the recurrence/clash logic in `applyScope`, `esc()`, section grouping. These are the parts most likely to be silently wrong, and they need no browser.
- **Playwright** for journeys — the checks already written into each R-stage of the build order, run against a staging database.
- Both run with one command, and in GitHub Actions on every push.

**A5 — Stop testing in production.** A second free Supabase project as `staging`, seeded from a snapshot. All development points at staging; production is only ever reached by a deploy.

**A6 — One deploy command.** Runs the tests, and only if they pass, ships. Whether that writes to the asset row (Option B) or pushes to the repo (Option A) is settled by the decision above.

> **Blocker found 2026-08-26:** Render is not receiving push notifications from GitHub, so pushing does not deploy. Auto-deploy *reads* as enabled but has never fired — deploys have to be triggered through the Render API by hand. Repair the GitHub→Render connection **before** building anything on top of it, and do it in the same change as moving the site files into their own folder (see the landmine note in Status).

**A7 — A `CLAUDE.md` in the repo root.** The engineering rules, the palette, the do-not-relitigate list, the deploy and rollback procedure. So any future session — hers, mine, or someone else's — starts with the context this one built rather than rediscovering it.

### What she needs to do
- ~~Confirm GitHub access (A1).~~ **Done 2026-08-26 — nothing was needed; the credential was already saved.**
- **Approve deleting the two dead edge functions and the four stale bucket objects.** Backed up and verified; needs an explicit yes because it cannot be undone.
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
