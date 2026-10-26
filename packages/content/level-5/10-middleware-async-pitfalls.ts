import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s10",
  level: 5,
  order: 10,
  title: "Middleware: async error pitfalls",
  runner: "worker",

  look: `Express 5 (what this app uses) automatically catches an error THROWN by an async route handler, or a promise IT returns that rejects, and sends it to your error-handling middleware. That is real, and you already relied on it two strikes ago.

But that safety net only watches the promise your handler itself hands back to Express. Code that escapes that promise entirely is invisible to it:

  app.get("/risky", async (req, res) => {
    setTimeout(() => {
      throw new Error("this escapes Express completely");   // NOT caught, ever
    }, 0);
    res.json({ ok: true });
  });

That setTimeout callback runs LATER, completely disconnected from the request/response cycle Express is watching. By the time it throws, Express has already moved on; the error becomes an UNHANDLED exception in the whole Node process, not a tidy 500 response to one request. This strike is guided-local: real execution can't show this safely (an error like that is deliberately meant to crash the process, which real Node.js does on purpose, for its own safety).`,

  type: `Fill in the answers object:
  caughtByExpress    pick a, b or c: what does Express 5 automatically catch for you?
  escapesExpress     pick a, b or c: what kind of code can still slip past that safety net?
  fixApproach        write one word: what should the setTimeout callback have been, so its error rejoins the handler's own promise chain?`,

  break: `Try it for real, carefully: in a throwaway scratch file (never in this real app), write exactly the setTimeout example above inside a plain Express route and run it locally with node. Watch the whole process crash with an unhandled exception, not a clean 500 response to the browser. That crash is Node protecting itself: an error nobody is watching for is treated as unsafe to just ignore.`,

  say: `In one sentence: why does a thrown error inside an un-awaited setTimeout (or any disconnected promise) not get caught by Express, even in Express 5?`,

  starterCode: `// Strike 10: async error pitfalls.

// caughtByExpress: what does Express 5 automatically catch for you?
//   a) any error thrown or rejected from the promise your OWN async handler returns
//   b) every error anywhere in the whole Node process, no matter where it comes from
//   c) only errors you manually wrap with try/catch

// escapesExpress: what kind of code can still slip past Express's safety net?
//   a) a plain "throw new Error(...)" as the very first line of a route
//   b) an error thrown inside a callback (like setTimeout) that is not connected to the handler's own returned promise
//   c) an error thrown inside an "if" statement

const answers = {
  caughtByExpress: "",
  escapesExpress: "",
  fixApproach: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("caughtByExpress", () => {
  if (said(answers.caughtByExpress) !== "a") {
    throw new Error("What does Express 5 automatically catch for you? (a, b or c)");
  }
});

test("escapesExpress", () => {
  if (said(answers.escapesExpress) !== "b") {
    throw new Error("What kind of code can still slip past Express's safety net? (a, b or c)");
  }
});

test("fixApproach", () => {
  if (said(answers.fixApproach) !== "await") {
    throw new Error('What is the fix for the setTimeout example? (write the single word: "await", of whatever you replace setTimeout with a properly awaited promise)');
  }
});
`,

  hints: [
    "caughtByExpress: think about the word Express is watching — the promise YOUR handler itself returns, nothing further away than that.",
    "escapesExpress: setTimeout's callback runs on its own, later, disconnected from the request Express was ever tracking.",
    'fixApproach: the real fix is to stop using a disconnected callback at all, and instead await a real promise (for example setTimeout wrapped in one, or a proper timer library) so the error rejoins the handler\'s own chain. Write the single word: await',
  ],

  solution: `=== CODE ===
const answers = {
  caughtByExpress: "a",
  escapesExpress: "b",
  fixApproach: "await",
};
=== LINE BY LINE ===
caughtByExpress is a: Express 5 wraps the call to your async handler and watches the ONE promise that call returns. Throw inside the handler's own body (before any other async work), or reject the promise the handler returns, and Express sees it.
escapesExpress is b: setTimeout's callback is scheduled to run LATER, as its own separate turn of the event loop. Nothing connects it back to the promise Express is watching, so an error inside it is not "part of" the request as far as Express can tell.
fixApproach is await: the fix is always the same shape — turn the disconnected callback into a real, awaited promise, so its rejection (if any) becomes part of the SAME promise chain Express's async wrapper is already watching. A callback Express cannot see is a callback that was never connected to await in the first place.`,
};
