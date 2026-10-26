import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s03",
  level: 5,
  order: 3,
  title: "Middleware: build your own use()/next() chain",
  runner: "worker",

  look: `MIDDLEWARE is just a function that runs BETWEEN a request arriving and a route finally answering it: a logger, an auth check, a body parser. Express chains them together with .use(), and every middleware gets a next() function it must call to let the NEXT one run:

  app.use((req, res, next) => {
    console.log("a request came in");
    next();       // without this, the chain STOPS here forever
  });

This strike is about the CONCEPT, not real Express or real HTTP, so it stays right here in a plain JavaScript sandbox where you can see exactly how next() works underneath. You will build a tiny createApp() with its own .use() and .run(), the same shape Express itself uses.`,

  type: `Finish run(req) inside createApp():
1. Call each registered middleware in the order it was added with app.use(...).
2. Each middleware receives (req, next). Pass it a next function that moves on to the FOLLOWING middleware.
3. If a middleware never calls next(), the chain simply stops there (later middlewares never run).`,

  break: `Break it on purpose: inside next(), delete the line that increases index. Now calling next() finds the SAME middleware again (the pointer never moved), which calls next() again... forever. In a real browser this blows the call stack (RangeError: Maximum call stack size exceeded). Put index = index + 1; back.`,

  say: `In one sentence: what does calling next() actually do, and what happens if a middleware forgets to call it?`,

  starterCode: `// Strike 3: build your own middleware chain (use/next), the concept behind Express.

function createApp() {
  const middlewares = [];

  function use(fn) {
    middlewares.push(fn);
  }

  function run(req) {
    // your code here
  }

  return { use, run };
}
`,

  tests: `test("middlewares run in the order they were added", () => {
  const app = createApp();
  const req = { trail: [] };
  app.use((req, next) => { req.trail.push("first"); next(); });
  app.use((req, next) => { req.trail.push("second"); next(); });
  app.run(req);
  expect(req.trail).toEqual(["first", "second"]);
});

test("a middleware that never calls next() stops the chain right there", () => {
  const app = createApp();
  const req = { trail: [] };
  app.use((req, next) => { req.trail.push("first"); }); // no next() on purpose
  app.use((req, next) => { req.trail.push("second"); next(); });
  app.run(req);
  expect(req.trail).toEqual(["first"]);
});
`,

  hints: [
    "You need an index variable starting at 0, remembered between calls to next() (so declare it outside of next(), inside run()).",
    "Write next() to read middlewares[index], THEN increase index by 1 (in that order), then call that middleware if one was found: middleware(req, next).",
    "run(req) just needs to call next() once, the very first time, to kick the whole chain off: let index = 0; function next() { const m = middlewares[index]; index = index + 1; if (m) m(req, next); } next();",
  ],

  solution: `=== CODE ===
function createApp() {
  const middlewares = [];

  function use(fn) {
    middlewares.push(fn);
  }

  function run(req) {
    let index = 0;
    function next() {
      const middleware = middlewares[index];
      index = index + 1;
      if (middleware) {
        middleware(req, next);
      }
    }
    next();
  }

  return { use, run };
}
=== LINE BY LINE ===
index remembers our place in the middlewares array, between one next() call and the next one. It has to live OUTSIDE of next() (in run()'s own scope) so it survives across calls, instead of resetting every time.
next() reads the CURRENT middleware, moves the pointer forward, and only THEN calls that middleware, handing it the very same next function again as its own second argument. That is the whole trick: every middleware gets a fresh chance to call "the next step" whenever IT decides it is done.
run(req) does not loop by itself at all: it just calls next() ONCE to start things moving. From there, the chain keeps itself going only because each middleware chooses to call next() in turn. This is exactly why a middleware that forgets to call next() silently stops everything after it: nothing else is watching.`,
};
