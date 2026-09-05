# UX Redesign — Phase 2: Train + Coach merge

_Started 2026-08-29. Picks up after R1–R7 shipped._

---

## Context

A full UI/UX usability assessment (17 findings) was completed. Diyanah's main feedback: the app looks clunky and not user-friendly, and she doesn't know what the Train tab is for. Research was done on Garmin, Fitbit, and Whoop for inspiration — but Daily Plan is a planner with a workout function, not a fitness app.

Assessment artifact: https://claude.ai/code/artifact/d1f4c043-0556-4331-9f09-81ae6565f22e

---

## Decisions — locked

### 1. Coach tab removed, folded into Train

Coach is a function of training, not a standalone feature. Having it as its own tab:
- Made it unclear what Train is for
- Made Coach look like a general AI chatbot instead of a training-specific tool

Coach now lives inside the Train screen and inside individual workout screens.

### 2. Tab bar: three tabs

**Before:** Today · Train · Coach · You (four tabs)
**After:** Today · Train · You (three tabs)

### 3. Coach entry points

- **Train screen** — one coach card near the top. When there's a relevant nudge (e.g. "legs were heavy on Tuesday"), it shows that. When there's nothing to nudge about, it becomes a simple "Ask your coach" prompt.
- **Workout screen** — one coach card below the header, scoped to that routine ("Ask about this routine — swap a move, check form, adjust load").
- Same conversation thread regardless of entry point.

### 4. Icons

- **Train tab icon:** the barbell (path: `M6 7v10M18 7v10M4 9v6M20 9v6M6 12h12`) — do not change this
- **Coach icon within Train:** the speech bubble SVG from the original Coach tab (path: `M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z`) — do not change this
- **Today tab icon:** calendar with pins (existing)
- **You tab icon:** person silhouette (existing)

---

## Train screen — populated state

```
┌─────────────────────────────────┐
│  Train                      [+] │   ← title + add button (top right)
│                                 │
│  ┌─ coach card ───────────────┐ │   ← speech bubble icon + nudge text
│  │ 💬 Legs were heavy on Tue. │ │      + "Ask the coach →" link
│  │    Ask the coach →         │ │
│  └────────────────────────────┘ │
│                                 │
│  ROUTINES                       │   ← section label
│                                 │
│  ┌────────────────────────────┐ │
│  │ Legs + lateral power     › │ │   ← routine name (no "Strength A" prefix)
│  │ Tue · 13 exercises ·      │ │      meta: day · count · last done
│  │ Done 3d ago               │ │      no coloured words in meta
│  └────────────────────────────┘ │
│                                 │
│  ┌────────────────────────────┐ │
│  │ Core, back & balance    › │ │
│  │ Fri · 15 exercises ·     │ │
│  │ Today · not started       │ │
│  └────────────────────────────┘ │
│                                 │
│  ┌ Today ─── Train ─── You ──┐ │   ← three-tab bar
└─────────────────────────────────┘
```

**Key rules:**
- Routine names are descriptive only — drop the "Strength A / B" prefix
- Meta line uses dot separators: day · exercise count · last done
- No coloured words in the meta line (no amber or bronze on descriptive text)
- The `+` button top-right replaces the old dashed "New routine" bar
- Coach appears once, not twice

## Train screen — empty state

```
┌─────────────────────────────────┐
│  Train                      [+] │
│                                 │
│                                 │
│         [barbell icon]          │   ← barbell in amber-tinted rounded square
│       No routines yet           │
│                                 │
│    Create a routine with your   │
│    exercises, set which day it  │
│    runs, and track how each     │
│    session feels.               │
│                                 │
│      [ Create a routine ]       │   ← amber CTA button
│                                 │
│  ┌────────────────────────────┐ │
│  │ 💬 Not sure where to      │ │   ← coach card, same position concept
│  │    start? The coach can    │ │
│  │    help you build one.   › │ │
│  └────────────────────────────┘ │
│                                 │
│  ┌ Today ─── Train ─── You ──┐ │
└─────────────────────────────────┘
```

