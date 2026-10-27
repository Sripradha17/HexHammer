# Hexhammer

Hexhammer is a free, open-source, browser-based classroom, with a real back end and database, where you learn to code **by hand** and prepare for FAANG-style interviews. It is built for an experienced full stack developer who wants their coding touch back, and who wants to get genuinely strong in full stack, AWS, design systems and AI integration.

## Charter summary

- **Teaching style:** like teaching ABCs. One tiny idea per lesson (a "strike"), simple words first, something visible on screen, a little fun (streaks, colors, celebrations).
- **The 5-beat loop:** Look, Type, Break, Say, Save.
- **Role split:** the AI builds the classroom but never writes lesson solutions. Lessons have starter code, tests and three hints. A full explained answer appears only on "reveal".
- **Free only:** no paid APIs, no cloud accounts. Later AI features use a local Ollama model. AWS lessons use the free plan only, with cost-trap warnings.
- **Security:** learner code runs in a browser Web Worker or a sandboxed iframe, both with a 3-second timeout. It only ever runs on the server for Level 5's real Express/HTTP strikes, and even then only in a throwaway local process that refuses every request except ones from this same computer in development (see "Three code runners" below).
- **Code style:** small, readable, heavily commented, so you can rebuild it by hand.

The full charter is in [CLAUDE.md](CLAUDE.md) (identical copies: [TUTOR_RULES.md](TUTOR_RULES.md), [.github/copilot-instructions.md](.github/copilot-instructions.md)).

## What is in the app

Hexhammer has two layers that work together:

- **The Atlas** (new): a 16-domain curriculum map with Mission Control, a World Map, a Learning Studio, labs, assessments, spaced reviews, an Interview Arena, a Project Workshop and Portfolio, a Glossary, a Technology Radar, Analytics and Settings.
- **The classic levels** (lessons unchanged): 130 hand-typing "strikes" with a Monaco editor, tests, 3 hints and a gated reveal, in five code runners (see below). Atlas topics link to these strikes for their coding exercises.

| Area | What it does | Where |
| --- | --- | --- |
| Mission Control | Next mission, reviews due, active project, latest achievement, relevant radar items, level and XP | `/` |
| World Map | 16 hexagon regions filled by real progress, unlock paths, locked/review states; also listed as a table | `/map`, `/map/:region` |
| Learning Studio | Story → mental model → lesson one section at a time → worked examples you step through → lab → exercises → assessment → project → interview → transparent mastery rules → references → "what changed" | `/topic/:id` |
| Labs (16) | Big O, bits and bytes, event loop, HTTP journey, middleware pipeline, LRU cache, message queue, SQL joins, contrast, CI pipeline, injection, logs and traces, decision boundary, embeddings, RAG, prompt-injection defence. Real computation; simulations say so. | inside topics |
| Reviews | Spaced repetition with confidence ratings; misses come back tomorrow, nothing resets | `/reviews` |
| Interview Arena | Searchable bank (143 questions). Answer in your own words before the model answer is revealed; your self-rating schedules reviews | `/interview` |
| Projects + Portfolio | Templates from topics, milestones, tasks, tests, GitHub/demo URLs (format-checked, never fetched), evidence required to complete, Markdown export | `/projects`, `/portfolio` |
| Glossary | 90 terms: plain definition, why it matters, example, where you meet it, a line to say in a meeting, linked lessons | `/glossary` |
| Tech Radar | 13 live sources + test fixtures, rule-based classification, review queue, proposals, lesson versions, audit trail | `/radar` |
| Analytics | Only real numbers: lessons, assessments, review success, mastery by region, XP per week, what needs practice, achievements, history | `/analytics` |
| Settings | Goals, path, difficulty, review intensity, motion, notifications, radar categories, theme, data export | `/settings` |

