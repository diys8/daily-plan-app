# Daily Plan — Redesign Build Order

_Written 2026-08-24. Companion to `App_Build_Plan.md`. Design approved by Diyanah across eight rounds._

**Code review (nine findings, verified against the live project):** https://claude.ai/code/artifact/ee883fa9-70dd-4a0b-a90e-66855fd62841
**Design reference (all screens, scrollable):** https://claude.ai/code/artifact/becf8c2d-1715-479d-b01d-3b0b12057210
**Original critique (31 findings):** https://claude.ai/code/artifact/d93ee0f0-1475-4116-83dd-91368e732af7
**Icon files:** `Health/app_icon/`

---

## 0. How to write this code

Three rules, set by Diyanah. They override any instinct to be clever.

### 0.1 Write it simple, and write it safe.

Simple is about **how much there is to understand**, not about leaving out the parts that keep it correct. An earlier draft of this section said "no framework, no build step, no bundler" — that was jargon, and it wrongly implied that fewer guardrails is the goal. It is not.

**Keep it plain:**
- Ordinary named functions and template strings. A new screen is a `renderX()` returning an HTML string plus a `wireX()` attaching handlers — the pattern already in `app.js`. Follow it rather than inventing a better one.
- No compile or publish step between editing and running. This is why a change reaches her phone in seconds; keep it.
- No heavy third-party libraries. At this size the browser is enough.
- No abstraction invented before it is needed. A longer obvious function beats a shorter clever one; five duplicated lines are cheaper than an abstraction nobody can name.

**And check the work — these are guardrails, not complexity:**
- **Every database write is checked.** One `save()` wrapper that inspects the result, reverts the optimistic UI on failure, and shows a short message. Nothing writes directly.
- **Input is validated where it enters** — empty names rejected, times parsed, absurd values refused.
- **Text is escaped properly** before it goes on screen, including quote marks.
- **Permissions are scoped** to the person the link identifies. Nothing in the browser may delete.
- **Anything irreversible asks first.**
- **Failures are visible.** Silence is never the failure mode.
- **Comments explain _why_, not _what_.** Section banners so a 57,000-character file can be navigated.

