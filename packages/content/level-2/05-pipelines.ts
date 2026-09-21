import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l2-s05",
  level: 2,
  order: 5,
  title: "Function pipelines (airport security: order matters, short-circuit)",

  look: `Think of airport security. You walk through a line of stations, one after another: check ticket, scan bag, walk through the metal detector. That is a pipeline: a value goes through a line of steps, and each step hands its answer to the next one.

  const trim = (text) => text.trim();
  const shout = (text) => text.toUpperCase();

  let value = "  hi ";
  value = trim(value);    // "hi"
  value = shout(value);   // "HI"

Two big rules of any pipeline:
  1. ORDER MATTERS. Metal detector first, then boarding is not the same as boarding first!
  2. SHORT-CIRCUIT. If a station says STOP (no ticket!), the line ends there. The later stations never even see you.

A helper you will need: three dots in the input list COLLECT extra inputs into an array.

  function countAll(...things) { return things.length; }
  countAll("a", "b", "c")   // 3`,

  type: `Finish two functions:
1. pipe(...steps) takes any number of functions and returns a NEW function. That new function sends a value through every step, in order, left to right. pipe() with no steps just returns the value it was given.
2. firstFailure(checks, person) walks through the security checks in order. Each check looks like { name: "ticket", passes: (person) => ... }. Return the name of the FIRST check that fails, or "cleared" if all pass. Stop at the first failure: later checks must not even run!`,

  break: `Break it on purpose: in firstFailure, keep looping after you find a failure (do not return right away). Run the tests.
The "later checks must not run" test fails. That is short-circuiting: stopping early. Then put the early return back.`,

  say: `In one sentence: why does the order of steps in a pipeline matter, and what does "short-circuit" mean?`,

  starterCode: `// Strike 5: function pipelines.

function pipe(...steps) {
  // return a function that sends a value through every step, left to right
}

function firstFailure(checks, person) {
  // return the name of the first check that fails, or "cleared"
  // stop at the first failure!
}
`,

  tests: `const plusOne = (n) => n + 1;
const timesTwo = (n) => n * 2;

test("pipe runs the steps left to right", () => {
  expect(pipe(plusOne, timesTwo)(3)).toBe(8);
});

test("order matters: swapping the steps changes the answer", () => {
  expect(pipe(timesTwo, plusOne)(3)).toBe(7);
});

test("pipe works with text steps", () => {
  const clean = pipe((text) => text.trim(), (text) => text.toUpperCase());
  expect(clean("  hi ")).toBe("HI");
});

test("pipe with no steps returns the value unchanged", () => {
  expect(pipe()(5)).toBe(5);
});

const hasTicket = { name: "ticket", passes: (person) => person.ticket };
const noLiquids = { name: "liquids", passes: (person) => !person.liquids };

test("firstFailure says cleared when everything passes", () => {
  expect(firstFailure([hasTicket, noLiquids], { ticket: true, liquids: false })).toBe("cleared");
});

test("firstFailure names the first check that fails", () => {
  expect(firstFailure([hasTicket, noLiquids], { ticket: false, liquids: true })).toBe("ticket");
  expect(firstFailure([hasTicket, noLiquids], { ticket: true, liquids: true })).toBe("liquids");
});

test("firstFailure stops early (short-circuit)", () => {
  let laterCalls = 0;
  const spy = { name: "spy", passes: () => { laterCalls = laterCalls + 1; return true; } };
  firstFailure([hasTicket, spy], { ticket: false });
  expect(laterCalls).toBe(0);
});
`,

  hints: [
    "pipe(...steps) must RETURN a function. Inside, that function receives the start value and needs to push it through every step.",
    "reduce is perfect here: steps.reduce((value, step) => step(value), start). The running answer is the value that flows down the line.",
    'firstFailure: use a loop over checks. Inside, if check.passes(person) is false, return check.name right away. After the loop, return "cleared".',
  ],

  solution: `=== CODE ===
function pipe(...steps) {
  return function (start) {
    return steps.reduce((value, step) => step(value), start);
  };
}

function firstFailure(checks, person) {
  for (const check of checks) {
    if (!check.passes(person)) {
      return check.name;
    }
  }
  return "cleared";
}
=== LINE BY LINE ===
pipe: ...steps collects all the functions into an array. We return a new function that waits for a start value. reduce walks down the array: value starts as start, and each step turns the current value into the next one. That is the conveyor belt.
The order is the order of the array, so pipe(plusOne, timesTwo)(3) is (3 + 1) * 2 = 8, but pipe(timesTwo, plusOne)(3) is (3 * 2) + 1 = 7.
With no steps, reduce has nothing to do and simply returns the start value.
firstFailure: a for...of loop visits the checks in order. The first time one fails, "return" ends the whole function immediately, so the remaining checks never run. That is short-circuiting. If the loop finishes, nobody failed, so we say "cleared".`,
};
