// Tests for the actual server-side code runner (Level 5+). These really fork a Node child
// process and really import Express + supertest, so they are slower than the rest of the suite,
// but that is the whole point: this is the ONE place in the app that must be proven to genuinely
// execute code, time it out, and clean up after itself.
import { describe, expect, it } from "vitest";
import { access } from "node:fs/promises";
import { runServerCode } from "./runServerCode";

describe("runServerCode", () => {
  it("really builds and calls a learner's Express app, and reports a real pass", async () => {
    const code = `import express from "express";
export function buildApp() {
  const app = express();
  app.get("/ping", (req, res) => res.status(200).json({ pong: true }));
  return app;
}
`;
    const tests = `test("GET /ping answers 200 with pong: true", async () => {
  const res = await request(buildApp()).get("/ping");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ pong: true });
});
`;
    const result = await runServerCode(code, tests);
    expect(result.timedOut).toBe(false);
    expect(result.error).toBe(null);
    expect(result.results).toEqual([
      { name: "GET /ping answers 200 with pong: true", passed: true, message: "" },
    ]);
  });

  it("reports a real, specific failure when the learner's route is wrong", async () => {
    const code = `import express from "express";
export function buildApp() {
  const app = express();
  app.get("/ping", (req, res) => res.status(404).json({ pong: false }));
  return app;
}
`;
    const tests = `test("GET /ping answers 200", async () => {
  const res = await request(buildApp()).get("/ping");
  expect(res.status).toBe(200);
});
`;
    const result = await runServerCode(code, tests);
    expect(result.error).toBe(null);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].passed).toBe(false);
    expect(result.results[0].message).toContain("200");
    expect(result.results[0].message).toContain("404");
  });

  it("captures console.log from the learner's own code instead of printing it for real", async () => {
    const code = `console.log("module loaded");
import express from "express";
export function buildApp() {
  console.log("building the app");
  return express();
}
`;
    const tests = `test("buildApp still works", () => {
  buildApp();
  expect(true).toBe(true);
});
`;
    const result = await runServerCode(code, tests);
    expect(result.error).toBe(null);
    expect(result.consoleLines).toEqual(["module loaded", "building the app"]);
  });

  it("reports a friendly error when the learner's own code fails to even load", async () => {
    const code = `export function buildApp( {\n  // missing closing paren on purpose\n}\n`;
    const tests = `test("never gets here", () => {
  expect(true).toBe(true);
});
`;
    const result = await runServerCode(code, tests);
    expect(result.error).not.toBe(null);
    expect(result.error).toContain("crashed");
  });

  it("times out and kills the process instead of hanging forever, on a real infinite loop", async () => {
    const code = `export function buildApp() {
  while (true) { /* on purpose: this never returns */ }
}
`;
    const tests = `test("never gets here", async () => {
  await request(buildApp()).get("/");
});
`;
    const result = await runServerCode(code, tests, 500); // short timeout, just for this test
    expect(result.timedOut).toBe(true);
    expect(result.results).toEqual([]);
  }, 10_000);

  it("cleans up its temp folder after a run, even after a timeout", async () => {
    const code = `export function buildApp() { while (true) {} }`;
    const tests = `test("x", async () => { await request(buildApp()).get("/"); });`;

    const foldersBefore = await listRunnerTmp();
    await runServerCode(code, tests, 300);
    const foldersAfter = await listRunnerTmp();
    expect(foldersAfter.length).toBe(foldersBefore.length);
  }, 10_000);
});

async function listRunnerTmp(): Promise<string[]> {
  const { readdir } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const path = await import("node:path");
  const apiRoot = path.resolve(fileURLToPath(import.meta.url), "../../..");
  const tmpRoot = path.join(apiRoot, ".runner-tmp");
  try {
    await access(tmpRoot);
    return await readdir(tmpRoot);
  } catch {
    return [];
  }
}
