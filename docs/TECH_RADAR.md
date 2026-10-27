# Technology Radar: monitoring guide

The radar watches official sources for changes. It classifies each change with transparent rules and queues it for **your** review. Only approved proposals reach a lesson, and then only as a new version that adds a "What changed" section.

## What runs, and when (honest limits)

- The scheduler lives **inside the API process** (`apps/api/src/radar/scheduler.ts`). It wakes 30 seconds after start-up, then every 15 minutes, and checks at most 5 due sources per wake-up.
- **When `npm run dev` or `npm start` is not running, nothing is monitored.** Nothing catches up "in the background" afterwards; on the next start, due sources are simply checked.
- Set `RADAR_SCHEDULER=off` in `.env` to disable it. Manual "Check now" still works.
- Default intervals (per source, editable):
  - security: 24h (daily);
  - frameworks, AI platforms, cloud, DevOps: 168h (weekly);
  - OWASP page: 720h (monthly).
- Periodic curriculum jobs only *record findings*; they never change content:
  - **quarterly**: list topics whose `lastReviewedAt` is over 91 days old;
  - **monthly**: list topics whose interview bank is below target.
- Robustness:
  - 15s timeout per request;
  - up to 2 retries with exponential backoff (1s, 2s), and no retry on 4xx;
  - a 2 MB response cap;
  - "Check now" is rate-limited to once per 10 minutes per source;
  - health is tracked per source (consecutive failures; stale = no success for 3 intervals);
  - every run is recorded in `RadarRun`.

### Running it on a schedule without leaving the app open

Hexhammer is local-only by design: no hosted database, no public deploy. If you want checks while the app is closed, use your OS scheduler on this computer. Example: Windows Task Scheduler or cron running, hourly, `npm --prefix C:\HTML\HexHammer start` for a few minutes, or a small script that calls `POST http://localhost:4000/radar/check-due`. A GitHub Actions cron cannot reach your local database, so it is not recommended for this app.

## Sources

`npm run seed` registers these as **unverified**. `npm run radar:validate` fetches each one and records valid or invalid. On 27 Oct 2026 all 13 live sources validated:

| Brief asked for | Registered source (kind) | Why this address |
| --- | --- | --- |
| github.com/facebook/react/releases | `…/react/releases.atom` (atom) | official release feed |
| github.com/microsoft/TypeScript/releases | `…/TypeScript/releases.atom` (atom) | official release feed |
| github.com/nodejs/node/releases | `…/node/releases.atom` (atom) | official release feed |
| developers.openai.com/api/docs/changelog | same URL (page-watch) | no feed; text fingerprint. Monitored for awareness only; the app never calls a paid AI API |
| platform.openai.com/docs/deprecations | same URL (page-watch) | as above |
| kubernetes.io/docs/home | `kubernetes.io/feed.xml` (rss) | docs home has no feed; official blog feed |
| docs.docker.com | `docs.docker.com/engine/release-notes/` (page-watch) | the page that actually changes per release |
| aws.amazon.com/new | `…/about-aws/whats-new/recent/feed/` (rss) | official feed |
| nvd.nist.gov | NVD CVE API 2.0, keyword "node.js" (nvd) | public API, no key needed (low rate limits) |
| github.com/advisories | REST API, critical npm advisories (github-advisories) | no token needed (60 requests/hour) |
| owasp.org | `owasp.org/www-project-top-ten/` (page-watch) | the standard that matters for the curriculum |
| — (added) | Express and Ollama releases (atom) | technologies this app itself teaches and uses |

Fixture sources (`fixture://…`, files in `apps/api/src/radar/fixtures/`) contain clearly fictional data ("Fixture Framework", example.com links) for tests and offline demos. The scheduler never checks them; use "Check now".

**Page-watch limits:** it can only say "the page's text changed". It cannot say what changed, so such items arrive as `needs-verification`. A validation result of "valid" only proves the page loaded. A site that returns a bot-check page would still "load".

## Adding a source

On the Radar page, open "Add a source". The URL must be public https, the kind must match (`atom`, `rss`, `page-watch`, `github-advisories` or `nvd`), and the app **fetches and parses it before saving**. Invalid sources are refused with the reason. Sources can be edited, disabled and recategorised. Settings → *Technology Radar categories* chooses which categories the scheduler checks.

## From a change to a lesson

1. **Ingest.** The canonical URL is normalised (no tracking parameters or fragments; sorted query) and deduplicated across runs. The same title from another source within 14 days increments `seenCount` instead of creating a duplicate. `publishedAt` (from the source, may be missing) is stored separately from `discoveredAt` (when the app saw it).
2. **Classify (rule-based, not AI).** The first matching rule wins, and the reason is stored:
   - security severity critical/high → *Critical security issue*, worded as "detected advisory, not a verified impact on your projects";
   - "breaking/removed/end of life" or "deprecated" → *Breaking*;
   - alpha/beta/preview/RC → *Emerging*;
   - SemVer major/minor/patch → *Breaking* / *Capability* / *Minor*;
   - "recommend/guidance" → *Practice change*;
   - "introducing/now available" → *Capability*;
   - nothing matched to the Atlas → *Irrelevant*.
3. **Optional local AI.** "Ask the local model" sends the plain text to Ollama (`OLLAMA_URL`, `OLLAMA_MODEL`, default `llama3.2`). The source is delimited and marked as untrusted. The result is stored as `aiAnalysis` and shown as "AI-generated, unverified". If Ollama is not running, you get a clear 503 and everything else works.
4. **Review queue.** Actions: approve, reject, defer, already covered, needs verification. You can also mark the facts verified or disputed after reading the source.
5. **Propose.** Creates a draft learning mission with 12 parts. Only facts from the source are pre-filled; why, before, now and the migration exercise must be written by you. Approval is refused until they are, and every field is stripped of markup and checked (https references only).
6. **Approve.** In one transaction:
   - a `TopicVersion` is created (version N → N+1);
   - the proposal and update are marked approved;
   - the audit trail records `approve` and `publish`.

   The lesson shows a "What changed" section; earlier versions stay listed; `TopicProgress` is untouched (tested).

## Audit trail

`AuditLog` records `register-source`, `validate-source`, `edit-source`, `ingest`, `review:*`, `verify:*`, `ai-analysis`, `propose`, `edit-proposal`, `approve`/`reject`/`defer` and `publish`. View it at `GET /api/radar/audit`.
