import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l1-s01",
  level: 1,
  order: 1,
  title: "console.log and return values",

  look: `console.log() prints words on the screen so you can SEE what your code is doing.

  console.log("Hi Sam!");

A function can also hand a value back to whoever called it. That is called returning (a "return value").

  function triple(n) {
    return n * 3;
  }

  console.log(triple(2)); // prints 6

Printing shows something to YOU. Returning gives something back to your CODE. They are different!`,

  type: `Do two things in the editor:
1. Print exactly: Hello, Hexhammer!
2. Finish the function double so it RETURNS its number times two.

Type it by hand. No copy-paste!`,

  break: `Break it on purpose: change "return" in your double function to console.log and run the tests.
The function now prints, but it hands back nothing (undefined), so the test fails.
Read the message, then put it back.`,

  say: `In one sentence: what is the difference between printing a value and returning a value?`,

  starterCode: `// Strike 1: console.log prints. return hands a value back.

// TODO 1: print Hello, Hexhammer! to the console (words must match exactly).


// TODO 2: make double RETURN the number times two.
function double(n) {
  // your code here
}
`,

  tests: `test("console.log prints Hello, Hexhammer!", () => {
  expect(consoleLines[0]).toBe("Hello, Hexhammer!");
});

test("double(4) returns 8", () => {
  expect(double(4)).toBe(8);
});

test("double(0) returns 0", () => {
  expect(double(0)).toBe(0);
});
`,

  hints: [
    "console.log(...) takes the thing to print between its parentheses. Words need quote marks around them.",
    "A function gives a value back with the word return. Where in your function would that word go?",
    "Inside double, you want the word return, then n, then the multiply sign *, then 2, then a semicolon.",
  ],

  solution: `=== CODE ===
console.log("Hello, Hexhammer!");

function double(n) {
  return n * 2;
}
=== LINE BY LINE ===
Line 1: console.log(...) prints whatever is inside the parentheses. The quote marks tell JavaScript "this is text".
Line 3: "function double(n)" makes a function named double. n is a box that holds the number we are given.
Line 4: "return n * 2" multiplies n by 2 and hands the answer back to the caller. The function stops here.
Line 5: the closing curly brace ends the function body.
Why not console.log inside double? Printing shows the answer to a human, but the tests (your code) need the value handed back.`,
};
