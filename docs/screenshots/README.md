# Screenshots of Hexhammer itself

These are screenshots of **this app**. Inspiration screenshots of other websites live separately, in [`../design-references/screenshots/`](../design-references/screenshots/).

| Folder | What | How it was made |
| --- | --- | --- |
| `before/` | The app before the Forge Atlas rebuild (26 Oct 2026) | `node scripts/capture-app.mjs before / /level/1 /strike/l1-s01 /interview` |
| `after/` | After the rebuild: desktop, mobile and dark theme of key screens | `node scripts/capture-app.mjs after / /map ...`, plus dark-theme captures |
| `e2e/` | Captured automatically by the end-to-end journeys (desktop 1440×900 and phone 390×844, 8 pages) | `npm run test:e2e` |

Data in these screenshots is real for that moment: a new learner with 0 XP in `before/` and `after/`, and the e2e test learner in `e2e/`. Radar items in `after/` are real GitHub security advisories fetched by the scheduler on 27 Oct 2026.
