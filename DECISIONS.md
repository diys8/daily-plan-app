# Decisions

What was decided, and — more importantly — **what was rejected and why**.
Rejections are the part that gets lost. Without them written down, the same
option gets re-argued every few months by someone who wasn't there.

Newest first. Add to the top.

---

## 2026-08-26 — Amber revised, `#e3953b` → `#f2952c`

The accent colour read as glaring at first and flat after it was calmed down.
Those are two different properties: glare is *lightness*, flatness is
*saturation*. The original fix turned both down together, which is why it went
dull.

**Decided:** keep the hue (32°) and the lightness (56%) exactly; raise
saturation 75% → 88%. More colour, not more light. Icon gradient follows to
`#f2952c → #d77c14`.

**Rejected:** a brighter gold (`#f4ae34`) — more vivid, but it reintroduces the
original glare complaint. And a deeper orange (`#f68a1e`), which reads heavier
rather than more alive.

**Note:** this reopened a decision previously marked settled after eight rounds.
It was reopened deliberately and cheaply, *before* the palette reached the app —
at that point it was one line and five icon files. Once R1–R7 ships it is
everywhere.

## 2026-08-26 — The two stale copies of the app are retired, not preserved

Two edge functions (`app`, `publish`) and a public storage bucket each served a
21 August copy of the app pointed at the live database.

**Decided:** retire all three. Archive their content outside the repo rather
than committing it.

**Rejected:** committing them into the snapshot for completeness. Committing
15 KB of encoded obsolete app preserves a hazard rather than a record — the
useful artefact is the written account of what they were.

## 2026-08-26 — The first commit is verbatim, not tidied

**Decided:** the snapshot commit reproduces exactly what was running, with no
cleanup, renaming or reformatting.

**Why:** so that anything which breaks later is provably a change we made, not
something that was already wrong. Cleanup mixed into a baseline destroys the
baseline.

## 2026-08-24 — Migration A: move into the static site, not a bundler

Two ways to get the app logic out of a database row.

**Decided — Option A:** move it into real files in this repo. Ordinary imports,
no bundler, no build step. Every change becomes a commit and a deploy of about
a minute.

**Rejected — Option B:** keep the database row and add a bundler. It preserves
instant deploys, but instant-deploy-from-anywhere is exactly the property worth
giving up once there is more than one user and a test suite worth waiting for.
It also adds the one piece of tooling the project currently does without.

## 2026-08-24 — Migration B waits, and splits in two before it starts

**Decided:** do not begin real accounts until Migration A and the redesign are
done. Then decide **B-friends** (a handful of people you know) versus
**B-product** (strangers can sign up) *before* building any of it.

**Why the gap is deliberate:** the answer to "should other people have this" is
much clearer once the redesigned thing they'd be given actually exists.

**Consequence:** B-product makes the exercise-illustration licensing question
blocking rather than optional.

## 2026-08-24 — No external exercise library as a primary source

**Decided:** demos come from Diyanah's own illustrations in `exercise_img/`,
two-frame `_0`/`_1` pairs. They cover 16 of 22 of her moves.

**Rejected, with reasons:**
- **free-exercise-db** — JSON is public domain, but image licensing was never
  clarified; the question was asked in the repository's issues and closed
  unanswered.
- **wger** — sparse image coverage, mixed licences.
- **ExerciseDB** — redistribution terms unclear.
- **Any photo-based set** — clashes with flat illustrations stylistically.

**Unsolved and carried forward:** the coach can add exercises nobody has drawn,
so the set can never be complete. The written form cue is the guaranteed floor;
anything undrawn lands in a needs-a-demo queue.

**Still open:** whether a library may serve as a labelled third-tier fallback
below the cue card. Needs a licensing answer first.

**Non-negotiable if illustrations are ever generated automatically:** a human
approves before they go live. AI image generation gets limb positions wrong.

## 2026-08-24 — One action colour, no category colours

**Decided:** amber means *anything you can act on*, app-wide. Bronze means
*done*, as a fill and never as text. Categories keep their tag in the data but
stop being rendered as colour.

**Rejected:** colour-coding by category (food / work / play / rest), which the
original app used. With categories coloured, colour stops meaning "you can tap
this" and the interface loses its only reliable signal.

## 2026-08-24 — Bottom navigation is Today · Train · Coach · You

**Decided:** four tabs, and the second is **Train**, not "Workouts".

## 2026-08-21 — Private links, not accounts

**Decided:** each person reaches their plan through a link containing a private
slug. No sign-in.

**Known consequence, and it is now a live problem:** this only works if the
slug is unguessable *and* unlistable. It is currently listable — anyone holding
the publishable key can read the `person` table and obtain every slug. The model
is not delivering the privacy it assumes. This is finding **F1**, and it retires
properly in Migration B1.

## 2026-08-21 — App logic lives in a database row

**Decided at the time:** store the whole app as text in the `asset` table and
serve it through an edge function, so edits reach the phone in seconds with no
deploy.

**Superseded 2026-08-24** by the Migration A decision above. Recorded because it
explains the shape of everything built before that date, and because the
trade-off it made — speed of iteration against having any history at all — is
worth remembering rather than rediscovering.
