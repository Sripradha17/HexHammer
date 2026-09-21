import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "dsa-s05",
  level: 0,
  track: "dsa",
  order: 5,
  title: "Sliding window",

  look: `A sliding window is a frame you slide along a list, one step at a time, always looking at just the items INSIDE the frame. Picture looking out of a train window: the view changes a little bit at a time, and you never re-look at the whole landscape.

The big idea: when the window moves one step, do not recompute everything. Just ADD the new item that enters on the right and SUBTRACT the item that leaves on the left.

  Sum of any 3 in a row, sliding along [2, 1, 5, 1, 3, 2]:
    window [2,1,5] = 8
    slide:  add 1, remove 2  ->  7        (no need to add three numbers again)
    slide:  add 3, remove 1  ->  9
    slide:  add 2, remove 5  ->  6

Two kinds of window:
  FIXED SIZE     always k items wide
  GROWING/SHRINKING   the right edge moves on to grow it. When it breaks a rule, the left edge moves on to shrink it.

  let left = 0;
  for (let right = 0; right < list.length; right++) {
    // add list[right] to the window
    while (/* the window is no longer allowed */) {
      // remove list[left] from the window
      left++;
    }
    // now the window is valid: use it
  }

Each item enters once and leaves once, so it is O(n) even though there is a loop inside a loop.`,

  type: `Solve three problems:
1. maxSumOfSize(nums, k) is the biggest sum of any k numbers in a row. If k is bigger than the list (or the list is empty), return 0.
2. longestUniqueSubstring(text) is the length of the longest stretch of characters with NO repeated character. "abcabcbb" gives 3 ("abc"). Empty text gives 0.
3. minSubarrayLen(target, nums) is the length of the SHORTEST stretch whose sum is at least target. All numbers are positive. If no stretch works, return 0.
All of them must be O(n): the tests use 200,000 items.`,

  break: `Break it on purpose: in maxSumOfSize, add up the k numbers from scratch for every window (a loop inside the loop).
It gives the right answer but takes O(n * k) time. On the big test Hexhammer stops it after 3 seconds. Slide instead: add the new item, subtract the old one.`,

  say: `In one sentence: what does a sliding window save you from doing again and again?`,

  starterCode: `// DSA 5: sliding window.

function maxSumOfSize(nums, k) {
  // biggest sum of k numbers in a row (0 if k > length)
}

function longestUniqueSubstring(text) {
  // length of the longest stretch with no repeated character
}

function minSubarrayLen(target, nums) {
  // shortest stretch with sum >= target (all positive), or 0
}
`,

  tests: `test("maxSumOfSize finds the best window", () => {
  expect(maxSumOfSize([2, 1, 5, 1, 3, 2], 3)).toBe(9);
  expect(maxSumOfSize([2, 3, 4, 1, 5], 2)).toBe(7);
});

test("maxSumOfSize edge cases", () => {
  expect(maxSumOfSize([1, 2], 5)).toBe(0);
  expect(maxSumOfSize([], 1)).toBe(0);
  expect(maxSumOfSize([4, -1, 2], 3)).toBe(5);
});

test("longestUniqueSubstring", () => {
  expect(longestUniqueSubstring("abcabcbb")).toBe(3);
  expect(longestUniqueSubstring("bbbbb")).toBe(1);
  expect(longestUniqueSubstring("pwwkew")).toBe(3);
  expect(longestUniqueSubstring("abba")).toBe(2);
  expect(longestUniqueSubstring("")).toBe(0);
});

test("minSubarrayLen finds the shortest stretch", () => {
  expect(minSubarrayLen(7, [2, 3, 1, 2, 4, 3])).toBe(2);
  expect(minSubarrayLen(4, [1, 4, 4])).toBe(1);
});

test("minSubarrayLen returns 0 when impossible", () => {
  expect(minSubarrayLen(11, [1, 1, 1, 1, 1, 1, 1, 1])).toBe(0);
  expect(minSubarrayLen(5, [])).toBe(0);
});

test("all three are fast on 200,000 items", () => {
  const ones = Array.from({ length: 200000 }, () => 1);
  expect(maxSumOfSize(ones, 100000)).toBe(100000);
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const text = Array.from({ length: 200000 }, (_, i) => letters[i % 26]).join("");
  expect(longestUniqueSubstring(text)).toBe(26);
  expect(minSubarrayLen(150000, ones)).toBe(150000);
});
`,

  hints: [
    "maxSumOfSize: add the first k numbers to get the first window's sum. Then slide: add nums[i], subtract nums[i - k], and keep the biggest sum seen.",
    "longestUniqueSubstring: keep a Map from each character to the LAST position you saw it. When the new character was seen inside the current window (its last position is at or after left), jump left to just after that position. The window length is right - left + 1.",
    "minSubarrayLen: grow the window by moving right and adding nums[right] to the sum. While the sum is at least target, record the length, subtract nums[left] and move left forward. That shrinks the window as far as it can go.",
  ],

  solution: `=== CODE ===
function maxSumOfSize(nums, k) {
  if (k > nums.length || k <= 0) {
    return 0;
  }
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum = windowSum + nums[i];
  }
  let best = windowSum;
  for (let i = k; i < nums.length; i++) {
    windowSum = windowSum + nums[i] - nums[i - k];
    best = Math.max(best, windowSum);
  }
  return best;
}

function longestUniqueSubstring(text) {
  const lastSeen = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < text.length; right++) {
    const character = text[right];
    if (lastSeen.has(character) && lastSeen.get(character) >= left) {
      left = lastSeen.get(character) + 1;
    }
    lastSeen.set(character, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}

function minSubarrayLen(target, nums) {
  let left = 0;
  let sum = 0;
  let best = 0;
  for (let right = 0; right < nums.length; right++) {
    sum = sum + nums[right];
    while (sum >= target) {
      const length = right - left + 1;
      if (best === 0 || length < best) {
        best = length;
      }
      sum = sum - nums[left];
      left++;
    }
  }
  return best;
}
=== LINE BY LINE ===
maxSumOfSize: build the first window once, then slide. Each step adds the item that enters (nums[i]) and subtracts the item that leaves (nums[i - k]). Total work is O(n), not O(n * k).
longestUniqueSubstring: lastSeen remembers where each character was last. If the character we just reached was already inside the window (its last position is at or after left), the window would contain a repeat, so we move left just past that earlier copy. The check "at or after left" matters: in "abba", the first "a" is remembered but is already outside the window when the last "a" arrives.
minSubarrayLen: the right edge grows the window. Once the sum is big enough, we record the length and then shrink from the left as long as it is STILL big enough, hunting for a shorter one. This only works because all numbers are positive: removing an item always makes the sum smaller. Every item enters once and leaves once, so it is O(n).`,
};
