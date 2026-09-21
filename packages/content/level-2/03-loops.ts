import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l2-s03",
  level: 2,
  order: 3,
  title: "Loops",

  look: `A loop repeats work so you do not have to type it again and again. Think of doing jumping jacks: "do 10 of them".

  for (let i = 1; i <= 3; i++) {    // start at 1, keep going while i <= 3, add 1 each time
    console.log("jump " + i);
  }

  for (const letter of "hey") {     // for...of visits every item, one at a time
    console.log(letter);
  }

  let n = 3;
  while (n > 0) {                   // while repeats as long as the question is true
    n = n - 1;
  }

Careful: if the question never becomes false, the loop never stops. That is called an infinite loop.`,

  type: `Finish three functions using loops:
1. sumTo(n) adds 1 + 2 + ... + n with a for loop. sumTo(4) is 10. sumTo(0) is 0.
2. countVowels(text) counts the letters a, e, i, o, u (upper or lower case) with for...of.
3. countdown(n) returns an array counting down to 1, like [3, 2, 1], with a while loop. countdown(0) is [].`,

  break: `Break it on purpose: in your while loop, delete the line that makes the counter smaller. Run the tests.
The loop never ends! After 3 seconds Hexhammer stops your code for you and tells you. That is what the timeout is for. Put the line back.`,

  say: `In one sentence: when would you pick a for loop, and when a while loop?`,

  starterCode: `// Strike 3: loops.

function sumTo(n) {
  // add 1 + 2 + ... + n using a for loop
}

function countVowels(text) {
  // count a, e, i, o, u (any case) using for...of
}

function countdown(n) {
  // return [n, n-1, ..., 1] using a while loop
}
`,

  tests: `test("sumTo adds up to n", () => {
  expect(sumTo(4)).toBe(10);
  expect(sumTo(100)).toBe(5050);
});

test("sumTo(0) is 0", () => {
  expect(sumTo(0)).toBe(0);
});

test("countVowels counts a, e, i, o, u", () => {
  expect(countVowels("banana")).toBe(3);
  expect(countVowels("HELLO World")).toBe(3);
});

test("countVowels with no vowels is 0", () => {
  expect(countVowels("rhythm")).toBe(0);
});

test("countdown counts down to 1", () => {
  expect(countdown(3)).toEqual([3, 2, 1]);
});

test("countdown(0) is an empty array", () => {
  expect(countdown(0)).toEqual([]);
});
`,

  hints: [
    "sumTo: make a box called total that starts at 0. A for loop from 1 up to n adds each number into it. Return the box at the end.",
    'countVowels: turn the text lowercase first with text.toLowerCase(). Then for every letter, ask if "aeiou".includes(letter). If yes, add 1 to your counter.',
    "countdown: make an empty array and a counter. While the counter is more than 0, push it into the array and then make the counter one smaller.",
  ],

  solution: `=== CODE ===
function sumTo(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total = total + i;
  }
  return total;
}

function countVowels(text) {
  let count = 0;
  for (const letter of text.toLowerCase()) {
    if ("aeiou".includes(letter)) {
      count = count + 1;
    }
  }
  return count;
}

function countdown(n) {
  const result = [];
  let current = n;
  while (current > 0) {
    result.push(current);
    current = current - 1;
  }
  return result;
}
=== LINE BY LINE ===
sumTo: total starts at 0. The for loop sets i to 1, 2, 3 ... up to n, and each time we add i into total. i++ means "make i one bigger".
countVowels: toLowerCase makes HELLO into hello so we only have to check five small letters. for...of hands us one letter at a time. "aeiou".includes(letter) is true when the letter is one of those five.
countdown: current starts at n. While it is bigger than 0 we push it into the array, then make it one smaller. That last step is what makes the loop finish. Without it the loop would run forever.`,
};
