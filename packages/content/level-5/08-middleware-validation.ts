import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s08",
  level: 5,
  order: 8,
  title: "Middleware: request validation",
  runner: "server",

  look: `A validation middleware checks the request BEFORE any route runs, and refuses early if something required is missing. This exact pattern already protects the real Hexhammer API: look at apps/api/src/middleware/validate.ts.

The trick worth noticing here is that requireBody below is a MIDDLEWARE FACTORY: a function that does not check anything itself, but instead RETURNS the middleware that will.

  function requireBody(fields) {
    return function (req, res, next) {
      // the REAL checking happens in here, once per request
    };
  }

  app.use(requireBody(["title"]));   // requireBody(...) runs ONCE, at setup, and returns a function

That inner function is what actually runs on every request. requireBody itself only runs once, while you are building the app.`,

  type: `Finish requireBody(fields). It must RETURN a middleware function that:
1. For each name in fields, checks that req.body[name] is a string.
2. If any one is missing or the wrong type, respond with status 400 and JSON { error: '"<name>" must be a string' }, and stop.
3. Otherwise, call next().`,

  break: `Break it on purpose: write requireBody as if IT were the middleware directly, with (req, res, next) as its own three parameters, instead of returning an inner function. Now app.use(requireBody(["title"])) calls requireBody immediately, at setup time, with ["title"] as its only real argument — req, res and next are all undefined, and your app crashes before it can handle a single request. Wrap the checking logic back inside an inner function that requireBody returns.`,

  say: `In one sentence: what is the difference between what requireBody(["title"]) does and what the function IT RETURNS does?`,

  starterCode: `import express from "express";

function requireBody(fields) {
  // your code here: return a middleware function
}

export function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(requireBody(["title"]));

  app.post("/notes", (req, res) => {
    res.status(201).json({ title: req.body.title });
  });

  return app;
}
`,

  tests: `test("POST /notes without a title is rejected with 400", async () => {
  const res = await request(buildApp()).post("/notes").send({});
  expect(res.status).toBe(400);
  expect(res.body).toEqual({ error: '"title" must be a string' });
});

test("POST /notes with a title succeeds with 201", async () => {
  const res = await request(buildApp()).post("/notes").send({ title: "Learn Express" });
  expect(res.status).toBe(201);
  expect(res.body).toEqual({ title: "Learn Express" });
});
`,

  hints: [
    "requireBody(fields) should have a single line at its top level: return function (req, res, next) { ... };",
    'Inside that inner function, loop over fields (a for...of works well), and check typeof req.body[name] !== "string".',
    'On a bad field: res.status(400).json({ error: `"${name}" must be a string` }); return; — then, after the loop, if nothing failed: next();',
  ],

  solution: `=== CODE ===
import express from "express";

function requireBody(fields) {
  return function (req, res, next) {
    for (const name of fields) {
      if (typeof req.body[name] !== "string") {
        res.status(400).json({ error: \`"\${name}" must be a string\` });
        return;
      }
    }
    next();
  };
}

export function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(requireBody(["title"]));

  app.post("/notes", (req, res) => {
    res.status(201).json({ title: req.body.title });
  });

  return app;
}
=== LINE BY LINE ===
requireBody(["title"]) runs exactly ONCE, while buildApp() is setting things up. All it does is build and return the real middleware, with fields (["title"]) remembered inside it via closure.
The RETURNED function is what Express actually calls, once per request. It is the one with (req, res, next), and it is the one that reads req.body every time.
This two-layer shape (a plain function that RETURNS a middleware) is exactly how apps/api/src/middleware/validate.ts works for real, and how you will keep seeing "configurable" middleware written: a factory on the outside, the real per-request work on the inside.`,
};
