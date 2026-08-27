# Daily Plan App — Build Plan

_Last updated: 2026-08-22_

## Goal
Turn the current static daily-plan HTML files into a **proactive app** on the phone that:
1. Sends a **notification** for each schedule block (food, supplements, work, workout).
2. Lets me **edit** the plan myself (times, blocks, exercises) — no need to ask Claude each time.
3. Gives **AI workout suggestions** tuned to my badminton goals, so I can refresh the workouts.

Two versions: **Diyanah** and **Gong** (same app, separate data).

## Decisions made
- **Approach:** Build one real custom app (installable PWA + database). Chosen over stitching existing apps together.
- **Exercise illustrations:** **Option 2 — real exercise-demo library.** When a new/swapped exercise is added, the app auto-pulls a ready-made animated demo + written instructions from a free exercise library. Chosen for accuracy and ease (no AI re-rolling). Custom flat illustrations we already made can stay for the core moves.
- **Tool:** Stay in Cowork (not Claude Code). Claude builds and hosts everything.
- **App type:** Installable **PWA** — a hosted web app saved to the phone home screen, opens full-screen with its own icon, supports notifications. No app store, no Play Protect warning.
- **Supabase:** Reuse existing account, **new separate project** (keeps it isolated from the badminton-poc app). Free tier covers it.
- **Workout shuffle:** Each exercise has a **lock** toggle. Lock the ones you like; "Suggest" only replaces unlocked ones. Re-shuffle as many times as wanted.
- **Editable goals:** Goals are editable text in the app; the AI suggestion reads current goals each time.
- **Build principle:** Keep it simple and practical — no login system (just the two of us), no unnecessary frameworks. Maintainable over clever.

## Architecture (four pieces, plain language)
1. **Database (Supabase)** — stores the plan (days, blocks, food, supplements, exercises), goals, and notification settings for both people.
2. **The app (PWA)** — what you see and tap: NOW card, timeline, illustrated workouts, editor, suggest button. Hosted on a free host, installed to the phone home screen.
3. **Scheduler (Supabase cron)** — a cloud "alarm clock" that checks every minute and pushes a notification when a block starts (works with the app closed).
4. **AI function** — a small server function that takes current goals + unlocked exercises and returns suggested swaps.

No login system (just the two of us), no heavy frameworks. Deliberately simple and maintainable.

## Testing approach
- **Test-driven:** write the checks first, then build the feature so each piece proves itself.
- **User-journey tests:** walk real flows end-to-end (e.g. morning → NOW card shows breakfast → notification fires → open workout → lock 2 moves → shuffle → new set appears).
- Claude runs all tests before presenting, so each stage arrives working.

## Frontend design
- Same look as the current app: **NOW card** (current block) on top, tap-through **timeline**, illustrated **workout screen**.
- Each exercise row has a **lock** toggle; "Suggest new" replaces only unlocked moves.
- **Goals** shown and editable inline above the workout.
- **Any block is tappable anytime** (not just the current one) — opens its detail, since things get done out of order.
- **Each block's subtitle is an editable notes / to-do list** (e.g. Job applications block opens its checklist; Breakfast opens its items). Editable by the user.
- Mockup reviewed and approved (2026-08-20).

## Build stages
**Stage 1 — Foundation**
Set up the database; move the current Diyanah plan into it. _(You: create 1 free account, approve connection.)_

**Stage 2 — The app**
Installable web app showing the plan from the database (viewer only). Install on phone. _(You: install + test.)_

**Stage 3 — Editing**
In-app screens to change times, add/remove blocks, swap exercises. Saved to the database. _→ Working editable app reached here; we pause and review before moving on._

**Stage 4 — Notifications**
Background scheduler + phone push for each block. _(You: allow notifications.)_

**Stage 5 — AI workout suggestions**
"Suggest workout" feature using badminton goals; new moves auto-pull library demos. _(You: nothing extra.)_

**Stage 6 — Gong's version**
Repeat with Gong's supplements + Workout A/B plan and his data.

