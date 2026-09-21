import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "dsa-s13",
  level: 0,
  track: "dsa",
  order: 13,
  title: "Dynamic programming basics",

  look: `Dynamic programming (DP) sounds fancy, but the idea is simple: DO NOT SOLVE THE SAME LITTLE PROBLEM TWICE. Solve each small problem once, write the answer down, and reuse it.

Think of climbing stairs when you can take 1 or 2 steps at a time. How many ways to reach step 5? To arrive at step 5 you came from step 4 (took 1 step) or step 3 (took 2 steps). So:

  ways(5) = ways(4) + ways(3)

That is the fibonacci pattern! But if you compute it by pure recursion, ways(3) gets computed again and again, and the work EXPLODES (fib(50) would take days).

Two cures. Both remember answers:

  MEMOIZATION (top-down)   keep the recursion, but check a notebook first:
      if (notebook.has(n)) { return notebook.get(n); }
  TABULATION (bottom-up)   no recursion. Fill a table from the smallest case upward:
      table[0] = 1; table[1] = 1; for (i = 2 ...) table[i] = table[i-1] + table[i-2]

How to spot a DP problem:
  1. You are asked for a count, a minimum, a maximum, or "is it possible".
  2. The big answer is built from answers to smaller versions of the SAME question.
  3. Smaller versions repeat (overlap).

Recipe: (1) say what "the answer for size i" means, (2) find how it comes from smaller sizes, (3) find the starting cases, (4) fill in order.

Example, fewest coins: best[amount] = 1 + the smallest best[amount - coin] over every coin that fits.`,

  type: `Solve three problems (tests use numbers where the slow pure-recursion way would never finish):
1. fib(n) returns the n-th fibonacci number: fib(0) = 0, fib(1) = 1, fib(2) = 1, fib(3) = 2 ... n is at most 70.
2. climbStairs(n) is the number of different ways to climb n steps taking 1 or 2 steps at a time. climbStairs(1) = 1, climbStairs(2) = 2, climbStairs(3) = 3. n is at most 70.
3. coinChange(coins, amount) is the FEWEST coins that add up to exactly amount (you may use each coin as often as you like). Return -1 if it cannot be done. amount 0 needs 0 coins.`,

  break: `Break it on purpose: write fib with pure recursion and no notebook: return fib(n - 1) + fib(n - 2).
It works for fib(10), but fib(50) would need trillions of calls, and Hexhammer stops it after 3 seconds. Add a Map notebook (or a table) and it finishes instantly.`,

  say: `In one sentence: what problem does dynamic programming avoid, and what are the two ways of remembering answers?`,

  starterCode: `// DSA 13: dynamic programming basics.

function fib(n) {
  // fib(0)=0, fib(1)=1, fib(2)=1 ... remember answers!
}

function climbStairs(n) {
  // ways to climb n steps using 1 or 2 steps at a time
}

function coinChange(coins, amount) {
  // fewest coins to make amount, or -1
}
`,

  tests: `test("fib small values", () => {
  expect(fib(0)).toBe(0);
  expect(fib(1)).toBe(1);
  expect(fib(2)).toBe(1);
  expect(fib(10)).toBe(55);
});

test("fib of big numbers is instant", () => {
  expect(fib(50)).toBe(12586269025);
  expect(fib(70)).toBe(190392490709135);
});

test("climbStairs", () => {
  expect(climbStairs(1)).toBe(1);
  expect(climbStairs(2)).toBe(2);
  expect(climbStairs(3)).toBe(3);
  expect(climbStairs(5)).toBe(8);
  expect(climbStairs(45)).toBe(1836311903);
});

test("coinChange finds the fewest coins", () => {
  expect(coinChange([1, 2, 5], 11)).toBe(3);
  expect(coinChange([1, 3, 4], 6)).toBe(2);
  expect(coinChange([5, 10], 20)).toBe(2);
});

test("coinChange when it cannot be done, or needs nothing", () => {
  expect(coinChange([2], 3)).toBe(-1);
  expect(coinChange([1], 0)).toBe(0);
  expect(coinChange([], 5)).toBe(-1);
});

test("coinChange is fast for a big amount", () => {
  expect(coinChange([1, 5, 10, 25, 50], 20000)).toBe(400);
  expect(coinChange([186, 419, 83, 408], 6249)).toBe(20);
});
`,

  hints: [
    "fib: keep a table (an array) or two variables. Start with fib(0) = 0 and fib(1) = 1. Then each new value is the previous two added. A loop from 2 up to n is enough, no recursion needed.",
    "climbStairs: the ways to reach step n are the ways to reach n - 1 plus the ways to reach n - 2. It is the same pattern as fib, but with ways(0) = 1 and ways(1) = 1.",
    "coinChange: best is an array of size amount + 1. best[0] = 0, the rest start at Infinity (impossible so far). For each amount from 1 up, try every coin that is not bigger than the amount: best[a] = Math.min(best[a], best[a - coin] + 1). At the end, Infinity means -1.",
  ],

  solution: `=== CODE ===
function fib(n) {
  if (n < 2) {
    return n;
  }
  let previous = 0;
  let current = 1;
  for (let i = 2; i <= n; i++) {
    const next = previous + current;
    previous = current;
    current = next;
  }
  return current;
}

function climbStairs(n) {
  let waysToPrevious = 1;
  let waysToCurrent = 1;
  for (let step = 2; step <= n; step++) {
    const waysToNext = waysToPrevious + waysToCurrent;
    waysToPrevious = waysToCurrent;
    waysToCurrent = waysToNext;
  }
  return waysToCurrent;
}

function coinChange(coins, amount) {
  const best = new Array(amount + 1).fill(Infinity);
  best[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) {
        best[a] = Math.min(best[a], best[a - coin] + 1);
      }
    }
  }
  return best[amount] === Infinity ? -1 : best[amount];
}
=== LINE BY LINE ===
fib: this is TABULATION with the smallest possible table. Every fibonacci number only needs the two before it, so we keep just those two numbers and slide them forward. O(n) time and O(1) memory, instead of the exponential blow-up of plain recursion.
climbStairs: to land on step n you came from step n-1 or n-2, so ways(n) = ways(n-1) + ways(n-2). Same shape as fib, only the starting cases differ (one way to stand at the bottom, one way to reach step 1).
coinChange: best[a] means "the fewest coins that make amount a". For each amount we try every coin: if we use that coin, the rest is amount a - coin, which we already solved (smaller amounts come first). Infinity means "not possible so far", and 1 + Infinity stays Infinity, so impossible amounts spread correctly. O(amount * number of coins).
The greedy idea (always take the biggest coin) fails here: for coins [1, 3, 4] and amount 6, greedy takes 4 + 1 + 1 (3 coins), but 3 + 3 is only 2. DP tries every option, so it is always right.`,
};
