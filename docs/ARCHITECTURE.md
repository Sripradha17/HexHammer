# Architecture

Hexhammer is a local-first monorepo. Everything runs on your computer with Docker and npm: no accounts, no paid services, no cloud.

```
apps/web               React 19 + Vite + TypeScript: the classroom UI (no curriculum answers bundled)
apps/api               Express 5 + Prisma + PostgreSQL: progress, projects, radar, scheduler
packages/content       curriculum: classic strikes (levels/tracks) + the 16-domain Atlas
packages/design-system tokens + small accessible components ("Forge Atlas")
e2e/                   Playwright journeys (own API + own throwaway DB schema)
scripts/               screenshot tools (reference sites, app screens)
docs/                  architecture, curriculum, radar, design references, screenshots
```

## Data flow

```
Browser (React)  ──/api──▶  Vite dev proxy  ──▶  Express API  ──▶  PostgreSQL (Docker volume)
     │                                               │
     │  learner code runs ONLY here:                 ├─ @hexhammer/content (curriculum in code,
     │  Web Worker / sandboxed iframe                │   imported server-side; answers stay here)
     │                                               ├─ Radar scheduler (in-process, every 15 min)
     │                                               └─ Level 5 local-only runners (loopback + dev only)
```

### Why the curriculum lives in code, not the database

Lessons are reviewed like code: diffs, the validator, tests and version control. The database only stores what the learner does: progress, attempts, reviews, projects, XP, and radar findings and decisions.

Curriculum changes approved through the Tech Radar are stored as `TopicVersion` rows that *add* a "What changed" section to a lesson. They never rewrite the lesson's code, and they never touch progress.

### Answers never leave the server early

`apps/api/src/atlas/sanitize.ts` strips `answerIndex`, explanations and model answers from every topic before it is sent. They are returned only by the routes that check *my* answer:
- `POST /atlas/questions/:id/check`
- `POST /atlas/topics/:id/assessment`
- `POST /atlas/interview/questions/:id/answer`, which requires a real attempt of at least 20 characters

The web app imports only *types* from `@hexhammer/content`. Strike solutions keep their original gate (two failed runs, or passing).

## Back end modules (`apps/api/src`)

| Module | Responsibility |
| --- | --- |
| `routes.ts` | classic levels, strikes (now also pays XP and updates linked Atlas topics), flashcards, streak |
| `atlas/rules.ts` | **pure** rules: XP values, levels, mastery checklist, topic status, unlocking, spaced repetition, scoring |
| `atlas/service.ts` | DB helpers: `awardXp` (unique key, so no double rewards), activity log, audit log, evidence loader |
| `atlas/achievements.ts` | achievement rules over real counts; unlocked once, never revoked |
| `atlas/atlasRoutes.ts` | map, mission control, topics, checks, labs, assessments, reviews, interview arena, glossary, analytics, preferences, export |
| `projects/*` | project CRUD, milestones, templates from topics, Markdown portfolio export; hand-written validation |
| `radar/*` | connectors, feed parser, normalisation, rule classifier, ingest + dedupe, scheduler, missions, optional Ollama |
| `serverRunner/*` | Level 5 real Express/SQL runners: **local-only**, never deploy publicly |

## Database (Prisma, `apps/api/prisma/schema.prisma`)

The original tables (`Level`, `Strike`, `Progress`, `SayNote`, `InterviewCard`, `StreakDay`) are unchanged. Migration `forge_atlas` only **adds** tables:

| Area | Tables |
| --- | --- |
| Preferences | `Preference` (single row) |
| Learning | `TopicProgress` (keyed by topic id only, so content versions can never reset it), `AssessmentAttempt`, `QuestionAttempt`, `ReviewItem`, `ReviewLog`, `ActivityLog` |
| Game | `XpEvent` (unique `key`), `Achievement` |
| Projects | `Project`, `ProjectMilestone` |
| Radar | `TechSource`, `TechUpdate` (unique `canonicalUrl`, indexed `titleKey`), `RadarRun`, `CurriculumProposal`, `TopicVersion`, `AuditLog` |

## Rules worth knowing

- **XP is a log, not a counter.** Each reward has a unique key (`assessment-pass:cs-big-o`, `milestone:12`, `review:7:2026-10-27`), so repeating an action never pays twice. Deleting a project keeps its XP, because the work was real.
- **Mastery = evidence.** Every line must be met:
  1. read every section;
  2. complete N exercises;
  3. score ≥ X% on the assessment;
  4. pass N spaced reviews;
  5. (optionally) complete the project.

  Reading alone stops at "In progress".
- **Mistakes never punish.** A wrong answer explains and allows a retry. A missed review steps back one gap and returns tomorrow; it never resets to zero. Streaks are shown, but a missed day removes nothing.
- **Soft locks.** Unmet prerequisites show a topic as "locked", but you can still study it, unless Settings → *Strict unlocking* is on.

## Security

| Concern | How it is handled |
| --- | --- |
| Learner code | Runs in a Web Worker or a sandboxed iframe (`allow-scripts` only) with a 3s timeout. Level 5 server/SQL runners are local-only: loopback and `NODE_ENV !== production`. |
| Untrusted radar content | Stored as plain text, HTML stripped twice, rendered as React text (never `innerHTML`), never executed. Fixture names are restricted to a fixed folder (no path tricks). |
| SSRF | Radar sources must be public `https://` addresses (no localhost or private ranges). |
| AI | Optional and local only (Ollama). Its output is labelled "AI-generated, unverified" and never changes curriculum by itself. |
| Input validation | Every write route validates by hand (projects, preferences, proposals). Bad JSON gives 400, not 500. Errors never leak stack traces. |
| Secrets | None needed. `.env` holds only the local DB URL. |

## Performance

The main JS bundle is ~430 KB (130 KB gzipped). The Monaco editor and every lab are lazy-loaded only on the pages that use them. There is no WebGL and no animation library.

## Tests

| Command | What runs |
| --- | --- |
| `npm test` | unit tests: content audit, rules, radar, validation, lab logic; plus integration journeys against a throwaway `hexhammer_test` schema (skipped, and reported, if Postgres is down) |
| `npm run test:e2e` | Playwright: the 20 user journeys through the real UI, an own API on :4190, an own `hexhammer_e2e` schema, axe checks, phone overflow checks, screenshots |
| `npm run curriculum:check` | the curriculum audit; writes `docs/curriculum/coverage-report.md`; fails on errors |
| `npm run lint` / `npm run typecheck` | ESLint / tsc in every workspace |
