import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l2-s14",
  level: 2,
  order: 14,
  title: "Big-O intro",

  look: `Big-O answers one question: "If my pile of stuff gets bigger, how much slower does my code get?"

Imagine a stack of name cards and you need to find "Sam":

  O(1)   constant   grab the top card. Same effort for 10 cards or 10 million.
  O(n)   linear     look through every card one by one. Twice the cards, twice the work.
  O(n²)  quadratic  compare EVERY card with EVERY other card. Twice the cards, FOUR times the work. Ouch!

  for (const a of cards) { }                                  // O(n)
  for (const a of cards) { for (const b of cards) { } }       // O(n²)  a loop inside a loop

Tricks that make code faster:
  A formula instead of a loop:  1 + 2 + ... + n  is just  n * (n + 1) / 2   (no looping at all!)
  A Set for remembering things: set.has(x) is instant, like a coat-check ticket.
  Stop early: if you found the answer, return right away.

Hexhammer stops any code that runs longer than 3 seconds. Slow code will hit that wall, which is a great teacher.`,

  type: `Finish three functions:
1. sumFormula(n) returns 1 + 2 + ... + n WITHOUT a loop, using the formula n * (n + 1) / 2.
2. hasDuplicate(list) returns true if any item appears twice. It must be FAST: the tests give it 200,000 items. Use a Set.
3. findFirstEven(nums) returns the first even number, or -1 if there is none. Stop as soon as you find it.`,

  break: `Break it on purpose: write hasDuplicate the slow way, with a loop inside a loop comparing every pair.
On the 200,000-item test that is about 40 billion comparisons. Hexhammer stops your code after 3 seconds. That is O(n squared) hitting the wall! Switch to a Set.`,

  say: `In one sentence: what does Big-O tell you, and why is a loop inside a loop dangerous for big inputs?`,

  starterCode: `// Strike 14: Big-O.

function sumFormula(n) {
  // 1 + 2 + ... + n, using a formula and no loop
}

function hasDuplicate(list) {
  // true if any item appears twice. Must be fast (use a Set)
}

function findFirstEven(nums) {
  // the first even number, or -1. Stop as soon as you find one
}
`,

  tests: `test("sumFormula adds 1 to n", () => {
  expect(sumFormula(10)).toBe(55);
  expect(sumFormula(100000)).toBe(5000050000);
});

test("findFirstEven finds the first even number", () => {
  expect(findFirstEven([1, 3, 4, 6])).toBe(4);
});

test("findFirstEven returns -1 when there is none", () => {
  expect(findFirstEven([1, 3, 5])).toBe(-1);
  expect(findFirstEven([])).toBe(-1);
});

test("hasDuplicate on small lists", () => {
  expect(hasDuplicate([1, 2, 3, 1])).toBe(true);
  expect(hasDuplicate([1, 2, 3])).toBe(false);
  expect(hasDuplicate([])).toBe(false);
});

test("hasDuplicate is fast on 200,000 items (no double loops!)", () => {
  const big = Array.from({ length: 200000 }, (_, index) => index);
  expect(hasDuplicate(big)).toBe(false);
  expect(hasDuplicate(big.concat([5]))).toBe(true);
});
`,

  hints: [
    "sumFormula is one line: return n * (n + 1) / 2;",
    "findFirstEven: loop through the numbers. The moment one is even (n % 2 === 0), return it. After the loop, return -1.",
    "hasDuplicate: make const seen = new Set(). Loop over the list. If seen.has(item) return true, otherwise seen.add(item). After the loop return false.",
  ],

  solution: `=== CODE ===
function sumFormula(n) {
  return (n * (n + 1)) / 2;
}

function hasDuplicate(list) {
  const seen = new Set();
  for (const item of list) {
    if (seen.has(item)) {
      return true;
    }
    seen.add(item);
  }
  return false;
}

function findFirstEven(nums) {
  for (const n of nums) {
    if (n % 2 === 0) {
      return n;
    }
  }
  return -1;
}
=== LINE BY LINE ===
sumFormula: the trick is pairing the first and last numbers (1 + n, 2 + (n - 1), ...). There are n / 2 pairs each worth n + 1. So the total is n * (n + 1) / 2. No loop means O(1): the same tiny effort for any n.
hasDuplicate: a Set is a bag that remembers what you put in and can answer "have I seen this?" instantly. One pass over the list, one quick question per item: that is O(n). The slow way (a loop inside a loop) would be O(n squared).
findFirstEven: return ends the function the moment we find one, so we do not check the rest. In the best case that is a single look. We only return -1 after checking everything.`,
};
