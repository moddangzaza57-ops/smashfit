# Smash Fit — Design system

Recorded from the shipped build (`src/shell.html`, `src/ui.js`). Product truth lives in `PRODUCT.md`.

## World

Calm iOS grouped-list app, the way Apple's own Fitness and Health apps feel: system type, inset grouped cells, hairline separators, light and dark following the phone. The one product-specific idea is the **coach's logbook tally**: every set is a small square cell that fills with the accent colour when done and never disappears. It appears on the Today hero (whole session), on each exercise row (that exercise), in focus mode (set buttons), on the onboarding progress, and in the celebration (days trained this week).

## Colour (CSS custom properties on `:root`)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f2f2f7` | `#000` | page ground |
| `--cell` | `#fff` | `#1c1c1e` | grouped cells, sheets content |
| `--cell-hi` | `#fff` | `#2c2c2e` | toast, rest pill |
| `--fill` / `--fill2` | gray 12% / 20% | gray 24% / 36% | inputs, segmented track, empty tally cells |
| `--sep` | `rgba(60,60,67,.2)` | `rgba(84,84,88,.65)` | 0.5px hairlines |
| `--tx` / `--tx2` | `#000` / `#636366` | `#fff` / `#98989f` | text / secondary (≥4.5:1) |
| `--ac` / `--ac-tx` | `#18794e` / `#fff` | `#30d158` / `#00210d` | the only action colour: primary buttons, filled tally, active tab |
| `--ac-soft` / `--ac-ink` | 12% / `#18794e` | 16% / `#30d158` | tinted buttons, accent text |
| `--game` | `#0060df` | `#409cff` | badminton game days in heatmap |
| `--warn` / `--bad` | `#a64b00` / `#c4001a` | `#ffb340` / `#ff6961` | caution / pain-high only |
| `--fig-*` | near `#1c1c1e`, dumbbell `#18794e` | near `#f2f2f7`, dumbbell `#30d158` | stick-figure animation (`figure.js` reads these) |

**User appearance settings** (Settings → การแสดงผล, stored in `settings.theme/accent/textSize`, applied before first paint by an inline script in `<head>` and by `applyLook()`):
- Theme: `auto` (follows the phone) / `light` / `dark` → `data-theme` on `<html>`.
- Accent: green (default), blue, orange, purple, pink → `data-accent` overrides `--ac`, `--ac-tx`, `--ac-soft`, `--ac-ink`, `--fig-db` with a light and a dark value each (light values carry white text ≥4.5:1). Blue accent moves `--game` to purple so game days stay distinct.
- Text size: 1 / 1.1 / 1.2 → `--tz`, applied as `body{zoom}`; any `vh` length divides by `--tz`.

Rule: the accent appears only on things you can press or things that are done. State colours appear only where they carry meaning, always with text.

## Type

`-apple-system, BlinkMacSystemFont, "Noto Sans Thai", …` (iOS uses the system Thai face; others load Noto Sans Thai). Tabular numerals via `.num`.

| Role | Size / weight |
|---|---|
| Large title (`.lt h1`) | 34 / 700, -0.02em |
| Focus exercise name | 26 / 700 |
| Hero session name | 24 / 700 |
| Body / row | 17 / 400 |
| Row subtitle, meta | 14–15 / 400 `--tx2` |
| Section header (`.sec`) | 13 / 400 `--tx2` |
| Timer | 72 / 600 tabular; stepper value 40 / 600 |

No eyebrow/kicker labels above headings.

## Components

- **Grouped list** `.grp` + `.row` (min-height 50, 16px inset, hairline separators inset to text). Rows with a line icon use `.has-i`. Select rows (`.row.sel`) overlay a transparent native `<select>`, so iOS shows its own picker.
- **Buttons** `.btn` (50px, radius 12): primary accent, `.tint` (accent-soft), `.plain` (fill), `.sm` (pill 36px).
- **Segmented** `.seg` (iOS style, 36px; `.five` 44px for check-in scales). **RPE** grid 5×2, 46px cells.
- **Week strip** `.week`: 7 day cells, selected = filled circle, today = accent number, type icon, logged dot.
- **Tally** `.tally` cells 11px (hero), 8px (`.sm` rows), 26px (`.lg` celebration).
- **Focus mode** `#focus`: full-screen; figure, name, prescription, set buttons (48px), steppers (56px ±, 40px value), rest timer panel, prev / swap / next.
- **Sheets** `#sheet`: bottom sheet with grabber, swipe down or Esc to close, `role=dialog`.
- **Icons**: authored inline SVG line set `IC` in `ui.js` (24 grid, 1.8 stroke, round caps). No emoji in chrome; `clean()` strips emoji from data copy.

## Motion

One authored moment: the celebration — check mark pops, the newly earned week cell stamps in. Elsewhere only short ease-out (`--ease: cubic-bezier(.22,1,.36,1)`) sheet rise and press scale. `prefers-reduced-motion` disables all of it.

## Layout

Phone-first, max content width 600px, 16px gutters, safe-area insets respected, bottom tab bar with blur and 5 labelled icons.
