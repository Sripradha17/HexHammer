# Design references

This folder records the visual research behind Hexhammer's "Forge Atlas" redesign (October 2026).
It holds **inspiration** captured from other websites. Screenshots of Hexhammer itself live
in [`docs/screenshots/`](../screenshots/), so the two are never mixed up.

| File | What it holds |
| --- | --- |
| [reference-catalog.md](reference-catalog.md) | Every reference: URL, capture date, what we saw, what to adapt, what NOT to copy |
| [design-analysis.md](design-analysis.md) | The patterns across the references, and what they mean for a learning app |
| [design-system.md](design-system.md) | Hexhammer's own design system: tokens, type, motion, components, accessibility |
| [implementation-map.md](implementation-map.md) | Which idea went into which screen, file and token |
| `screenshots/` | Real captures, made by `node scripts/capture-references.mjs` (Playwright, 1440x900) |
| `analysis/capture-log.json` | The raw log of every capture attempt: final URL, HTTP status, page title, errors |

## How the screenshots were made

1. `npm install` (Playwright is a dev dependency) and `npx playwright install chromium` once.
2. `node scripts/capture-references.mjs` captures everything, or
   `node scripts/capture-references.mjs awwwards` re-captures only the files whose name matches.
3. The script writes `analysis/capture-log.json`. The catalog was written from that log and
   from looking at each image, never from memory.

## Limitations, honestly recorded

- **Awwwards home (`01-awwwards-home.png`) was not captured.** Two first-load attempts timed out
  after 30 seconds. A second navigation in the same browser session succeeded, so we have the
  scrolled "Nominees" section instead (`11-awwwards-scrolled.png`).
- **godly.website** now redirects to **recent.design**, so `02-recent-design-via-godly-redirect.png`
  shows recent.design. The brief's address, `godly.design/sites/`, was captured separately as
  `12-godly-design-sites.png`.
- **Mobbin and Refero** show only public marketing/landing pages; their real product-flow
  libraries need a login. We did **not** log in or bypass anything. For product patterns we
  relied on what is public (Refero's research-mode UI, the shadcn/ui docs, the Motion docs).
- Cookie banners are visible in some captures. They were left in, because removing them would
  mean editing the evidence.
- Captures are single viewport frames. They do not show motion. Motion notes come from reading
  the Motion documentation pages, not from recordings.
