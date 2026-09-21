import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l2-s15",
  level: 2,
  order: 15,
  title: "Hash maps",

  look: `A hash map is a coat-check room. You hand over a coat and get a ticket. Later you show the ticket and the coat comes back INSTANTLY, no matter how many coats are in the room.

In JavaScript, a plain object works like this, and so does the special Map:

  const ages = {};
  ages["Sam"] = 10;              // hand in a coat
  ages["Sam"]                    // 10, instant!
  ages["Zed"]                    // undefined: no such ticket
  "Sam" in ages                  // true

  const map = new Map();
  map.set("Sam", 10);
  map.get("Sam");                // 10
  map.has("Zed");                // false

Favourite trick: COUNTING. Keep a running total per key.

  counts["a"] = (counts["a"] || 0) + 1;    // if there is no count yet, start from 0

Remembering things in a hash map turns slow searches into one quick pass. That is why interviewers love them.`,

  type: `Finish three functions:
1. countLetters(text) returns an object counting each letter. countLetters("banana") is { b: 1, a: 3, n: 2 }.
2. twoSum(nums, target) finds two DIFFERENT positions whose numbers add up to target. Return [firstIndex, secondIndex] (smaller index first), or null if there are none. Do it in ONE pass using a Map.
3. groupByLength(words) returns an object where each key is a word length and the value is the array of words with that length, in order. ["hi", "yo", "cat"] gives { 2: ["hi", "yo"], 3: ["cat"] }.`,

  break: `Break it on purpose: in countLetters, write counts[letter] = counts[letter] + 1 without the || 0 part.
The first time you see a letter, counts[letter] is undefined, and undefined + 1 is NaN (not a number). Put the || 0 back.`,

  say: `In one sentence: why is looking something up in a hash map so fast, and what is one thing it is good for?`,

  starterCode: `// Strike 15: hash maps.

function countLetters(text) {
  // { b: 1, a: 3, n: 2 } for "banana"
}

function twoSum(nums, target) {
  // return [i, j] where nums[i] + nums[j] === target, or null. One pass with a Map
}

function groupByLength(words) {
  // { 2: ["hi", "yo"], 3: ["cat"] }
}
`,

  tests: `test("countLetters counts each letter", () => {
  expect(countLetters("banana")).toEqual({ b: 1, a: 3, n: 2 });
});

test("countLetters of empty text is an empty object", () => {
  expect(countLetters("")).toEqual({});
});

test("twoSum finds the pair", () => {
  expect(twoSum([2, 7, 11, 15], 9)).toEqual([0, 1]);
  expect(twoSum([3, 2, 4], 6)).toEqual([1, 2]);
  expect(twoSum([3, 3], 6)).toEqual([0, 1]);
});

test("twoSum returns null when there is no pair", () => {
  expect(twoSum([1, 2], 10)).toBe(null);
});

test("groupByLength groups the words", () => {
  expect(groupByLength(["hi", "yo", "cat"])).toEqual({ 2: ["hi", "yo"], 3: ["cat"] });
});

test("groupByLength of nothing is an empty object", () => {
  expect(groupByLength([])).toEqual({});
});
`,

  hints: [
    "countLetters: start with const counts = {}. For each letter, set counts[letter] to (counts[letter] || 0) + 1. The || 0 covers the very first time you see a letter.",
    'twoSum: as you walk through the numbers, ask "what number do I NEED to reach the target?" (target minus this number). If the Map already has it, you are done. If not, save this number and its index in the Map.',
    "groupByLength: use word.length as the key. If there is no array for that length yet, make an empty one first, then push the word into it.",
  ],

  solution: `=== CODE ===
function countLetters(text) {
  const counts = {};
  for (const letter of text) {
    counts[letter] = (counts[letter] || 0) + 1;
  }
  return counts;
}

function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) {
      return [seen.get(need), i];
    }
    seen.set(nums[i], i);
  }
  return null;
}

function groupByLength(words) {
  const groups = {};
  for (const word of words) {
    if (!groups[word.length]) {
      groups[word.length] = [];
    }
    groups[word.length].push(word);
  }
  return groups;
}
=== LINE BY LINE ===
countLetters: counts is the coat-check room. counts[letter] || 0 means "the count so far, or 0 if this letter has no ticket yet". We add 1 and put it back.
twoSum: seen remembers every number we have passed and WHERE it was. For each number we work out the partner we need (target minus the number). Asking the Map "have I seen that partner?" is instant. If yes, we found the pair: the earlier index first, then the current one. If not, we remember this number and move on. One pass through the list: O(n), instead of checking every pair.
groupByLength: the word's length is the key. The first word of a new length finds no array, so we create an empty one. Then push adds the word. Words stay in their original order.`,
};
