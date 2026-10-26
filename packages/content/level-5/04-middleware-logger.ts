import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s04",
  level: 5,
  order: 4,
  title: "Middleware: a logger and next()",
  runner: "server",

  look: `A real Express middleware has three inputs: (req, res, next). It can read the request, change the response, and it MUST decide what happens next: either call next() to let the chain continue, or send a response itself and stop there.

  function logger(req, res, next) {
    console.log(req.method, req.url);   // just look, do not change anything
    next();                              // hand off to whatever comes after this
  }
  app.use(logger);

res.locals is a plain object that lives for exactly one request. Middleware often uses it to hand a computed value down to whichever route eventually answers, without changing the request itself:

  function logger(req, res, next) {
    res.locals.logged = true;
    next();
  }`,

  type: `Write a middleware function called logger(req, res, next) that:
1. Sets res.locals.logged = true.
2. Calls next().
Register it with app.use(logger), before the /ping route.`,

  break: `Break it on purpose: write the body of logger, but leave out next(). Now GET /ping never gets a turn at all: your request just hangs forever, because Express is still waiting for SOMETHING further down the chain to either respond or call next(), and nothing ever does. Add next(); back at the end of logger.`,

  say: `In one sentence: what two things can a piece of middleware choose to do, and why must it always do exactly one of them?`,

  starterCode: `import express from "express";

export function buildApp() {
  const app = express();

  function logger(req, res, next) {
    // your code here
  }

  app.use(logger);

  app.get("/ping", (req, res) => {
    res.json({ logged: res.locals.logged === true });
  });

  return app;
}
`,

  tests: `test("logger runs before the route, so res.locals.logged is already true when /ping answers", async () => {
  const res = await request(buildApp()).get("/ping");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ logged: true });
});

test("an unmatched route still correctly 404s (the logger does not swallow it)", async () => {
  const res = await request(buildApp()).get("/does-not-exist");
  expect(res.status).toBe(404);
});
`,

  hints: [
    "Inside logger's body: res.locals.logged = true;",
    "Right after that line: next();",
    "Both lines belong inside logger, in that order: set the value FIRST, then hand off with next().",
  ],

  solution: `=== CODE ===
import express from "express";

export function buildApp() {
  const app = express();

  function logger(req, res, next) {
    res.locals.logged = true;
    next();
  }

  app.use(logger);

  app.get("/ping", (req, res) => {
    res.json({ logged: res.locals.logged === true });
  });

  return app;
}
=== LINE BY LINE ===
res.locals.logged = true stores a small fact on THIS one request/response pair, ready for whichever route ends up answering it. res.locals is thrown away the moment the response finishes; it is not shared across requests.
next() is what makes this "middleware" rather than a route: it does not answer the request itself, it passes control on to whatever is registered after it (here, the /ping route).
app.use(logger), with no path given, means "run this before EVERY route, no matter what URL was requested" — which is exactly why /does-not-exist still correctly 404s afterwards: logger runs, calls next(), and Express's own built-in "nothing matched" handling takes it from there.`,
};
