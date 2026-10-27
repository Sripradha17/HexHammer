# Reference catalog

All captures: 26 October 2026, headless Chromium 131 via Playwright 1.49.1, 1440x900 viewport.
Exact timestamps and HTTP statuses are in [`analysis/capture-log.json`](analysis/capture-log.json).

Legend for "Helps": **MC** Mission Control, **MAP** World Map, **ST** Learning Studio,
**PW** Project Workshop / Portfolio, **IA** Interview Arena, **GL** Glossary, **RD** Tech Radar,
**AN** Analytics, **SET** Settings.

---

## 11 · Awwwards: "Nominees" section (cinematic)

- **File:** `screenshots/11-awwwards-scrolled.png`
- **Source:** https://www.awwwards.com/ (scrolled 1400px)
- **Section:** the "Latest / NOMINEES" section header, the first two nominee previews, the floating pill navigation dock.
- **Visually effective:** a single enormous heavy word ("NOMINEES") above a quiet one-line explanation. One idea per screen. A tiny eyebrow label ("Latest") sets context. Big image tiles that bleed nearly edge to edge. A **floating dark pill dock** at the bottom holds all the main navigation, so the page itself stays clean.
- **Adapt:** the giant-headline-plus-one-sentence rhythm for **Mission Control's** "next mission" hero. The floating dock for **mobile navigation**.
- **Do not copy:** the all-caps 140px headline everywhere (exhausting in a learning app you read for an hour); image-heavy tiles (our content is concepts, not photos); the cookie banner layering on top of the dock.
- **Helps:** MC, mobile nav.
- **A11y / perf:** a giant headline must still be a real `<h1>` and wrap gracefully at 390px. A fixed dock must not cover focused elements (add bottom padding equal to its height).

## 02 · recent.design (reached through godly.website)

- **File:** `screenshots/02-recent-design-via-godly-redirect.png`
- **Source:** https://godly.website/ → redirected to https://recent.design/?ref=godly
- **Section:** left sidebar navigation, filter chips row, masonry of mixed-size tiles.
- **Visually effective:** filter **chips** (All / Web / Interface / Branding...) with one solid "on" chip; a **masonry** of tiles of different heights, which avoids the "grid of identical cards" look; quiet grey sidebar labels with a dot marking the current section.
- **Adapt:** the chip row for **Portfolio, Glossary and Interview Arena** filters. The "current item has a dot" sidebar marker for our rail.
- **Do not copy:** the infinite visual feed (we want focus, not browsing); sponsored slots.
- **Helps:** PW, GL, IA.
- **A11y / perf:** chips must be real toggle buttons with `aria-pressed`. A masonry must keep a sensible DOM/reading order.

## 12 · Godly: Website design inspiration

- **File:** `screenshots/12-godly-design-sites.png`
- **Source:** https://godly.design/sites/
- **Section:** icon + label sidebar, large page title with a muted two-line description, three-column preview cards with a logo + name footer.
- **Visually effective:** a calm sidebar with a soft filled "current" pill; a title + muted description pair that explains the page in one breath.
- **Adapt:** the sidebar pattern (icon + label, filled pill for the current page) for our **desktop navigation rail**; the "title + one muted sentence" header for every page.
- **Do not copy:** the identical three-column card grid: exactly what the brief asks us to avoid.
- **Helps:** shell, all pages.
- **A11y / perf:** the current page needs `aria-current="page"`, not just a color.

## 03 · Refero: research home (product interface)

- **File:** `screenshots/03-refero-home.png`
- **Source:** https://refero.design/
- **Section:** serif display headline, a large "ask a question" input card with mode chips, tabbed suggestion lists with arrow glyphs.
- **Visually effective:** the **command input as the hero**: the most important action is a big, friendly field; tabbed "Popular / Inspiration / Onboarding" suggestions underneath give a starting point for an empty state.
- **Adapt:** the **Glossary and Interview Arena search** as a big hero field with suggestion tabs underneath ("Try: idempotency, CORS, event loop").
- **Do not copy:** the promotional MCP pop-up card covering the sidebar; the serif display face (we chose a grotesque to match a technical subject).
- **Helps:** GL, IA, empty states.
- **A11y / perf:** a search field needs a visible `<label>` (can be visually small) and results announced with `aria-live="polite"`.

## 04 · Mobbin: landing hero (product library)

