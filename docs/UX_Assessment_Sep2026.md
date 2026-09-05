# UX/UI Assessment — September 2026

_Completed 2026-09-05. Follows the Phase 2 redesign (18 findings shipped)._

---

## How this was done

Reviewed the live app at mobile and desktop widths across all three tabs (Today, Train, You) and the workout detail view. Compared patterns against Garmin Connect, Apple Fitness, Nike Training Club, Todoist, and Apple Calendar.

---

## Overall impression

The app has a strong foundation — the dark theme is clean, the amber accent is distinctive, and the day-as-a-timeline concept is immediately clear. It feels like a real product, not a prototype. But it's held back by a few patterns that make it feel more like a developer tool than a consumer app. The biggest gaps are about **information density** (too much scrolling, not enough summary) and **missing visual signals** (you have to read everything — nothing is communicated through shape, colour, or position alone).

---

## What works well

- **The amber/bronze system is clear.** Amber = do something, bronze = done. Consistent and learnable. Better than most apps that use 5+ colours.
- **The Now card** anchors you in your day instantly. The "step 11 of 12" label is clear.
- **The welcome card** is friendly, short, and explains the three tabs in one sentence each.
- **The day strip** is intuitive — horizontal week with the current day highlighted. Standard pattern, well executed.
- **Coach inside Train** (not its own tab) was the right call — keeps the tab count to three and makes Coach feel like a training tool, not a chatbot.

---

## Findings

### 1. Workout detail opens inside the Today tab (high)

**What happens:** Tapping a workout block on the Today tab opens the full workout view (all exercises, coach card, edit button) but the tab bar still says "Today."

**Why it's a problem:**
- The tab bar lies about where you are
- 10+ exercises expand inside the day timeline, burying the schedule
- The same workout view already exists in the Train tab — it's duplicated

**What successful apps do:** Garmin, Apple Fitness, Apple Calendar — tapping a linked item navigates to its home tab with that item open. The source screen keeps a compact summary.

**Recommendation:** Tapping a workout block on Today should navigate to the Train tab with that workout auto-opened. Today keeps a compact row showing just the name, time, and progress (e.g. "0/10"). One tap to jump. Back arrow to return.

---

### 2. No progress visualisation (high)

**What happens:** Progress is shown as "0/12" text in a small circle.

**Why it's a problem:** You have to read and interpret numbers. At a glance, you can't tell if you're 20% or 80% through your day.

**What successful apps do:** Apple Health uses rings, Garmin has a daily progress bar, Todoist shows a progress pie on projects. All use shape, not just numbers.

**Recommendation:** Replace or supplement the "0/12" text with a progress ring — a thin circle that fills as you complete blocks. Keep the number inside it.

---

### 3. All blocks look identical (medium)

**What happens:** Meal, work, workout, and wind-down blocks are all the same text row — no visual differentiation.

**Why it's a problem:** In a 12-block day, you have to read every title to find what you're looking for. No scanning shortcuts.

**What successful apps do:** Google Calendar uses colour strips. Notion uses icons per page. Todoist uses priority dots. Visual markers let you scan by shape.

**Recommendation:** Add a small icon next to each block title — a cup for meals, a laptop for work, a barbell for workouts, a moon for wind-down. No category colours needed — icons alone are enough.

**Note:** This needs a way to assign icons. Options:
- Auto-assign based on the block's `tag` field (already in the data)
- Let users pick an icon per block (adds UI complexity)
- Start with tag-based auto-assignment, add manual override later

---

### 4. Past blocks and future blocks look the same (medium)

**What happens:** On the current day, blocks that have already passed look identical to upcoming blocks.

**Why it's a problem:** No natural "you are here" boundary. The Now card helps, but everything around it has equal visual weight.

**What successful apps do:** Apple Calendar greys out past events. Google Calendar draws a red "now" line. Both create a clear before/after split.

**Recommendation:** Dim past blocks to ~45% opacity. No strikethrough — just lower contrast so your eye naturally lands on what's current and upcoming. Done blocks (marked with the checkmark) get the existing bronze treatment plus the dimming.

---

### 5. "0/3" count is ambiguous (medium)

**What happens:** Block rows show "0/3" or "0/1" with no label. It's unclear whether that's checklist items, exercises, or something else.

**Why it's a problem:** You have to tap into a block to understand what the number means.

**What successful apps do:** Todoist shows "3 subtasks" explicitly. Apple Reminders shows a count with a label.

**Recommendation:** Consider showing "0/3 items" or using a small checklist icon next to the count to make it self-explanatory. For workout blocks, show "0/10 exercises" or similar.

---

### 6. Profile is an edit form, not a profile (low)

**What happens:** The You tab opens straight to editable text fields — no read-only summary view.

**Why it's a problem:** Most apps show a profile card first with an "Edit" button. Opening directly to a form feels like you've landed in settings, not on your profile.

**Recommendation:** Future consideration — not part of the immediate changes. Could show a read-only card layout with an "Edit" toggle that switches to form mode.

---

### 7. Day title ("Rest + Strength A") is confusing (low)

**What happens:** The day heading auto-generates from the day's activities. "Rest + Strength A" doesn't clearly communicate what the day is.

**Why it's a problem:** A new user wouldn't understand what "Rest" means as a day label.

**Recommendation:** Future consideration — could use just the date, or let users set custom day names.

---

## Comparison to successful apps

| What they do | Daily Plan equivalent | Gap |
|---|---|---|
| **Garmin:** daily summary card with progress rings | "0/12" text counter | No visual progress shape |
| **Apple Calendar:** colour-coded event strips, "now" line | Plain text rows, no time marker | No scanning shortcuts |
| **Todoist:** satisfying check animation, progress pie | Bronze fade on done blocks | Done-state is subtle |
| **Nike Training Club:** workout cards with images, clear "Start" CTA | Workout block is just a text row | Workout block should look different from "Breakfast" |
| **Notion:** icons on every page, card-based layout | No icons on blocks | Blocks are text-only |

---

## Priority order

1. **Workout block → navigates to Train** (fixes the biggest UX confusion)
2. **Progress ring** (instant visual feedback)
3. **Block icons** (scanning by shape)
4. **Dimmed past blocks** (visual "you are here")
5. ~~Strikethrough on past blocks~~ (decided against — dimming only)

Items 6 and 7 are noted for later, not part of the immediate implementation.
