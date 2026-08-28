# Daily Plan — CLAUDE.md

Read this before touching anything. It carries the rules, the palette, and the
decisions that are closed.

---

## What this is

A phone-first dark-theme PWA that runs Diyanah's day — meals, work blocks,
wind-down, training — plus a workouts hub and an AI coach. Two users today
(Diyanah and Gong). Live at https://daily-plan-app.onrender.com

## How it's built

Static site hosted on Render (service `srv-da48u8rbc2fs73c9q9v0`).
Database and edge functions on Supabase (project ref `nalxowbclhvopjqkvweh`).

- `public/` — the served app. `index.html`, seven ES modules, `styles.css`,
  service worker, icons, manifest.
- `public/app.js` — entry point, imports the others.
- `public/state.js` — shared mutable state (`S` object), Supabase URL and key.
- `public/db.js` — every database call, the `save()` wrapper, `load()`.
- `public/today.js` — Today screen rendering and handlers.
- `public/workout.js` — Workouts hub and routine editor.
- `public/coach.js` — AI coach screen.
- `public/util.js` — `esc()` and small helpers.
- `supabase/functions/` — three edge functions: `asset`, `coach`, `notify`.
- `supabase/migrations/` — nine tracked migrations.
- No build step, no bundler, no framework.

## Palette — locked

```
--bg:    #0d0e11   ground, neutral charcoal
--surf:  #16181d   flat panels, tiles
--raise: #1d2026   the one raised card per screen
--line:  #272b32   borders on controls
--line2: #1b1e23   hairline dividers between rows
--ink:   #f2f4f7   primary text
--mut:   #9ba3ad   secondary text, cues
--dim:   #6f7883   labels, meta, times
--acc:   #f2952c   AMBER — anything tappable
--onacc: #150f05   text on amber
--done:  #a7712e   BRONZE — done only, fill never text
```

Amber means "you can act on this." Bronze means "done." No other semantic
colours. Category colours (food/work/play/rest) are in the data but no longer
rendered.

## Decisions that are closed — do not reopen

Full reasoning for each is in `DECISIONS.md`.

- **One action colour everywhere.** No colour-coding by category.
- **Bottom nav:** Today · Train · Coach · You. "Train", not "Workouts."
- **Exercise demos** from Diyanah's own illustrations (`exercise_img/`).
  No external library as primary source.
- **App icon:** the "timeline" mark, flat amber `#f2952c`.
- **No bundler, no framework, no compile step.**
- **Migration B waits** until after the redesign ships.

## Engineering rules

### Write it simple, and write it safe

- Plain named functions and template strings. A new screen is `renderX()` +
  handler wiring — follow the existing pattern.
- No heavy libraries. No abstraction before it's needed.
- Every database write goes through `save()` in `db.js` — never write directly.
- Text shown on screen goes through `esc()` in `util.js`.
- Anything irreversible asks the user first (`confirm()`).
- Failures are visible (red toast via `showError()` in `db.js`). Silence is
  never the failure mode.
- Comments explain *why*, never *what*.

### Security — hard rules

- **`SUPABASE_SERVICE_ROLE_KEY` must NEVER reach a browser or this repo.**
- **`app_secret` table must NEVER be exported** (contains keys).
- The publishable key is in the page source by design. Row-level security
  policies are the only barrier. Currently all DELETE policies are dropped;
  SELECT/INSERT/UPDATE are wide open until Migration B adds real auth.
- Never build a database query by joining strings. Use the Supabase client's
  builder methods.

### Code patterns

- Shared mutable state lives in the `S` object (`state.js`).
- `S.render` is set at boot to avoid circular imports between modules.
- `load()` in `db.js` fetches all data; `reloadAndRender()` calls load then
  re-renders the current view.
- The `save()` wrapper returns `data` on success or `null` on failure. Check
  the return value when the calling code needs the result.

## Deploy

Auto-deploy from GitHub is broken (pushes don't trigger builds). Deploys are
triggered through the Render API or dashboard.

```
# Via Render MCP tool:
trigger_deploy(serviceId: "srv-da48u8rbc2fs73c9q9v0",
               workspaceId: "tea-d6lj7ch4tr6s73biq880")
```

Publish directory on Render is `public/`. Only files in `public/` are served.
`docs/`, `src/`, `supabase/` are not publicly accessible.

## Rollback

Revert the commit and deploy again. Every change is a commit, so `git revert`
is always available.

## Working with Diyanah

She is not technical. Summarise what you're about to do in plain language and
wait for a go-ahead. Don't show code unless asked. Keep it short.
