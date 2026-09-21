import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "dsa-s08",
  level: 0,
  track: "dsa",
  order: 8,
  title: "Recursion and backtracking",

  look: `You met recursion in Level 2 (a function calling itself on a smaller problem). BACKTRACKING is recursion used to try EVERY possibility, like walking through a maze: at each fork you pick a path, follow it, and if it is a dead end (or you have finished it) you step back and try the next path.

The recipe has three moves, over and over:

  1. CHOOSE    add one option to what you have built so far
  2. EXPLORE   recurse to keep building
  3. UNCHOOSE  remove that option (backtrack!) and try the next one

  function build(current) {
    if (/* current is a complete answer */) {
      results.push([...current]);      // save a COPY, because current keeps changing!
      return;
    }
    for (const option of options) {
      current.push(option);            // choose
      build(current);                  // explore
      current.pop();                   // unchoose
    }
  }

Two things to remember:
  Save a COPY of the answer ([...current]), not current itself, because you keep changing it afterwards.
  The number of answers explodes: 10 items have 1,024 subsets and 3,628,800 permutations. Backtracking is slow by nature (exponential), so interviews keep the inputs tiny.

Example, all subsets of [1, 2]: at each item you have two choices, take it or skip it.
  []  [1]  [2]  [1,2]`,

  type: `Solve three problems. The ORDER of the answers does not matter (the tests sort them), but there must be no duplicates and nothing missing:
1. subsets(nums) returns every subset of nums (including the empty one and the whole list). nums has no duplicates. [1,2,3] has 8 subsets.
2. permutations(nums) returns every ordering of nums. nums has no duplicates. [1,2,3] has 6 permutations.
3. generateParentheses(n) returns every string of n pairs of correctly matched brackets. n = 3 gives "((()))", "(()())", "(())()", "()(())", "()()()".`,

  break: `Break it on purpose: in subsets, push current (not a copy) into the results.
Every saved answer is the SAME array, which ends up empty after all the backtracking. Always save [...current].`,

  say: `In one sentence: what are the three moves of backtracking, and why must you save a copy of the answer?`,

  starterCode: `// DSA 8: recursion and backtracking.

function subsets(nums) {
  // every subset, including [] and the full list
}

function permutations(nums) {
  // every ordering
}

function generateParentheses(n) {
  // every valid string of n bracket pairs
}
`,

  tests: `function same(actual, expected) {
  const a = actual.map((item) => JSON.stringify(item)).sort();
  const b = expected.map((item) => JSON.stringify(item)).sort();
  expect(a).toEqual(b);
}

test("subsets of [1, 2, 3]", () => {
  same(subsets([1, 2, 3]), [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]]);
});

test("subsets of tiny lists", () => {
  same(subsets([]), [[]]);
  same(subsets([5]), [[], [5]]);
});

test("subsets of 12 numbers has 4096 subsets", () => {
  expect(subsets([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).length).toBe(4096);
});

test("permutations of [1, 2, 3]", () => {
  same(permutations([1, 2, 3]), [
    [1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1],
  ]);
});

test("permutations of tiny and bigger lists", () => {
  same(permutations([]), [[]]);
  same(permutations([7]), [[7]]);
  expect(permutations([1, 2, 3, 4, 5, 6, 7]).length).toBe(5040);
});

test("generateParentheses", () => {
  expect(generateParentheses(3).sort()).toEqual(["((()))", "(()())", "(())()", "()(())", "()()()"]);
  expect(generateParentheses(1)).toEqual(["()"]);
  expect(generateParentheses(0)).toEqual([""]);
  expect(generateParentheses(8).length).toBe(1430);
});
`,

  hints: [
    "subsets: a helper build(position, current). If position is past the end, save [...current]. Otherwise there are two branches: skip nums[position], or push it, recurse, and pop it.",
    "permutations: build(current) with a used[] array. If current has as many items as nums, save a copy. Otherwise loop over every index that is not used yet: mark it used, push, recurse, unmark, pop.",
    'generateParentheses: build(text, open, close). If text has 2n characters, save it. You may add "(" while open < n. You may add ")" while close < open (never close more than you opened).',
  ],

  solution: `=== CODE ===
function subsets(nums) {
  const results = [];
  const current = [];
  function build(position) {
    if (position === nums.length) {
      results.push([...current]);
      return;
    }
    build(position + 1);
    current.push(nums[position]);
    build(position + 1);
    current.pop();
  }
  build(0);
  return results;
}

function permutations(nums) {
  const results = [];
  const current = [];
  const used = new Array(nums.length).fill(false);
  function build() {
    if (current.length === nums.length) {
      results.push([...current]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) {
        continue;
      }
      used[i] = true;
      current.push(nums[i]);
      build();
      current.pop();
      used[i] = false;
    }
  }
  build();
  return results;
}

function generateParentheses(n) {
  const results = [];
  function build(text, open, close) {
    if (text.length === 2 * n) {
      results.push(text);
      return;
    }
    if (open < n) {
      build(text + "(", open + 1, close);
    }
    if (close < open) {
      build(text + ")", open, close + 1);
    }
  }
  build("", 0, 0);
  return results;
}
=== LINE BY LINE ===
subsets: at every position we have two branches: SKIP the number, or TAKE it. Taking means push, explore, then pop (the backtrack). When we run out of positions the current pile is one finished subset, so we save a COPY. There are 2 choices for each of n numbers, so 2^n subsets.
permutations: used[] remembers which numbers are already in the current ordering. At each level we try every unused number: mark, push, recurse, then undo both (pop and unmark) so the next number gets a fresh start. There are n! orderings.
generateParentheses: instead of building every string and checking it, we only ever add a bracket that keeps the string valid: an open bracket while we have some left, and a close bracket only while there is an unclosed open one. Rules that stop bad branches early are called pruning, and they are what makes backtracking practical.`,
};