**Key rules:**
- Empty state icon is the barbell (same as tab icon), not a stock emoji
- Icon sits in an amber-tinted rounded square that fits the palette
- Clear, friendly copy — no jargon
- Coach card offers to help build a routine

## Workout screen (tapping into a routine)

```
┌─────────────────────────────────┐
│  ‹  Strength A          Edit   │   ← back arrow + name + edit
│                                 │
│  [13 exercises] [Tue] [~45 min] │   ← meta pills
│                                 │
│  Last done 3 days ago           │
│                                 │
│  ┌─ coach card ───────────────┐ │
│  │ 💬 Ask about this routine  │ │   ← scoped to this workout
│  │    — swap a move, check    │ │
│  │    form, adjust load     › │ │
│  └────────────────────────────┘ │
│                                 │
│  EXERCISES                      │
│                                 │
│  [1] Lateral lunge              │
│      3 × 10 each side        › │
│                                 │
│  [2] Bulgarian split squat      │
│      3 × 8 each side         › │
│                                 │
│  [3] Single-leg RDL             │
│      3 × 10 each side        › │
│                                 │
│  [4] Lateral band walk          │
│      3 × 12 each direction   › │
│                                 │
│      + 9 more exercises         │
│                                 │
│  ┌──── Start session ─────────┐ │   ← amber CTA
│  └────────────────────────────┘ │
└─────────────────────────────────┘
```

**Key rules:**
- Coach card is scoped — "Ask about this routine" with examples, not a general chatbot
- Exercises show numbers, names, and sets/reps without extra tapping
- Back arrow returns to Train screen
- Meta pills: exercise count, scheduled day, estimated time

---

## Design principles (from this round)

1. **Sleek and smooth** — the app should feel polished, not clunky
2. **Visual hierarchy** — clear levels of importance, not everything competing
3. **No redundancy** — each element appears once, in the right place
4. **Purpose is obvious** — every screen explains itself within the first second
5. **Colour discipline** — amber = tappable, bronze = done, nothing else gets colour treatment in meta text
6. **Fit the palette** — icons and empty states use the app's own visual language (barbell, speech bubble), not stock emoji or unrelated icons

---

## UX assessment findings (18 total, not yet implemented)

Prioritised into three waves:

### Wave 1 — Make it make sense (~2 hrs)
1. Train screen: no header or purpose explanation
2. Empty states missing across app
3. No feedback on taps (missing :active states)
4. Checkbox borders too low contrast
5. "Now" card unclear what it means
6. Tab icons too small for touch
7. No onboarding or first-run guidance

### Wave 2 — Make it feel alive (~1.5 hrs)
8. Day strip pills too small for fingers
9. Grip handles on drag items too narrow
10. No loading or transition states
11. Coach input field too small
12. No confirmation after saving
13. Completed blocks not visually distinct

### Wave 3 — Make it inviting (~3 hrs)
14. Profile screen is just a data dump
15. No visual rhythm or breathing room
16. Exercise cards lack visual interest
17. No celebration moments (completing a workout, finishing all blocks)
18. App feels like a prototype, not a product

---

## Exercise demo library research

The app currently uses Diyanah's hand-drawn illustrations for exercise demos. Some are inaccurate, and coverage is incomplete. Research was done to find free libraries that could supplement or replace them.

### Recommendation: Workout Guide

- **Library:** [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db) (also called Workout Guide)
- **License:** MIT — free for any use, no restrictions
- **Format:** SVG frame sequences (two frames per exercise, showing start and end positions)
- **Size:** 302 exercises
- **Coverage of our exercises:** 25 out of 30 (83%)

**Covered (25):** Lateral lunge, Bulgarian split squat, Single-leg RDL, Lateral band walk, Calf raise, Hip thrust, Step-up, Goblet squat, Glute bridge, Plank, Side plank, Dead bug, Bird dog, Pallof press, Superman, Face pull, Bent-over row, Shoulder press, Lat pulldown, Push-up, Tricep dip, Bicep curl, Hammer curl, Wrist curl, Leg curl

