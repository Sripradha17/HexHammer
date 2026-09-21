import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "dsa-s09",
  level: 0,
  track: "dsa",
  order: 9,
  title: "Binary search",

  look: `Binary search is the "higher or lower" guessing game. Someone thinks of a number from 1 to 1,000,000. You always guess the MIDDLE. They say "higher" or "lower", and you throw away half. In about 20 guesses you find it. That is O(log n): the giant list becomes tiny very fast.

It ONLY works when the list is SORTED, because sorting is what lets you say "everything to the left is too small".

  let low = 0;
  let high = list.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (list[middle] === target) { return middle; }
    if (list[middle] < target) { low = middle + 1; }    // target is in the right half
    else { high = middle - 1; }                          // target is in the left half
  }
  return -1;

The small details cause the famous bugs: <= or <, middle + 1 or middle, high = middle - 1 or high = middle. Always test tiny lists (empty, one item, two items).

Beyond finding a value: binary search also finds the FIRST position where something becomes true. Picture a row of light switches that are all OFF up to some point and ON after it. Binary search finds where they flip. This "first true" shape solves many problems, like:
  "the first index with value at least target" (called lower bound)
  "the square root of a number" (the biggest whole number whose square is not too big)`,

  type: `Solve three problems (no built-in searching allowed: use binary search so it stays O(log n)):
1. binarySearch(sorted, target) returns the position of target in the sorted array, or -1 if it is not there.
2. firstAtLeast(sorted, target) returns the position of the FIRST item that is greater than or equal to target. If every item is smaller, return the array's length. This is the "lower bound".
3. integerSqrt(n) returns the whole-number square root of n, rounded down (for example 8 gives 2). Use binary search on the answer, and do NOT use Math.sqrt.`,

  break: `Break it on purpose: in binarySearch, write while (low < high) instead of while (low <= high).
The search stops one step too early and misses items that sit at the very last spot, like the only item in a one-item list. Test tiny lists!`,

  say: `In one sentence: why must the list be sorted for binary search, and how many steps does it take on a million items?`,

  starterCode: `// DSA 9: binary search.

function binarySearch(sorted, target) {
  // position of target, or -1
}

function firstAtLeast(sorted, target) {
  // first position whose item is >= target (or sorted.length)
}

function integerSqrt(n) {
  // biggest whole number whose square is <= n. Do not use Math.sqrt
}
`,

  tests: `test("binarySearch finds items", () => {
  expect(binarySearch([1, 3, 5, 7, 9], 7)).toBe(3);
  expect(binarySearch([1, 3, 5, 7, 9], 1)).toBe(0);
  expect(binarySearch([1, 3, 5, 7, 9], 9)).toBe(4);
});

test("binarySearch when it is missing", () => {
  expect(binarySearch([1, 3, 5], 4)).toBe(-1);
  expect(binarySearch([1, 3, 5], 0)).toBe(-1);
  expect(binarySearch([1, 3, 5], 6)).toBe(-1);
  expect(binarySearch([], 1)).toBe(-1);
});

test("binarySearch on tiny lists", () => {
  expect(binarySearch([4], 4)).toBe(0);
  expect(binarySearch([4], 5)).toBe(-1);
  expect(binarySearch([2, 4], 4)).toBe(1);
});

test("firstAtLeast finds the lower bound", () => {
  expect(firstAtLeast([1, 3, 3, 3, 8], 3)).toBe(1);
  expect(firstAtLeast([1, 3, 5, 7], 4)).toBe(2);
  expect(firstAtLeast([1, 3, 5, 7], 0)).toBe(0);
});

test("firstAtLeast when every item is smaller", () => {
  expect(firstAtLeast([1, 2, 3], 10)).toBe(3);
  expect(firstAtLeast([], 1)).toBe(0);
});

test("integerSqrt rounds down", () => {
  expect(integerSqrt(0)).toBe(0);
  expect(integerSqrt(1)).toBe(1);
  expect(integerSqrt(8)).toBe(2);
  expect(integerSqrt(16)).toBe(4);
  expect(integerSqrt(2147395599)).toBe(46339);
  expect(integerSqrt(2147395600)).toBe(46340);
});

test("binarySearch really is O(log n): 20,000 searches in 1,000,000 items", () => {
  const big = Array.from({ length: 1000000 }, (_, i) => i * 2);
  for (let i = 0; i < 20000; i++) {
    if (binarySearch(big, i * 100) !== i * 50) { throw new Error("Wrong answer for " + i * 100); }
  }
  expect(binarySearch(big, 1999999)).toBe(-1);
});
`,

  hints: [
    "binarySearch: low = 0, high = last position. While low <= high: middle = Math.floor((low + high) / 2). Found: return middle. Item too small: low = middle + 1. Otherwise: high = middle - 1.",
    "firstAtLeast: low = 0, high = sorted.length (one past the end is a valid answer). While low < high: middle. If sorted[middle] < target, the answer is to the right, so low = middle + 1. Otherwise it could be middle itself, so high = middle. Return low.",
    "integerSqrt: the answer is somewhere from 0 to n. Search for the biggest number m where m * m <= n. If middle * middle <= n, remember middle and look right (low = middle + 1). Otherwise look left (high = middle - 1).",
  ],

  solution: `=== CODE ===
function binarySearch(sorted, target) {
  let low = 0;
  let high = sorted.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (sorted[middle] === target) {
      return middle;
    } else if (sorted[middle] < target) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return -1;
}

function firstAtLeast(sorted, target) {
  let low = 0;
  let high = sorted.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (sorted[middle] < target) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return low;
}

function integerSqrt(n) {
  let low = 0;
  let high = n;
  let answer = 0;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (middle * middle <= n) {
      answer = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return answer;
}
=== LINE BY LINE ===
binarySearch: low and high are the edges of what is still possible. The middle item either is the target, or tells us which half to throw away. low <= high keeps a one-item search space alive. Each step halves the space, so it takes about log2(n) steps.
firstAtLeast: this is the "light switch" version. Everything below the answer is too small, everything from the answer on is big enough. When the middle is too small the answer must be to its right (middle + 1). Otherwise the middle could BE the answer, so we keep it (high = middle). low < high stops when both edges meet on the answer. high starts at length so "nothing is big enough" gives length.
integerSqrt: "is middle * middle <= n?" is true for small numbers and false for big ones, like the light switches. We want the LAST true one. Each time it is true we remember it and look for a bigger one on the right. No Math.sqrt needed, and it takes about 31 steps even for a number near two billion.`,
};
