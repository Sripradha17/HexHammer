import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l1-s06",
  level: 1,
  order: 6,
  title: "Comparison operators",

  look: `Comparison operators ask a question and answer true or false.

  ===  is exactly equal        5 === 5     true
  !==  is not equal            5 !== 6     true
  <    less than               3 < 4       true
  >    greater than            3 > 4       false
  <=   less than or equal      4 <= 4      true
  >=   greater than or equal   4 >= 5      false

Always use three equals (===). It also checks the TYPE, so 5 === "5" is false.
Careful: one = puts a value in a box. Three === asks a question.`,

  type: `Finish three functions:
1. isSame(a, b): true only if a and b are exactly equal (same value AND same type).
2. isBetween(n, low, high): true if n is low, high, or anything in between.
3. isDifferent(a, b): true if a and b are NOT exactly equal.`,

  break: `Break it on purpose: change === to == (two equals) in isSame and run the tests.
The "5 versus text 5" test now fails. Two equals sneaks type changes in. Put three back.`,

  say: `In one sentence: why should you use === instead of ==?`,

  starterCode: `// Strike 6: comparison operators.

function isSame(a, b) {
  // true only if a and b are exactly equal
}

function isBetween(n, low, high) {
  // true if n is from low to high, including both ends
}

function isDifferent(a, b) {
  // true if a and b are NOT exactly equal
}
`,

  tests: `test("isSame(5, 5) is true", () => {
  expect(isSame(5, 5)).toBe(true);
});

test('isSame(5, "5") is false because the types differ', () => {
  expect(isSame(5, "5")).toBe(false);
});

test("isBetween includes both ends", () => {
  expect(isBetween(1, 1, 10)).toBe(true);
  expect(isBetween(10, 1, 10)).toBe(true);
});

test("isBetween works in the middle and outside", () => {
  expect(isBetween(5, 1, 10)).toBe(true);
  expect(isBetween(11, 1, 10)).toBe(false);
  expect(isBetween(0, 1, 10)).toBe(false);
});

test("isDifferent works", () => {
  expect(isDifferent("a", "b")).toBe(true);
  expect(isDifferent("a", "a")).toBe(false);
});
`,

  hints: [
    "All three functions can just return a comparison. A comparison already gives back true or false.",
    "isBetween needs two questions joined with AND: is n big enough, and is n small enough?",
    "For the ends to count, use >= and <= (not > and <). isDifferent uses !==.",
  ],

  solution: `=== CODE ===
function isSame(a, b) {
  return a === b;
}

function isBetween(n, low, high) {
  return n >= low && n <= high;
}

function isDifferent(a, b) {
  return a !== b;
}
=== LINE BY LINE ===
isSame: === compares value and type, gives true or false, and we return that answer.
isBetween: "n >= low" asks "is n at least low?" and "n <= high" asks "is n at most high?". && needs both to be true. Using >= and <= (not > and <) is what lets the two ends count.
isDifferent: !== is the opposite of ===.`,
};
