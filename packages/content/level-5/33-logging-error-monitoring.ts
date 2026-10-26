import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s33",
  level: 5,
  order: 33,
  title: "Logging and error monitoring",
  runner: "server",

  look: `A request logger's whole job is recording what actually happened: which method, which path, and — this is the subtle part — which STATUS CODE the response really ended with, even one decided much later by an error handler.

  res.on("finish", () => {
    logs.push({ method: req.method, path: req.path, status: res.statusCode });
  });

res.on("finish", ...) fires once the response has genuinely been sent, in full. At THAT point, res.statusCode holds its real, final value. Reading res.statusCode any earlier (say, at the very top of your middleware, before calling next()) would just see the default (200), even for a request about to crash — you would confidently log a lie.`,

  type: `Finish logger(req, res, next):
1. Listen for res.on("finish", ...), and inside it, push { method: req.method, path: req.path, status: res.statusCode } onto logs.
2. Call next() right away, without waiting for the response to finish.`,

  break: `Break it on purpose: read res.statusCode immediately, at the top of logger, before calling next() — instead of waiting for "finish". At that moment the response has not been sent yet at all, so res.statusCode is still its default (200), even for a request that is about to crash into the error handler. Every request would get logged as a false 200. Wait for res.on("finish", ...) instead.`,

  say: `In one sentence: why does logging AFTER the response finishes give you a truer picture than logging before it?`,

  starterCode: `import express from "express";

export function buildApp() {
  const app = express();
  const logs = [];

  function logger(req, res, next) {
    // your code here
  }

  app.use(logger);

  app.get("/ok", (req, res) => res.json({ fine: true }));
  app.get("/boom", (req, res) => {
    throw new Error("kaboom");
  });
  app.use((err, req, res, next) => res.status(500).json({ error: err.message }));

  app.get("/logs", (req, res) => res.json({ logs }));

  return app;
}
`,

  tests: `test("a successful request is logged with its real status", async () => {
  const app = buildApp();
  await request(app).get("/ok");
  const res = await request(app).get("/logs");
  expect(res.body.logs).toEqual([{ method: "GET", path: "/ok", status: 200 }]);
});

test("even a request that crashed is logged with its REAL final status (500), not a guess", async () => {
  const app = buildApp();
  await request(app).get("/boom");
  const res = await request(app).get("/logs");
  expect(res.body.logs).toEqual([{ method: "GET", path: "/boom", status: 500 }]);
});
`,

  hints: [
    'res.on("finish", () => { ... }); goes first, before next().',
    "Inside that callback: logs.push({ method: req.method, path: req.path, status: res.statusCode });",
    "next(); comes right after registering the listener, NOT inside it — the listener only fires later, once the response is truly done.",
  ],

  solution: `=== CODE ===
import express from "express";

export function buildApp() {
  const app = express();
  const logs = [];

  function logger(req, res, next) {
    res.on("finish", () => {
      logs.push({ method: req.method, path: req.path, status: res.statusCode });
    });
    next();
  }

  app.use(logger);

  app.get("/ok", (req, res) => res.json({ fine: true }));
  app.get("/boom", (req, res) => {
    throw new Error("kaboom");
  });
  app.use((err, req, res, next) => res.status(500).json({ error: err.message }));

  app.get("/logs", (req, res) => res.json({ logs }));

  return app;
}
=== LINE BY LINE ===
res.on("finish", ...) is registered EARLY (before next()), but its callback only actually RUNS later, once Express has genuinely finished sending the response — no matter how it got there, a normal route or an error handler.
next(); runs immediately after registering the listener, letting the real route (or the error handler) do its work right away. Logging does not block anything.
By the time /boom's request reaches "finish", the error-handling middleware has already run and set status 500 — which is exactly the value res.statusCode holds at that point, the true final answer, not a guess made too early.`,
};
