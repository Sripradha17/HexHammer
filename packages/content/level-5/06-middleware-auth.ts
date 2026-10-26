import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s06",
  level: 5,
  order: 6,
  title: "Middleware: auth short-circuit returning 401",
  runner: "server",

  look: `A middleware does not have to call next(). Instead, it can decide the request is done right there and send a response itself: an AUTH CHECK is the classic example. If the caller is not allowed in, there is no reason to run any of the routes after it.

  function requireAuth(req, res, next) {
    if (notAllowed) {
      res.status(401).json({ error: "Unauthorized" });
      return;          // stop here: do NOT call next()
    }
    next();             // allowed: let the real route run
  }

401 Unauthorized means "I don't know who you are, or you did not prove it" (as opposed to 403 Forbidden, which means "I know who you are, and the answer is still no"). This is called SHORT-CIRCUITING the chain: exactly one of "send a response" or "call next()" happens, never both, and never neither.`,

  type: `Finish requireAuth(req, res, next):
1. If req.headers.authorization is not exactly "Bearer secret-token", respond with status 401 and JSON { error: "Unauthorized" }, and stop (do not call next()).
2. Otherwise, call next().`,

  break: `Break it on purpose: call next() in BOTH branches, even the 401 one. Express lets the 401 response go out fine, but then the /secret route ALSO tries to send its own response, and Node throws a real error: "Cannot set headers after they are sent". Remove the next() from the 401 branch: send a response OR call next(), never both.`,

  say: `In one sentence: what does it mean for a middleware to "short-circuit" the chain?`,

  starterCode: `import express from "express";

function requireAuth(req, res, next) {
  // your code here
}

export function buildApp() {
  const app = express();

  app.use(requireAuth);

  app.get("/secret", (req, res) => {
    res.json({ data: "top secret" });
  });

  return app;
}
`,

  tests: `test("a request without the right token is refused with 401 and never reaches the route", async () => {
  const res = await request(buildApp()).get("/secret");
  expect(res.status).toBe(401);
  expect(res.body).toEqual({ error: "Unauthorized" });
});

test("a request with the right token reaches the real route and gets the data", async () => {
  const res = await request(buildApp()).get("/secret").set("Authorization", "Bearer secret-token");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ data: "top secret" });
});
`,

  hints: [
    'Check the header: if (req.headers.authorization !== "Bearer secret-token") { ... }',
    "Inside that if: res.status(401).json({ error: \"Unauthorized\" }); then return; (so the function stops here).",
    "After the if block (outside it): next();",
  ],

  solution: `=== CODE ===
import express from "express";

function requireAuth(req, res, next) {
  if (req.headers.authorization !== "Bearer secret-token") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export function buildApp() {
  const app = express();

  app.use(requireAuth);

  app.get("/secret", (req, res) => {
    res.json({ data: "top secret" });
  });

  return app;
}
=== LINE BY LINE ===
req.headers.authorization reads the Authorization header a caller sent. Real systems use a proper token here (often a JWT, coming up in a later strike); this one checks a fixed string just to keep the idea simple.
The return; right after res.status(401).json(...) is doing real work: without it, execution would fall through to next() below, calling it anyway.
next(); at the very end only runs when the if block did NOT return early, meaning the token was correct. That is the whole short-circuit: this function always ends by doing exactly one of "answer" or "hand off", never both.`,
};
