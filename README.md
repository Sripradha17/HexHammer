# Hexhammer

Hexhammer is a free, open-source, browser-based classroom, with a real back end and database, where you learn to code **by hand** and prepare for FAANG-style interviews. It is built for an experienced full stack developer who wants their coding touch back, and who wants to get genuinely strong in full stack, AWS, design systems and AI integration.

## Charter summary

- **Teaching style:** like teaching ABCs. One tiny idea per lesson (a "strike"), simple words first, something visible on screen, a little fun (streaks, colors, celebrations).
- **The 5-beat loop:** Look, Type, Break, Say, Save.
- **Role split:** the AI builds the classroom but never writes lesson solutions. Lessons have starter code, tests and three hints. A full explained answer appears only on "reveal".
- **Free only:** no paid APIs, no cloud accounts. Later AI features use a local Ollama model. AWS lessons use the free plan only, with cost-trap warnings.
- **Security:** learner code runs only in a browser Web Worker with a 3-second timeout. Never on the server.
- **Code style:** small, readable, heavily commented, so you can rebuild it by hand.

The full charter is in [CLAUDE.md](CLAUDE.md) (identical copies: [TUTOR_RULES.md](TUTOR_RULES.md), [.github/copilot-instructions.md](.github/copilot-instructions.md)).

## What is in Phase 1

- Level Map with 8 level cards (Level 1 open, 2-8 and three tracks shown as "coming soon"), % complete and a daily streak
- 62 strikes (10 in Level 1, 16 in Level 2, 22 in Level 3, 14 in the DSA track) with a Monaco editor, auto-save, tests, 3 hints and a gated "reveal"
- Interview page with a level switcher: Say-It flashcards (spaced repetition), one Solve-It problem and a STAR prompt for Levels 1 and 2
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
