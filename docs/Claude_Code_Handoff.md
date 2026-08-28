# Claude Code — handoff prompt

_Written 2026-08-26 at the end of the Cowork session. Paste the block below, whole, as the first message in a new Claude Code session opened in the `Health` folder. Everything it needs is either in the block or in the files it points at._

---

## Paste this

I'm continuing a project that was being run from Claude (Cowork) and is now moving to Claude Code. Don't start building yet — read first, then confirm the plan with me.

**The app.** "Daily Plan" — a phone-first dark-theme PWA that runs my day (meals, work blocks, wind-down, training) plus a workouts hub and an AI coach. Two users today: me (Diyanah) and Gong. Live at https://daily-plan-app.onrender.com

**How it's built right now.** A static shell (`index.html`, `manifest.webmanifest`, `sw.js`, icons) in the GitHub repo `github.com/diys8/daily-plan-app`, deployed by Render. All the actual app logic is one 57k-character JavaScript file stored as a **row in a Supabase table** — project ref `nalxowbclhvopjqkvweh`, table `asset`, row `name='app.js'`, served through an edge function. The service worker logic is the same trick, row `name='sw-logic.js'`. Postgres, Web Push with VAPID, a `pg_cron` job calling a `notify` edge function every minute, and a `coach` edge function that calls the Anthropic API. **Moving off the asset row and into real files in the repo is exactly what this migration is for.**

**Read these before anything else** (in `C:\Users\gongg\OneDrive\Desktop\Health\`):

1. `Migration_Plan.md` — what we're doing. **Read the Status section first** — A1 and A2 are done; it carries what they found and what's next.
2. `App_Build_Plan.md` — the project index: what exists, what shipped, what's pending.
3. `Redesign_Build_Order.md` — the approved redesign, staged R0–R7, with edge cases and checks-to-write-first per stage. **Read this before touching app logic.**
4. `Claude_Code_Handoff.md` — this file.

**Two migrations, and only the first one is in scope now.**
- **Migration A — development moves to Claude Code.** Real repo, files instead of one database row, tests that actually run, a staging Supabase project, one deploy command. ~1 day, reversible. **This is what we're doing.**
- **Migration B — from two hardcoded people to real accounts.** Supabase Auth, per-user data, onboarding. Weeks, not reversible. **Not now** — it waits until after the redesign ships and I've decided whether this is for a few friends or for strangers.

Order: **A → R0 (finish it) → R1–R7 → I decide friends-or-product → B.**

**Decisions that are locked. Do not reopen them.**
- **Palette:** ground `#0d0e11`, one action colour amber `#e3953b` (anything tappable, app-wide, never category-specific), done-state bronze `#a7712e` (fill only, never text). Full token block is §1 of `Redesign_Build_Order.md`. This took eight rounds and three passes on the amber alone. It's settled.
- **No colour-coding by category.** One action colour everywhere.
- **Bottom nav:** Today · Train · Coach · You. ("Train", not "Workouts".)
- **Exercise demos** come from my own illustrations in `exercise_img/` — two-frame `_0`/`_1` pairs. **No external exercise library as a primary source** (licensing was never clarified, and the styles clash). Six images still need drawing; the approach for exercises nobody has drawn is §R3.1.
- **App icon:** the "timeline" mark, files cut in `app_icon/`.

**How I want the code written — both halves matter.** Simple *and* safe. Plain named functions, no compile step, no heavy libraries, no abstraction before it's needed — **and** every database write checked, input validated, text escaped, permissions scoped, irreversible actions confirmed, failures visible on the phone, comments that explain *why*. "Simple" is about how much there is to understand; it never meant leaving out the parts that keep it correct. Write the checks before the feature — each stage in `Redesign_Build_Order.md` lists them already.

**What shipped on 2026-08-26, just before this handoff** (backups exist as `asset` rows `app.js.bak.2026-08-26` and `sw-logic.js.bak.2026-08-26`):
- Migration `r0_partial_lockdown_and_workout_write_policy`: dropped 4 `anon` DELETE policies, added the missing scoped `workout` INSERT/UPDATE policies — this fixed a live bug where creating or renaming a routine silently did nothing.
- `esc()` now escapes `"` and `'`.
- Tapping a reminder opens the block it's about (`?b=<id>` on boot).
- Service worker rewritten: cache `dp-v1` → `dp-v2` with old-cache purge, block id carried into the notification, `notificationclick` actually navigates, notification icon PNG instead of SVG.
- One data fix: Thursday had two 09:00 Breakfast blocks both notifying; `block id=38` set `notify=false`.
- **It was verified statically, not live** — neither machine could reach the running app. Assume it works; confirm on the phone.

**What's still open, roughly in order** _(updated 2026-08-28, end of redesign session)_**:**

**Migration A — done.** A0, A3, A4, A7 all complete. Code split into seven ES modules, Vitest running (34 tests), Render publish dir set to `public/`.

**Redesign R1–R7 — done.** All seven stages built and committed locally (commits `6237ba6` through `301f5ef`). Coach edge function redeployed as v4 with conversation history and session data. `coach_message` table created. Service worker cache bumped to `dp-v3`.

**What remains:**
1. **Push 7 local commits to GitHub** and trigger a Render deploy. Auto-deploy is still broken.
2. **Push the shell files** from `Health/app_shell_update/` to `github.com/diys8/daily-plan-app-f2`. Needs Diyanah's GitHub credentials.
3. **Backups (F7).** Still the top-priority safety item. No export, no restore ever performed.
4. **R0 security items still open.** F1 proper — 7 `anon` DELETE policies remain, browser talks to PostgREST directly. The private-link model protects nothing. These wait for Migration B (real auth).
5. **Supabase cleanup.** Delete inert `app` and `publish` edge functions from the dashboard (two clicks, non-urgent).
6. **Migration B** — real accounts, Supabase Auth, per-user data. Not started; waits until Diyanah decides friends-or-product.

**Reference (phone-readable versions of the same material):**
- Redesign, 11 screens — https://claude.ai/code/artifact/becf8c2d-1715-479d-b01d-3b0b12057210
- Design critique, 31 findings — https://claude.ai/code/artifact/d93ee0f0-1475-4116-83dd-91368e732af7
- Code review, 9 findings — https://claude.ai/code/artifact/ee883fa9-70dd-4a0b-a90e-66855fd62841
- Build order — https://claude.ai/code/artifact/4f8cc43b-7e51-4e8f-88c4-dd9ca87f292c
- Migration plan — https://claude.ai/code/artifact/5346b06d-2dcc-49ef-88bd-bd80f78251d0
- Status board — https://claude.ai/code/artifact/85234f5a-5ec3-46aa-8cf6-09773ad9c0db

**How to work with me.** I'm not technical. Summarise what you're going to do in plain language before you do it, and wait for my go-ahead. Don't show me code unless I ask. Keep it short. If something needs my hands — a credential, a push, a tap on the phone — say so as numbered steps.

~~**Start with A1: confirm push access to `github.com/diys8/daily-plan-app`, then tell me what you found and what A2 will look like.** Don't clean anything up in the first commit — commit exactly what's running today, so we can tell later whether a change broke something.~~

**Migration A and Redesign R1–R7 are done (2026-08-28).** 10 local commits, 7 not yet pushed. Read the **Status** section of `Migration_Plan.md` for the full table. Next priorities: push + deploy, backups (F7), then decide on Migration B.
