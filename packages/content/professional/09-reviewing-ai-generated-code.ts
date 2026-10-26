import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "prof-s09",
  level: 0,
  track: "professional",
  order: 9,
  title: "Reviewing and verifying AI-generated code",

  look: `AI-generated code has a specific risk plain human-written code shares less often: it tends to look COMPLETELY reasonable, even when it is wrong. Code that obviously crashes gets caught immediately. Code that runs, returns a plausible-looking answer, and is subtly wrong on an edge case nobody tried yet is far more dangerous, because nothing about reading it raises a flag.

Verifying means actively trying to BREAK it with edge cases before you trust it: empty input, punctuation, case, the boundary values. Not just reading it and nodding.

  function isPalindrome(text) {
    const cleaned = text.toLowerCase();
    return cleaned === cleaned.split("").reverse().join("");
  }

This looks right, and it IS right for "racecar". It was never actually tested against "race car" (a space) or "A man, a plan, a canal: Panama" (real punctuation) — exactly the kind of edge case that separates code that LOOKS correct from code that IS correct.`,

  type: `This isPalindrome function was handed to you, claiming to check whether text is a palindrome, ignoring case. Verify it against a real edge case it was never actually tested against: spaces and punctuation. Fix it so it strips anything that is not a letter or digit before comparing, not just lowercases it.`,

  break: `Break it on purpose: strip spaces but forget punctuation (only text.split(" ").join("")). "A man, a plan, a canal: Panama" would still fail, because of the comma and colon left behind. Strip everything that is not a letter or digit, not just spaces.`,

  say: `In one sentence: why is AI-generated code that looks completely reasonable actually MORE dangerous to blindly trust than code that obviously crashes?`,

  starterCode: `// Strike 9: reviewing and verifying AI-generated code.
// This function was handed to you as already working. Verify it before you trust it.

function isPalindrome(text) {
  const cleaned = text.toLowerCase();
  return cleaned === cleaned.split("").reverse().join("");
}
`,

  tests: `test("a simple palindrome, already clean, still works", () => {
  expect(isPalindrome("racecar")).toBe(true);
});

test("ignores case", () => {
  expect(isPalindrome("RaceCar")).toBe(true);
});

test("ignores spaces and punctuation (the edge case the original version missed)", () => {
  expect(isPalindrome("race car")).toBe(true);
  expect(isPalindrome("A man, a plan, a canal: Panama")).toBe(true);
});

test("correctly rejects real non-palindromes, even with punctuation stripped", () => {
  expect(isPalindrome("hello")).toBe(false);
  expect(isPalindrome("Not a palindrome!")).toBe(false);
});
`,

  hints: [
    "Strip anything that is not a letter or digit with a regex: text.replace(/[^a-z0-9]/gi, \"\")",
    'Do the stripping AND the lowercasing: const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, "");',
    "The rest of the function (comparing cleaned to its own reverse) was already correct — only the cleaning step needed the fix.",
  ],

  solution: `=== CODE ===
function isPalindrome(text) {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned === cleaned.split("").reverse().join("");
}
=== LINE BY LINE ===
text.toLowerCase() handles case, exactly like the original.
.replace(/[^a-z0-9]/g, "") is the real fix: it strips every character that is NOT a lowercase letter or digit (spaces, commas, colons, anything), so only the actual letters and numbers are left to compare.
The comparison itself (cleaned === cleaned.split("").reverse().join("")) never needed to change: the bug was entirely in what counted as "cleaned" text, not in the palindrome logic itself — exactly the kind of narrow, easy-to-miss gap that only shows up once you test a real edge case, not by reading the code and nodding.`,
};
