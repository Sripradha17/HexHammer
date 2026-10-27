# Hexhammer design system: "Forge Atlas"

Source of truth: [`packages/design-system/src/tokens.css`](../../packages/design-system/src/tokens.css) (tokens) and [`components.css`](../../packages/design-system/src/components.css) (components). This page explains the decisions behind them.

## Brand identity

**Hexhammer** brings together the forge (the hammer: you build skills by hand, strike by strike) and the hexagon (the map tile: knowledge is a territory you explore and fill in).

- **Mark:** an ember hexagon with an "H".
- **Voice:**
  - plain words first, professional term second;
  - encouraging and never shaming;
  - honest about what is real, simulated or unfinished.
- **Theme names:** *Night forge* (dark) and *Daylight workshop* (light).

## Colour tokens

Three layers: primitives (`--p-*`), then semantic tokens (`--hh-*`, the only ones components may use), then component knobs.

| Role | Light | Dark | Used for |
| --- | --- | --- | --- |
| `--hh-bg` | `#f7f4ec` paper | `#0b0d12` ink | page |
| `--hh-surface` | `#ffffff` | `#151923` | raised panels |
| `--hh-surface-2` | `#efeadd` | `#10131a` | sunken wells, inputs, tracks |
| `--hh-text` | `#16181d` | `#f2f4f8` | body text |
| `--hh-text-muted` | `#5a5f6b` | `#a6aebe` | secondary text (≥ 4.5:1 on its surfaces) |
| `--hh-action` + `--hh-action-ink` | `#ffb547` + `#2a1600` | same | the ONE next action; "you are here" |
| `--hh-ember-text` | `#9a5200` | `#ffb547` | ember-coloured text that still passes contrast |
| `--hh-review` | `#5b3fc4` | `#c7b4ff` | "review due" (calm violet, never alarm red) |
| `--hh-success` / `--hh-danger` | green / red | lighter tints | status, always paired with a word or icon |
| `--hh-focus` | `#1f6feb` | `#8be0f5` | focus rings (3px) |
| `--hh-code-bg` | `#11141b` | same | code is always on a dark well |

**Region hues:** each of the 16 domains has a `hue` (0–360) in its content file. Set `style="--hue: N"` and CSS derives `--hh-region` (stroke and text), `--hh-region-fill` and `--hh-region-glow`, with lightness tuned separately per theme. Hue is identity only. The meaning is always also in text: "Locked", "3 of 21 assessed".

**Classic level colours:** `--hh-level-1..8` keep the eight original levels recognisable on the classic pages.

**Charts:** a single-series chart uses one hue (`--hh-chart-bar`). It is darker in light mode, so bars keep 3:1 contrast against white, and has no legend, a hover tooltip and a table view (per the dataviz method).

## Typography

| Token | Font | Use |
| --- | --- | --- |
| `--hh-font-display` | Bricolage Grotesque Variable | headlines: expressive, slightly condensed, technical |
| `--hh-font-body` | Inter Variable | reading text |
| `--hh-font-mono` | JetBrains Mono (no ligatures) | code, eyebrows, numbers |

All three are bundled with Fontsource, so the app works offline. Display sizes are fluid `clamp()` values (`--hh-text-display`, `--hh-text-2xl`) that shrink smoothly on phones. Reading width is capped at `--hh-measure: 68ch`. Code ligatures are disabled on purpose: a learner typing `=>` must see `=>`.

## Spacing, layout and shape

- **Spacing:** a 4px base, `--hh-space-1` (4) to `--hh-space-8` (72).
- **Layout:**
  - a rail (232px) plus fluid content, at most 1240px wide, at ≥1024px;
  - below that, a single column with a floating dock;
  - grids use `minmax(0, 1fr)` where long code may appear, so nothing scrolls sideways.
- **Radii:** 8 / 14 / 22 / pill.
- **Depth:** three shadow steps (`--hh-shadow-1..3`); dark mode uses deeper, softer shadows plus hairline borders.

## Motion

| Token | Value | Typical use |
| --- | --- | --- |
| `--hh-speed-fast` | 120ms | hover, press |
| `--hh-speed` | 200ms | state changes |
| `--hh-speed-slow` | 420ms | page enter, achievement pop |
| `--hh-ease` / `--hh-ease-spring` | cubic-béziers | calm / playful |

Rules:
1. Motion explains a change: a section appears, a medal is earned, a bar grows.
2. Nothing moves on its own while the learner reads.
3. Every duration becomes 0ms under the OS reduced-motion setting, or `data-motion="reduce"` from Settings. Settings can also force full motion.

## Interaction patterns

- **One primary button per screen** (ember). Secondary is an outline; ghost is text-like; danger is red.
- **Answer first, then reveal:** every question hides its answer until the learner commits. The server enforces this; answers are never in the browser bundle.
- **Optimistic toggles:** a checkbox moves immediately, then rolls back with a message if saving fails.
- **Confirm destructive actions** with `ConfirmDialog`; focus starts on Cancel.
- **Keyboard first:** a skip link, focus moved to `<main>` on every route change, visible 3px focus rings, and up/down reorder buttons instead of drag-and-drop.

## Components

| Component | Variants / props | Accessibility built in |
| --- | --- | --- |
| `Button` | primary, secondary, ghost, danger; small; `level` tint | real `<button type="button">`, focus ring |
| `Card` | `level` top edge, `locked`, `postit` | section with heading |
| `Badge` | accent, soft, success, danger, review, ember | text always present |
| `ProgressBar` | `percent`, `label`, `name` | `role=progressbar` with an accessible name and value text |
| `Field` | label, hint, error | ids wired: `aria-describedby`, `aria-invalid`, error `role=alert` |
| `Chip` | `pressed` | `aria-pressed` toggle |
| `EmptyState` | title, body, action | always says why it is empty and what to do |
| `ConfirmDialog` | danger | native modal dialog, inert background, Escape, safe default focus |
| `Hex` | `fill`, `locked`, `review`, `hue` | decorative (`aria-hidden`); values are also shown as text |

## Iconography and illustrations

Glyphs are typographic (◎ ⬡ ↻ ✎ ⚒), so they inherit colour, scale with text, and cost nothing to load. The hexagon is the only recurring shape, and it always carries data: the map tiles, topic progress and achievement medals. The old mascot images remain on the classic level pages. The new Atlas screens use diagrams and labs that teach rather than decorate.

## Accessibility checklist (verified by automated tests)

- `e2e/journeys.spec.ts` runs axe (WCAG 2 A/AA) on 8 key pages and fails on any serious or critical violation. It currently passes.
- The same test checks that no page scrolls sideways at 390px wide.
- Keyboard journey: skip link, then Tab to a map hexagon, then Enter opens the region (tested).
- Colour is never the only signal: statuses, classifications and goal checks all carry words.
