// Level 5 lessons, in order. ALL 37 PLANNED TOPICS ARE NOW DONE. Eight batches total. Most
// strikes execute for real on the local API (see apps/api/src/serverRunner), across THREE real
// execution shapes sharing one fork/timeout/cleanup core (forkAndCollect.ts):
//   - real Express apps (runServerCode.ts) — most of the level, including file uploads (multer),
//     GraphQL (the graphql package), and one WebSocket strike (the ws package, where buildApp()
//     returns a real http.Server instead of an Express app, since a WS upgrade needs one)
//   - real SQL, against a throwaway IN-MEMORY database (runSqlCode.ts, pg-mem) — joins, group by,
//     transactions — never the app's own real Postgres
// The N+1 strike is SQL-labeled in the curriculum but is really about a QUERY PATTERN, not one
// raw query, so it uses the Express runner with an in-memory "database" and a real query counter
// instead. Caching (Redis) is DELIBERATELY simulated with a plain in-memory Map rather than a
// real Redis connection: the TTL/get/set concept teaches fully either way, and a real Redis
// container would mean new Docker infra and real network calls from every graded run, for one
// strike's benefit — a judgement call, not a limitation of the runner.
//
// Eight topics stay guided-local (plain worker) instead of real execution, each for its own
// honest reason: the use()/next() chain, Prisma ORM, and API testing with supertest are concept
// exercises that point at this app's own real code as proof; async error pitfalls demonstrates a
// deliberate, real process crash; OAuth/OIDC needs a real external provider this offline
// classroom cannot reach; OWASP Top 10, indexes/EXPLAIN (pg-mem does not implement EXPLAIN at
// all) and NoSQL modeling are surveys/contrasts, not single exercises; and CSRF needs a real
// cross-site browser scenario.
import type { Lesson } from "../types";
import { lesson as s01 } from "./01-http-basics";
import { lesson as s02 } from "./02-express-basics";
import { lesson as s03 } from "./03-middleware-chain";
import { lesson as s04 } from "./04-middleware-logger";
import { lesson as s05 } from "./05-middleware-order";
import { lesson as s06 } from "./06-middleware-auth";
import { lesson as s07 } from "./07-middleware-error-handling";
import { lesson as s08 } from "./08-middleware-validation";
import { lesson as s09 } from "./09-middleware-cors-rate-limit";
import { lesson as s10 } from "./10-middleware-async-pitfalls";
import { lesson as s11 } from "./11-http-caching-cookies";
import { lesson as s12 } from "./12-rest-resources-pagination";
import { lesson as s13 } from "./13-rest-filtering-versioning-idempotency";
import { lesson as s14 } from "./14-auth-password-hashing";
import { lesson as s15 } from "./15-auth-sessions-vs-jwt";
import { lesson as s16 } from "./16-auth-oauth-oidc";
import { lesson as s17 } from "./17-auth-rbac";
import { lesson as s18 } from "./18-security-owasp-top-10";
import { lesson as s19 } from "./19-security-injection";
import { lesson as s20 } from "./20-security-csrf";
import { lesson as s21 } from "./21-security-secrets";
import { lesson as s22 } from "./22-sql-joins";
import { lesson as s23 } from "./23-sql-group-by";
import { lesson as s24 } from "./24-sql-indexes-explain";
import { lesson as s25 } from "./25-sql-transactions";
import { lesson as s26 } from "./26-sql-normalization-migrations";
import { lesson as s27 } from "./27-sql-n-plus-1";
import { lesson as s28 } from "./28-prisma-orm";
import { lesson as s29 } from "./29-caching-redis";
import { lesson as s30 } from "./30-background-jobs-queues";
import { lesson as s31 } from "./31-websockets-sse";
import { lesson as s32 } from "./32-file-uploads";
import { lesson as s33 } from "./33-logging-error-monitoring";
import { lesson as s34 } from "./34-nosql-modeling";
import { lesson as s35 } from "./35-graphql-basics";
import { lesson as s36 } from "./36-api-testing-supertest";
import { lesson as s37 } from "./37-openapi-docs";

export const level5Lessons: Lesson[] = [
  s01,
  s02,
  s03,
  s04,
  s05,
  s06,
  s07,
  s08,
  s09,
  s10,
  s11,
  s12,
  s13,
  s14,
  s15,
  s16,
  s17,
  s18,
  s19,
  s20,
  s21,
  s22,
  s23,
  s24,
  s25,
  s26,
  s27,
  s28,
  s29,
  s30,
  s31,
  s32,
  s33,
  s34,
  s35,
  s36,
  s37,
];
