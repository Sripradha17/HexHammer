// Runs a Level 5 (or later) learner's SERVER code for real: writes their code plus the lesson's
// tests into a throwaway temp folder, forks it as a brand-new Node child process, and waits for
// the result (or kills it if it takes too long) — the server-side equivalent of runCode.ts
// (Worker) and runIframeTests.ts (sandboxed iframe). See forkAndCollect.ts for the actual
// fork/timeout/cleanup plumbing, shared with the SQL runner (runSqlCode.ts).
//
// SAFETY: this must only ever be reached through the hard local-only gate in
// serverRunnerRoute.ts. It does NOT try to sandbox the CHILD PROCESS itself beyond a timeout:
// the learner is running their own code, on their own machine, the same trust level as if they
// typed `node their-file.js` themselves. What must never happen is a STRANGER reaching this over
// the network — that is what the gate stops, not this file.
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { forkAndCollect, type ForkResult } from "./forkAndCollect";

export type ServerRunResult = ForkResult;

export const SERVER_RUNNER_TIMEOUT_MS = 5000;

// apps/api's own root folder, worked out from where THIS file lives
// (apps/api/src/serverRunner/runServerCode.ts), so it works no matter what the process's cwd is.
const apiRoot = path.resolve(fileURLToPath(import.meta.url), "../../..");
const harnessPath = path.join(apiRoot, "src", "serverRunner", "runHarness.mjs");
const helperUrl = pathToFileURL(path.join(apiRoot, "src", "serverRunner", "serverTestHelper.mjs")).href;
// A temp folder INSIDE apps/api (not the OS temp folder) on purpose: the learner's code does
// `import express from "express"`, and Node resolves that by walking UP from the importing
// file's own folder looking for node_modules. Only somewhere under apps/api finds it.
const tmpRoot = path.join(apiRoot, ".runner-tmp");

export async function runServerCode(
  code: string,
  tests: string,
  timeoutMs: number = SERVER_RUNNER_TIMEOUT_MS,
): Promise<ServerRunResult> {
  await mkdir(tmpRoot, { recursive: true });
  const dir = await mkdtemp(path.join(tmpRoot, "run-"));

  try {
    // The learner's own code, written to disk exactly as they typed it. It must
    // `export function buildApp() { ... return app; }` — the tests below call that.
    await writeFile(path.join(dir, "learner.mjs"), code, "utf8");

    // The lesson's tests, with the imports every server lesson needs added automatically, so a
    // lesson's `tests` string never has to spell these out itself (same as the other two
    // runners: a lesson author just writes test()/expect() calls).
    const testFile =
      `import { test, expect } from ${JSON.stringify(helperUrl)};\n` +
      `import request from "supertest";\n` +
      `import { buildApp } from "./learner.mjs";\n\n` +
      tests;
    await writeFile(path.join(dir, "test.mjs"), testFile, "utf8");

    return await forkAndCollect(harnessPath, [dir], apiRoot, timeoutMs);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
