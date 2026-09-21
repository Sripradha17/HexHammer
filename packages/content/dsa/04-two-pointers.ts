import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "dsa-s04",
  level: 0,
  track: "dsa",
  order: 4,
  title: "Two pointers",

  look: `Two pointers means using TWO fingers on the same list at once, instead of a loop inside a loop. It turns many O(n^2) ideas into O(n).

The most common shape: one finger at the LEFT end, one at the RIGHT end, moving toward each other.

  let left = 0;
  let right = list.length - 1;
  while (left < right) {
    // look at list[left] and list[right]
    // decide: move left forward, move right backward, or stop
  }

It works beautifully when the list is SORTED, because then you always know which finger to move:
  the sum is too small  ->  move the LEFT finger right  (bigger number)
  the sum is too big    ->  move the RIGHT finger left  (smaller number)

Imagine two people walking toward each other along a bridge, each deciding whether to step, until they meet.

Another use is checking a text from both ends at once: a palindrome reads the same forwards and backwards, so compare the outer characters, then move both fingers inward.

A useful trick for characters: "abcdefghijklmnopqrstuvwxyz0123456789".includes(letter) tells you if it is a letter or digit (once lowercased).`,

  type: `Solve three problems:
1. isPalindrome(text) is true if the text reads the same backwards, looking ONLY at letters and digits and ignoring upper/lower case. "A man, a plan, a canal: Panama" is true. An empty text is true.
2. twoSumSorted(nums, target) works on an array sorted from smallest to largest. Return [i, j] (positions, with i < j) of two numbers that add up to target, or null. Do it with two pointers, no Set.
3. maxArea(heights) is the "container with most water" problem: heights are vertical lines at positions 0, 1, 2 ... Pick two lines. The water held is (distance apart) * (the SHORTER of the two heights). Return the biggest amount possible. Fewer than 2 lines gives 0.`,

  break: `Break it on purpose: in maxArea, always move the left pointer, no matter which line is taller.
Some answers come out too small. The rule is: move the pointer at the SHORTER line, because keeping it can never give a bigger container, since the width only shrinks.`,

  say: `In one sentence: when do two pointers work well, and which pointer do you move in a sorted two-sum?`,

  starterCode: `// DSA 4: two pointers.

function isPalindrome(text) {
  // only letters and digits count, ignore case
}

function twoSumSorted(nums, target) {
  // nums is sorted. Return [i, j] with i < j, or null
}

function maxArea(heights) {
  // most water between two lines: width * the shorter height
}
`,

  tests: `test("isPalindrome ignores case, spaces and punctuation", () => {
  expect(isPalindrome("A man, a plan, a canal: Panama")).toBe(true);
  expect(isPalindrome("racecar")).toBe(true);
});

test("isPalindrome says no when it is not one", () => {
  expect(isPalindrome("race a car")).toBe(false);
  expect(isPalindrome("ab")).toBe(false);
});

test("isPalindrome edge cases", () => {
  expect(isPalindrome("")).toBe(true);
  expect(isPalindrome(" ., ")).toBe(true);
  expect(isPalindrome("0P")).toBe(false);
});

test("twoSumSorted finds the pair", () => {
  expect(twoSumSorted([2, 7, 11, 15], 9)).toEqual([0, 1]);
  expect(twoSumSorted([1, 2, 3, 4, 4, 9], 8)).toEqual([3, 4]);
});

test("twoSumSorted returns null when there is no pair", () => {
  expect(twoSumSorted([1, 2, 3], 100)).toBe(null);
  expect(twoSumSorted([5], 10)).toBe(null);
  expect(twoSumSorted([], 3)).toBe(null);
});

test("twoSumSorted is fast on 200,000 numbers", () => {
  const big = Array.from({ length: 200000 }, (_, i) => i);
  expect(twoSumSorted(big, 399997)).toEqual([199998, 199999]);
  expect(twoSumSorted(big, 500000)).toBe(null);
});

test("maxArea finds the biggest container", () => {
  expect(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])).toBe(49);
  expect(maxArea([1, 1])).toBe(1);
});

test("maxArea edge cases", () => {
  expect(maxArea([])).toBe(0);
  expect(maxArea([5])).toBe(0);
  expect(maxArea([4, 3, 2, 1, 4])).toBe(16);
});

test("maxArea is fast on 200,000 lines", () => {
  const big = Array.from({ length: 200000 }, (_, i) => (i % 100) + 1);
  expect(maxArea(big)).toBe(19990000);
});
`,

  hints: [
    'isPalindrome: put one pointer at each end. Skip over any character that is not a letter or digit (lowercase it first, then check with "abcdefghijklmnopqrstuvwxyz0123456789".includes(ch)). If the two characters differ, return false. When the pointers meet, return true.',
    "twoSumSorted: left = 0, right = last. Add the two numbers. Equal to target: return [left, right]. Too small: left++. Too big: right--. Stop when they meet, and return null.",
    "maxArea: left = 0, right = last. Compute width * min(heights[left], heights[right]) and remember the best. Then move the pointer that points at the SHORTER line inward.",
  ],

  solution: `=== CODE ===
function isPalindrome(text) {
  const keep = "abcdefghijklmnopqrstuvwxyz0123456789";
  const cleaned = text.toLowerCase();
  let left = 0;
  let right = cleaned.length - 1;
  while (left < right) {
    if (!keep.includes(cleaned[left])) {
      left++;
    } else if (!keep.includes(cleaned[right])) {
      right--;
    } else {
      if (cleaned[left] !== cleaned[right]) {
        return false;
      }
      left++;
      right--;
    }
  }
  return true;
}

function twoSumSorted(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) {
      return [left, right];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  return null;
}

function maxArea(heights) {
  let left = 0;
  let right = heights.length - 1;
  let best = 0;
  while (left < right) {
    const width = right - left;
    const height = Math.min(heights[left], heights[right]);
    best = Math.max(best, width * height);
    if (heights[left] < heights[right]) {
      left++;
    } else {
      right--;
    }
  }
  return best;
}
=== LINE BY LINE ===
isPalindrome: two fingers walk inward. A finger that lands on a character we do not care about (a space, a comma) just skips it. When both point at real characters they must match, otherwise it is not a palindrome. If the fingers cross without a mismatch, it is one. O(n) and no extra copy of the text.
twoSumSorted: because the list is sorted, moving left up makes the sum bigger and moving right down makes it smaller. So each step throws away one number that can never be part of the answer. O(n) time and O(1) memory, better than the Set version of two-sum.
maxArea: the water is limited by the SHORTER line. Moving the taller line inward can only shrink the width and cannot raise the limit, so it can never help. Moving the shorter one might find a taller line, so that is the pointer we move. Each step discards one line, so it is O(n).`,
};
