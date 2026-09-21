import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l1-s10",
  level: 1,
  order: 10,
  title: "Mini grade calculator",

  look: `Time to combine everything: variables, math, if / else, functions and template strings.
Small functions that do one job, and one function that uses them, is how real programs are built.

  function average2(a, b) {
    return (a + b) / 2;
  }

  Math.round(4.6)   // 5  (rounds to the nearest whole number)

Plan first, then type: what are the small jobs here?`,

  type: `Build a grade calculator from three small functions:
1. letterGrade(score): "A" for 90 or more, "B" for 80+, "C" for 70+, "D" for 60+, otherwise "F".
   If score is below 0 or above 100 return "Invalid".
2. average3(a, b, c): the average of three scores, rounded to a whole number.
3. gradeReport(name, a, b, c): returns text like "Sam: 85 (B)". Use average3 and letterGrade inside it.`,

  break: `Break it on purpose: in average3 forget the brackets, so it reads a + b + c / 3.
Math does division before addition! Run the tests and see the strange average. Then fix it with brackets.`,

  say: `In one sentence: why is it good to build gradeReport out of smaller functions?`,

  starterCode: `// Strike 10: mini grade calculator.

function letterGrade(score) {
  // "Invalid" if score is below 0 or above 100
  // otherwise A (90+), B (80+), C (70+), D (60+), F
}

function average3(a, b, c) {
  // average of three scores, rounded to a whole number (Math.round)
}

function gradeReport(name, a, b, c) {
  // like "Sam: 85 (B)". Use average3 and letterGrade.
}
`,

  tests: `test("letterGrade gives A to 95", () => {
  expect(letterGrade(95)).toBe("A");
});

test("letterGrade edges: 90 is A, 89 is B, 80 is B, 79 is C", () => {
  expect(letterGrade(90)).toBe("A");
  expect(letterGrade(89)).toBe("B");
  expect(letterGrade(80)).toBe("B");
  expect(letterGrade(79)).toBe("C");
});

test("letterGrade edges: 70 is C, 60 is D, 59 is F", () => {
  expect(letterGrade(70)).toBe("C");
  expect(letterGrade(60)).toBe("D");
  expect(letterGrade(59)).toBe("F");
});

test("letterGrade rejects scores out of range", () => {
  expect(letterGrade(-1)).toBe("Invalid");
  expect(letterGrade(101)).toBe("Invalid");
});

test("average3(90, 80, 85) is 85", () => {
  expect(average3(90, 80, 85)).toBe(85);
});

test("average3 rounds: 90, 90, 91 gives 90", () => {
  expect(average3(90, 90, 91)).toBe(90);
});

test('gradeReport("Sam", 90, 80, 85) is "Sam: 85 (B)"', () => {
  expect(gradeReport("Sam", 90, 80, 85)).toBe("Sam: 85 (B)");
});

test('gradeReport("Ada", 100, 100, 100) is "Ada: 100 (A)"', () => {
  expect(gradeReport("Ada", 100, 100, 100)).toBe("Ada: 100 (A)");
});
`,

  hints: [
    "letterGrade is an if / else if chain. Check for Invalid first, then go from the highest grade down to the lowest.",
    "average3: add the three numbers inside brackets, divide by 3, and wrap the whole thing in Math.round(...).",
    "gradeReport: first work out the average with average3, then get its letter with letterGrade, then build the sentence with a template string.",
  ],

  solution: `=== CODE ===
function letterGrade(score) {
  if (score < 0 || score > 100) {
    return "Invalid";
  } else if (score >= 90) {
    return "A";
  } else if (score >= 80) {
    return "B";
  } else if (score >= 70) {
    return "C";
  } else if (score >= 60) {
    return "D";
  } else {
    return "F";
  }
}

function average3(a, b, c) {
  return Math.round((a + b + c) / 3);
}

function gradeReport(name, a, b, c) {
  const average = average3(a, b, c);
  const letter = letterGrade(average);
  return \`\${name}: \${average} (\${letter})\`;
}
=== LINE BY LINE ===
letterGrade line 2: bad scores are rejected first, with || meaning "either of these is true". Then the grades run from highest to lowest; the first true check wins, so "score >= 80" only runs when the score is already below 90.
average3: the brackets make the addition happen BEFORE the division. Math.round then rounds the result to the nearest whole number.
gradeReport: two const boxes hold the average and the letter, so the last line stays easy to read. The template string glues it all together: name, colon, average, and the letter in brackets.
Each function does one job. gradeReport just calls the other two.`,
};
