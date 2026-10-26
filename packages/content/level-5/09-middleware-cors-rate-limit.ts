import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s09",
  level: 5,
  order: 9,
  title: "Middleware: CORS and rate limiting by hand",
  runner: "server",

  look: `Two more small, common middlewares, both usually reached for as a library, but simple enough to see by hand once.

CORS (you met the concept in Level 4) is granted by the SERVER sending a header:

  function cors(req, res, next) {
    res.set("Access-Control-Allow-Origin", "*");
    next();
  }

A RATE LIMITER refuses a request once too many have arrived. A tiny by-hand version just needs somewhere to keep count between requests:

  function rateLimiter(maxRequests) {
    let count = 0;                    // remembered here, across every request
    return function (req, res, next) {
      count = count + 1;
      if (count > maxRequests) {
        res.status(429).json({ error: "Too many requests" });
        return;
      }
      next();
    };
  }

429 Too Many Requests is the real status code for exactly this. (A real rate limiter also tracks WHO is asking, and resets the count after a time window — this tiny version skips both, on purpose, to keep the idea visible.)`,

  type: `Finish rateLimiter(maxRequests). It must return a middleware that:
1. Increases a counter by 1 on every request.
2. If the counter is now MORE than maxRequests, respond 429 with { error: "Too many requests" } and stop.
3. Otherwise, call next().`,

  break: `Break it on purpose: move let count = 0; OUT of rateLimiter, to the very top of the file. Now every app you build with buildApp() shares the exact same counter — even two completely separate apps, in two separate tests, never reset. Put let count = 0; back INSIDE rateLimiter, so every call to rateLimiter(...) starts its own fresh count.`,

  say: `In one sentence: why does count have to live INSIDE rateLimiter, instead of outside it?`,

  starterCode: `import express from "express";

function cors(req, res, next) {
  res.set("Access-Control-Allow-Origin", "*");
  next();
}

function rateLimiter(maxRequests) {
  // your code here: return a middleware function
}

export function buildApp() {
  const app = express();
  app.use(cors);
  app.use(rateLimiter(2));

  app.get("/ping", (req, res) => {
    res.json({ pong: true });
  });

  return app;
}
`,

  tests: `test("the first two requests (limit is 2) both succeed", async () => {
  const app = buildApp();
  const first = await request(app).get("/ping");
  const second = await request(app).get("/ping");
  expect(first.status).toBe(200);
  expect(second.status).toBe(200);
});

test("a third request past the limit is refused with 429", async () => {
  const app = buildApp();
  await request(app).get("/ping");
  await request(app).get("/ping");
  const third = await request(app).get("/ping");
  expect(third.status).toBe(429);
  expect(third.body).toEqual({ error: "Too many requests" });
});

test("cors sets the Access-Control-Allow-Origin header on a successful request", async () => {
  const res = await request(buildApp()).get("/ping");
  expect(res.headers["access-control-allow-origin"]).toBe("*");
});
`,

  hints: [
    "Inside rateLimiter, before the return: let count = 0;",
    "The returned function: count = count + 1; then check if (count > maxRequests) { res.status(429).json({ error: \"Too many requests\" }); return; }",
    "After that check: next();",
  ],

  solution: `=== CODE ===
import express from "express";

function cors(req, res, next) {
  res.set("Access-Control-Allow-Origin", "*");
  next();
}

function rateLimiter(maxRequests) {
  let count = 0;
  return function (req, res, next) {
    count = count + 1;
    if (count > maxRequests) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }
    next();
  };
}

export function buildApp() {
  const app = express();
  app.use(cors);
  app.use(rateLimiter(2));

  app.get("/ping", (req, res) => {
    res.json({ pong: true });
  });

  return app;
}
=== LINE BY LINE ===
let count = 0; lives inside rateLimiter, so it is created FRESH every time rateLimiter(...) is called — once per buildApp() call here, giving every test its own independent counter, the same way every real, separately-started server starts its own counting from zero.
The returned function is a CLOSURE: it keeps its own private access to that one count variable forever, even though rateLimiter itself already finished running. This is the same closure idea you have already used to keep other values alive between calls.
res.set(...) (in cors) writes a response HEADER, not the body. Headers travel alongside the response and carry small facts like this one, rather than actual data.`,
};