**Honest status:** the curriculum is not finished. 17 of 270 topics are fully written; the rest are outlines with objectives and linked strikes. Every written topic's interview bank is below its 15-question target. See [docs/curriculum/coverage-report.md](docs/curriculum/coverage-report.md) and [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md).

More docs: [Architecture](docs/ARCHITECTURE.md) · [Curriculum guide](docs/CURRICULUM_GUIDE.md) · [Tech Radar guide](docs/TECH_RADAR.md) · [Design references and design system](docs/design-references/README.md) · [Screenshots](docs/screenshots/README.md)

## Setup

You need Node 20+ and Docker.

```bash
cp .env.example .env         # once (Windows PowerShell: Copy-Item .env.example .env)
docker compose up -d         # starts PostgreSQL 16
npm install
npx prisma migrate dev       # creates the tables
npm run seed                 # levels, strikes, flashcards and radar sources (never touches your progress)
npm run dev                  # web on http://localhost:5173, API on http://localhost:4000
```

| Command | What it does |
| --- | --- |
| `npm test` | unit + integration tests (integration uses a throwaway `hexhammer_test` schema; skipped, and reported, if Postgres is down) |
| `npm run test:e2e` | the 20 user journeys in a real browser (own API on :4190, own `hexhammer_e2e` schema). First time: `npx playwright install chromium` |
| `npm run curriculum:check` | audits the Atlas and writes `docs/curriculum/coverage-report.md` |
| `npm run radar:validate` | fetches every radar source once and records valid/invalid (needs internet) |
| `npm run typecheck`, `npm run lint`, `npm run format` | the usual |