**Not covered (5):** Shadow footwork drill, Agility ladder (badminton-specific), Banded clamshell (close match exists), Copenhagen plank (niche variation), Ankle alphabet (rehab-specific)

### Fallback: ExerciseDB open-source

- **Library:** [exercisedb.io open-source fork](https://github.com/exercisedb)
- **License:** Unclear — uses data scraped from various sources. Low risk for personal use, but not safe to redistribute or build a product on
- **Format:** Animated GIFs
- **Size:** ~1,500 exercises
- **Coverage of our exercises:** 19–24 out of 30 (63–80%, depending on how close a match is accepted)

### Gaps — need custom illustrations

Neither library covers badminton-specific drills (shadow footwork, agility ladder patterns, shuttle runs). These will continue to use Diyanah's own illustrations or simple text cues.

### Integration approach

- Use Workout Guide SVG frames as the primary demo source
- Keep Diyanah's illustrations for badminton-specific and rehab exercises
- SVG frames can be displayed as a simple two-frame animation (alternating start/end position) — lightweight, no video files needed
- Store mapping of exercise name → library filename in a lookup table

### Colour update

Amber is changing from `#f2952c` to `#F5A623` (more vibrant). The current shade looked dull on phone screens. This applies to all tappable elements, accent fills, and the app icon background.

---

## Status

- [x] UX assessment complete (17 findings)
- [x] Tab restructure decided (4 tabs → 3)
- [x] Coach merge into Train decided
- [x] Train screen mockup approved (populated + empty)
- [x] Workout screen mockup created
- [x] Exercise demo library researched (Workout Guide recommended, 83% coverage)
- [x] Amber updated to `#F5A623`
- [x] Update `styles.css` — amber `#F5A623`, coach card, empty state styles
- [x] Update `index.html` tab bar (remove Coach tab, 4→3)
- [x] Update `app.js` tab routing (coach under Train)
- [x] Update `workout.js` — new Train layout, coach card in workout session
- [x] Update `coach.js` — back button, navigates to Train or workout
- [x] Update `CLAUDE.md` — tab bar decision updated
- [x] Wave 1: #1 Train header (done via redesign)
- [x] Wave 1: #3 Tap feedback — `:active` states on tabs, day pills, block rows, buttons, checklist items, workout rows
- [x] Wave 1: #4 Checkbox contrast — border bumped from `--dim` to `--mut`
- [x] Wave 1: #6 Tab icons — 22px → 24px
- [x] Wave 2: #8 Day strip pills — 46px → 50px
- [x] Wave 2: #13 Completed blocks — done rows fade + strikethrough
- [x] Wave 1: #2 Empty states — Today "Nothing planned" with calendar icon; Train empty state already done
- [x] Wave 1: #5 "Now" card clarity — "3 of 8" → "step 3 of 8"
- [x] Wave 1: #7 Onboarding — first-run welcome card with localStorage dismissal
- [x] Wave 2: #11 Coach input — taller (44px), larger font (15px), more max-height (160px)
- [x] Wave 2: #12 Save confirmation — "Saved ✓" toast after every save action
- [x] Wave 2: #9 Grip handles — wider touch target (12px padding), grab cursor, tap-highlight suppressed
- [x] Wave 2: #10 View transitions — fade on view change, instant re-render within same view
- [x] Wave 3: #14 Profile — avatar header with initial, sections wrapped in cards
- [x] Wave 3: #15 Visual rhythm — spacing adjustments across day strip, now card, sections, detail wrap
- [x] Wave 3: #16 Exercise cards — numbered circles (1, 2, 3…) replacing dots, bronze fill when done
- [x] Wave 3: #17 Celebrations — recap badge pop-in animation + burst effect, "All done" toast when every block is checked
- [x] Wave 3: #18 Polish — cumulative result of all above fixes
- [ ] Integrate Workout Guide library for exercise demos

---

## What to read next

- `Redesign_Build_Order.md` — the R1–R7 stages that shipped before this
- `Claude_Code_Handoff.md` — project overview and architecture
- `CLAUDE.md` (project root) — palette, engineering rules, deploy process
