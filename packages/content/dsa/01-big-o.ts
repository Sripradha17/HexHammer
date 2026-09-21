import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "dsa-s01",
  level: 0,
  track: "dsa",
  order: 1,
  title: "Big-O",

  look: `In interviews, a working answer is only half the job. The next question is always: "How fast is it when the input gets HUGE?" Big-O is the language for that answer.

Think of finding a friend in a crowd:
  O(1)        constant     you already know where they stand. Same effort for 10 or 10 million people.
  O(log n)    logarithmic  guess the middle, throw away half, repeat. A million people take only about 20 guesses!
  O(n)        linear       check every person once.
  O(n log n)  "n log n"    sorting a crowd by height. The best you can do for general sorting.
  O(n^2)      quadratic    ask every person about every other person. 1,000 people means 1,000,000 questions.

How to read code:
  one statement                          O(1)
  one loop over n items                  O(n)
  a loop INSIDE a loop over n items      O(n^2)
  cutting the problem in half each step  O(log n)

Rules of thumb: ignore small parts (n + 5 is just O(n)) and constants (2n is O(n)). Keep the biggest part.

The big trick of the whole track: trade MEMORY for SPEED. A Set or Map remembers what you have seen, so you avoid the second loop.

Hexhammer stops code that runs over 3 seconds, so a slow O(n^2) answer on the big test will teach you the lesson the hard way.`,

  type: `Two jobs.
1. Fill in the answers object with the Big-O of each snippet in the starter file (write it like O(n) or O(n^2)).
2. Write hasPairWithSum(nums, target): true if two DIFFERENT positions in nums add up to target. The tests use 200,000 numbers, so it must be O(n): use a Set.`,

  break: `Break it on purpose: write hasPairWithSum with a loop inside a loop.
On the 200,000-number test that is about 20 billion checks and Hexhammer stops it after 3 seconds. That is O(n^2) hitting the wall. Switch to a Set.`,

  say: `In one sentence: what does Big-O tell you, and how can a Set or Map turn a slow O(n^2) idea into O(n)?`,

  starterCode: `// DSA 1: Big-O.

// A:  function first(list) { return list[0]; }
// B:  function sum(list) { let t = 0; for (const x of list) { t += x; } return t; }
// C:  function pairs(list) { for (const a of list) { for (const b of list) { check(a, b); } } }
// D:  function search(sorted, target) { /* each step throws away half of the list */ }
// E:  function sorted(list) { return [...list].sort((a, b) => a - b); }

const answers = {
  snippetA: "",
  snippetB: "",
  snippetC: "",
  snippetD: "",
  snippetE: "",
};

function hasPairWithSum(nums, target) {
  // true if two different positions add up to target. Must be O(n)!
}
`,

  tests: `function clean(text) {
  return String(text).toLowerCase().split(" ").join("");
}
function need(what, actual, accepted) {
  if (!accepted.includes(clean(actual))) {
    throw new Error(what + ' (you wrote: "' + String(actual).trim() + '")');
  }
}

test("snippet A", () => {
  need("first(list) just reads one item", answers.snippetA, ["o(1)"]);
});
test("snippet B", () => {
  need("sum(list) has one loop", answers.snippetB, ["o(n)"]);
});
test("snippet C", () => {
  need("pairs(list) has a loop inside a loop", answers.snippetC, ["o(n^2)", "o(n2)", "o(n*n)", "o(n\\u00b2)"]);
});
test("snippet D", () => {
  need("search halves the list each step", answers.snippetD, ["o(logn)", "o(log(n))"]);
});
test("snippet E", () => {
  need("sorting a list", answers.snippetE, ["o(nlogn)", "o(n*logn)", "o(nlog(n))"]);
});

test("hasPairWithSum on small inputs", () => {
  expect(hasPairWithSum([1, 2, 3, 4], 7)).toBe(true);
  expect(hasPairWithSum([1, 2, 3, 4], 8)).toBe(false);
  expect(hasPairWithSum([], 5)).toBe(false);
});

test("hasPairWithSum must not use the same position twice", () => {
  expect(hasPairWithSum([5], 10)).toBe(false);
  expect(hasPairWithSum([5, 5], 10)).toBe(true);
});

test("hasPairWithSum is fast on 200,000 numbers (O(n))", () => {
  const big = Array.from({ length: 200000 }, (_, i) => i);
  expect(hasPairWithSum(big, 399997)).toBe(true);
  expect(hasPairWithSum(big, 399998)).toBe(false);
});
`,

  hints: [
    "Count the loops. No loop is O(1). One loop is O(n). A loop inside a loop is O(n^2). Cutting in half each time is O(log n). Sorting is O(n log n).",
    "hasPairWithSum: for each number x, the partner you need is target - x. Instead of searching for it with a second loop, ask a Set that remembers the numbers you have already passed.",
    "Order matters: check the Set for the partner FIRST, and only then add x to the Set. That way a number is never paired with itself.",
  ],

  solution: `=== CODE ===
const answers = {
  snippetA: "O(1)",
  snippetB: "O(n)",
  snippetC: "O(n^2)",
  snippetD: "O(log n)",
  snippetE: "O(n log n)",
};

function hasPairWithSum(nums, target) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(target - x)) {
      return true;
    }
    seen.add(x);
  }
  return false;
}
=== LINE BY LINE ===
A reads one item: O(1). B visits each item once: O(n). C compares every item with every item: O(n^2). D throws away half each step, like guessing a number by always asking "higher or lower?": O(log n). E is sorting: O(n log n).
hasPairWithSum: the naive way checks every pair, O(n^2). Instead we walk the list once, and for each x we ask "have I already seen the partner target - x?". A Set answers that instantly, so the whole thing is O(n).
We check BEFORE adding x, so a number can never pair with itself. [5] gives false, but [5, 5] gives true because the second 5 finds the first one in the Set.
The price of the speed is memory: the Set can grow to hold n items. Trading memory for speed is the most common trick in interview problems.`,
};