**Optional local AI:** install [Ollama](https://ollama.com) and run `ollama pull llama3.2`. The radar's "Ask the local model" button then works. Nothing else needs it, and no paid API is ever called.

**Backups:** Settings → "Download my data (JSON)" exports everything you have done. For a full database backup run `docker exec hexhammer-db pg_dump -U hexhammer hexhammer > backup.sql`, and restore with `docker exec -i hexhammer-db psql -U hexhammer hexhammer < backup.sql`.

## How to do a strike

1. **Look:** read the tiny example.
2. **Type:** write your code in the editor by hand. AI suggestions are switched off on purpose.
3. **Break:** make it fail on purpose, read the message, fix it.
4. Press **Run tests**. Stuck? Open hints one at a time. After 2 failed runs, "Reveal" unlocks (and asks you to confirm).
5. **Say:** write one sentence explaining the idea.
6. **Save:** your code auto-saves 1 second after you stop typing, and progress is recorded when all tests pass.

## Five code runners

Learner code is picked automatically per strike, and almost always runs in your own browser, never on the server:

- **Web Worker** (Levels 1-3, the DSA track, and ten Level 4/5 exceptions): plain JavaScript, checked with `test()`/`expect().toBe()`/`expect().toEqual()`. A 3-second timeout kills runaway loops. A handful of Level 4/5 topics (CSP/CORS, the use()/next() chain, async error pitfalls, OAuth/OIDC, OWASP Top 10, indexes/EXPLAIN, NoSQL modeling, Prisma ORM, API testing with supertest, CSRF) also use this runner — guided-local quizzes or plain-JS concept exercises pointing at this app's own real code — since none of them can be honestly demonstrated in a live-graded sandbox.
- **Sandboxed iframe** (most of Level 4): a real web page. You edit one HTML file (it can hold its own `<style>` and `<script>`), see it rendered live in "Your page" as you type, and the same `test()`/`expect()` helper runs against the real, rendered `document` when you press Run tests. The iframe has `sandbox="allow-scripts"` and nothing else: no access to this app's cookies, storage or page, no top-level navigation, no popups. The same 3-second timeout applies.
- **Local server runner** (most of Level 5): the one case where code genuinely runs on the server, because the lesson is Express itself. Your code becomes a real `buildApp()` Express app (or, for the one WebSocket strike, a real `http.Server`), and the tests make real requests against it — HTTP via `supertest`, real multipart uploads via `multer`, a real GraphQL query via the `graphql` package, or a real WebSocket connection via `ws` — in a brand-new, throwaway Node process, killed after 5 seconds either way. Hard-gated in `apps/api/src/serverRunner/serverRunnerRoute.ts`: it refuses every request unless `NODE_ENV` is not `production` AND the request physically arrived from this same computer's own loopback address. This app must never be deployed publicly with that switched on. (The Redis caching strike is a deliberate exception: it simulates a cache with a plain in-memory `Map`, since real Redis would mean a new Docker service and real network calls from every graded run, for one strike's benefit.)
- **Local SQL runner** (3 of Level 5's SQL strikes: joins, group by, transactions): your query runs for real, but against a throwaway database that only ever exists in memory (`pg-mem`), never the app's own real Postgres. Same fork-a-throwaway-process shape and the same local-only gate as the server runner (`apps/api/src/serverRunner/runSqlCode.ts`), with one extra layer of safety by construction: even a query that tries to `DROP` everything can only ever affect that one in-memory database, which disappears the moment the process is killed. (pg-mem does not implement `EXPLAIN`, so that one SQL topic stays guided-local instead.)
- **React in a sandboxed iframe** (Level 6): the same sandbox as the plain web-page runner, with React, ReactDOM and Babel standalone loaded first from a small vendor script this app builds itself (`apps/web/scripts/build-react-env.mjs`) — React 19 dropped the old ready-made browser build entirely, so there is no CDN shortcut, and this app stays fully offline either way. Your JSX runs for real, with no build step, the same classic "Babel in the browser" trick real quick-prototyping tools use. One real, non-obvious rule learned the hard way while building this: every test must `await settle()` (a short, fixed wait this runner exposes) before reading the DOM, since React's render does not commit synchronously inside this setup and there is no better signal available.

## Rebuild Lab

At the end of each level, delete one piece of this app and rebuild it by hand from memory. Then compare with the original (`git diff` or `git restore`).

| Level | Piece to rebuild                                                      |
| ----- | --------------------------------------------------------------------- |
| 1     | `nextBox` in `apps/api/src/spacedRepetition.ts`                       |
| 2     | Array helpers (map, filter, reduce)                                   |
| 5     | Validation and error-handling middleware in `apps/api/src/middleware` |
| 6     | `Button` and `Card` in `packages/design-system`                       |

The other levels' pieces are listed in `packages/content/curriculum.json`. Good Atlas pieces to rebuild by hand: `nextReview` and `masteryChecklist` in `apps/api/src/atlas/rules.ts`, `parseFeed` in `apps/api/src/radar/feed.ts`, and the LRU cache in `apps/web/src/labs/CacheLab.tsx`.

## Project layout

```
apps/web               Vite + React + TypeScript: shell, Atlas pages, labs, classic strike pages, code runners
apps/api               Express + TypeScript + Prisma: progress, projects, radar + scheduler, local-only runners
packages/content       classic strikes (levels/tracks) and the 16-domain Atlas (atlas/) with its audit
packages/design-system "Forge Atlas" tokens and accessible components
e2e/                   Playwright user journeys
docs/                  architecture, curriculum and radar guides, design references, screenshots, roadmap
```

## API notes

Classic routes: levels, strikes, flashcards, streak, and `GET /strikes/:id/solution` (only after 2 failed runs, so solutions never reach the browser early). New routes live under `/atlas/*`, `/projects/*` and `/radar/*`; see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Atlas answers (checks, assessments, model answers) are likewise only returned after you answer.

## Safety

This app has no login. It is for **one local user**. Do not deploy it publicly: it includes local-only code runners, and its API has no authentication. While the API runs, the Tech Radar fetches public web pages and APIs (set `RADAR_SCHEDULER=off` in `.env` to stop that). Everything it downloads is stored as plain text and never executed.

## License

MIT, see [LICENSE](LICENSE).
