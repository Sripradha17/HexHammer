import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s36",
  level: 5,
  order: 36,
  title: "API testing with supertest",
  runner: "worker",

  look: `You have been using supertest this ENTIRE level, in every single server-runner strike's own tests, without necessarily stopping to name it: request(buildApp()).get("/items"). This strike is a moment to look directly at the tool itself.

supertest drives REAL HTTP requests against an Express app OBJECT directly — it does not need app.listen() or a real, reachable port at all. It builds a real request, real headers, a real body, and gets back a real response, all in-process. That is exactly why every one of your Level 5 tests has been trustworthy: they are not guessing at your app's behavior by reading the code, they are running it for real and checking what actually comes back.

  const res = await request(app).post("/items").send({ name: "pencil" });
  res.status        // the real numeric status code
  res.body           // the real, already-parsed JSON body
  res.headers        // the real response headers`,

  type: `Fill in the answers object:
  needsListen     pick a, b or c: does supertest need app.listen() and a real reachable port?
  whatItProves    pick a, b or c: what does a passing supertest test actually prove, that reading the code cannot?
  alreadyUsedIt   write one word: yes or no. Have you already been using supertest, even before this strike named it?`,

  break: `Try it for real, for free: open any earlier Level 5 strike's tests (right there in this app, in the lesson content you have already completed) and find the line request(buildApp())..... That is supertest, already doing real work, in every single one.`,

  say: `In one sentence: why does testing with supertest give you more confidence than just reading your route handler and reasoning about what it "should" do?`,

  starterCode: `// Strike 36: API testing with supertest.

// needsListen: does supertest need app.listen() and a real reachable port?
//   a) yes, always
//   b) no — it can drive requests against the app OBJECT directly, in-process
//   c) only for POST requests

// whatItProves: what does a passing supertest test actually prove?
//   a) that the code LOOKS correct
//   b) that the app, run for real, actually produced the response you expected
//   c) that the code has good style

const answers = {
  needsListen: "",
  whatItProves: "",
  alreadyUsedIt: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("needsListen", () => {
  if (said(answers.needsListen) !== "b") {
    throw new Error("Does supertest need app.listen() and a real reachable port? (a, b or c)");
  }
});

test("whatItProves", () => {
  if (said(answers.whatItProves) !== "b") {
    throw new Error("What does a passing supertest test actually prove? (a, b or c)");
  }
});

test("alreadyUsedIt", () => {
  if (said(answers.alreadyUsedIt) !== "yes") {
    throw new Error('Write one word: yes or no. Have you already been using supertest, before this strike named it?');
  }
});
`,

  hints: [
    "needsListen: supertest builds its own in-process connection straight to the app object you hand it.",
    "whatItProves: the difference is between code that LOOKS right and code that was actually RUN and checked.",
    'alreadyUsedIt: write the single word: yes — every server-runner strike so far has called request(buildApp())....',
  ],

  solution: `=== CODE ===
const answers = {
  needsListen: "b",
  whatItProves: "b",
  alreadyUsedIt: "yes",
};
=== LINE BY LINE ===
needsListen is b: supertest wraps the app object directly, making a real request against it in-process, with no real network socket or listening port required at all.
whatItProves is b: reading code tells you what it is SUPPOSED to do. Running it for real, with real inputs, and checking the real output, tells you what it ACTUALLY does — which is exactly why every "starter code should fail, solution should pass" check in this entire app runs the real thing, never just inspects the source.
alreadyUsedIt is "yes": every single server-runner strike, starting with HTTP basics, has been driven by supertest under the hood. This strike just gave the tool its name.`,
};
