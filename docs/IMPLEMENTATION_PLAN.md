# Implementation plan and status: "Forge Atlas" rebuild (Oct 2026)

## Decisions taken with the learner before starting

1. **The charter wins** where the master prompt conflicted with `CLAUDE.md`:
   - the name stays Hexhammer;
   - exercises never ship solutions;
   - model answers appear only after you answer;
   - free only, with AI through local Ollama.
2. **Platform foundation first.** All features exist and work end to end; the content is filled in domain by domain afterwards.
3. Existing work was committed by the learner (`7008383`) before the rebuild started, on branch `odyssey-rebuild`.

## Phase 1: discovery (what existed)

- Monorepo: React 19 + Vite web app, Express 5 + Prisma + PostgreSQL API, a content package, a small design system.
- 130 classic strikes across Levels 1–6, DSA and Professional, with five code runners (worker, iframe, React iframe, local Express, local SQL).
- A level map, a strike page and an interview flashcard page.
- Before changes, everything passed: typecheck, lint, 61 web tests, 30 API tests.
- Learner data at the start: 3 streak days and 51 flashcards; no strike progress. A data-only `pg_dump` was taken before any migration.

## Phase status

| Phase | Status | Evidence |
| --- | --- | --- |
| 1 Discovery | Done | this file |
| 2 Visual research | Done, with limits | 11 real captures, catalog, analysis, design system, implementation map (`docs/design-references/`). Awwwards home timed out; Mobbin and Refero product flows need a login (recorded). |
| 3 App foundation | Done | new tokens and components, rail + dock shell, 18 routes, 404, skip link, focus management |
| 4 Curriculum engine | Done | schema (`atlas/types.ts`), audit (`validate.ts`, 12 tests), coverage report, versions in the DB |
| 5 Learning Studio | Done | full topic flow, checks, assessments, mastery, reviews; 16 labs (23 logic tests) |
| 6 Portfolio and gamification | Done | projects + milestones + export, XP log with no double rewards, levels, 14 achievements |
| 7 Technology Radar | Done | 6 connector kinds, 13 validated live sources, fixtures, dedupe, rule classifier, review queue, proposals, versions, audit, scheduler |
| 8 Curriculum expansion | **Partial** | 16 domains, 270 topics, but only 17 complete; 143 interview questions (target 15 per topic); 90 glossary terms |
| 9 Quality | Done for this pass | lint, typecheck, unit + integration + e2e green; axe clean (serious/critical) on 8 pages; no phone overflow; main bundle cut from 3.8 MB to 430 KB; fixed a pre-existing Monaco worker error on the Level 4 HTML editor |
| 10 Documentation | Done | README, ARCHITECTURE, CURRICULUM_GUIDE, TECH_RADAR, design references, screenshots |

## Verified user journeys (all 20, `e2e/journeys.spec.ts`, real browser)

1. launch;
2. navigate to a domain;
3. read a lesson;
4. an interactive exercise (wrong answer first, then retry);
5. submit an assessment;
6. review the explanations;
7. reload: progress persists;
8. add a project with a GitHub URL (invalid URL rejected first);
9. edit it;
10. see it in the portfolio;
11. complete a milestone (XP once) and earn the Builder achievement;
12. a review mission;
13. an interview question (model answer hidden until answered);
14. discover updates from a fixture source;
15. deduplicate on re-check;
16. create a proposal (approval blocked until human-written parts exist);
17. approve: version 2 appears under "What changed";
18. earlier progress intact;
19. keyboard: skip link, then focus a map hex, then Enter;
20. desktop and phone layouts on 8 pages, screenshots, axe and overflow checks.

API-level versions of journeys 3–18 also run against a real database in `apps/api/src/atlas/journeys.integration.test.ts`.

## Not verified / known limits

- **Tested only in Chromium.** Firefox and Safari were not run.
- **Screen readers:** structure and ARIA are checked automatically (axe) and by keyboard tests. No manual screen-reader session was done.
- **Ollama analysis:** the code path exists. It was **not** run, because Ollama is not installed here; without it the app returns a clear 503.
- **Page-watch sources** can only detect "text changed". Their "valid" status proves the page loaded, not that its content is meaningful.
- **Scheduler** runs only while the API runs (by design: local only).
- **Labs** are honest teaching tools, not production simulators. Several say so explicitly: the toy embedding, the simulated fully-fooled model, example HTTP timings.

## Backlog (in priority order)

1. Raise every complete topic's interview bank to 15 or more questions.
2. Write full topics for outlines that already have strikes (about 70 topics). Start with `cs-functions-scope`, `cs-values-types`, `fe-react-components-state`, `fe-react-effects-hooks`, `be-authn-authz`, `db-transactions`, `cs-git`.
3. One complete topic in Domain 16 (Advanced Paths).
4. The rest of the outline topics, domain by domain (the full list is in `docs/curriculum/coverage-report.md`).
5. Labs listed in the brief but not built yet:
   - variable/memory visualiser;
   - DOM rendering explorer;
   - API request builder;
   - authentication flow simulator;
   - database relationship explorer;
   - system architecture builder;
   - Docker image explorer;
   - neural network visualiser;
   - tool-calling trace viewer;
   - incident-response simulator;
   - a standalone sorting visualiser (the `sorting` visualisation currently reuses the Big O lab).
6. A mobile header with the level badge (on phones it is currently only on the Analytics page).
7. Cross-browser e2e (Firefox, WebKit) and a manual screen-reader pass.
