// Runs a Level 5 SQL learner's query for real, but never against the real database: it builds a
// brand-new, throwaway IN-MEMORY database (pg-mem, a real SQL engine that just never touches
// disk or a network socket), seeds it with the lesson's fixed schema/rows, forks it as its own
// Node child process, and waits for the result (or kills it if it takes too long). See
// forkAndCollect.ts for the fork/timeout/cleanup plumbing, shared with runServerCode.ts.
//
// SAFETY: this must only ever be reached through the hard local-only gate in
// sqlRunnerRoute.ts. Unlike the real-server runner, this one has an EXTRA layer of safety by
// construction: even a learner who writes DROP SCHEMA or DELETE FROM everything can only ever
// affect this one throwaway, in-memory database, thrown away the moment the process is killed.
// It never opens a connection to the app's real Postgres container at all.
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { forkAndCollect, type ForkResult } from "./forkAndCollect";

export type SqlRunResult = ForkResult;

export const SQL_RUNNER_TIMEOUT_MS = 5000;

// apps/api's own root folder, worked out from where THIS file lives.
const apiRoot = path.resolve(fileURLToPath(import.meta.url), "../../..");
const harnessPath = path.join(apiRoot, "src", "serverRunner", "runHarness.mjs");
const helperUrl = pathToFileURL(path.join(apiRoot, "src", "serverRunner", "serverTestHelper.mjs")).href;
// The SAME temp folder the server runner uses: pg-mem is a real npm dependency, and Node
// resolves `import { newDb } from "pg-mem"` by walking UP from the importing file's own folder,
// so this has to live somewhere under apps/api to find it.
const tmpRoot = path.join(apiRoot, ".runner-tmp");

export async function runSqlCode(
  code: string,
  seedSql: string,
  tests: string,
  timeoutMs: number = SQL_RUNNER_TIMEOUT_MS,
): Promise<SqlRunResult> {
  await mkdir(tmpRoot, { recursive: true });
  const dir = await mkdtemp(path.join(tmpRoot, "sql-"));

  try {
    // The learner's own SQL, written to disk exactly as they typed it. It is not a JS module: it
    // is a raw SQL string, run against the freshly-seeded in-memory database by context.mjs below.
    await writeFile(path.join(dir, "learner.sql"), code, "utf8");

    // The lesson's fixed setup: CREATE TABLE + INSERT statements, always run first, the same way
    // for both the starter code and the solution, so every run starts from identical data.
    await writeFile(path.join(dir, "seed.sql"), seedSql, "utf8");

    // Builds a fresh in-memory database, seeds it, and exposes two things to the tests below:
    // `code` (the learner's raw SQL text) and `query(sql)` (runs any SQL against THIS database
    // and returns the resulting rows). A fresh module instance every run means a fresh database
    // every run: nothing here is shared between the starter-code run and the solution run.
    const contextFile = `import { newDb } from "pg-mem";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const code = readFileSync(path.join(here, "learner.sql"), "utf8");

const db = newDb();
db.public.none(readFileSync(path.join(here, "seed.sql"), "utf8"));

export function query(sql) {
  return db.public.many(sql);
}
`;
    await writeFile(path.join(dir, "context.mjs"), contextFile, "utf8");

    // The lesson's tests, with the imports every SQL lesson needs added automatically, so a
    // lesson's `tests` string never has to spell these out itself (same as the other runners).
    const testFile =
      `import { test, expect } from ${JSON.stringify(helperUrl)};\n` +
      `import { query, code } from "./context.mjs";\n\n` +
      tests;
    await writeFile(path.join(dir, "test.mjs"), testFile, "utf8");

    return await forkAndCollect(harnessPath, [dir], apiRoot, timeoutMs);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
