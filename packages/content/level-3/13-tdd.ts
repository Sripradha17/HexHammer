import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s13",
  level: 3,
  order: 13,
  title: "Testing: TDD",

  look: `TDD means Test-Driven Development. You write the TEST FIRST, watch it fail, and only then write the code. It sounds backwards, but it makes you think clearly and it keeps every bit of code covered by a test.

The dance has three steps, again and again:

  RED       write ONE small test. Run it. It fails (red). Good! Now you know the test can fail.
  GREEN     write the SMALLEST code that makes it pass (green). Nothing fancy.
  REFACTOR  tidy the code while the tests stay green. If a test turns red, you broke something.

Think of building with LEGO by following the picture step by step, checking the model after every brick.

Example: building add(a, b).
  RED:   test add(2, 3) is 5           -> fails, add does not exist
  GREEN: function add(a, b) { return 5; }   (yes, really, the laziest thing that passes!)
  RED:   test add(1, 1) is 2           -> fails, 5 is not 2
  GREEN: function add(a, b) { return a + b; }
  Now both are green, so you are done.

In this strike YOU are the dancer. The tests are ready, and they check ONE RULE EACH. Do NOT write the whole function at once: add one rule, run the tests, watch one more test go green, then add the next rule.`,

  type: `Build slugify(text): it turns a title into a web address piece. Add the rules ONE AT A TIME, running the tests after each rule:
  1. Everything becomes lowercase:                "Hello" -> "hello"
  2. Spaces become dashes:                         "hello world" -> "hello-world"
  3. Anything that is not a letter, number or dash is removed:   "Hello, World!" -> "hello-world"
  4. Several spaces or dashes in a row become ONE dash:           "a   b" -> "a-b"
  5. Dashes at the very start or end are removed:                 "  hi  " -> "hi"`,

  break: `Break it on purpose: write all five rules in one go, without running the tests in between. Now if one test is red, you do not know which rule caused it.
That is the whole reason TDD goes in tiny steps: when a test turns red, you know it was the last thing you changed.`,

  say: `In one sentence: what are the three steps of TDD, and why is it good to see a test fail first?`,

  starterCode: `// Strike 13: TDD. Add ONE rule at a time and run the tests after each one.

function slugify(text) {
  return text;
}
`,

  tests: `test("rule 1: lowercase", () => {
  expect(slugify("Hello")).toBe("hello");
});

test("rule 2: spaces become dashes", () => {
  expect(slugify("hello world")).toBe("hello-world");
});

test("rule 3: weird characters are removed", () => {
  expect(slugify("Hello, World!")).toBe("hello-world");
});

test("rule 4: many spaces or dashes become one dash", () => {
  expect(slugify("a   b")).toBe("a-b");
  expect(slugify("a - b")).toBe("a-b");
});

test("rule 5: no dashes at the start or end", () => {
  expect(slugify("  hi  ")).toBe("hi");
  expect(slugify("--x--")).toBe("x");
});

test("all rules together", () => {
  expect(slugify(" Hello,   World! 2026 ")).toBe("hello-world-2026");
});
`,

  hints: [
    "Rule 1: text.toLowerCase(). Run the tests. Rule 1 goes green. Then chain the next rule onto it with another dot: .replace(...).",
    'Rules 2 to 4: a regular expression like /[^a-z0-9\\s-]/g finds the unwanted characters (rule 3), and /[\\s-]+/g finds runs of spaces and dashes to swap for one "-" (rules 2 and 4).',
    'Rule 5: .replace(/^-+|-+$/g, "") removes dashes at the start (^) and at the end ($). Also .trim() early on helps with the spaces.',
  ],

  solution: String.raw`=== CODE ===
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
=== LINE BY LINE ===
toLowerCase: rule 1. trim removes spaces at both ends early, which helps rule 5.
.replace(/[^a-z0-9\s-]/g, ""): rule 3. Inside [ ] the ^ means NOT, so this finds every character that is not a letter, digit, space or dash, and deletes it.
.replace(/[\s-]+/g, "-"): rules 2 and 4 in one go. It finds any run of one or more spaces or dashes and swaps the whole run for a single dash.
.replace(/^-+|-+$/g, ""): rule 5. ^-+ is dashes at the very start, -+$ is dashes at the very end, and | means "or". Both are deleted.
Chaining works because every string method returns a new string, so the next dot can work on it. In real TDD you would have built this line by line, watching one more test turn green each time.`,
};
