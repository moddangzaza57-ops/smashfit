---
version: 1
slug: "src-shell-html"
primary_target: "src/shell.html"
related_targets: ["src/app.js"]
---

# Smash Fit app shell (all tabs)

Scope: whole PWA UI (src/shell.html CSS, src/app.js views). Mode: Operate. Phone-first (iPhone Safari, home-screen PWA), 390x844 primary.
Task: open app, see today's session, train set by set with a dumbbell in one hand, log, rest, finish. Secondary: plan week, library, progress, settings.
Constraints: Thai UI, localStorage `smashfit.v1` untouched, Friday game day locked, no copyrighted media, programming logic unchanged.
User pins (quoted): "สะอาด สงบ แบบแอป Apple"; signature chosen: "สมุดบันทึกโค้ช".
New in this build: focus mode, first-run onboarding, streak heatmap + celebration, term tips (ⓘ).

## Direction contract

THESIS: Today is one logbook page, not a stack of forms. Refuses the category default of a dark card stack with neon accent and every control visible at once.

OWN-WORLD: iOS grouped-list calm. Light: #f2f2f7 ground, white grouped cells, hairline separators; dark: true black ground, #1c1c1e cells. System type (-apple-system / SF + Noto Sans Thai fallback), large title 34px, tabular numerals. One action colour (court green, iOS-tuned) only on things you can press or that are done; state colours amber (caution) and red (pain/high) only where they mean something. SF-style line icons drawn as inline SVG, no emoji in chrome.

STORY: The user sees what today is, how long it takes, and how far they are, presses Start, does one exercise at a time with big numbers, and ends with the logbook page full.

FIRST VIEWPORT: Large title date + session name; week strip of 7 day cells; hero cell with session name, minutes, set-cell grid (the logbook tally: one small square per set, filled = done), primary "เริ่มฝึก" button full width; compact readiness row (3 one-tap segments) and pain chip below. Tab bar at bottom with 5 labelled line icons.

FORM: Coach's training logbook tally — every set a fixed cell that fills when done and never disappears. List position 7 of 7. seed:e0bdc50cb7621b2e
Raises: from ticket wallet — done states stay visible, nothing disappears, it is marked. From warm consumer app — the accent colour appears only on pressable or completed things.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
