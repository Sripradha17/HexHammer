import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s22",
  level: 3,
  order: 22,
  title: "Code review basics",

  look: `A code review is when a teammate reads your changes BEFORE they are merged. It catches bugs, shares knowledge, and keeps the code understandable. It is not a test of you. It is a second pair of eyes, like a friend proofreading your essay.

As a REVIEWER:
  Read the description first. What is this change trying to do?
  Check that it does what it says, and look for edge cases (empty input, zero, very big values).
  Be kind and specific. Talk about the CODE, not the person.
    Unkind: "This is sloppy."
    Kind:   "This loop reads one item past the end. Could it be i < numbers.length?"
  Ask questions ("What happens if the list is empty?") instead of giving orders.
  Praise good things too. Say what was nice.
  Small nitpicks are labelled as such ("nit:") and never block a merge.

As the AUTHOR:
  Keep the change small and explain WHY.
  Say thank you. Answer every comment, even just "Done".
  Do not take it personally. The review is about the code.

Here is a piece of code to review. Read it carefully:

  1  function average(numbers) {
  2    let total = 0;
  3    for (let i = 0; i <= numbers.length; i++) {
  4      total += numbers[i];
  5    }
  6    return total / numbers.length;
  7  }

Something is wrong on more than one line.`,

  type: `Two jobs:
1. Fill in the answers object about the code above:
   offByOneLine        the line number of the loop that reads one item too many
   emptyListLine       the line number where an EMPTY list causes a bad division
   kindComment         which review comment is best? a, b or c (see the starter file)
   smallChange         which pull request is easier to review? a or b (see the starter file)
2. Then write the FIXED function average(numbers) that returns the average, and 0 for an empty list.`,

  break: `Try it for real: find a small piece of your own code (maybe from a Level 2 strike), and write two review comments about it, as if you were reviewing a friend: one thing that is good and one question. Say them out loud kindly.
Break it on purpose: rewrite one of your comments in the unkind style, then again in the kind style, and notice how different they feel to receive.`,

  say: `In one sentence: what makes a code review comment helpful instead of hurtful?`,

  starterCode: `// Strike 22: code review basics.

// kindComment:
//   a) "This is wrong. Fix it."
//   b) "This loop reads one item past the end. Should it be i < numbers.length?"
//   c) "Who wrote this?"
//
// smallChange:
//   a) a pull request that changes 1,500 lines across 40 files
//   b) a pull request that changes 30 lines in 2 files and explains why

const answers = {
  offByOneLine: 0,
  emptyListLine: 0,
  kindComment: "",
  smallChange: "",
};

function average(numbers) {
  // write the fixed version
}
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("offByOneLine", () => {
  if (answers.offByOneLine !== 3) {
    throw new Error("Which line has the loop that goes one step too far? (you wrote " + answers.offByOneLine + ")");
  }
});
test("emptyListLine", () => {
  if (answers.emptyListLine !== 6) {
    throw new Error("On which line does an empty list cause 0 / 0? (you wrote " + answers.emptyListLine + ")");
  }
});
test("kindComment", () => {
  if (said(answers.kindComment) !== "b") {
    throw new Error("Which comment is specific and kind? (a, b or c)");
  }
});
test("smallChange", () => {
  if (said(answers.smallChange) !== "b") {
    throw new Error("Which pull request is easier to review? (a or b)");
  }
});
test("average works on a normal list", () => {
  expect(average([1, 2, 3])).toBe(2);
  expect(average([10, 20])).toBe(15);
});
test("average of one number is that number", () => {
  expect(average([7])).toBe(7);
});
test("average of an empty list is 0", () => {
  expect(average([])).toBe(0);
});
`,

  hints: [
    "Count the lines in the code above. The loop condition is the one that says i <= numbers.length: with a list of 3 items, i reaches 3, but the last item is at position 2.",
    "The division happens on the return line. If numbers is empty, its length is 0, and dividing by 0 gives a bad answer.",
    "For your fixed average: return 0 early if numbers.length is 0. Then loop with i < numbers.length (not <=). Add each number to the total and divide at the end.",
  ],

  solution: `=== CODE ===
const answers = {
  offByOneLine: 3,
  emptyListLine: 6,
  kindComment: "b",
  smallChange: "b",
};

function average(numbers) {
  if (numbers.length === 0) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
  }
  return total / numbers.length;
}
=== LINE BY LINE ===
Line 3 is the off-by-one bug: i <= numbers.length runs one time too many. On the last turn numbers[i] is undefined, and adding undefined turns the total into NaN (not a number). The fix is i < numbers.length.
Line 6 is the empty-list bug: numbers.length is 0, so total / 0 is not a useful answer. The fix is an early return of 0 for an empty list, which is a decision the code author should make on purpose and the reviewer should ask about.
kindComment is b: it names the exact problem, suggests a fix, and asks instead of ordering. a and c attack the person or give no information.
smallChange is b: 30 lines with an explanation can be read carefully. 1,500 lines across 40 files will just get a lazy "looks good" and hide bugs.`,
};
