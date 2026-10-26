import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "prof-s04",
  level: 0,
  track: "professional",
  order: 4,
  title: "A debugging method",

  look: `Guessing at a fix wastes time. A real method: read the failing test's message CLOSELY (it usually tells you exactly what was expected versus what you got), then check ONE concrete example BY HAND before changing any code at all.

  lastN([1, 2, 3, 4, 5], 2) should be [4, 5]

Work it out on paper first: items.length is 5, n is 2, so the slice should start at index 5 - 2 = 3, giving [4, 5]. NOW look at what the actual code computes for that same example, and compare. The gap between "what it should compute" and "what it actually computes" IS the bug — usually an off-by-one, once you have done this by hand.`,

  type: `Fix lastN(items, n) so it returns exactly the last n items, in original order. Use the method: work out items.length - n by hand for the example above (5 items, n=2, should start at index 3) BEFORE you change any code, then compare that to what the current code computes.`,

  break: `Break it on purpose, a DIFFERENT off-by-one, to practice the method again: change the start index to items.length - n + 1. Work out by hand, for the SAME example (5 items, n=2), what index that computes, before you even run the tests — does it still land on 3?`,

  say: `In one sentence: why does working out ONE concrete example by hand, before touching the code, help you find an off-by-one bug faster than just staring at the code?`,

  starterCode: `// Strike 4: a debugging method.
// Returns the last n items of an array, in original order.
// lastN([1, 2, 3, 4, 5], 2) should be [4, 5].

function lastN(items, n) {
  return items.slice(items.length - n - 1); // has a real, subtle off-by-one bug
}
`,

  tests: `test("lastN of [1,2,3,4,5] with n=2 is [4,5]", () => {
  expect(lastN([1, 2, 3, 4, 5], 2)).toEqual([4, 5]);
});

test("lastN of [1,2,3] with n=1 is [3]", () => {
  expect(lastN([1, 2, 3], 1)).toEqual([3]);
});

test("lastN with n equal to the whole array returns everything, in order", () => {
  expect(lastN([1, 2, 3], 3)).toEqual([1, 2, 3]);
});
`,

  hints: [
    "Work it out by hand first: for [1,2,3,4,5] with n=2, items.length - n is 5 - 2 = 3. items.slice(3) should be the answer.",
    "Compare that to what the CURRENT code computes: items.length - n - 1 = 5 - 2 - 1 = 2, one index too early. That extra - 1 is the bug.",
    "return items.slice(items.length - n);",
  ],

  solution: `=== CODE ===
function lastN(items, n) {
  return items.slice(items.length - n);
}
=== LINE BY LINE ===
items.length - n is the correct start index: for 5 items and n=2, that is index 3, and items.slice(3) correctly returns the last 2 items.
The original code's extra - 1 shifted the start index one place too early every single time, silently including one extra item at the front of the result — the exact kind of bug that working the example out by hand, before touching the code, catches immediately.
This is the whole method, generalized: read the failing test's exact expected-vs-actual values, pick ONE concrete example, work out by hand what the code SHOULD compute, then compare that to what it ACTUALLY computes. The gap is the bug.`,
};
