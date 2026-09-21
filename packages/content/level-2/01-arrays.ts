import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l2-s01",
  level: 2,
  order: 1,
  title: "Arrays and methods (map, filter, reduce)",

  look: `An array is a row of numbered boxes. The numbers start at 0.

  const fruits = ["apple", "pear", "plum"];
  fruits[0]      // "apple"
  fruits.length  // 3

Three helper machines work on the WHOLE row at once. Picture a fruit factory conveyor belt:

  map     changes every item, and gives back a NEW row     (the peeler)
  filter  keeps only the items that pass a test            (throws out bad fruit)
  reduce  squashes the whole row into ONE value            (makes one glass of juice)

  [1, 2, 3].map(n => n * 10)                   // [10, 20, 30]
  [1, 2, 3, 4].filter(n => n > 2)              // [3, 4]
  [1, 2, 3].reduce((sum, n) => sum + n, 0)     // 6

The original row is never changed. You always get something new back.`,

  type: `Finish three functions:
1. doubleAll(nums) returns a NEW array with every number doubled.
2. onlyEven(nums) returns only the even numbers (n % 2 === 0).
3. total(nums) returns all the numbers added together. An empty array gives 0.`,

  break: `Break it on purpose: in total, delete the starting 0 (the second input of reduce), then run the tests.
total([]) now crashes, because reduce has nothing to start with. Read the message, then put the 0 back.`,

  say: `In one sentence: what is the difference between map, filter and reduce?`,

  starterCode: `// Strike 1: map, filter and reduce.

function doubleAll(nums) {
  // return a new array with every number doubled
}

function onlyEven(nums) {
  // return only the even numbers
}

function total(nums) {
  // return every number added together (0 for an empty array)
}
`,

  tests: `test("doubleAll doubles every number", () => {
  expect(doubleAll([1, 2, 3])).toEqual([2, 4, 6]);
  expect(doubleAll([])).toEqual([]);
});

test("doubleAll does not change the original array", () => {
  const original = [1, 2];
  doubleAll(original);
  expect(original).toEqual([1, 2]);
});

test("onlyEven keeps the even numbers", () => {
  expect(onlyEven([1, 2, 3, 4, 5, 6])).toEqual([2, 4, 6]);
  expect(onlyEven([1, 3])).toEqual([]);
});

test("total adds everything up", () => {
  expect(total([1, 2, 3, 4])).toBe(10);
});

test("total of an empty array is 0", () => {
  expect(total([])).toBe(0);
});
`,

  hints: [
    "Each function is one line: take the array, call the right method on it, and return the answer.",
    "map and filter both take a small function. map's function returns the NEW value. filter's function returns true (keep) or false (throw away).",
    "reduce takes two things: a function (sum, n) => ... and a starting value. The starting value for adding is 0.",
  ],

  solution: `=== CODE ===
function doubleAll(nums) {
  return nums.map((n) => n * 2);
}

function onlyEven(nums) {
  return nums.filter((n) => n % 2 === 0);
}

function total(nums) {
  return nums.reduce((sum, n) => sum + n, 0);
}
=== LINE BY LINE ===
doubleAll: map runs the little function on EVERY item and collects the answers in a new array. (n) => n * 2 means "given n, give back n times 2".
onlyEven: filter runs the little function on every item. If it returns true the item stays, if false it is dropped. n % 2 === 0 is true for even numbers.
total: reduce keeps a running answer called sum. It starts at 0 (the second input). For every n it does sum + n and the result becomes the new sum. At the end it hands back the final sum.
None of these change the original array. map, filter and reduce always build something new.`,
};
