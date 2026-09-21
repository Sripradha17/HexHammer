import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "dsa-s02",
  level: 0,
  track: "dsa",
  order: 2,
  title: "Arrays and strings",

  look: `Arrays and strings are in almost every interview. Both are rows of items you can reach by position, and most problems are about walking through them in a smart way.

The toolbox:
  list.slice(start, end)       a COPY of a piece (end not included)
  list.reverse()               flips it IN PLACE (careful: changes the original!)
  [...list].reverse()          a flipped COPY
  text.split(" ")              string to array of words     array.join(" ") back to a string
  list.length, list[i]         size and position (positions start at 0)
  i % n                        the "wrap around" trick: after the last position comes 0 again

Habits that win interviews:
  1. Ask about EDGES first: empty input? one item? duplicates? negative numbers?
  2. Say what you will do BEFORE you type.
  3. Do not change the input unless the problem says you may.

Example: turning a row of 5 items to the right by 2 (rotate). The last 2 items jump to the front:
  [1,2,3,4,5]  ->  [4,5,1,2,3]`,

  type: `Solve three problems:
1. reverseWords(sentence) reverses the ORDER of the words. Extra spaces at the ends or between words disappear. "the sky is blue" becomes "blue is sky the". An empty text stays "".
2. rotateRight(nums, k) returns a NEW array rotated to the right by k places. k can be bigger than the length. Empty array gives [].
3. mergeSorted(a, b) takes two arrays that are already sorted (smallest first) and returns one sorted array with everything, in O(n + m). Do NOT just join and sort.`,

  break: `Break it on purpose: in rotateRight, skip the k % nums.length step and test rotateRight([1, 2, 3], 4).
Slicing with a number bigger than the length gives a strange answer. Rotating by 4 in a list of 3 is the same as rotating by 1: always shrink k first with the wrap-around trick.`,

  say: `In one sentence: what edge cases do you check first when a problem gives you an array or a string?`,

  starterCode: `// DSA 2: arrays and strings.

function reverseWords(sentence) {
  // "the sky is blue" -> "blue is sky the"
}

function rotateRight(nums, k) {
  // [1,2,3,4,5], 2 -> [4,5,1,2,3]. Return a NEW array.
}

function mergeSorted(a, b) {
  // two sorted arrays in, one sorted array out. O(n + m)
}
`,

  tests: `test("reverseWords flips the order of the words", () => {
  expect(reverseWords("the sky is blue")).toBe("blue is sky the");
  expect(reverseWords("hello")).toBe("hello");
});

test("reverseWords ignores extra spaces", () => {
  expect(reverseWords("  a   good   example ")).toBe("example good a");
});

test("reverseWords of empty text is empty", () => {
  expect(reverseWords("")).toBe("");
  expect(reverseWords("   ")).toBe("");
});

test("rotateRight moves items to the front", () => {
  expect(rotateRight([1, 2, 3, 4, 5], 2)).toEqual([4, 5, 1, 2, 3]);
  expect(rotateRight([1, 2, 3], 0)).toEqual([1, 2, 3]);
});

test("rotateRight copes with k bigger than the length", () => {
  expect(rotateRight([1, 2, 3], 4)).toEqual([3, 1, 2]);
  expect(rotateRight([1, 2, 3], 3)).toEqual([1, 2, 3]);
});

test("rotateRight leaves the original alone and handles empty", () => {
  const original = [1, 2, 3];
  rotateRight(original, 1);
  expect(original).toEqual([1, 2, 3]);
  expect(rotateRight([], 5)).toEqual([]);
});

test("mergeSorted merges two sorted arrays", () => {
  expect(mergeSorted([1, 3, 5], [2, 4, 6])).toEqual([1, 2, 3, 4, 5, 6]);
  expect(mergeSorted([1, 1], [1])).toEqual([1, 1, 1]);
});

test("mergeSorted with an empty side", () => {
  expect(mergeSorted([], [1, 2])).toEqual([1, 2]);
  expect(mergeSorted([3], [])).toEqual([3]);
  expect(mergeSorted([], [])).toEqual([]);
});

test("mergeSorted is fast on big inputs (no sorting the whole thing!)", () => {
  const a = Array.from({ length: 200000 }, (_, i) => i * 2);
  const b = Array.from({ length: 200000 }, (_, i) => i * 2 + 1);
  const merged = mergeSorted(a, b);
  expect(merged.length).toBe(400000);
  expect(merged[0]).toBe(0);
  expect(merged[399999]).toBe(399999);
});
`,

  hints: [
    "reverseWords: split the sentence at each space, throw away the empty pieces (filter), reverse the array, and join with one space.",
    "rotateRight: if the array is empty return []. Let shift = k % nums.length. The last shift items go first: [...nums.slice(nums.length - shift), ...nums.slice(0, nums.length - shift)].",
    "mergeSorted: keep two positions i and j, one for each array. Repeatedly take the smaller front item and move that position forward. When one array runs out, add whatever is left of the other.",
  ],

  solution: `=== CODE ===
function reverseWords(sentence) {
  const words = sentence.split(" ").filter((word) => word !== "");
  return words.reverse().join(" ");
}

function rotateRight(nums, k) {
  if (nums.length === 0) {
    return [];
  }
  const shift = k % nums.length;
  return [...nums.slice(nums.length - shift), ...nums.slice(0, nums.length - shift)];
}

function mergeSorted(a, b) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) {
      result.push(a[i]);
      i++;
    } else {
      result.push(b[j]);
      j++;
    }
  }
  while (i < a.length) {
    result.push(a[i]);
    i++;
  }
  while (j < b.length) {
    result.push(b[j]);
    j++;
  }
  return result;
}
=== LINE BY LINE ===
reverseWords: split(" ") gives empty pieces wherever there were extra spaces, so filter throws those away. reverse flips the array of words (it is our own copy, so that is safe) and join glues them back with single spaces.
rotateRight: k % length is the wrap-around trick: rotating by the length is a full circle, so only the remainder matters. The last "shift" items move to the front, and the rest follow. Building a new array with spread keeps the original untouched.
mergeSorted: two fingers, one on each array. Always take the smaller front item and move that finger. Each item is touched once, so it is O(n + m). The last two loops copy whatever is left when one array runs out (at most one of them does anything).
Sorting the joined array would work too, but it costs O((n + m) log(n + m)). Using the fact that both sides are already sorted is what the interviewer wants to see.`,
};
