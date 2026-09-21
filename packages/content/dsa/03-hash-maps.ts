import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "dsa-s03",
  level: 0,
  track: "dsa",
  order: 3,
  title: "Hash maps",

  look: `A hash map is the most useful interview tool there is: a coat-check room where a key gets you its value INSTANTLY (O(1)). Whenever you catch yourself thinking "I need to search for something inside a loop", ask: could a hash map remember it for me?

Three patterns to learn:

  1. COUNTING      counts[x] = (counts[x] || 0) + 1
  2. GROUPING      groups[key] holds an array of everything that shares that key
  3. PREFIX SUMS   remember the running total so far, and look up an earlier total in the map

Grouping needs a good KEY. Words that are anagrams of each other (same letters) have the same key if you sort their letters:  "eat" -> "aet",  "tea" -> "aet".

  const groups = new Map();
  const key = word.split("").sort().join("");
  if (!groups.has(key)) { groups.set(key, []); }
  groups.get(key).push(word);

A Map remembers the order in which keys were first added, which is handy when the answer must keep the original order.

Prefix-sum idea: if the running total is 10 now and it was 7 three steps ago, the last three numbers add to 3. So to find "a stretch that adds up to k", look up (running total - k) among the totals you have seen.`,

  type: `Solve three problems:
1. groupAnagrams(words) groups words that are anagrams of each other. Return an array of groups. Groups appear in the order their first word appeared, and words inside a group keep their original order.
2. firstUniqueChar(text) returns the position (starting from 0) of the first character that appears only ONCE in the text, or -1 if there is none.
3. subarraySumEquals(nums, k) counts how many contiguous stretches (subarrays) of nums add up to exactly k. nums can contain negative numbers and zeros. It must be O(n): use prefix sums and a Map.`,

  break: `Break it on purpose: in subarraySumEquals, forget to put the starting total 0 into the Map (the "empty prefix").
Stretches that begin at the very first item go missing, and the counts come out too small. A running total of 0 has "already been seen" before you start.`,

  say: `In one sentence: what kind of problem makes you reach for a hash map, and what do you use as the key?`,

  starterCode: `// DSA 3: hash maps.

function groupAnagrams(words) {
  // ["eat","tea","tan","ate","nat","bat"] -> [["eat","tea","ate"],["tan","nat"],["bat"]]
}

function firstUniqueChar(text) {
  // index of the first character that appears only once, or -1
}

function subarraySumEquals(nums, k) {
  // how many contiguous subarrays add up to k? O(n) with prefix sums
}
`,

  tests: `test("groupAnagrams groups by letters and keeps the order", () => {
  expect(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])).toEqual([
    ["eat", "tea", "ate"],
    ["tan", "nat"],
    ["bat"],
  ]);
});

test("groupAnagrams edge cases", () => {
  expect(groupAnagrams([])).toEqual([]);
  expect(groupAnagrams(["a"])).toEqual([["a"]]);
  expect(groupAnagrams(["ab", "ba", "ab"])).toEqual([["ab", "ba", "ab"]]);
});

test("firstUniqueChar finds the position", () => {
  expect(firstUniqueChar("leetcode")).toBe(0);
  expect(firstUniqueChar("loveleetcode")).toBe(2);
});

test("firstUniqueChar with none, or empty", () => {
  expect(firstUniqueChar("aabb")).toBe(-1);
  expect(firstUniqueChar("")).toBe(-1);
});

test("subarraySumEquals counts stretches", () => {
  expect(subarraySumEquals([1, 1, 1], 2)).toBe(2);
  expect(subarraySumEquals([1, 2, 3], 3)).toBe(2);
});

test("subarraySumEquals handles zeros and negatives", () => {
  expect(subarraySumEquals([1, -1, 0], 0)).toBe(3);
  expect(subarraySumEquals([3, 4, 7, 2, -3, 1, 4, 2], 7)).toBe(4);
  expect(subarraySumEquals([], 0)).toBe(0);
});

test("subarraySumEquals is O(n)", () => {
  const big = Array.from({ length: 200000 }, () => 1);
  expect(subarraySumEquals(big, 3)).toBe(199998);
});
`,

  hints: [
    'groupAnagrams: use a Map. The key is the word with its letters sorted (word.split("").sort().join("")). Push each word into the array stored under its key. At the end, [...map.values()] gives the groups in first-seen order.',
    "firstUniqueChar: first pass, count every character. Second pass, walk the text again and return the first position whose count is 1.",
    "subarraySumEquals: keep a running total. Keep a Map of how many times each running total has been seen (start with total 0 seen once). For each number, add it to the total, then add the map's count for (total - k) to your answer, then record the total in the map.",
  ],

  solution: `=== CODE ===
function groupAnagrams(words) {
  const groups = new Map();
  for (const word of words) {
    const key = word.split("").sort().join("");
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(word);
  }
  return [...groups.values()];
}

function firstUniqueChar(text) {
  const counts = {};
  for (const character of text) {
    counts[character] = (counts[character] || 0) + 1;
  }
  for (let i = 0; i < text.length; i++) {
    if (counts[text[i]] === 1) {
      return i;
    }
  }
  return -1;
}

function subarraySumEquals(nums, k) {
  const seenTotals = new Map();
  seenTotals.set(0, 1);
  let total = 0;
  let answer = 0;
  for (const n of nums) {
    total = total + n;
    answer = answer + (seenTotals.get(total - k) || 0);
    seenTotals.set(total, (seenTotals.get(total) || 0) + 1);
  }
  return answer;
}
=== LINE BY LINE ===
groupAnagrams: sorting a word's letters turns every anagram into the same key ("eat", "tea", "ate" all become "aet"). A Map keeps keys in the order they were first added, so the groups come out in first-seen order. O(n * L log L) for n words of length L.
firstUniqueChar: two passes. The first builds the counts. The second finds the earliest position whose count is 1. Two simple loops are still O(n).
subarraySumEquals: total is the running sum. If the total is T now and was T - k at some earlier moment, then everything between adds up to exactly k. The Map counts how many earlier moments had each total. We start it with 0 seen once: the "empty prefix", so stretches starting at the very beginning are counted. One pass, O(n).
We look up (total - k) BEFORE recording the current total, so a stretch can never be empty.`,
};
