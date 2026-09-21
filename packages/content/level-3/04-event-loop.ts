import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s04",
  level: 3,
  order: 4,
  title: "The event loop",

  look: `JavaScript has ONE cook in the kitchen. It can only do one thing at a time. So how can it wait for timers and downloads without freezing? With an ORDER SYSTEM called the event loop.

  1. The cook finishes everything in front of them first (all the normal code, top to bottom). This is the call stack.
  2. Then the cook serves the VIP line: promise callbacks (.then, await). Called the microtask queue. The whole VIP line is emptied first.
  3. Then the cook takes ONE regular order from the normal line: a timer (setTimeout) or a click. Called the task queue.
  4. Back to step 2, and around and around.

Try to predict this, then run it in your head:

  console.log("1");
  setTimeout(() => console.log("2"), 0);       // regular line
  Promise.resolve().then(() => console.log("3")); // VIP line
  console.log("4");

The answer is 1, 4, 3, 2. Sync code first (1, 4), then the VIP line (3), then the regular line (2). Even a timer of 0 milliseconds still waits behind the VIP line!`,

  type: `Finish two functions:
1. schedule(log) must make log receive these messages, in exactly this order: "start", "end", "promise", "timeout". "start" and "end" must happen right away (in the normal code). "promise" must come from a promise .then, and "timeout" from a setTimeout of 0. You cannot simply call log four times in a row: the tests check WHEN each one arrives.
2. predictOrder() returns an array: your prediction of what this program prints (the code is in the starter file). Work it out on paper first!`,

  break: `Break it on purpose: in schedule, move the log("end") line INSIDE the setTimeout.
"end" now arrives last, and the "right away" test fails. Where you put code decides WHEN it runs. Put it back.`,

  say: `In one sentence: in what order does JavaScript run normal code, promise callbacks and timers?`,

  starterCode: `// Strike 4: the event loop.

function schedule(log) {
  // log "start" and "end" now, "promise" from a .then, "timeout" from setTimeout(..., 0)
}

// What does this program print, in order? Write your prediction as an array.
//
//   console.log("A");
//   setTimeout(() => console.log("B"), 0);
//   Promise.resolve().then(() => console.log("C"));
//   console.log("D");
//
function predictOrder() {
  return [];
}
`,

  tests: `test("schedule logs start and end straight away", () => {
  const seen = [];
  schedule((message) => seen.push(message));
  expect(seen).toEqual(["start", "end"]);
});

test("then the promise arrives, and only then the timeout", () => {
  const seen = [];
  schedule((message) => seen.push(message));
  return Promise.resolve()
    .then(() => Promise.resolve())
    .then(() => {
      expect(seen).toEqual(["start", "end", "promise"]);
      return new Promise((resolve) => setTimeout(resolve, 30));
    })
    .then(() => {
      expect(seen).toEqual(["start", "end", "promise", "timeout"]);
    });
});

test("predictOrder is correct", () => {
  expect(predictOrder()).toEqual(["A", "D", "C", "B"]);
});
`,

  hints: [
    'The normal code runs top to bottom: log("start"), then schedule the other two, then log("end"). The scheduling lines do not print anything yet.',
    'Promise.resolve().then(() => log("promise")) puts a callback in the VIP line. setTimeout(() => log("timeout"), 0) puts one in the regular line.',
    "For the prediction: sync lines first (A, D), then the VIP promise line (C), then the timer (B).",
  ],

  solution: `=== CODE ===
function schedule(log) {
  log("start");
  setTimeout(() => log("timeout"), 0);
  Promise.resolve().then(() => log("promise"));
  log("end");
}

function predictOrder() {
  return ["A", "D", "C", "B"];
}
=== LINE BY LINE ===
schedule: log("start") and log("end") are normal code, so they run immediately while schedule is still running. The setTimeout and the .then only REGISTER callbacks, they do not run them yet.
When schedule finishes, the cook empties the VIP line first: the promise callback logs "promise". Only then does the cook take one order from the normal line: the timer logs "timeout". So the order is start, end, promise, timeout, even though we wrote the setTimeout line first.
predictOrder: A and D are normal code (A, D). The promise callback is VIP (C). The 0 ms timer is a regular order and comes last (B). So the answer is A, D, C, B.`,
};
