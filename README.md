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

## What is in Phase 1

- Level Map with 8 level cards (Level 1 open, 2-8 and three tracks shown as "coming soon"), % complete and a daily streak
- 130 strikes (10 in Level 1, 16 in Level 2, 22 in Level 3, 14 in the DSA track, 17 in Level 4, all 37 in Level 5, all 9 in the Professional Skills track, 5 in Level 6 so far) with a Monaco editor, auto-save, tests, 3 hints and a gated "reveal"
- Level 4 runs in a sandboxed iframe so you see your actual web page live as you type; Level 5 is content-complete and runs real Express code (including real WebSockets, file uploads and GraphQL), and real SQL against a throwaway in-memory database; Level 6 runs real React (see "Five code runners" below)
- Interview page with a level switcher: Say-It flashcards (spaced repetition), one Solve-It problem and a STAR prompt, for Levels 1 through 5
- Design system (tokens + Button, Card, Badge, ProgressBar)

## Setup

You need Node 20+ and Docker.

```bash
cp .env.example .env         # once (Windows PowerShell: Copy-Item .env.example .env)
docker compose up -d         # starts PostgreSQL 16
npm install
npx prisma migrate dev       # creates the tables
npm run seed                 # loads levels, strikes and flashcards
npm run dev                  # web on http://localhost:5173, API on http://localhost:4000
```

Other commands: `npm test`, `npm run typecheck`, `npm run lint`, `npm run format`.

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

The other levels' pieces are listed in `packages/content/curriculum.json`.

## Project layout

```
apps/web               Vite + React + TypeScript (Monaco editor, code runner in a Web Worker)
apps/api               Express + TypeScript + Prisma (schema, migration, seed)
packages/content       curriculum.json and the Level 1 lessons
packages/design-system tokens and the four plain components
docs/ROADMAP.md        phases and runner types
```

## API notes

The nine routes from the brief, plus one extra: `GET /strikes/:id/solution`. It returns the solution only after 2 failed runs, so solutions never travel to the browser early. `Progress.attempts` counts failed runs.

## Safety

This app has no login. It is for **one local user**. Do not deploy it publicly.

## License

MIT, see [LICENSE](LICENSE).
