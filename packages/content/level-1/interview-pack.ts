import type { InterviewPack } from "../types";

// Level 1 Interview Pack: Say-It cards, one Solve-It problem (tests only, no solution), one STAR prompt.
export const interviewPack: InterviewPack = {
  level: 1,

  sayIt: [
    {
      question: "What is the difference between console.log and return?",
      answer:
        "console.log prints a value so a human can see it, and gives nothing back. return hands a value back to the code that called the function so it can be used further, and it ends the function.",
    },
    {
      question: "What is a variable, and when do you use const versus let?",
      answer:
        "A variable is a named box that holds a value. Use const by default because it cannot be reassigned. Use let only when the value has to change later.",
    },
    {
      question: "Name the basic types in JavaScript that you have met so far.",
      answer:
        "Number, string, boolean, undefined and null (plus objects, which come later). typeof tells you which one a value is.",
    },
    {
      question: "What does && do, and what does || do?",
      answer:
        "&& (AND) is true only when both sides are true. || (OR) is true when at least one side is true. ! (NOT) flips true to false.",
    },
    {
      question: "How does if / else if / else pick a branch?",
      answer:
        "It checks the conditions from top to bottom and runs the first branch whose condition is true. Everything below is skipped, so the order of the checks matters.",
    },
    {
      question: "Why use === instead of == ?",
      answer:
        '=== compares value and type with no hidden conversion, so 5 === "5" is false. == converts types first, which causes surprising results.',
    },
    {
      question: "What is a function, and what are parameters and arguments?",
      answer:
        "A function is a reusable block of code with a name. Parameters are the named inputs in its definition. Arguments are the actual values you pass in when you call it.",
    },
    {
      question: "How would you solve FizzBuzz, and what is the classic mistake?",
      answer:
        "Use % to test divisibility. Check the both-3-and-5 case first, then 3, then 5, then return the number. The classic mistake is checking Fizz before FizzBuzz so multiples of 15 never reach the FizzBuzz branch.",
    },
    {
      question: "What is a template string?",
      answer:
        "A string written with backticks that can embed expressions using ${ }, like `Hello ${name}`. It is easier to read than gluing strings with +.",
    },
    {
      question: "What does the % (remainder) operator return, and give one use.",
      answer:
        "It returns what is left after dividing. 10 % 3 is 1. Common uses: checking even or odd (n % 2 === 0) and checking divisibility, like in FizzBuzz.",
    },
    {
      question: "What is middleware? (You will learn this in Level 5)",
      answer:
        "Preview only! Middleware is a function that sits in the middle of a request and a response. It can look at the request, change it, stop it early, or pass it along to the next function. You will build your own in Level 5.",
      isPreview: true,
    },
  ],

  solveIt: {
    title: "Leap years and days in a month",
    minutes: 30,
    prompt: `Write two functions.

1. isLeapYear(year): true if the year is a leap year.
   A year is a leap year if it divides exactly by 4, EXCEPT years that divide by 100, unless they also divide by 400.
   So 2024 is a leap year, 1900 is not, 2000 is.

2. daysInMonth(month, year): how many days are in a month (month is 1 to 12).
   January is 1. February has 29 days in a leap year, otherwise 28.
   April, June, September and November have 30 days. The rest have 31.
   Use your isLeapYear function. If month is not from 1 to 12, return 0.

Talk out loud as you work: say what you plan to do before you type. Start a 30-minute timer.`,
    starterCode: `// Solve-It: leap years and days in a month.

function isLeapYear(year) {
  // your code here
}

function daysInMonth(month, year) {
  // your code here
}
`,
    tests: `test("2024 is a leap year", () => {
  expect(isLeapYear(2024)).toBe(true);
});

test("2023 is not a leap year", () => {
  expect(isLeapYear(2023)).toBe(false);
});

test("1900 is not a leap year (divides by 100)", () => {
  expect(isLeapYear(1900)).toBe(false);
});

test("2000 is a leap year (divides by 400)", () => {
  expect(isLeapYear(2000)).toBe(true);
});

test("January has 31 days", () => {
  expect(daysInMonth(1, 2023)).toBe(31);
});

test("April has 30 days", () => {
  expect(daysInMonth(4, 2023)).toBe(30);
});

test("February has 28 days in a normal year", () => {
  expect(daysInMonth(2, 2023)).toBe(28);
});

test("February has 29 days in a leap year", () => {
  expect(daysInMonth(2, 2024)).toBe(29);
});

test("February 1900 has 28 days", () => {
  expect(daysInMonth(2, 1900)).toBe(28);
});

test("a bad month returns 0", () => {
  expect(daysInMonth(0, 2023)).toBe(0);
  expect(daysInMonth(13, 2023)).toBe(0);
});
`,
  },

  star: {
    prompt:
      "Tell me about a time you had to learn something hard, or re-learn something you used to know. What did you do, and what changed?",
    tips: [
      "S (Situation): one or two sentences. Where were you and what was the problem?",
      "T (Task): what was YOUR job or goal in it?",
      "A (Action): what did YOU do, step by step? Say 'I', not 'we'.",
      "R (Result): what happened? Use a number or a clear outcome if you can. Then add what you learned.",
      "Practice out loud, aim for about two minutes, and write your version in a notes file by hand.",
    ],
  },
};
