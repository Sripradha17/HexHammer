import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l1-s08",
  level: 1,
  order: 8,
  title: "FizzBuzz",

  look: `FizzBuzz is the most famous warm-up puzzle in interviews. The tool you need is the remainder operator %.
"a % b" gives what is left over after dividing a by b. If it is 0, b divides a exactly.

  10 % 5   // 0  (5 fits exactly)
  10 % 3   // 1  (3 fits three times, 1 is left)

  function isEven(n) {
    return n % 2 === 0;
  }`,

  type: `Finish fizzBuzz(n). It gets one number and returns:
  "FizzBuzz" if n divides exactly by 3 AND by 5
  "Fizz"     if n divides exactly by 3
  "Buzz"     if n divides exactly by 5
  otherwise the number turned into text, like "7"`,

  break: `Break it on purpose: move the "Fizz" check ABOVE the "FizzBuzz" check and run the tests.
fizzBuzz(15) now says "Fizz". The first true check wins, so the most specific check must go first.`,

  say: `In one sentence: why does the FizzBuzz check have to come before the Fizz and Buzz checks?`,

  starterCode: `// Strike 8: FizzBuzz.
// Hint about the tools: n % 3 === 0 means "3 divides n exactly".
// String(n) turns a number into text.

function fizzBuzz(n) {
  // your code here
}
`,

  tests: `test("1 stays as text", () => {
  expect(fizzBuzz(1)).toBe("1");
});

test("7 stays as text", () => {
  expect(fizzBuzz(7)).toBe("7");
});

test("3 is Fizz", () => {
  expect(fizzBuzz(3)).toBe("Fizz");
});

test("9 is Fizz", () => {
  expect(fizzBuzz(9)).toBe("Fizz");
});

test("5 is Buzz", () => {
  expect(fizzBuzz(5)).toBe("Buzz");
});

test("15 is FizzBuzz", () => {
  expect(fizzBuzz(15)).toBe("FizzBuzz");
});

test("30 is FizzBuzz", () => {
  expect(fizzBuzz(30)).toBe("FizzBuzz");
});
`,

  hints: [
    "You need an if / else if / else chain that returns a different answer for each of the four cases.",
    "Which case is the most specific? Numbers that are in BOTH the Fizz and Buzz groups. Put that check first.",
    "The both-check can use &&: n % 3 === 0 && n % 5 === 0. The last else returns String(n).",
  ],

  solution: `=== CODE ===
function fizzBuzz(n) {
  if (n % 3 === 0 && n % 5 === 0) {
    return "FizzBuzz";
  } else if (n % 3 === 0) {
    return "Fizz";
  } else if (n % 5 === 0) {
    return "Buzz";
  } else {
    return String(n);
  }
}
=== LINE BY LINE ===
Line 2: n % 3 === 0 means "3 divides n exactly". && adds "and 5 divides it too". This is the most specific case so it goes FIRST.
Line 4: only reached when the first check failed. Divisible by 3 (but not both) is "Fizz".
Line 6: divisible by 5 (but not both) is "Buzz".
Line 8: everything else returns the number as text. String(n) turns 7 into "7" (the tests expect text, and === checks type).
If Fizz came first, 15 would return "Fizz" and never reach the FizzBuzz check.`,
};
