# Phase 3 — Today tab improvements

_Created 2026-09-05. Implements findings 1–4 from `UX_Assessment_Sep2026.md`._

---

## Scope

All changes are to the **Today tab only**. Train, You, and workout detail screens stay as they are.

---

## Change 1: Workout block navigates to Train

**Current behaviour:** Tapping a workout block on Today opens the full workout view (all exercises, coach card) inside the Today tab. The tab bar still says "Today."

**New behaviour:** Tapping a workout block on Today navigates to the Train tab with that specific workout already open. Today shows a compact workout row.

### What the compact workout row looks like on Today

- Barbell icon (amber) on the left
- Workout name in amber, bold (e.g. "Strength A")
- Progress badge: "0/10" in a small amber-tinted pill
- Chevron arrow (›) on the right indicating it's tappable
- Same row height as other blocks — not expanded, no exercise list

### What happens on tap

1. Set `S.view = "workout"` and `S.workoutBlockId` to the block's linked workout
2. This navigates to the Train tab's workout detail view
3. The tab bar highlights "Train"
4. Back arrow (‹) in the workout header returns to the Today tab

### Files to change

- `public/today.js` — in `renderPlan()`, render workout blocks as compact rows instead of expandable detail. In `wire()`, change the click handler from expanding inline to setting `S.view = "workout"`.
- `public/app.js` — `updateTabs()` already maps the "workout" view to the Train tab. No change needed.

---

## Change 2: Progress ring

**Current:** "0/12" shown as text in a bordered circle (top right of day header).

**New:** An SVG progress ring — a thin circular track that fills clockwise as blocks are marked done. The fraction (e.g. "5/12") stays as text inside the ring.

### Design spec

- Ring diameter: 44px
- Track colour: `var(--line)` (#272b32)
- Fill colour: `var(--acc)` (#F5A623)
- Stroke width: 3px
- Text inside: current count in `--ink`, font-size 11px, bold
- Ring fills proportionally: 5 of 12 done = ~42% of the circle filled
- Uses SVG `stroke-dasharray` and `stroke-dashoffset` for the fill

### Files to change

- `public/today.js` — replace the `<div class="prog">` element in `renderPlan()` with an SVG ring
- `public/styles.css` — add `.progress-ring` styles, can remove `.prog` styles

---

## Change 3: Block icons

**Current:** Block rows show time + title + count. No visual differentiation between types.

**New:** A small icon appears between the time and the title, based on the block's `tag` field.

### Icon mapping (tag → icon)

| Tag | Icon | SVG concept |
|-----|------|-------------|
| `food` | Cup/mug | Coffee cup with steam lines |
| `work` | Laptop | Monitor with stand |
| `play` | Gamepad or ball | Circle or controller |
| `rest` | Moon | Crescent moon |
| `workout` (or block has a linked workout) | Barbell | The existing barbell path |
| No tag / unknown | Dot | Small filled circle as fallback |

### Design spec

- Icon size: 16×16px in a 20×20px container
- Stroke colour: `var(--dim)` (#6f7883) for normal blocks
- Stroke colour: `var(--acc)` (#F5A623) for the current "Now" block and workout blocks
- Stroke colour: `var(--done)` (#a7712e) for completed blocks
- Stroke width: 2px, no fill

### Files to change

- `public/today.js` — add a `blockIcon(tag, isWorkout)` helper function. Use it in `blockRow()` to insert the icon SVG between time and title.
- `public/styles.css` — add `.block-icon` container style

---

## Change 4: Dim past blocks

**Current:** Past and future blocks on today's schedule have the same visual weight.

**New:** Past blocks (blocks whose time has already passed on the current day) are dimmed to ~45% opacity. No strikethrough.

### Rules

- Only applies when viewing today (not when browsing other days)
- A block is "past" if its scheduled time is before the current time AND it's not the "Now" block
- The Now block keeps full opacity with its existing raised-card treatment
- Done blocks get dimming AND the existing bronze checkmark
- Future blocks stay at full opacity

### Design spec

- Past block row: `opacity: 0.45`
- Applied via a CSS class (e.g. `.block-past`) added in the rendering logic
- The Now card is never dimmed

### Files to change

- `public/today.js` — in `blockRow()`, add a `.block-past` class when the block's time index is before `currentIdx` and it's not the current block
- `public/styles.css` — add `.block-past { opacity: 0.45; }`

---

## Implementation order

1. ~~**Change 4** (dim past blocks)~~ — **Done.** `.row-past{opacity:0.45}` in styles.css, `isPast` flag in `blockRow()`.
2. ~~**Change 2** (progress ring)~~ — **Done.** Amber stroke, bold text, `stroke-dasharray` math in `ringHtml()`.
3. ~~**Change 3** (block icons)~~ — **Done.** `blockIcon()` helper in today.js, `.block-icon` in styles.css. Food/work/play/rest/workout SVGs.
4. ~~**Change 1** (workout → Train)~~ — **Done.** `updateTabs()` in app.js maps "workout"/"recap" to the Train tab group. Back button returns to Today.

All four changes shipped and verified locally on 2026-09-05.

---

## Additional findings — shipped 2026-09-05

5. ~~**Count label clarity** (finding #5)~~ — **Done.** Checkbox and barbell icons added to counts in `blockRow()`. Workout blocks now show only the exercise count (redundant checklist count removed).
6. ~~**Profile read-only view** (finding #6)~~ — **Done.** You tab opens in read-only mode; "Edit profile" toggles to form. `S.profileEdit` flag in state.js.
7. ~~**Day title simplification** (finding #7)~~ — **Done.** Non-today days show full date eyebrow + weekday heading + optional subtitle from day label.

## UX polish — shipped 2026-09-05

- Routine cards: "Never run" → "Not started", "3d ago" → "3 days ago"
- Demo queue moved from You tab to Train tab
- Demo queue cards: amber left border, rounded corners, consistent spacing
- Profile edit: App card (Reminders, Timezone) restored after read-only split
- Reminders row clickable in both read-only and edit views

## Not in scope

- Workout Guide library integration — deferred
- Changes to workout detail or coach screens — none needed
