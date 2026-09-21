import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l2-s13",
  level: 2,
  order: 13,
  title: "Modules",

  look: `A module is one file that keeps its stuff to itself and only shares what it chooses. Think of a restaurant: guests can order from the menu (public), but they cannot walk into the kitchen (private).

In real projects you write it like this, in two files:

  // math.js
  const secretRate = 1.5;                       // private: not exported
  export function double(n) { return n * 2; }   // public: exported

  // app.js
  import { double } from "./math.js";
  double(21);   // 42

Why bother? Small files are easier to read, names do not clash between files, and private details can change without breaking anyone.

This little practice window cannot load other files, so we practise the SAME idea with a function that returns an object. The things inside the function are the kitchen. The returned object is the menu.`,

  type: `Finish makeCalculator(). It returns an object with three public methods:
  add(a, b)       returns a + b and remembers "2 + 3 = 5"
  subtract(a, b)  returns a - b and remembers "10 - 4 = 6"
  history()       returns a COPY of the list of remembered lines, in order
The list itself must stay private: nobody outside should be able to reach into it.`,

  break: `Break it on purpose: make history() return the private list itself instead of a copy.
Now anyone can call history().push("cheat!") and change the calculator's memory. A test catches it. Return a copy again, like [...log].`,

  say: `In one sentence: what is the point of a module keeping some things private?`,

  starterCode: `// Strike 13: modules (the idea, using a function).

function makeCalculator() {
  // keep a private list, and return { add, subtract, history }
}
`,

  tests: `test("add and subtract give the right answers", () => {
  const calc = makeCalculator();
  expect(calc.add(2, 3)).toBe(5);
  expect(calc.subtract(10, 4)).toBe(6);
});

test("history remembers every calculation in order", () => {
  const calc = makeCalculator();
  calc.add(2, 3);
  calc.subtract(10, 4);
  expect(calc.history()).toEqual(["2 + 3 = 5", "10 - 4 = 6"]);
});

test("a new calculator starts with an empty history", () => {
  expect(makeCalculator().history()).toEqual([]);
});

test("changing the history you got back does not change the calculator", () => {
  const calc = makeCalculator();
  calc.add(1, 1);
  const copy = calc.history();
  copy.push("cheat");
  expect(calc.history().length).toBe(1);
});

test("the private list is not reachable from outside", () => {
  const calc = makeCalculator();
  expect(calc.log).toBe(undefined);
  expect(calc.lines).toBe(undefined);
  expect(Object.keys(calc).length).toBe(3);
});
`,

  hints: [
    "Inside makeCalculator make a const log = []. This is the kitchen. Because it is not in the returned object, nobody outside can touch it.",
    'add(a, b): work out the result, push a line like a + " + " + b + " = " + result into log, and return the result. subtract is the same with a minus sign.',
    "history() should return [...log], a photocopy, so people can look but not change your real list.",
  ],

  solution: `=== CODE ===
function makeCalculator() {
  const log = [];

  return {
    add(a, b) {
      const result = a + b;
      log.push(a + " + " + b + " = " + result);
      return result;
    },
    subtract(a, b) {
      const result = a - b;
      log.push(a + " - " + b + " = " + result);
      return result;
    },
    history() {
      return [...log];
    },
  };
}
=== LINE BY LINE ===
log is a plain variable inside makeCalculator, so it is private: it exists only in the kitchen.
The returned object is the menu: only add, subtract and history are public. The three little functions still remember log (that is a closure).
add and subtract calculate, write a line into the log, then return the answer.
history returns [...log], a copy. Whoever gets it can play with the copy, but the real log stays safe. Hiding details and sharing only a small clean surface is exactly what real modules do with export.`,
};
