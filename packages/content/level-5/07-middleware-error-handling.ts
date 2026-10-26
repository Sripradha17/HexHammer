import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s07",
  level: 5,
  order: 7,
  title: "Middleware: error-handling (err, req, res, next)",
  runner: "server",

  look: `Express recognizes an ERROR-HANDLING middleware by counting its parameters: exactly FOUR, (err, req, res, next), instead of the usual three. It must be registered LAST, after every route, so it catches whatever went wrong anywhere above it.

  app.get("/risky", (req, res) => {
    throw new Error("something broke");
  });

  app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
  });

Express 5 (what this app uses) automatically catches an error thrown inside an async route and routes it here for you, the same way apps/api/src/middleware/errorHandler.ts does for this whole real app. You do not have to wrap every route in your own try/catch.`,

  type: `Add an error-handling middleware AFTER the /risky route:
1. It must take exactly four parameters: (err, req, res, next).
2. It should respond with status 500 and JSON { error: err.message }.`,

  break: `Break it on purpose: write your handler with only THREE parameters, (err, req, res), dropping next. Express decides whether a middleware is an error handler purely by COUNTING its parameters: with three, Express treats it as an ordinary, non-error middleware instead, which never gets a turn for a thrown error. Put next back as the fourth parameter, even though this handler never calls it.`,

  say: `In one sentence: how does Express know a piece of middleware is meant to handle ERRORS specifically, and not ordinary requests?`,

  starterCode: `import express from "express";

export function buildApp() {
  const app = express();

  app.get("/risky", (req, res) => {
    throw new Error("something broke");
  });

  app.get("/ok", (req, res) => {
    res.json({ fine: true });
  });

  // your code here: an error-handling middleware, registered LAST

  return app;
}
`,

  tests: `test("a thrown error is caught and answered with 500 and the error's own message", async () => {
  const res = await request(buildApp()).get("/risky");
  expect(res.status).toBe(500);
  expect(res.body).toEqual({ error: "something broke" });
});

test("a normal route is completely unaffected by the error handler existing", async () => {
  const res = await request(buildApp()).get("/ok");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ fine: true });
});
`,

  hints: [
    "Add it as the LAST thing registered, after both routes: app.use((err, req, res, next) => { ... });",
    "Inside it: res.status(500).json({ error: err.message });",
    "All four parameters matter, even though this handler never calls next() itself: Express counts them to recognize this as error-handling middleware in the first place.",
  ],

  solution: `=== CODE ===
import express from "express";

export function buildApp() {
  const app = express();

  app.get("/risky", (req, res) => {
    throw new Error("something broke");
  });

  app.get("/ok", (req, res) => {
    res.json({ fine: true });
  });

  app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
  });

  return app;
}
=== LINE BY LINE ===
Express 5 automatically catches the thrown Error from /risky (both a plain throw and a rejected promise from an async handler) and hands it to the FIRST four-parameter middleware it finds AFTER the route, in registration order.
err.message is the same string you threw with new Error("something broke"): the error object survives the trip from your route all the way to this handler.
/ok never even sees this error-handling middleware: Express only routes ERRORS into it, and a request that never throws simply never reaches it, exactly like next() skipping an unrelated route.`,
};
