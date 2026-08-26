# Edge functions

Snapshot taken 2026-08-26 from Supabase project `nalxowbclhvopjqkvweh`.

The project has **five** deployed edge functions. Three are load-bearing and are
committed here verbatim. Two are dead scaffolding from the first days of the
project and are deliberately **not** committed — see below.

## Committed (live, load-bearing)

| Function | What it does | Auth |
|---|---|---|
| `asset` | Serves a row of the `asset` table as JavaScript. This is how `app.js` and `sw-logic.js` reach the browser today. | none — public by design |
| `notify` | Called every minute by `pg_cron`. Finds blocks due now in each person's timezone and sends Web Push. | shared `cron_secret` from the `app_secret` table |
| `coach` | Calls the Anthropic API, enforces the spend budget, returns a coaching proposal. | none — see the note below |

No secret is hardcoded in any of them. Keys come from environment variables
(`ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) or from the `app_secret`
table, which has RLS on and no `anon` policy.

**Note on `coach`:** it has `verify_jwt` off and identifies the user from a
`slug` in the request body, so anyone who knows a slug can spend the Anthropic
budget. The yearly cap (`coach_config.yearly_cap_usd`, currently $10) is what
bounds the damage. This is the same private-link trust model as the rest of the
app and it retires in Migration B1.

## Not committed (dead scaffolding, slated for deletion)

Both predate the move to Render and both embed a base64 copy of the **21 August**
version of the app.

- **`app`** — serves a complete, stale copy of Daily Plan at
  `/functions/v1/app`, with a working publishable key, pointed at the **live
  production database**. It answers 200 today. It is a second front door running
  four-day-old code against real data.
- **`publish`** — uploads that same stale copy into the `app` storage bucket.
  `verify_jwt` is off and it runs with the service role key, so any unauthenticated
  caller can trigger it.

They are excluded from this snapshot on purpose: committing 15 KB of base64 that
reconstructs an obsolete app would preserve a hazard rather than a record. Their
source remains retrievable from Supabase until they are deleted.

**Neither has been deleted yet — that is a decision for Diyanah, not a cleanup to
slip into a snapshot commit.**

## Verification status of this snapshot

`app.js`, `sw-logic.js` and all nine migrations in `../migrations/` were verified
byte-for-byte against the database with matching MD5 checksums. The three edge
functions here were transcribed from the live source, which Supabase exposes with
no checksum to compare against — so they are faithful but **not** independently
verified. Treat them as reference copies until they are deployed from this repo
and confirmed working.
