# Daily Plan

A phone-first dark-theme web app that runs Diyanah's day — meals, work blocks,
wind-down, training — plus a workouts hub and an AI coach.

Live at **https://daily-plan-app.onrender.com**

Two users today: Diyanah and Gong. There are no accounts; each person reaches
their own plan through a private link containing their slug.

## How it fits together

Four pieces, and it helps to know which is which:

| Piece | Where it lives | What it does |
|---|---|---|
| **The shell** | this repo, deployed by Render | `index.html`, the service worker, the manifest and the icons. Small and rarely changes. |
| **The app logic** | a **row in the database**, served by the `asset` edge function | All the actual behaviour. One large file. |
| **The database** | Supabase project `nalxowbclhvopjqkvweh` | Plan, blocks, checklists, routines, exercises, logs, goals. |
| **The server jobs** | Supabase edge functions | `notify` sends reminders every minute; `coach` calls the Anthropic API. |

The unusual part is the second row. The app's logic is not a file on this
server — it is text stored in a database table and loaded by the page at
runtime. That is why edits used to appear instantly with no deploy.
**Moving it into real files in this repo is what Migration A is for**, and
`src/app.js` here is the first step: a verified copy, not yet the thing that
actually runs.

## What is in this repo

```
index.html, sw.js, manifest.webmanifest, icon*   the shell Render serves
src/app.js, src/sw-logic.js                      snapshot of the live logic
supabase/migrations/                             every database change, in order
supabase/functions/                              the three live edge functions
docs/                                            plans, build order, code review
```

## Running it

There is no build step, no bundler and no framework. That is deliberate.

To look at the shell locally, open `index.html` in a browser — it will load the
live app logic and talk to the live database, so **treat it as production**.
There is no staging environment yet (migration step A5).

## Deploying

Render publishes this repo at the address above.

**Auto-deploy is currently broken.** The service reads as connected to `main`,
but pushing does not trigger a deploy — it has to be started by hand from the
Render dashboard. Repairing that is an open task.

**Do not deploy without reading this first:** Render publishes the repository
root, so `docs/`, `src/` and `supabase/` would become publicly downloadable at
the app's address. The site files need moving into their own folder, and the
Render publish path pointing at it, in the same change that reconnects
auto-deploy.

## Settings and secrets

No secret belongs in this repo. See `.env.example` for what exists and where
each one is configured.

## Where to start reading

1. `docs/Claude_Code_Handoff.md` — the current state and what is open
2. `docs/Migration_Plan.md` — where the project is going, and its Status section
3. `docs/Redesign_Build_Order.md` — the approved redesign, staged R0 to R7
4. `docs/Code_Review.html` — nine findings, several still open

## Known open issues

- **F1** — the database is reachable by anyone holding the key published in the
  page source, under rules that permit reading and writing every table.
- **F7** — nothing backs up the plan, routines or logs, and no restore has ever
  been performed.
- **F2** — around twenty database writes never check whether they succeeded, so
  a failed write looks exactly like a successful one.
- Un-toggling a day in the routine editor deletes the block **and its logs**
  with no confirmation. Scheduled as R5. Avoid day toggles until then.
