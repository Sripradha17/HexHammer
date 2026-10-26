import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s21",
  level: 5,
  order: 21,
  title: "Security: secrets",
  runner: "server",

  look: `A SECRET is anything that would cause real harm if it leaked: an API key, a database password, a signing key like the one from the JWT strike. The single most common way secrets leak is the most avoidable one: typed directly into a source file, then committed to git — forever, in the project's history, even if you "delete" it in a later commit.

The fix is an ENVIRONMENT VARIABLE: a value that lives outside your code entirely, supplied when the process starts, and read with process.env.SOME_NAME. This whole real app already does exactly this — look at .env.example and how apps/api/src/index.ts reads process.env.DATABASE_URL.

  const API_KEY = "sk-hardcoded-secret-12345";   // BAD: sitting in git forever
  const apiKey = process.env.API_KEY;             // GOOD: never written down in the code at all`,

  type: `Delete the hardcoded API_KEY constant entirely. Inside GET /status, read the key fresh from process.env.API_KEY every time, and respond 200 with { hasKey: true } if it is a non-empty string, or { hasKey: false } otherwise.`,

  break: `Break it on purpose: "fix" it halfway with a fallback: const apiKey = process.env.API_KEY || "sk-hardcoded-secret-12345";. The endpoint still answers correctly either way, so this is easy to miss in a review — but the real secret is STILL sitting in your source code, committed to git forever. Read straight from process.env.API_KEY, with no hardcoded fallback string at all.`,

  say: `In one sentence: why is a secret "deleted" from a later git commit not actually safe?`,

  starterCode: `import express from "express";

// BAD, on purpose: this is exactly what this exercise fixes.
const API_KEY = "sk-hardcoded-secret-12345";

export function buildApp() {
  const app = express();

  app.get("/status", (req, res) => {
    // your code here
  });

  return app;
}
`,

  tests: `import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

process.env.API_KEY = "a-real-secret-value-for-testing";

test("GET /status reports hasKey: true, because the key now comes from process.env", async () => {
  const res = await request(buildApp()).get("/status");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ hasKey: true });
});

test("the source code itself never hardcodes a real-looking secret value", () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(path.join(here, "learner.mjs"), "utf8");
  expect(source.includes("process.env.API_KEY")).toBe(true);
  expect(source.includes("sk-hardcoded-secret-12345")).toBe(false);
});
`,

  hints: [
    "Delete the whole line: const API_KEY = \"sk-hardcoded-secret-12345\"; — it should not exist anywhere in the file any more.",
    "Inside GET /status: const apiKey = process.env.API_KEY;",
    'res.json({ hasKey: typeof apiKey === "string" && apiKey.length > 0 });',
  ],

  solution: `=== CODE ===
import express from "express";

export function buildApp() {
  const app = express();

  app.get("/status", (req, res) => {
    const apiKey = process.env.API_KEY;
    res.json({ hasKey: typeof apiKey === "string" && apiKey.length > 0 });
  });

  return app;
}
=== LINE BY LINE ===
process.env.API_KEY reads the value fresh, every single request, from wherever the process was actually started (a real .env file, a deploy platform's secret settings, ...). Nothing resembling the real secret ever needs to appear inside a file that git tracks.
typeof apiKey === "string" && apiKey.length > 0 answers "is a key actually configured right now?" without ever exposing what the key IS anywhere in the response — a status endpoint like this is a genuinely common, safe way to let a deploy check confirm configuration without leaking it.
The second test reads the LEARNER FILE ITSELF off disk and checks its raw text, the same trick Level 4 used to check CSS source: this is the one way to catch a "fixed" version that still quietly hides the real secret behind a fallback.`,
};
