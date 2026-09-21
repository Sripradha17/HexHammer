import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l1-s03",
  level: 1,
  order: 3,
  title: "Numbers and strings",

  look: `Numbers are for math. Strings (text) are for words. You can do math with + - * / on numbers.
Strings have handy tools: .length counts letters, .toUpperCase() makes BIG letters, and + glues strings together.

  const pets = 3 + 4;                 // 7
  const size = "cat".length;          // 3
  const loud = "meow".toUpperCase();  // "MEOW"
  const both = "cat" + "dog";         // "catdog"

Careful: "5" (text) is not the same as 5 (number).`,

  type: `Finish three functions:
1. areaOfRoom(width, height) returns width times height.
2. shout(word) returns the word in CAPITAL letters with an exclamation mark at the end. shout("hi") is "HI!".
3. wordLength(word) returns how many letters are in the word.`,

  break: `Break it on purpose: in shout, glue with the wrong thing, like adding a number: word + 1.
See what text you get. Then fix it.`,

  say: `In one sentence: what is a string, and what is one thing you can do with it that you cannot do with a number?`,

  starterCode: `// Strike 3: numbers and strings.

function areaOfRoom(width, height) {
  // return width times height
}

function shout(word) {
  // return the word in CAPITALS with ! at the end
}

function wordLength(word) {
  // return how many letters are in the word
}
`,

  tests: `test("areaOfRoom(3, 4) is 12", () => {
  expect(areaOfRoom(3, 4)).toBe(12);
});

test("areaOfRoom(5, 5) is 25", () => {
  expect(areaOfRoom(5, 5)).toBe(25);
});

test('shout("hi") is "HI!"', () => {
  expect(shout("hi")).toBe("HI!");
});

test("wordLength('hammer') is 6", () => {
  expect(wordLength("hammer")).toBe(6);
});
`,

  hints: [
    "Each function needs the word return followed by an answer. The answer for area uses the * sign.",
    'For shout, there are two steps: make the word big with .toUpperCase(), then glue the text "!" on the end with +.',
    "For wordLength, a string has a property called length. Write word.length (no parentheses).",
  ],

  solution: `=== CODE ===
function areaOfRoom(width, height) {
  return width * height;
}

function shout(word) {
  return word.toUpperCase() + "!";
}

function wordLength(word) {
  return word.length;
}
=== LINE BY LINE ===
areaOfRoom: width * height multiplies the two numbers and return hands the answer back.
shout: word.toUpperCase() is a string tool that returns a new BIG-LETTER string ("hi" becomes "HI"). Then + "!" glues an exclamation mark on the end.
wordLength: every string has a .length property that counts its letters. It is a property, not a function, so there are no parentheses.`,
};