Judged this way the app today is not over-engineered — in the places that matter it is **under**-engineered. See the code review (https://claude.ai/code/artifact/ee883fa9-70dd-4a0b-a90e-66855fd62841) and Stage R0 below.

### 0.2 Handle the edge cases deliberately.

Every stage below lists the states that must not break. The recurring ones, worth checking everywhere:

- **Empty** — no blocks, no exercises, no routines, no logs, no history.
- **One** — a section with a single item; a routine that runs on one day.
- **Many** — a 20-move routine; a 15-block day; a long coach thread.
- **Missing** — no illustration, no cue, no scheme, no `demo_slug`, a null `section`.
- **Offline** — the app caches the last view. Nothing may throw when a write fails; queue it or fail visibly, never silently.
- **Wrong day** — viewing a non-today weekday. Today-only state (ticks, logs, overrides) must not leak across dates.
- **Stale** — the phone was left open overnight and it is now tomorrow.
- **Concurrent** — the same person on phone and laptop.

Write the guard, not the comment. Default to a designed empty state rather than an error.

### 0.3 Test-driven: write the checks first.

There is no test runner inside a single hosted file, so "test-driven" here means a written, runnable checklist that exists **before** the feature does. Two layers per stage:

1. **Data checks** — SQL run against the real project, asserting a fact. Example: after finishing a workout, exactly one `workout_session` row exists for that person and date, with `finished_at` set and `feel` non-null.
2. **Journey checks** — a numbered script of taps and expected outcomes, run in a browser before anything reaches her phone.

Both are listed per stage below under **Checks to write first**. Copy them into a working checklist at the start of a stage, build until every one passes, then run the phone test. A stage is not done until every check is ticked and the test data is removed.

---

## 1. Design tokens — replace the `:root` block in `STYLE`

```
--bg:#0d0e11      /* app ground, neutral charcoal, no hue */
--surf:#16181d    /* flat panels, tiles */
--raise:#1d2026   /* the one raised card per screen */
--line:#272b32    /* borders on controls */
--line2:#1b1e23   /* hairline dividers between rows */
--ink:#f2f4f7     /* primary text */
--mut:#9ba3ad     /* secondary text, cues, descriptions */
--dim:#6f7883     /* labels, meta, times */
--acc:#f2952c     /* AMBER — anything tappable */
--onacc:#150f05   /* text on amber */
--done:#a7712e    /* BRONZE — done only. Fill colour, never text */
```

> **Amber revised 2026-08-26 — `#e3953b` → `#f2952c`.** Same hue (32°) and the same
> lightness (56%); saturation raised 75% → 88%. Deliberately *not* brighter — the
> earlier complaint was glare, the later one was flatness, and those are different
> dials. This turns the colour up without turning the light up. Contrast on the
> ground is 8.4:1. The icon gradient moves with it: `#f2952c → #d77c14`.
> The icon files in `app_icon/` and `app_shell_update/` still carry the old amber
> and must be re-cut before the next deploy.

**Colour rules — this is the whole system:**
- **Amber = anything you can act on.** Buttons, selected chips, selected day, active tab, a profile field still to fill. Nothing else.
- **Bronze = done, and only done.** Completion dots, progress segments, the day ring. Never text — at this value it lands ~4:1 on the ground.
- **No category colour anywhere.** Keep `block.tag` in the data; stop rendering it.
- Paused exercises grey. Breathing cue grey.

**Type — five sizes:** 11 label · 13 meta · 15.5 body · 23 card title · 26 screen title.
**Radii — two:** 13 controls, 18 card.
**Touch:** rows 56px, buttons 48px, day pills 46px. Never below 44px.
**Depth:** exactly one raised card per screen — whatever is happening now.

---

## 2. Operating rules

1. **Back up `app.js` before every stage.** It is one row: `asset` table, `name='app.js'`, project `nalxowbclhvopjqkvweh`. Copy to `name='app.js.bak.<stage>'` first. Rollback is one UPDATE.
2. **One stage at a time.** Each leaves the app working. Nothing starts until the previous phone test passes.
3. **She must close and reopen the installed app** after each deploy.
4. **Nothing existing is dropped.** Two tables are added.
5. **Remove test data before handing a stage over.**
6. **F6 and F9 fold into whichever stage touches that code.** F6: a failure must be visible on screen — a toast is enough for one user, but silence is not acceptable. F9: add section banners and a short index comment to `app.js`, and move the `STYLE` block to its own `asset` row so the stylesheet and the logic are not one string.

---

## Stage R0 — Foundations

**Do this before any redesign work.** Nothing visible changes. Every stage after it writes to the database, so these four fixes protect all of them. Findings F1, F2, F3, F7 from the code review.

> **Status 2026-08-26 — partly shipped from Cowork.** Done: F3 (`esc()` fixed); the missing `workout` write policies (routine create/rename works now); 4 of 11 `anon` DELETE policies dropped. **Still to do here: F1 proper (7 delete policies remain, the browser still talks to PostgREST directly), F2 the `save()` wrapper, F7 backups.** Also shipped alongside: notification tap now opens the right block, service-worker cache versioned `dp-v2`. Full record in `App_Build_Plan.md` → "Shipped 2026-08-26".

### Build

**F1 — Close the database.** Every table currently carries `anon` policies of `USING (true)` for SELECT, INSERT, UPDATE **and DELETE**, and the publishable key is in the page source. The private link identifies a person; it does not gate anything.
- **Minimum, today:** drop every `anon` DELETE policy. Deleting is the only irreversible operation in the app; the UI deletes via `deleteBlockCascade`, `onDeleteBlock` and `onDeleteExercise`, which move behind a server function.
- **Proper fix:** stop the browser talking to PostgREST directly. Put reads and writes behind an edge function that takes the slug and uses the service role, so the slug becomes a real credential. Alternative if that is too big a change: pass the slug as a signed claim and scope every policy to `person.slug = current_setting(...)`.
- Do not add a third person to this app until this is done.

**F2 — One `save()` wrapper, and the missing permission.** Roughly twenty `await sb.from(...)` calls exist and **none inspects `{ error }`**. The UI re-renders optimistically, so a failed write looks identical to a successful one.
- **Live bug this is already hiding:** the `workout` table has an `anon` **SELECT policy only**. `newRoutine()`, `saveRoutineName()` and the focus toggle all call insert/update on it, so they are denied by RLS and fail silently. Add the missing write policy (scoped, per F1) **and** the wrapper — the wrapper is what would have surfaced it.
- Shape: `async function save(label, promise)` → awaits, on `error` restores the previous state, shows a toast, logs. Every write goes through it. ~15 lines.

**F3 — Fix `esc()`.** It replaces `& < >` but not `"` or `'`, and its output is interpolated into HTML attributes (`value="${esc(e.name)}"`). An exercise named `3" band pull` breaks the editor. Add `"` → `&quot;` and `'` → `&#39;`.

**F7 — Back up the data.** `app.js` is backed up before every stage; her plan, routines, logs and goals are not. Add a weekly scheduled job writing a JSON snapshot of every table to Storage. Months of logs are what the coach's value rests on.

### Edge cases
- **A write fails while offline** → the wrapper reverts the UI and says so; it must not leave a half-applied state.
- **A write fails mid-loop** (e.g. `applyScope` writing across seven days) → stop, report which days applied, do not silently half-finish.
- **Backup job runs while a write is in flight** → snapshot is point-in-time, not transactional across tables; acceptable, but note it in the file.
- **Policy change locks out a path nobody tested** → that is exactly what F2's wrapper surfaces. Expect to find one or two more.

### Checks to write first
- Data: `select count(*) from pg_policies where schemaname='public' and cmd='DELETE' and roles::text like '%anon%'` returns **0**.
- Data: as `anon`, an insert into `workout` succeeds (after the policy is added) and an insert into another person's rows fails.
- Journey: rename a routine → reload → the new name held. **This fails today.**
- Journey: turn off the network → tick a checklist item → the tick reverts and a message appears.
- Journey: name an exercise `3" band pull` → the editor still renders and saves.
- Data: a backup file exists in Storage after the job runs, and contains every table.

### Phone test
Rename a routine and reload — it should stick, which it does not today. Then turn on airplane mode, tick something, and confirm the app tells you it did not save instead of pretending it did.

---

## Stage R1 — Design system + Today ✓ (commit `6237ba6`)

> **Done 2026-08-27.** Design tokens applied, bottom tab bar wired, day strip, NOW card, past-blocks fold, progress ring. Category colours removed.

### Build
- Swap in the token block. Delete `.t-food/.t-work/.t-play/.t-rest` colour mapping and every category-coloured border, dot and background.
- **Bottom tab bar**, sticky: Today · Train · Coach · You. 58px, icon + label, amber when active. `view` already routes `plan | hub | routine | coach` — add `workout`, `recap`, `profile`. Profile stops being a bottom sheet.
- **Header:** full date as eyebrow, day label as H1, progress ring showing done/total.
- **Day strip:** seven days, weekday + date number, whole current week so past days are reachable.
- **NOW card** (the only raised card): label + time range, title, description, checklist, primary button, "1 of 2".
  - **Fix the duplication:** render `block.detail` only when it differs from every one of that block's checklist item texts. Otherwise render the checklist alone.
- **Every other block is a plain row:** time · title · meta, 56px, hairline divider.
- **Counts become `x/y`.** No items → no count.
- **Past blocks fold** into "✓ 5 done earlier · 3 skipped · Show", expandable. Delete the `opacity:.42` rule entirely.

### Edge cases
- A day with **no blocks at all** → empty state, not a blank screen.
- **Nothing is current** (before the first block, or after the last) → card shows the next block as "Next up", or an end-of-day state after the last one.
- **Two blocks at the same time** → both render; the earlier-sorted one is current.
- A block with **no checklist items** → no checklist section, no empty count, button still works.
- **Viewing a non-today weekday** → no NOW card at all, no ring, no folding. Today-only state must not render.
- **Left open past midnight** → on regaining focus, re-read the date and reload rather than showing yesterday as today.
- **All blocks done** → the fold row reads sensibly and the ring is full.

### Checks to write first
- Data: for a block whose `detail` equals its first `checklist_item.text`, the rendered card contains that sentence exactly once.
- Data: `item_check` writes carry today's date; ticking on a non-today view writes nothing.
- Journey: open → tick an item → reload → still ticked.
- Journey: tap Show → past blocks readable → tap again → collapsed.
- Journey: switch to Sunday → no NOW card, no ring.
- Journey: all four tabs render without a console error.

### Phone test
Open the app. Is the right block current? Tick something and reload — did it stick? Tap Show and confirm the past blocks are actually readable. Tap all four tabs.

---

## Stage R2 — The workout as its own screen ✓ (commit `bd7667f`)

> **Done 2026-08-27.** Workout view with sections (warmup/main/cooldown), accordion open-one-at-a-time, feel chips, segmented progress bar, paused-exercise grouping. `workout_session` table created. F4 (one definition of "today") and F8 (scroll position) fixed.

### Build
- A block with `workout` set opens a **new `workout` view**. Remove the inline `movesHtml` path from the day list.
- Header: back · routine name · Edit. Below: **segmented progress**, one segment per exercise, bronze when done, plus "4 of 13 done" and a time estimate.
- **Three sections: Warm-up · Main · Cooldown**, from `exercise.section`, each with its own `done/total`.
- **Closed exercise = one 56px row:** dot · name · scheme.
- **One open at a time** (accordion). The open card holds demo, cue, breathing, feel chips, Mark done.
- **Feel chips exist only inside the open card.**
- **Paused exercises collapse to one grey line** for the group: "3 moves paused while your groin heals · Review".
- **Finish workout** button.
- Delete the repeated "Demo coming in a later step" string.

**Also in this stage — F4 and F8 from the code review:**
- **F4, one definition of "today".** The app uses the device's local date (`todayStr()`); the notifier uses the profile timezone. That split is what put a 1pm lunch reminder at 1am. Replace both with one function that resolves the date from the profile timezone, used by the app and the notifier alike.
- **F8, keep the scroll position.** `render()` rebuilds the whole screen on every tick. Keep that — it is simple and right at this size — but record `scrollY` before and restore it after, or the workout screen jumps every time you tick a move thirteen rows down.

### Data
```sql
create table workout_session (
  id bigserial primary key,
  person_id bigint not null,
  workout_id bigint not null,
  on_date date not null,
  started_at timestamptz,
  finished_at timestamptz,
  feel text,
  unique (person_id, workout_id, on_date)
);
```
`started_at` is stamped on the first tick of that date. The unique constraint is deliberate — it makes a double-start impossible rather than something to guard in code.

### Edge cases
- **A section with no exercises** → hide the section entirely, do not render an empty header.
- **`section` is null** on an old row → treat as `main`.
- **Every exercise paused** → the screen is the paused line plus the Review link; Finish is disabled with a reason.
- **A routine with no exercises at all** → empty state pointing at the editor.
- **Same workout on two days** → sessions keyed by date; today's ticks must not show on Friday's.
- **Opened on a non-today weekday** → read-only. No ticking, no session row.
- **Finish pressed with nothing ticked** → allowed, but the recap says so rather than showing zeros as an achievement.
- **A second Finish press** → idempotent, no duplicate row.

### Checks to write first
- Data: `select count(*) from workout_session where person_id=? and on_date=?` is exactly 1 after any number of ticks.
- Data: ticking an exercise on Tuesday creates no `exercise_log` row dated Wednesday.
- Data: sum of section counts equals the total exercise count for the routine.
- Journey: open Strength A → three sections in order → counts match.
- Journey: open exercise A, then exercise B → A closes.
- Journey: closed rows show no feel chips.
- Journey: a paused move never appears as a normal row.

### Phone test
Open Tuesday → Strength A. Are the three sections right and their counts correct? Tick two moves and watch the segments fill. Open one exercise and confirm the previous one closes.

---

## Stage R3 — Exercise demos, and the problem of new exercises ✓ (commit `b712a31`)

> **Done 2026-08-27.** Resolution ladder (two-frame animation → single frame → cue card), light plate styling, `demo_slug` immutable after creation. Images served from Supabase Storage bucket `exercise`.

**This stage carries the one genuinely unsolved problem in the project. Read §R3.1 before building.**

### Build (the part that is settled)
- Public Supabase Storage bucket `exercise`. Upload `Health/exercise_img/` as `<demo_slug>_0.png`, `<demo_slug>_1.png`, or `<demo_slug>.png`. `g_`-prefixed files are Gong's — hold for Stage 6.
- **Resolution ladder, in order:**
  1. Two distinct frames → alternate on a 1.4s loop (CSS `steps(1,end)`, two stacked `<img>`).
  2. One frame, or two identical frames → show it static.
  3. Nothing → **the form cue on a plain card.** This is a designed state, not an error.
- Illustrations render on a **light plate** — 1:1, `#f4f4f2`, radius 12, `object-fit:contain`. Do not try to knock the white out.
- Honour `prefers-reduced-motion`: hold frame two.
- **`demo_slug` is set once, on creation**, from a slugified name. Never re-derive it on rename — the image would go missing the moment an exercise is renamed.

### R3.1 — The open problem: illustrations for exercises we have never seen

Her own set covers 22 moves. **The coach can propose anything** — "shadow footwork, front corners", "suitcase carry" — and she can type in anything. Those arrive with no illustration, and the set can never be complete by definition.

**External libraries were reconsidered and are not the answer as a primary source:**
- **free-exercise-db** — ~800 exercises, and its images are conveniently already start/end pairs. But the **JSON is public domain while the image licensing was never clarified** — the question was asked in the repo's issues and closed without an answer. Not safe to build on.
- **wger** — real project, but exercise image coverage is sparse and community-contributed with mixed licences.
- **ExerciseDB (RapidAPI)** — good animated coverage, freemium, and redistribution terms are unclear.
- **Style clash regardless.** Photographs or a different illustration style sitting next to her flat set looks broken, and she has been explicit that limb accuracy is the point.

**Recommended approach — never depend on a picture, and make the gap a finite, visible backlog:**

1. **The cue is the floor.** Every exercise must have a usable `cue`. Make `cue` **required** for any exercise the coach proposes — the model is already generating text, so this costs nothing — and required in the manual add form. An exercise with no picture and a good cue is usable; one with neither is not.
2. **A "needs a demo" queue.** Any exercise whose `demo_slug` resolves to no file appears in a small list (in You, or behind the Train header). Each entry shows the name, its cue, and a **Copy prompt** button that outputs the ready-to-paste generation prompt: her style header from `Diyanah's/Exercise_Image_Prompts.md` + the exercise name + its cue + "START / END positions side by side".
3. **She generates in batches**, checks the limbs, drops the files in `exercise_img/`, and they get uploaded. The queue empties. An open-ended problem becomes a countable one.
4. **A "Request a demo" button** on any exercise showing the cue-only card — one tap adds it to the queue, so the gap is actionable instead of annoying.

**Later, optional:** an edge function that calls an image model with the same prompt, writes to storage and clears the queue item automatically. **Do not skip the human check.** AI image generation gets limb positions wrong, and that is precisely the thing she said is non-negotiable — so any automated path still ends with her approving the image before it goes live.

**Still to decide (not blocking R3):** whether to use a library as a *third-tier* fallback below the cue card — a labelled "reference photo, not our illustration" — for common barbell/dumbbell moves. Needs a licensing answer first.

### Known gaps — six images to draw
Diyanah, using `Diyanah's/Exercise_Image_Prompts.md`, same chat, same style header:
- `bosu_balance` — **replace.** A torso with no head, no feet, no Bosu ball in frame; `_0` and `_1` are byte-identical.
- `skater_jumps` — **replace.** Cut off above the eyes and below the knees.
- Glute bridge, supine butterfly stretch, standing adductor stretch, kneeling hip-flexor stretch — **new**, and they have no `demo_slug` yet either.

### Edge cases
- **Image 404s** (bad path, offline, deleted) → fall through to the cue card. Never a broken-image icon.
- **Only `_1` exists** → treat as a single frame.
- **`_0` and `_1` are byte-identical** → treat as single frame, do not animate a still (this is the live `bosu_balance` case).
- **No `demo_slug` and no cue** → the card shows the name and scheme only, plus Request a demo.
- **Slow connection** → reserve the plate's space so the card does not jump when the image lands.
- **Two exercises share a name** across routines → same slug, same image, intended.
- **Exercise renamed after upload** → slug is stored, not derived; the image stays attached.

### Checks to write first
- Data: every exercise row has a non-empty `cue` OR appears in the needs-a-demo queue.
- Data: no two storage objects differ only by case.
- Journey: an exercise with two frames animates; with one frame does not; with none shows the cue card and a Request a demo button.
- Journey: rename an exercise → its image still resolves.
- Journey: break the image URL by hand → the cue card appears, no console error.

### Phone test
Open Strength A and the Bulgarian split squat — does it loop? Then open a move with no drawing and confirm you get the cue and a way to ask for one, not an empty box.

---

## Stage R4 — Finishing a workout ✓ (commit `ed53982`)

> **Done 2026-08-27.** Recap view with stats (minutes, moves, per-section breakdown, skipped list), feel question (easy/solid/rough), "Saved as you went" messaging. Block-level Mark done removed from workout blocks.

### Build
- Finish (or ticking the last exercise) opens the **`recap` view**.
- Shows routine name + "done", the date and start–finish times, three stats (minutes · moves done/total · paused), a per-section breakdown, and a "Skipped" line naming what was left.
- **One question:** "How did the session go?" — Easy / Solid / Rough → `workout_session.feel`.
- **No Save button.** Everything already wrote. Quiet "Saved as you went" line and a **Back to today** button.
- **Unify "done":** on workout blocks, remove the block-level Mark done. Ordinary blocks keep theirs.

### Edge cases
- **`started_at` is null** (ticks predate this stage) → show "—" for minutes, not a negative number or `NaN`.
- **Finished before started** (clock change, timezone shift) → clamp to zero and show "—".
- **Session spans midnight** → the session belongs to its `on_date`, not to the clock at finish time.
- **Nothing ticked** → recap says "nothing logged", the question is still offered.
- **Everything paused** → "0 of 0" must not divide by zero.
- **Reopening the recap later** → read-only, shows the stored answer, does not re-ask.
- **Finish pressed twice** → same row updated, no duplicate.

### Checks to write first
- Data: exactly one `workout_session` per person/workout/date; `finished_at >= started_at` or null.
- Data: `feel` is one of easy/solid/rough or null.
- Journey: complete a workout → recap shows the right counts → answer → back to Today → block reads done.
- Journey: reopen the recap → same numbers, question already answered.
- Journey: finish with zero ticked → no crash, honest copy.

### Phone test
Run a whole workout to the end. Answer the question. Go back to Today and check the block reads as done.

---

## Stage R5 — Train hub + routine editor ✓ (commit `10a4100`)

> **Done 2026-08-27.** Hub with "Last done N days ago · felt X", This Week list, + New routine. Editor with day pills, per-day times, pointer-event drag reorder within sections. Destructive toggle safeguard added (confirms when logged data exists). Rename syncs block titles across all days. 34 Vitest tests passing (added `daysBetween` tests).

### Build
- **Hub:** each routine shows name, neutral focus chip, the days and times it runs, move count, and **"Last done N days ago · felt X"** from `workout_session`. Never run → says so. Below, a **This week** list. `+ New routine`. Remove the "Ask the coach" link — Coach is a tab.
- **Editor:** two-letter day pills (Mo Tu We Th Fr Sa Su) on one row at 46px, amber when selected. Per-day time fields. Drag handles reordering within a section, writing `exercise.sort`. Add-exercise links grey. Paused moves keep their row with a grey marker.
- **Safeguard:** un-toggling a day currently runs `deleteBlockCascade` — deleting the block, its overrides and its logs, silently. Add a confirm whenever that day's block has any `exercise_log` or `block_done` rows: "Thursday's session has logged sets. Removing the day deletes them."

### Edge cases
- **Routine scheduled on zero days** → hub says "Not scheduled", no crash in the This week list.
- **Same routine on several days at different times** → each day keeps its own time (already supported; do not regress it).
- **Reorder while a filter or accordion is open** → sort values stay contiguous.
- **Drag across sections** → either forbid it or update `section` too; do not leave a half-moved row.
- **Deleting the last exercise** → section disappears cleanly.
- **Two devices editing the same routine** → last write wins, but a reload must not duplicate rows.
- **Renaming a routine while its block exists** → the day's block title follows.

### Checks to write first
- Data: after a reorder, `sort` values within a section are unique and ascending.
- Data: toggling a day off with logs present, then cancelling, leaves every `exercise_log` row intact.
- Data: toggling a day on creates exactly one block for that day.
- Journey: reorder → reload → order held.
- Journey: un-toggle a day with logs → warning appears → cancel → nothing lost.

### Phone test
Reorder an exercise and reload. Then try to un-toggle a day that has logged sets and confirm you get warned.

---

## Stage R6 — Coach ✓ (commit `632b55c`)

> **Done 2026-08-27.** Thread-based conversation (messages persist in `coach_message` table). Quick prompts. `create_routine` proposal type. `cue` required on all coach-proposed exercises. Edge function v4 deployed — receives conversation history (last 20 messages), workout session data, and weekly schedule as context. Model badge and spend line removed.

### Build
- **Thread, not a form.** New table `coach_message (id, person_id, role, text, created_at)`. Render history; asking again stops wiping the last answer.
- **Quick prompts:** Review my week · Make it harder · I'm travelling · Something hurts.
- Proposals as **app-styled rows** with the app's own checkboxes; button counts the selection.
- **Remove the model badge and the spend line.** Keep the budget logic server-side; at the cap, say so in plain language.
- **New proposal type `create_routine`** — name, focus, and a list of exercises with section, scheme and cue. Applying inserts the workout and its exercises. Same approve-per-item rule.
- **`cue` becomes required** on every exercise the coach proposes (see R3.1 and R6.1).
- **New-routine empty state:** Ask the coach to build it (primary) / Add exercises myself. Nothing is scheduled until days are picked.

### R6.1 — What the coach is told today, and what is missing

The instruction lives in the `coach` edge function (`index.ts`, `sys`). Today it says, in substance:

- **Role:** a certified sports dietitian and CSCS strength coach helping one client via a fitness app.
- **Principles:** human-centred and conservative. Rep ranges and reps-in-reserve over fixed maxes. Start light, progress gradually, respect injuries, equipment, level and goals. Never prescribe machine-like fixed volume cold. Build in deloads.
- **Limits:** at most 5 changes; never rewrite a whole routine; 1–3 small changes if the client is just starting.
- **Pause discipline:** use `pause_exercise` with a reason. Never write "HOLD" or "skip" into the sets/reps, never overwrite the real numbers to signal a pause. `resume_exercise` brings it back.
- **One movement per exercise** — three stretches must be three cooldown exercises, not one bundled entry.
- **Output:** raw JSON only, `{text: <=120 words, proposal: [ops]}`, ops limited to update / add / remove / pause / resume / note, using only exercise ids that exist.

**Context it receives:** profile (level, equipment, injuries, sports), goals, all routines with exercise ids and paused flags, and **per-exercise logs from the last 14 days** (done + felt).

**Gaps to close in this stage — all of them limit the quality of its advice:**

1. **No conversation history.** Every call is a single fresh message. This is the main thing R6 fixes; wire `coach_message` into the request as prior turns.
2. **`cue` is optional on `add_exercise`.** Make it **required** — the cue is the fallback when there is no illustration (see R3.1), so an exercise added without one is a hole in the app.
3. **No session-level data.** It sees individual ticks but not whether a session was finished, how long it took, or the overall "how did it go" answer. Once `workout_session` exists (R2/R4), add it to the context — that is the whole point of building the recap.
4. **No schedule.** It does not know which days routines run on, nor that she plays badminton Monday and Wednesday and has coach training Thursday and Saturday. So it cannot reason about weekly load or say "you are on court tomorrow, keep the legs light". Add the day/time map and the week's play blocks to the context.
5. **`level` is blank in her profile**, so "respect the client's level" has nothing to work with. The R7 picker fixes the input; make sure the coach reads it.
6. **No `create_routine` op** — added in this stage.

### Edge cases
- **Network fails mid-ask** → the question stays in the thread marked unsent, retryable. Never lose what she typed.
- **Model returns malformed JSON** → show the text answer, drop the proposal, do not crash.
- **A proposal references an exercise that has since been deleted** → skip that op, report it, apply the rest.
- **Apply with nothing ticked** → button disabled.
- **Applying twice** → second apply is a no-op, not a duplicate insert.
- **Budget cap reached** → plain-language message, thread still readable.
- **Very long thread** → cap what is sent to the model; keep the full history on screen.
- **`create_routine` with zero exercises** → reject before it reaches the database.

### Checks to write first
- Data: every exercise created by an applied proposal has a non-empty `cue`.
- Data: applying the same proposal twice produces the same row count as applying it once.
- Data: `coach_message` rows persist across a reload.
- Journey: ask → answer → ask again → both visible.
- Journey: build a routine → untick one move → apply → the routine has exactly the ticked moves.
- Journey: kill the network → ask → nothing is lost.

### Phone test
Ask it to build a short cardio session. Untick one move, apply, and check it turns up in Train and can be edited like any other routine.

---

## Stage R7 — You, and installing properly ✓ (commit `301f5ef`)

> **Done 2026-08-28.** Profile reorganised into Training / Goals / App sections. Training level three-option chip picker (beginner/intermediate/advanced) with amber hint when unset. Reminders row tappable, timezone display-only. Service worker cache bumped to `dp-v3`. Shell files (`app_shell_update/`) still need to be pushed separately.

### Build
- **Profile becomes the `profile` view.** Rows of label + value + chevron, grouped Training / Goals / App.
- **Training level becomes a three-option picker**, shown in amber as "Not set — tap to pick" until filled.
- Rows for **Connected devices** (ready for the Whoop) and **Reminders**.
> **Where these files live — this stage is the exception.** `index.html`, `manifest.webmanifest`, `sw.js` and the icons are **not** in the Supabase `asset` row. They are the shell, deployed from the GitHub repo `github.com/diys8/daily-plan-app` via Render. **Confirm push access before starting R7.** Everything in R1–R6 is the Supabase row; R7 is a repo commit and a Render deploy.

- **The symptom this fixes:** on Android the app currently offers "Add shortcut" (a bookmark) rather than "Install app", because the manifest has only one SVG icon and no maskable PNG.
> **Already built, waiting on a push (2026-08-26).** The finished shell files are in **`Health/app_shell_update/`** — patched `index.html`, new `manifest.webmanifest`, `sw.js`, and all four icons, plus `HOW_TO_PUSH.md`. They need Diyanah's GitHub credentials. `theme_color` is deliberately still navy `#0f1420`; flip it to `#0d0e11` when R1 lands, not before, or the phone chrome will not match the app.

- **Install assets** — already cut in `Health/app_icon/`:
  - `icon-192.png`, `icon-512.png` → manifest `icons`, `purpose:"any"`
  - `icon-512-maskable.png` → manifest `icons`, `purpose:"maskable"`
  - `apple-touch-icon-180.png` → `<link rel="apple-touch-icon">` **in the page head**. iOS ignores manifest icons; without this the home-screen icon is a screenshot of the page.
  - `theme_color` and `background_color` → `#0d0e11`, in the manifest and the `<meta name="theme-color">`.
  - Add `<meta name="mobile-web-app-capable" content="yes">` to `index.html`.
- **F5 — let the app update itself.** The service worker's cache is named `dp-v1` and never renamed, and `app.js` is fetched from a fixed address, so the phone has no way to know a new version exists. That is why "close and reopen the app" is in every release note. Stamp a version on the asset URL and bump the cache name on release; the manual step then goes away.
  - Deploy the shell, then **delete the old shortcut on the phone before reinstalling** — Chrome will not upgrade a bookmark into an installed app in place.

### Edge cases
- **Empty goals list** → empty state with Add goal, not a bare heading.
- **Very long equipment string** → wraps, never truncates silently.
- **Notifications denied at OS level** → the Reminders row says so and offers the settings path, rather than showing "On".
- **Timezone changed by travel** → the existing auto-detect still runs; the profile row shows the detected zone.
- **Installed with the old icon cached** → the release note must say remove-and-reinstall; an in-place refresh will not pick up the new icon.
- **No push access to the shell repo** → R7 stalls. Check this before starting, not halfway through.
- **Render deploy fails or lags** → the app keeps working; only the shell is stale. Do not roll back the Supabase row for a shell problem.

### Checks to write first
- Data: saving the profile with an empty goal drops the empty row rather than inserting a blank.
- Data: training level writes one of the three allowed values.
- Journey: set training level → reload → held.
- Journey: manifest and head both reference all four icon files at the right sizes.
- Journey: Chrome on Android offers "Install app", not "Add shortcut".
- Journey: the installed app launches standalone, with no browser chrome.

### Phone test
Delete the installed app, install it again, and confirm the icon and the status-bar colour are right.

---

## Not in this redesign — still open

- **Third-tier library fallback for demos** — see R3.1. Needs a licensing answer before it can be considered.
- **Automated illustration generation** — an edge function producing images in her style, with her approving before they go live.
- Coach: automatic per-session tweaks, tournament periodisation, deload scheduling.
- In-app control to raise the coach budget (today the yearly cap is edited by hand in `coach_config`).
- Manual pause toggle on an exercise (pausing is coach-driven; only resume exists).
- Per-day checklist item text edits (edits currently change the template for every day).
- **Stage 6 — Gong's version.** After this lands, so he never sees the old app.
- **Wearables** — Whoop and Garmin via Strava as the bridge, surfacing on the recap screen.

## Closed by the design pass

- **"Block categories after editing"** (AI auto-tagging vs minimalist) — dissolved. There is no category colour left to tag.
- **Exercise library as the primary demo source** — rejected. Licensing on the best free option was never clarified, coverage would still be incomplete, and the style clashes with her set. The cue card is the floor; her own illustrations are the ceiling; the queue closes the gap.
