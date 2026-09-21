import type { Lesson } from "../types";

// NOTE for editing this file: the lesson code below contains backslashes (like \d and \s),
// so the text fields use String.raw. That keeps every backslash exactly as typed.
export const lesson: Lesson = {
  id: "l2-s11",
  level: 2,
  order: 11,
  title: "Strings and regex",

  look: String.raw`A regular expression (regex) is a magic wand that finds PATTERNS in text, like "any digit" or "something that looks like an email".

You write it between slashes: /pattern/

  /cat/.test("concatenate")        // true    does the text contain "cat"?
  "a1b22".match(/\d+/g)            // ["1", "22"]   find all the numbers

The magic symbols (learn a few at a time):
  \d     any digit (0 to 9)
  \s     any space
  +      one or more of the thing before it
  [abc]  any ONE of a, b or c
  [^abc] any one character that is NOT a, b or c
  ^  $   start of the text, end of the text
  g      flag: find ALL matches, not just the first

Useful string helpers: text.trim() removes spaces at the ends, text.split(" ") cuts text into an array, text.toUpperCase(), text.includes("x").

Careful: match with the g flag returns null (not an empty array) when nothing is found.`,

  type: String.raw`Finish three functions:
1. isEmail(text) returns true when the text looks like an email: some characters (no spaces, no @), then @, then some characters, then a dot, then some characters. "sam@example.com" is true. "sam@example" is false.
2. countWords(text) counts the words. Words are separated by one or more spaces. Extra spaces at the ends do not count. "" is 0 words.
3. extractNumbers(text) returns every whole number in the text, as real numbers. "I have 2 cats and 10 dogs" gives [2, 10]. No numbers gives [].`,

  break: String.raw`Break it on purpose: in extractNumbers, delete the g flag from your regex (the letter after the last slash).
Now match only finds the FIRST number, and it comes back in a different shape. Flags matter! Put it back.`,

  say: String.raw`In one sentence: what is a regular expression, and what does the g flag do?`,

  starterCode: String.raw`// Strike 11: strings and regex.

function isEmail(text) {
  // true if it looks like something@something.something
}

function countWords(text) {
  // how many words? (words are split by spaces)
}

function extractNumbers(text) {
  // return every whole number in the text, as numbers
}
`,

  tests: String.raw`test("isEmail accepts normal emails", () => {
  expect(isEmail("sam@example.com")).toBe(true);
  expect(isEmail("a.b@c.org")).toBe(true);
});

test("isEmail rejects things that are not emails", () => {
  expect(isEmail("sam@example")).toBe(false);
  expect(isEmail("sam example@x.com")).toBe(false);
  expect(isEmail("@x.com")).toBe(false);
  expect(isEmail("hello")).toBe(false);
});

test("countWords counts words", () => {
  expect(countWords("hello big world")).toBe(3);
  expect(countWords("  spaced   out  ")).toBe(2);
});

test("countWords of nothing is 0", () => {
  expect(countWords("")).toBe(0);
  expect(countWords("   ")).toBe(0);
});

test("extractNumbers finds every number", () => {
  expect(extractNumbers("I have 2 cats and 10 dogs")).toEqual([2, 10]);
  expect(extractNumbers("7")).toEqual([7]);
});

test("extractNumbers returns an empty array when there are none", () => {
  expect(extractNumbers("no numbers here")).toEqual([]);
});
`,

  hints: [
    "isEmail: build the regex in pieces: some non-space non-@ characters [^\\s@]+, then @, then [^\\s@]+, then a dot (write it \\.), then [^\\s@]+. Wrap it with ^ and $ so the WHOLE text must match, and call .test(text).",
    "countWords: first text.trim(). If that is empty, return 0. Otherwise text.trim().split(/\\s+/) cuts it into words, and .length counts them.",
    "extractNumbers: text.match(/\\d+/g) gives an array of number-strings, or null. If null return []. Otherwise .map(Number) turns the strings into numbers.",
  ],

  solution: String.raw`=== CODE ===
function isEmail(text) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

function countWords(text) {
  const cleaned = text.trim();
  if (cleaned === "") {
    return 0;
  }
  return cleaned.split(/\s+/).length;
}

function extractNumbers(text) {
  const found = text.match(/\d+/g);
  if (found === null) {
    return [];
  }
  return found.map(Number);
}
=== LINE BY LINE ===
isEmail: ^ and $ pin the pattern to the start and end, so the whole text must fit. [^\s@]+ means "one or more characters that are not a space and not an @". Then a real @, then the same kind of characters, then \. (a real dot, the backslash stops it from meaning "any character"), then more characters. .test returns true or false.
countWords: trim removes the spaces at both ends. If nothing is left there are 0 words. Otherwise split(/\s+/) cuts at every run of one or more spaces, so double spaces do not create fake empty words.
extractNumbers: \d+ means one or more digits in a row, and g finds every such group. match returns null when there is no match, so we check for that. map(Number) turns "10" into the number 10.`,
};