## What you do (one-time, guided, ~30–45 min total)
- Create ~2 free accounts (database service; possibly an AI key) and approve connections.
- Install the app on the phone and allow notifications.
- Review/test at each stage.

## Cost
- Effectively **$0/month** for personal use (free tiers cover database, hosting, push).
- AI suggestions cost a few cents per use.

## Ongoing upkeep
- Low. Occasional check if a free service changes something.

## Confirmed behaviour (from grilling)
- **To-do lists:** each block has tick-off checkboxes. The *items* stay the same day to day (a per-day-type template); **checkboxes reset fresh each morning**; unfinished items do **not** roll over.
- **Editing:** changing a time/to-do prompts **"Only today" vs "Every [weekday]"** so one-offs don't change the template.
- **Mark block done → its reminder won't fire** (e.g. breakfast ticked at 7:30 cancels the 8:00 ping).
- **Two people, two phones:** one app + one database, **two private links**, each phone pinned to its person. No profile switcher. Notifications target each phone separately.
- **Notifications:** every block by default; each can be turned off individually.
- **Internet:** app needs a connection to sync (data plan fine); last view cached so it still displays offline.
- **Privacy:** no passcode; hard-to-guess private link per person.
- **Workout detail:** show moves + demo + instructions + **sets/reps/rest as text** (info only, no logging).
- **AI progression (Stage 5):** feedback-driven — one tap after a session ("too easy / just right / too hard") lets the AI apply progressive overload week to week (heavier / more reps / harder variation), periodize toward tournaments, and add deload weeks. Respects goals, equipment, and injury areas. To revisit and build in Stage 5.
- **Workout logging + feedback (Stage 5, confirmed):** each exercise is individually tickable (done) with a quick "how it felt" tap (too easy / just right / too hard; too light / too heavy for weighted moves). Stored per session → this is the AI's input. Build the logging FIRST so real data accumulates, then the AI review.
- **AI assessment cadence (confirmed):** weekly progression review (reads the week's sessions + feedback + training frequency → proposes next week: heavier / more reps / harder variation, or deload) + small after-each-session tweaks + a "suggest anytime" button. Deload week every 4–6 weeks.
- **Human-centered workouts (principle, from the first prescription):** never prescribe machine-like fixed volume cold. Start conservative (often 2 sets, rep ranges not fixed counts), autoregulate by feel (e.g. "stop ~2 reps before failure" / reps-in-reserve), ramp gradually with built-in deload weeks. AI sets the *starting* volume from the user's actual level + equipment, not a textbook default. Current sets/reps in the seed are placeholders until Stage 5.
- **Block categories after editing (open — awaiting choice):** either (a) keep type colors with AI auto-tagging from the title + neutral gray for unknowns + one-tap override (recommended), or (b) minimalist — only the current block is colored, all others neutral. Current block always highlighted either way.
- **Workouts = routines:** exercises belong to a routine; a day points to one. Manual dropdown works now; the real model (Stage 5) is a **Workouts hub**:
  - Routines are **open-ended** (not just A/B) and any focus — strength, cardio, mobility — each with a **focus tag**.
  - Each routine has **Warm-up / Main / Cooldown-stretch** sections (exercises carry a section field).
  - **"Runs on" day picker** assigns a routine to days + a time in one place (replaces day→add-block→category→dropdown).
  - **AI coach** ("Ask the coach"): builds/edits routines, adds warm-ups/stretches, creates new-type days (e.g. cardio), progresses you, and **moves sessions** — permanently (edit the routine's days) or **one-off "just this week"** (a date-scoped exception that reverts next week). User approves changes.
  - Daily schedule unchanged to view; a workout block opens warm-up → main → cooldown.
- **Profile structure:** Equipment & weights (prepopulated) · Sports & activities · Training level/experience (baseline for AI cold-start) · Injuries/constraints · Fitness goals (generic, free-form — not badminton-locked). AI calibrates baseline conservatively + from feedback; goals can be natural language (e.g. even out weaker left side).
- **UI:** non-current blocks are dimmed (past more, upcoming lightly) to focus on the current block; type colors kept.
- **Hosting:** Render **static site** (free, doesn't use the badminton app's web-service hours), deployed from a GitHub repo. Supabase can't serve the page itself (it sandboxes HTML).

## UX refinements (live)
- **Per-block editing:** removed the global Edit mode. Tap a block → its detail has Remind me, Mark done, and Edit block (pencil icon). "+ Add block" is always visible at the bottom. Unsaved new blocks don't linger.
- **Reminders default OFF** with bulk control: the bell opens a menu — enable notifications, All reminders on, All reminders off — plus per-block from inside a block.
- **Repeat options on save — now inline (no popup):** the editor has an "Apply to" selector — Only today · Every [weekday] · Every weekday (Mon–Fri) · Every weekend (Sat–Sun) · Every day — defaulting to **Only today**. Save applies directly; the modal was removed. Clash rule verified: empty→add, same-title→update, different-at-same-time→**combine** (join titles, pool checklists, keep existing category). Never overwrites.

## Workouts hub (Stage 5, live)
Built and tested end-to-end in the live app (2026-08-22):
- **Workouts button** in the top ribbon → hub screen listing every routine with its focus tag, the days it runs, and move count. Cards show a **›** chevron so they read as tappable. Also: **+ New routine** and **✨ Ask the coach** (placeholder until the AI step).
- **Routine detail:** editable name, focus chip (strength / cardio / mobility), a **"Runs on" day picker**, Warm-up / Main / Cooldown sections, and tap-to-edit exercises (name, sets/reps text, section, cue; add/delete).
- **Per-day times:** each day a routine runs on shows its **own time field** — the same routine can run at different times on different days. Toggling a day on/off adds/removes its workout block on the schedule automatically.
- Data model in place: `workout.focus`, `exercise.section` (warmup/main/cooldown), `exercise.load`, and `exercise_log` (per-session tick + feel) — logging UI not built yet.

## Fixes
- **Edit-apply bugs (2026-08-23):** (1) Editing a recurring block's *time* and applying to other days **stacked** a duplicate (it matched the counterpart by the new time, not by the block) — one Friday edit even merged "Wake" into the Strength B workout. Now edits match the counterpart by the block's **original title** and update it in place (verified: renaming "Wind down" → every day updated all 7, zero duplicates). (2) Editing a block on a **non-today** weekday defaulted the "Apply to" selector to "Only today", which wrote a change for the wrong date, so title/time silently didn't apply (checklist did). Now non-today edits show "Every [weekday] / weekday / weekend / every day" (no "Only today"). Data cleanup: Wake deduped to one/day at 8:45 all week, Friday Strength B title repaired, Monday set to Chinese Class 10:30.
- **Reminder fired at wrong time (2026-08-23):** a Lunch (13:00) reminder arrived at 01:00. Cause was **not** a 12/24-hour code bug — the scheduler is correct and the block is stored at 13:00. The profile timezone was hard-set to Asia/Singapore while the phone was on US Eastern, so 13:00 SGT = 01:00 EDT. Fix: app now **auto-detects the phone's timezone on open** and saves it to the profile (self-corrects on travel); also set the profile to America/New_York immediately. Diyanah: open the app once on the phone to confirm.

## Done 2026-08-23
- **Reminder on/off visual state — live:** top-ribbon bell is accent-blue only when notifications are enabled AND at least one block has a reminder on; neutral (like Workouts/Profile) otherwise. Reminders sheet now shows the current state ("All reminders are on/off" or "X of Y on") and highlights the active All-on/All-off button. Per-block reminder buttons already colour-code on=blue/off=neutral.
- **#24 Per-exercise logging — live:** each move on an opened workout block has a **Done** tick + **Too easy / Just right / Too hard** chips. Stored in `exercise_log` per `on_date` (resets daily like checklists, no roll-over). Verified end-to-end (tick + feel persist). Independent from the block-level "Mark done". Weighted-load chips deferred.

## AI coach (#25) — DONE & live 2026-08-23
- **Coach screen** in the app (Workouts → ✨ Ask the coach): free-form **Ask** + **Review my week**. Proposals render as a checklist; **nothing applies until you tick items and press Apply**. Applied changes write to the routines (update/add/remove exercise). Verified end-to-end in the browser (ask, review, apply, budget tracking, clean render); test data removed and test spend zeroed.
- **Backend:** `coach` Supabase edge function (provider-agnostic, reads `ANTHROPIC_API_KEY` from Edge Function secrets, CORS, identifies by slug). Models confirmed valid: `claude-sonnet-4-6` (primary) + `claude-haiku-4-5-20251001` (fallback). Model IDs + prices + budgets live in the `coach_config` table → switch model with no redeploy. Spend tracked per person/month in `coach_usage`.
- **Budget:** monthly allowance (~$0.83), Sonnet until 80% of the month, then Haiku; always-on reliability fallback; "⚡ Lite mode (Haiku)" badge when on fallback. Real cost per call observed ~$0.006 — well under budget.
- **At 100% of yearly cap:** function returns a pause message. Raising the allowance = bump `coach_config.yearly_cap_usd` (Diyanah tells me; no in-app button yet — small future add).
- **Known v1 quirks:** for a specific ask the model sometimes also proposes broader baseline changes; proposals are capped at 5 ops and you approve per-item, so it's safe. Auto per-session tweaks + tournament periodization still to come.

## Migration decided — 2026-08-24

Diyanah expects this to grow beyond the two of us. Plan in **`Migration_Plan.md`** · phone version: https://claude.ai/code/artifact/5346b06d-2dcc-49ef-88bd-bd80f78251d0

**Two migrations, executed separately.**
- **Migration A — development moves to Claude Code.** A real repo, files instead of one 57k database row, Vitest + Playwright that actually run, a staging Supabase project, and a deploy gate. ~1 day, low risk, reversible. **Do this first.** Architectural call inside it: move the app into the static site repo (ordinary files, no bundler, ~1 min deploys) rather than keeping the asset row plus a bundler — giving up instant-deploy-from-anywhere is the point once there are tests and more than two users.
- **Migration B — two hardcoded people to real accounts.** Supabase Auth, RLS scoped to `auth.uid()`, per-user data, onboarding that gets a new user to a usable plan, per-user coach budgets. Weeks, high risk, not reversible. **Wait until after the redesign.**

**The decision that gates B (product, not technical): a handful of friends, or strangers can sign up?** Same core work either way; everything around it differs — who pays for the coach (the Anthropic key is Diyanah's, so every user spends her money), legal duty of care for health data, support, and whether the illustration gap becomes blocking.

**Order:** A → R0 → R1–R7 → decide friends-or-product (after living with the redesign for a few weeks) → B.

**Consequence for R0:** closing the database (F1) becomes a **stopgap**, not the final answer — lock it down now, replace with real auth in B1. Still worth doing.

## Code review — 2026-08-24 (read before building)

Full review: https://claude.ai/code/artifact/ee883fa9-70dd-4a0b-a90e-66855fd62841 · fixes scheduled as **Stage R0** in `Redesign_Build_Order.md`.

**What is already right:** architecture suits the problem; 8 tracked migrations; the Anthropic key is correctly server-side only; the coach cannot act without approval; per-date reset logic is sound.

**Fix first — verified against the live project:**
- **F1 — the database is open to anyone with the link.** Every table has `anon` policies of `USING (true)` for SELECT/INSERT/UPDATE/**DELETE**, and the publishable key is in the page source. The private link only decides *which* person is shown; it gates nothing. Anyone with the URL could read or wipe both people's plans, logs, goals and push subscriptions. Risk today is low (two users, obscure URL) but the impact is total. **Do not add a third person until this is closed.** Minimum today: drop all `anon` DELETE policies.
- **F2 — no database write is ever checked.** ~20 `await sb.from(...)` calls, none inspect `{ error }`, and the UI re-renders optimistically — so a failed write looks exactly like a successful one. **Live bug this is hiding:** the `workout` table has an `anon` SELECT policy *only*, so creating a routine, renaming one and changing its focus are all denied by RLS and fail in silence. Fix = one `save()` wrapper (~15 lines) that checks, reverts and reports + the missing scoped write policy.
- **F3 — `esc()` does not escape quote marks.** It handles `& < >` but not `"` or `'`, and its output goes into HTML attributes. An exercise named `3" band pull` breaks the editor.
- **F7 — no data backup.** `app.js` is backed up before every change; the plan, routines, logs and goals are not.

**Worth fixing (scheduled into later stages):** F4 two definitions of "today" (device date vs profile timezone — this caused the 1am lunch reminder) → R2. F5 the app cannot update itself (cache never versioned — the reason "close and reopen" is in every release note) → R7. F6 failures are invisible on a phone → ongoing. F8 full re-render loses scroll position → R2. F9 one 57k-character file with no section markers, stylesheet inside the logic → ongoing.

**Engineering rules (hers, 2026-08-24):** write it **simple and safe**. Plain named functions, no compile step, no heavy libraries, no abstraction before it is needed — *and* every write checked, input validated, text escaped, permissions scoped, irreversible actions confirmed, failures visible, comments explaining *why*. Simple is about how much there is to understand; it never meant leaving out the parts that keep it correct.

## Shipped 2026-08-26 — part of R0, plus the notification fixes

Backups taken first: `asset` rows `app.js.bak.2026-08-26` and `sw-logic.js.bak.2026-08-26`.

**Database (migration `r0_partial_lockdown_and_workout_write_policy`)**
- Dropped the `anon` DELETE policy on `person`, `day`, `push_subscription`, `exercise_log`. Delete policies left: **7 of 11** — F1 is *partly* closed, not closed.
- Added scoped `anon` INSERT + UPDATE policies on `workout`. **This fixes the silent bug where creating or renaming a routine did nothing.**
- Data fix: Thursday had two 09:00 Breakfast blocks, both notifying. Set `block id=38` `notify=false` (reversible).

**App logic (`app.js`, 57,606 → 57,876 chars, two surgical edits)**
- **F3 done:** `esc()` now escapes `"` and `'`.
- Tapping a reminder now opens the block it is about — the app reads `?b=<id>` on boot and jumps to that day and block.

**Service worker (`sw-logic.js`, rewritten)**
- Cache renamed `dp-v1` → `dp-v2` and old caches purged on activate, so the phone actually picks up new versions.
- The push handler now carries the block id through to the notification, and `notificationclick` navigates to it instead of doing nothing.
- Notification icon switched from `icon.svg` to `icon-192.png` — Chrome on Android does not render SVG notification icons.

**Verified:** SQL assertions re-run (delete policies 7, workout writes 2, block 38 off), byte-delta matches both edits exactly, `node --check` plus behaviour tests on the changed functions. **Not verified live** — the container's network blocks the app, and her machine's proxy returns 403 for the Supabase host. Click-testing on the phone is hers.

**Still open from R0:** F1 proper fix (7 delete policies remain, browser still talks to PostgREST directly), F2 the `save()` wrapper (~20 unchecked writes), F7 backups. Those move to Claude Code.

## Migration A — A1 & A2 done 2026-08-26 (first Claude Code session)

Full detail in `Migration_Plan.md` under **Status**. Summary:

- **A1 done.** Push access to `github.com/diys8/daily-plan-app` confirmed; nothing was needed from Diyanah, the credential was already saved on the machine.
- **Install fix shipped** — commit `74163bf`, deployed, all eight files confirmed serving. The app installs properly on Android now.
- **A2 done** — commit `32e6e23`, 21 files, nothing cleaned up. App source, all **9** migrations, three edge functions, and the five documents including the code review.
- **Verified byte-for-byte:** `app.js`, `sw-logic.js` and all nine migrations match the database exactly (MD5). The three edge functions could **not** be verified this way — Supabase publishes no checksum for function source — so they are reference copies until deployed from the repo.

**Three things A2 turned up:**
1. **Render was never told about pushes.** Auto-deploy reads as on but had never fired in the service's history; the install fix had to be deployed by hand through the API. A6 would have silently done nothing.
2. **Five edge functions, not two.** `asset`, `notify`, `coach` are live. `app` and `publish` are dead — see Security below. No secret is hardcoded in any of them.
3. **`asset.updated_at` doesn't change on write**, so the only "history" the project has today is wrong.

### Security — found 2026-08-26, NOT fixed

**Three front doors reach the live database.** Besides the real app: the edge function `app` serves a complete working copy of Daily Plan frozen at **21 August** with a working key pointed at production, and the public storage bucket `app` serves the same stale copy at a third address. `publish` can rewrite the bucket at any time — authentication off, service-role key.

Nothing in the live app references any of them. All of it is **backed up and verified** in `Health/_archive/dead_supabase_functions_2026-08-26/`. **Deletion was proposed and is not yet approved** — it needs an explicit yes because Supabase cannot undo it.

**The leftovers are not the real exposure.** Read live from the database: `anon` still holds SELECT on 13 tables, INSERT on 12, UPDATE on 11, DELETE on 7. Because `person` is readable by anyone, the key in the page source is enough to list **both private slugs** — so the private-link model protects nothing. That is **F1**, still open, and it is R0 build work rather than a quick patch.

### Landmine — before the next deploy

`docs/`, `src/` and `supabase/` are safe **only because nothing has deployed since the snapshot.** Render publishes the repo root, so the next deploy exposes the migrations, function source and planning documents at the public address. **Reconnecting Render and moving the site files into their own folder must be done together, before anything deploys.**

## Pending / next up (as of 2026-08-26)
- **NEXT — approve deleting the two dead edge functions and the four stale bucket objects.** Backed up, verified, waiting on an explicit yes.
- **THEN — F1**, the real security fix, and the folder move + Render reconnection (together).
- **THEN — Migration A step A3:** split `app.js` into modules. A4–A7 after.
- ~~**YOUR ACTION — push the app shell to GitHub.**~~ **Done 2026-08-26** (commit `74163bf`, deployed, phone steps completed).
- **YOUR ACTION — click-test what shipped 2026-08-26:** rename a routine and reload (should stick — it did not before); tap a reminder (should open that block).
- **YOUR ACTION — turn down the reminders.** 67 of 71 blocks have reminders on, which is why they feel constant. Bell icon → All reminders off, then switch back on only the ones you want.
- **Front-end design pass — DONE & APPROVED (2026-08-24).** Design settled over eight rounds with Diyanah on her phone. **The build order is in `Redesign_Build_Order.md` — read that before touching `app.js`.** It carries the engineering rules (simple **and** safe — see the code review section above; deliberate edge-case handling; checks written before the feature), **Stage R0 (foundations/safety, do first)**, the design tokens, the per-stage build spec (R1–R7) with edge cases and pre-written checks, the schema additions, and a named phone test at the end of each stage. Screens: https://claude.ai/code/artifact/becf8c2d-1715-479d-b01d-3b0b12057210 · Critique: https://claude.ai/code/artifact/d93ee0f0-1475-4116-83dd-91368e732af7 · Icon files: `app_icon/`.
- **Exercise demos — approach decided, one part still open (2026-08-24).** Diyanah's own illustrations in `exercise_img/` cover **16 of 22 moves, 13 already animating** as `_0`/`_1` pairs — so no external library is needed for the known set. Two files are unusable broken crops (`bosu_balance`, `skater_jumps`) and four moves have no drawing (glute bridge + the 3 stretches): **six to draw**, using the style header in `Diyanah's/Exercise_Image_Prompts.md`. **External libraries were reconsidered and rejected as a primary source:** free-exercise-db's JSON is public domain but its **image licensing was never clarified** (asked in the repo issues, closed unanswered); wger's image coverage is sparse and mixed-licence; ExerciseDB's redistribution terms are unclear; and any photo/other-style set clashes with her flat illustrations. **Unsolved and carried forward:** the coach (or she) can add exercises nobody has drawn, so the set can never be complete. Approach in `Redesign_Build_Order.md` §R3.1 — the form cue is the guaranteed floor (make `cue` required on coach-proposed exercises), any exercise with no image lands in a **needs-a-demo queue** with a Copy-prompt button, she generates in batches and checks the limbs. Optional later: an edge function that generates them automatically, but **always with her approving before they go live** — AI image gen gets limb positions wrong, which is the one thing she called non-negotiable.
- **PWA installs as a bookmark, not an app (Android) — now folded into Stage R7** of `Redesign_Build_Order.md`. Root cause unchanged: the manifest offers one SVG icon and no maskable PNG, so Android offers "Add shortcut" instead of "Install app". **The icon files are already cut and sit in `app_icon/`** (192, 512, 512-maskable, apple-touch-180, svg). Note for whoever builds it: these shell files (`index.html`, `manifest.webmanifest`, `sw.js`) live in the GitHub repo `github.com/diys8/daily-plan-app` deployed via Render, **not** in the Supabase `asset` row — confirm push access before starting R7. Delete the old shortcut on the phone before reinstalling.
- **Coach polish:** auto after-each-session tweaks + tournament periodization + deload scheduling; in-app "raise allocation" button (today the yearly cap is bumped manually in `coach_config`).
- **Paused exercises:** currently coach-driven + a Resume button on the workout block (and a "· paused" marker in the routine editor). Could add a manual pause toggle. Remove the groin entry from the Injuries profile field once healed (user action).
- **Stage 6 — Gong's version:** same app, his data.
- **Wearables (brainstormed):** Whoop (Diyanah) + Garmin (Gong), worn only during workouts. Best value needs overnight wear (recovery/HRV/sleep). Workout-only → auto-fill logging with HR/zones/strain to feed the coach. No direct connector; Whoop has a dev API, Garmin's is approval-gated; both sync to Strava (which has a connector) as a bridge. Sequence after the design pass.
- **Safeguard — scheduled as Stage R5.** The Workouts-hub "Runs on" day toggle runs `deleteBlockCascade`: it deletes the block, its overrides **and its logs**, silently. Confirm step specified in the build order. **Until R5 ships, be careful with day toggles.**
- Reminder: on the phone, close and reopen the installed app once after each update to pull the latest version.

## Open items / to decide later
- ~~Which free exercise library to use for demos~~ — **closed 2026-08-24: none as a primary source.** Her own illustrations plus a cue-card floor. See `Redesign_Build_Order.md` §R3.1.
- **Still open:** whether to allow a library as a *third-tier* fallback below the cue card (a labelled "reference photo, not our illustration") for common barbell/dumbbell moves. Needs a licensing answer first.
- **Still open:** whether to automate illustration generation for new exercises via an edge function, and how the human approval step works.
- Notification style/timing preferences.

## Status
- [x] Stage 1 — Foundation _(project `daily-plan-app` created; schema + Diyanah's full plan seeded and tested: 7 days, 65 blocks, 115 checklist items, 2 workouts, 21 exercises, 4 goals; per-date reset verified)_
- [x] Stage 2 — The app _(live at https://daily-plan-app.onrender.com — shell on Render/GitHub, app logic served from Supabase so future updates happen from Cowork; renders live plan, installable, offline cache verified)_
- [x] Stage 3 — Editing _(live: tick checklists w/ per-date reset, tickable NOW card, edit block time+activity with auto-tagged category, add/remove blocks, "only today" vs "every weekday", profile editor for equipment/injuries/goals. All flows tested in-browser; test data cleaned. Note: checklist-item text edits apply to the template; per-day item text edits not yet supported.)_
- [x] Stage 4 — Notifications _(built + server-tested: VAPID keys, push_subscription table, service-worker push handlers, in-app Reminders toggle + per-block "mark done" that stops its reminder, notify edge function [tz-aware, respects notify flag + done + today overrides], pg_cron every minute. Scheduler match logic verified. Pending: live phone test after she enables reminders.)_
- [x] Stage 5 — Workouts hub + routine editor + per-day scheduling + per-exercise logging (#24) + AI coach (#25) all **done & live**.
- [ ] Stage 6 — Gong's version