- **File:** `screenshots/04-mobbin-home.png`
- **Source:** https://mobbin.com/
- **Section:** marketing hero only. Mobbin's real product flows (onboarding, settings, empty states) require an account; we did not log in.
- **Visually effective:** inline app icons inside the headline as **visual punctuation**; one primary (dark, filled) and one secondary (soft, with arrow) call to action, side by side.
- **Adapt:** the **primary + soft secondary button pair** ("Resume mission" / "Open the map →"). Inline glyphs inside sentences, used sparingly in our domain names (a small hex chip in the domain's color).
- **Do not copy:** third-party brand logos; the "number of screens" marketing claim style. We never show a metric that is not real.
- **Helps:** MC, buttons.
- **Limitation:** onboarding / settings / empty-state flows could not be inspected without login.

## 05 · Hoverstat.es (experimental)

- **File:** `screenshots/05-hoverstates-home.png`
- **Source:** https://www.hoverstat.es/
- **Section:** pill-shaped top navigation, a featured site inside a fake browser frame, a centered date + URL + one-paragraph description under it.
- **Visually effective:** **framing a live thing inside a browser chrome** makes it instantly read as "a web page". The featured site uses a blurred-to-sharp type effect that rewards interaction.
- **Adapt:** a browser-chrome frame around our **sandboxed live previews** (Level 4/6 iframes) and around the **HTTP lab** ("this is what the browser sees"). The "interaction brings things into focus" idea, used **only** in labs where focus means something (e.g., the RAG lab sharpens the retrieved chunks).
- **Do not copy:** the blurred typography for body text (unreadable); experimental effects on navigation.
- **Helps:** ST (live preview), labs.
- **A11y / perf:** anything blurred must have a sharp, readable equivalent, and reduced motion must skip the transition.

## 06 · Siteinspire (editorial layout)

- **File:** `screenshots/06-siteinspire-home.png`
- **Source:** https://www.siteinspire.com/
- **Section:** header with search, a two-column "intro sentence + category cloud" band, big preview tiles with a quiet caption ("David McGillivray · 11 days ago").
- **Visually effective:** **asymmetric two-column band**: a short statement on the left, a dense set of links on the right; generous white space; captions in two weights (name dark, date muted).
- **Adapt:** the asymmetric band for each **World Map domain page** (domain story left, module list right). The two-weight caption for **Radar items** (title dark, "discovered 3 days ago · published 12 Oct" muted).
- **Do not copy:** the category cloud as primary navigation (hard to scan for learners).
- **Helps:** MAP (domain view), RD.
- **A11y / perf:** muted caption grey must still pass 4.5:1.

## 07 · Motion for React: Get started (animation engineering)

- **File:** `screenshots/07-motion-react-docs.png`
- **Source:** https://motion.dev/docs/react
- **Section:** docs layout: letter-spaced mono section labels ("ANIMATIONS", "GESTURES"), a mono breadcrumb ("DOCS / REACT"), an "On this page" outline, big bold page title.
- **Visually effective:** **uppercase, letter-spaced monospace micro-labels** give a precise, engineered feel without decoration; a separate "on this page" outline makes long pages navigable.
- **Content read:** the page states that Motion runs animations through the Web Animations API and ScrollTimeline where possible, falling back to JavaScript for springs, interruptible keyframes and gestures.
- **Adapt:** mono micro-labels as our **eyebrow style** everywhere ("MISSION 07 · FRONTEND"); an "On this page" outline in the **Learning Studio** for long topics.
- **Decision:** we **did not add the Motion library**. Every animation we need (page enter, hex state change, packet travel in labs, celebration) is a CSS transition/keyframe or a few lines of `requestAnimationFrame` in a lab. That keeps the code small and rebuildable by hand (charter rule). Revisit if we ever need shared-layout or gesture physics.
- **Helps:** ST, typography.

## 08 · shadcn/ui: Components index (accessible components)

- **File:** `screenshots/08-shadcn-components.png`
- **Source:** https://ui.shadcn.com/docs/components
- **Section:** the full component list (Accordion, Alert Dialog, Badge, Breadcrumb, Combobox, Dialog, Empty, Field, ...).
- **Visually effective:** a plain alphabetical index is the fastest way to find a component; notably the list includes **"Empty"** and **"Field"** as first-class components.
- **Adapt:** we made **EmptyState** and **Field** first-class components in our design system too, instead of writing empty states and form rows ad hoc on each page.
- **Do not copy:** the components themselves. Our stack is plain React + CSS (no Tailwind, no Radix), and the charter wants small, hand-rebuildable code. We copy **behaviors**, not code.
- **Helps:** design system.

## 09 · shadcn/ui: Dialog (component states)

- **File:** `screenshots/09-shadcn-dialog.png`
- **Source:** https://ui.shadcn.com/docs/components/dialog (redirected to `/docs/components/base/dialog`)
- **Section:** the Dialog demo, its one-line definition ("A window overlaid on ... rendering the content underneath inert") and the Base UI / React Aria / Radix tabs.
- **Visually effective:** the definition itself is the key lesson: **content underneath becomes inert**.
- **Adapt:** our `ConfirmDialog` uses the native `<dialog>` element with `showModal()`, which gives inert background, focus trapping and Escape-to-close for free, in a few lines. Used for "delete project?" and "approve this curriculum change?".
- **Helps:** PW (delete confirmation), RD (approve).
- **A11y:** focus goes into the dialog on open and returns to the trigger on close; the destructive button is not the default focus.

## 10 · React Three Fiber: Introduction (optional 3D)

- **File:** `screenshots/10-r3f-docs.png`
- **Source:** https://r3f.docs.pmnd.rs/getting-started/introduction
- **Section:** docs intro, the "Note" callout (states v10 is in alpha with WebGPU), install tabs.
- **Visually effective:** a **solid colored callout** for important notes stands out without an icon zoo; the lime "current section" pill in the sidebar.
- **Decision:** **no 3D**. The World Map is a hex grid; it reads better and is fully keyboard/screen-reader accessible as SVG + buttons. WebGL would add GPU cost, a large dependency and an accessibility problem for no learning gain. Recorded so we do not revisit it without a real reason (e.g., a future "3D network topology" lab).
- **Adapt:** the solid callout for **cost-trap / security warnings** in AWS and security topics.
- **Helps:** ST callouts.
