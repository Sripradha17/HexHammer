import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s19",
  level: 3,
  order: 19,
  title: "Debugging: breakpoints",

  look: `console.log is like leaving notes along a path. A BREAKPOINT is a pause button: your program freezes on a line, and you can look at every variable, then step forward one line at a time, like watching a movie frame by frame.

Two ways to set one:
  1. In the DevTools Sources panel, click the line NUMBER next to your code. A blue marker appears.
  2. Write the word debugger; inside your code. The browser pauses there whenever DevTools is open.

When the program is paused you can:
  Resume        F8            run on until the next breakpoint
  Step over     F10           run this one line, then pause again (do not go INSIDE functions)
  Step into     F11           if the line calls a function, go inside it
  Step out      Shift+F11     finish this function and pause where it was called
  Watch         type an expression (like total * 2) in the Watch box and see its value

Here is a little program to practise on:

  let total = 0;
  for (let i = 1; i <= 5; i++) {
    total += i * 2;
    debugger;
  }

Each time it pauses, look at i and total in the Scope box on the right.

This is a GUIDED-LOCAL strike: run the snippet yourself in DevTools.`,

  type: `Fill in the answers object:
  resumeKey       the key that resumes (runs until the next breakpoint)
  stepOverKey     the key that steps over a line
  stepIntoKey     the key that steps into a function
  totalThirdStop  in the practice program, what is total on the THIRD time it pauses? (a number)
  iThirdStop      and what is i on that third pause? (a number)`,

  break: `Run the practice program for real:
  1. Open any page, press F12, go to the Sources panel.
  2. On the left, open the Snippets tab (you may need the >> arrows), click "New snippet", paste the program above.
  3. Keep DevTools open and run the snippet with Ctrl+Enter. It pauses at the debugger line.
  4. Press F8 to resume and watch i and total change each time. Note their values on the third pause.
Break it on purpose: click a line number to add a breakpoint on the total += i * 2 line as well, and press F10 a few times. See how stepping shows you the exact order your code runs in.`,

  say: `In one sentence: what is a breakpoint, and how is stepping through code different from using console.log?`,

  starterCode: `// Strike 19: breakpoints.

const answers = {
  resumeKey: "",
  stepOverKey: "",
  stepIntoKey: "",
  totalThirdStop: 0,
  iThirdStop: 0,
};
`,

  tests: `function said(text) {
  return String(text).trim().split(" ").filter(Boolean).join(" ").toLowerCase();
}
function need(what, actual, accepted) {
  if (!accepted.map(said).includes(said(actual))) {
    throw new Error(what + ' (you wrote: "' + String(actual).trim() + '")');
  }
}

test("resumeKey", () => {
  need("Which key resumes?", answers.resumeKey, ["F8"]);
});
test("stepOverKey", () => {
  need("Which key steps over a line?", answers.stepOverKey, ["F10"]);
});
test("stepIntoKey", () => {
  need("Which key steps into a function?", answers.stepIntoKey, ["F11"]);
});
test("totalThirdStop", () => {
  expect(answers.totalThirdStop).toBe(12);
});
test("iThirdStop", () => {
  expect(answers.iThirdStop).toBe(3);
});
`,

  hints: [
    "The three step keys are function keys and sit next to each other on your keyboard: F8 for resume, then F10 and F11 for the two kinds of step.",
    "The practice program adds i * 2 to total once per loop. The first pause has i = 1. Work out the second and third pause on paper, or just run it and read the Scope box.",
    "Third pause: i is 3. total is 2 (for i=1) plus 4 (for i=2) plus 6 (for i=3).",
  ],

  solution: `=== CODE ===
const answers = {
  resumeKey: "F8",
  stepOverKey: "F10",
  stepIntoKey: "F11",
  totalThirdStop: 12,
  iThirdStop: 3,
};
=== LINE BY LINE ===
F8 resumes, F10 steps over (runs the line but does not dive into any function it calls), F11 steps into (dives inside the function so you can watch it work).
The loop pauses once per turn, right after total += i * 2. Turn 1: i is 1, total is 2. Turn 2: i is 2, total is 2 + 4 = 6. Turn 3: i is 3, total is 6 + 6 = 12.
This is the big advantage over console.log: at a pause you can look at EVERY variable at once, and you did not have to guess in advance which ones to print.`,
};
