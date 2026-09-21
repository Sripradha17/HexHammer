import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l2-s09",
  level: 2,
  order: 9,
  title: "Recursion",

  look: `Recursion is when a function calls ITSELF, like Russian nesting dolls: open one doll and inside is a smaller doll, and inside that a smaller one, until you reach the tiny doll that does not open.

Every recursive function needs two things:
  1. A BASE CASE: the tiny doll. The easy answer where you stop.
  2. A SMALLER STEP: call yourself again with a smaller problem.

  function countFrom(n) {
    if (n === 0) {                     // base case: stop here
      return "liftoff";
    }
    return n + " " + countFrom(n - 1); // smaller problem: n - 1
  }
  countFrom(3)   // "3 2 1 liftoff"

If you forget the base case, the function calls itself forever until JavaScript gives up with a "stack overflow" error.

Handy tools: text.slice(1) is the text without its first letter. list.slice(1) is the list without its first item.`,

  type: `Finish three recursive functions (no loops!):
1. factorial(n) multiplies n * (n-1) * ... * 1. factorial(5) is 120. factorial(0) is 1.
2. sumList(list) adds up all the numbers in an array. An empty array is 0.
3. reverseText(text) returns the text backwards. reverseText("abc") is "cba".`,

  break: `Break it on purpose: in factorial, delete the base case (the if that stops it). Run the tests.
You get "Maximum call stack size exceeded". The function called itself until the computer ran out of room. Put the base case back.`,

  say: `In one sentence: what are the two things every recursive function needs?`,

  starterCode: `// Strike 9: recursion. No loops allowed!

function factorial(n) {
  // base case first, then n * factorial(n - 1)
}

function sumList(list) {
  // base case: empty list. Otherwise first item + sum of the rest
}

function reverseText(text) {
  // base case: empty text. Otherwise reverse the rest, then add the first letter
}
`,

  tests: `test("factorial of small numbers", () => {
  expect(factorial(0)).toBe(1);
  expect(factorial(1)).toBe(1);
  expect(factorial(5)).toBe(120);
});

test("factorial of 10", () => {
  expect(factorial(10)).toBe(3628800);
});

test("sumList adds everything", () => {
  expect(sumList([1, 2, 3, 4])).toBe(10);
});

test("sumList of an empty array is 0", () => {
  expect(sumList([])).toBe(0);
});

test("reverseText flips the letters", () => {
  expect(reverseText("abc")).toBe("cba");
  expect(reverseText("hexhammer")).toBe("remmahxeh");
});

test("reverseText of empty text is empty text", () => {
  expect(reverseText("")).toBe("");
});
`,

  hints: [
    "Start each function by writing the BASE CASE: the case so small you already know the answer (n is 0 or 1, the list is empty, the text is empty).",
    "factorial: n * factorial(n - 1). sumList: list[0] + sumList(list.slice(1)). Each call works on a smaller problem.",
    "reverseText: reverse everything except the first letter, then put the first letter at the END: reverseText(text.slice(1)) + text[0].",
  ],

  solution: `=== CODE ===
function factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

function sumList(list) {
  if (list.length === 0) {
    return 0;
  }
  return list[0] + sumList(list.slice(1));
}

function reverseText(text) {
  if (text === "") {
    return "";
  }
  return reverseText(text.slice(1)) + text[0];
}
=== LINE BY LINE ===
factorial: if n is 1 or less we stop and return 1 (the tiny doll). Otherwise n * factorial(n - 1): factorial(5) = 5 * factorial(4) = 5 * 4 * factorial(3) ... down to 1.
sumList: an empty list adds up to 0 (base case). Otherwise take the first item and add the sum of the rest. slice(1) is the list without its first item, so the problem gets smaller each time.
reverseText: an empty text reversed is empty (base case). Otherwise reverse everything after the first letter, then stick the first letter on the end. "abc" becomes reverse("bc") + "a" = "cb" + "a".`,
};
