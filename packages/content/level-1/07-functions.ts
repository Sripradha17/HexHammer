import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l1-s07",
  level: 1,
  order: 7,
  title: "Functions",

  look: `A function is a little machine: inputs go in (parameters), an answer comes out (return).
You can give a parameter a default value, and one function can call another.

  function double(n) {
    return n * 2;
  }

  function wave(name = "stranger") {   // default value
    return "Wave at " + name;
  }

  function quadruple(n) {
    return double(double(n));          // a function calling a function
  }`,

  type: `Finish these:
1. add(a, b) returns a plus b.
2. greet(name) returns "Hello, " + name + "!". If no name is given it should use "friend", so greet() is "Hello, friend!".
3. sumOfSquares(a, b) returns the square of a plus the square of b. Use the square function that is already written for you.`,

  break: `Break it on purpose: call add(2) with only one input and console.log the answer.
You will see NaN ("not a number"), because b was never given. Fix it by giving b a default of 0.`,

  say: `In one sentence: what are parameters, and what does return do?`,

  starterCode: `// Strike 7: functions.

function add(a, b) {
  // return a plus b
}

function greet(name) {
  // return "Hello, " + name + "!"  (use "friend" if no name is given)
}

// This one is finished for you. Use it inside sumOfSquares.
function square(n) {
  return n * n;
}

function sumOfSquares(a, b) {
  // return square(a) plus square(b)
}
`,

  tests: `test("add(2, 3) is 5", () => {
  expect(add(2, 3)).toBe(5);
});

test("add(-1, 1) is 0", () => {
  expect(add(-1, 1)).toBe(0);
});

test('greet("Sam") is "Hello, Sam!"', () => {
  expect(greet("Sam")).toBe("Hello, Sam!");
});

test('greet() with no name is "Hello, friend!"', () => {
  expect(greet()).toBe("Hello, friend!");
});

test("sumOfSquares(3, 4) is 25", () => {
  expect(sumOfSquares(3, 4)).toBe(25);
});
`,

  hints: [
    "add is just: return a + b; Type it by hand and check the spelling of return.",
    'A default value goes in the parameter list: function greet(name = "friend"). Then glue the pieces with +.',
    "sumOfSquares: call square(a) and square(b), then add the two answers together.",
  ],

  solution: `=== CODE ===
function add(a, b) {
  return a + b;
}

function greet(name = "friend") {
  return "Hello, " + name + "!";
}

function square(n) {
  return n * n;
}

function sumOfSquares(a, b) {
  return square(a) + square(b);
}
=== LINE BY LINE ===
add: two inputs go in, return hands back their sum.
greet: name = "friend" is a default value. If nobody passes a name, name becomes "friend". Then three strings are glued together with +.
square: (already given) multiplies a number by itself.
sumOfSquares: square(a) runs the square machine and gives back a number, same for square(b). Then + adds them. One function calling another is how big programs are built from small pieces.`,
};
