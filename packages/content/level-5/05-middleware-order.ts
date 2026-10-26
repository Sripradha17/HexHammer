import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s05",
  level: 5,
  order: 5,
  title: "Middleware: order matters",
  runner: "server",

  look: `Middleware runs in exactly the order you register it with app.use(), top to bottom. That order is not just style: later middleware can DEPEND on something an earlier one set up.

  app.use(addTimestamp);      // sets res.locals.receivedAt
  app.use(requireTimestamp);  // reads res.locals.receivedAt

If you registered these the other way round, requireTimestamp would run FIRST, find nothing there yet, and reasonably conclude something is wrong. Nothing about the code itself changed: only the ORDER did, and that alone flips the result.`,

  type: `Register the two middlewares, already written for you, in the correct order:
1. addTimestamp must run first (it sets res.locals.receivedAt).
2. requireTimestamp must run second (it checks res.locals.receivedAt exists).`,

  break: `Break it on purpose, after you get it working: swap your two app.use() lines, so requireTimestamp is registered FIRST. Rerun the tests and watch GET /ping answer 500 instead of 200 — requireTimestamp now runs before addTimestamp has ever had a chance to set anything. Put addTimestamp back first.`,

  say: `In one sentence: why can swapping the order of two app.use() calls change what a route answers, even though neither function itself changed?`,

  starterCode: `import express from "express";

function addTimestamp(req, res, next) {
  res.locals.receivedAt = Date.now();
  next();
}

function requireTimestamp(req, res, next) {
  if (res.locals.receivedAt === undefined) {
    res.status(500).json({ error: "no timestamp yet" });
    return;
  }
  next();
}

export function buildApp() {
  const app = express();

  // your code here: register addTimestamp and requireTimestamp, in the right order

  app.get("/ping", (req, res) => {
    res.json({
      hasTimestamp: typeof res.locals.receivedAt === "number",
      receivedAt: res.locals.receivedAt,
    });
  });

  return app;
}
`,

  tests: `test("GET /ping succeeds because addTimestamp ran before requireTimestamp", async () => {
  const res = await request(buildApp()).get("/ping");
  expect(res.status).toBe(200);
  expect(res.body.hasTimestamp).toBe(true);
});

test("the timestamp requireTimestamp found is a real number, not missing", async () => {
  const res = await request(buildApp()).get("/ping");
  expect(typeof res.body.receivedAt).toBe("number");
});
`,

  hints: [
    "Two lines, both inside buildApp(): app.use(addTimestamp); then app.use(requireTimestamp);",
    "addTimestamp SETS res.locals.receivedAt. requireTimestamp only CHECKS it. The setter has to run first.",
    "app.use(addTimestamp);\napp.use(requireTimestamp);",
  ],

  solution: `=== CODE ===
import express from "express";

function addTimestamp(req, res, next) {
  res.locals.receivedAt = Date.now();
  next();
}

function requireTimestamp(req, res, next) {
  if (res.locals.receivedAt === undefined) {
    res.status(500).json({ error: "no timestamp yet" });
    return;
  }
  next();
}

export function buildApp() {
  const app = express();

  app.use(addTimestamp);
  app.use(requireTimestamp);

  app.get("/ping", (req, res) => {
    res.json({
      hasTimestamp: typeof res.locals.receivedAt === "number",
      receivedAt: res.locals.receivedAt,
    });
  });

  return app;
}
=== LINE BY LINE ===
app.use(addTimestamp) runs FIRST for every request, setting res.locals.receivedAt before anything else gets a turn.
app.use(requireTimestamp) runs SECOND, so by the time it checks res.locals.receivedAt, addTimestamp has already set it. It calls next() and lets the request continue.
Neither function changed at all between the working version and the broken one you tried in the Break step. Only their ORDER did. This is exactly why real bugs in middleware chains are often invisible in the code itself: you have to read the list of app.use() calls, in order, to see the problem.`,
};
