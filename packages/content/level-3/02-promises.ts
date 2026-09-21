import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s02",
  level: 3,
  order: 2,
  title: "Async: promises",

  look: `A promise is an IOU note: "I do not have your answer yet, but I promise to give it to you (or tell you why I could not)."

A promise is always in one of three states:
  pending    still waiting
  fulfilled  it worked, here is the value
  rejected   it failed, here is the error

You make one with new Promise, and you use it with .then (success) and .catch (failure):

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("pizza!"), 100);   // resolve = "it worked"
  });

  promise
    .then((food) => food + " with cheese")      // each .then gets the last answer
    .then((meal) => console.log(meal))
    .catch((error) => console.log("oops"));     // any failure lands here

Promise.all([p1, p2, p3]) waits for ALL of them and gives you an array of answers, in order. Everyone runs at the same time, so it is fast.`,

  type: `Finish four functions. All of them return promises:
1. wait(ms, value) returns a promise that resolves with value after ms milliseconds.
2. doubleAfterWait(n) returns a promise that resolves with n * 2 after a short wait. Build it with .then.
3. allDoubled(nums) returns a promise of an array with every number doubled. Use Promise.all with doubleAfterWait.
4. withFallback(promise, fallback) returns a promise that gives the promise's value, or the fallback value if the promise fails (rejects).`,

  break: `Break it on purpose: in wait, call reject instead of resolve (or forget to call resolve at all).
A promise that never resolves just hangs forever, and the test says "nothing happened" after a second. Always make sure every path calls resolve or reject.`,

  say: `In one sentence: what is a promise, and what are its three states?`,

  starterCode: `// Strike 2: promises.

function wait(ms, value) {
  // return a promise that resolves with value after ms milliseconds
}

function doubleAfterWait(n) {
  // return a promise that resolves with n * 2 (use wait and .then)
}

function allDoubled(nums) {
  // return a promise of every number doubled (use Promise.all)
}

function withFallback(promise, fallback) {
  // value if it works, fallback if it fails
}
`,

  tests: `test("wait resolves with the value", () =>
  wait(10, "hi").then((value) => expect(value).toBe("hi")));

test("wait really waits", () => {
  const start = Date.now();
  return wait(40, "x").then(() => {
    const waited = Date.now() - start;
    if (waited < 30) { throw new Error("wait finished after only " + waited + " ms"); }
  });
});

test("doubleAfterWait doubles the number", () =>
  doubleAfterWait(21).then((value) => expect(value).toBe(42)));

test("allDoubled doubles every number and keeps the order", () =>
  allDoubled([1, 2, 3]).then((values) => expect(values).toEqual([2, 4, 6])));

test("allDoubled of an empty array gives an empty array", () =>
  allDoubled([]).then((values) => expect(values).toEqual([])));

test("withFallback keeps a good value", () =>
  withFallback(Promise.resolve("good"), "backup").then((value) => expect(value).toBe("good")));

test("withFallback uses the fallback when the promise fails", () => {
  const failing = Promise.reject(new Error("boom"));
  failing.catch(() => {}); // so an unfinished withFallback never leaves a loose, unhandled failure
  return withFallback(failing, "backup").then((value) => expect(value).toBe("backup"));
});
`,

  hints: [
    "wait: return new Promise((resolve) => { setTimeout(() => resolve(value), ms); });",
    "doubleAfterWait: wait(10, n) gives a promise of n. Chain .then((value) => value * 2) to change the answer. allDoubled: Promise.all(nums.map(doubleAfterWait)).",
    "withFallback: a promise has .catch. promise.catch(() => fallback) turns a failure into the fallback value.",
  ],

  solution: `=== CODE ===
function wait(ms, value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

function doubleAfterWait(n) {
  return wait(10, n).then((value) => value * 2);
}

function allDoubled(nums) {
  return Promise.all(nums.map((n) => doubleAfterWait(n)));
}

function withFallback(promise, fallback) {
  return promise.catch(() => fallback);
}
=== LINE BY LINE ===
wait: new Promise gives us two buttons, resolve and reject. We press resolve after the timer, and the value travels to whoever used .then.
doubleAfterWait: .then returns a NEW promise holding whatever the function returns. So wait(10, n) is a promise of n, and .then(v => v * 2) is a promise of n * 2.
allDoubled: nums.map makes an array of promises (all started together). Promise.all turns "an array of promises" into "one promise of an array", and keeps the order.
withFallback: .catch runs only when the promise failed. Whatever it returns becomes the new success value, so the caller never sees the failure.`,
};
