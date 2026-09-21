import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l1-s02",
  level: 1,
  order: 2,
  title: "Variables",

  look: `A variable is a labeled box that holds a value. You make one with const or let.

  const animal = "cat";   // const: the box never changes
  let lives = 9;          // let: the box can change later
  lives = lives - 1;      // now lives holds 8

Use const by default. Use let only when the value must change.`,

  type: `In the editor, create these three boxes:
1. A const named planet that holds the text "Earth".
2. A let named visitors that starts at 0, then add 5 to it so it ends at 5.
3. A const named greeting that holds the text "Welcome to Earth".`,

  break: `Break it on purpose: try to change planet after you make it (planet = "Mars";).
JavaScript will complain because const boxes are locked. Run the tests, read the error, then undo it.`,

  say: `In one sentence: when do you use const and when do you use let?`,

  starterCode: `// Strike 2: variables are labeled boxes.

// TODO 1: const planet = ...

// TODO 2: let visitors = ... then make it 5

// TODO 3: const greeting = ...
`,

  tests: `test("planet holds Earth", () => {
  expect(planet).toBe("Earth");
});

test("visitors ends at 5", () => {
  expect(visitors).toBe(5);
});

test("greeting holds Welcome to Earth", () => {
  expect(greeting).toBe("Welcome to Earth");
});
`,

  hints: [
    "The shape is: const name = value; The value can be text (in quotes) or a number.",
    "For visitors you need let, because the value changes. Start it at 0, then on a new line set it again.",
    "To add 5, write visitors = visitors + 5; on its own line after you made visitors.",
  ],

  solution: `=== CODE ===
const planet = "Earth";

let visitors = 0;
visitors = visitors + 5;

const greeting = "Welcome to Earth";
=== LINE BY LINE ===
Line 1: const makes a locked box named planet and puts the text "Earth" inside.
Line 3: let makes a box named visitors that CAN change. It starts at 0.
Line 4: read the right side first: visitors + 5 is 0 + 5 = 5. Then the answer goes back into visitors.
Line 6: another const box, this one holds a sentence.
Text always lives inside quote marks. Numbers do not.`,
};
