import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s11",
  level: 3,
  order: 11,
  title: "Testing: unit tests",

  look: `A unit test is a tiny robot that checks one small piece of your code, automatically, over and over. You already use them: every strike in Hexhammer is checked by tests! Now YOU write them.

A test has three steps, called Arrange, Act, Assert:

  test("adds two numbers", () => {
    const answer = add(2, 3);        // Act: run the code
    expect(answer).toBe(5);          // Assert: is the answer what I expect?
  });

What makes a GOOD set of tests?
  Test the normal case:      isEven(4)  should be true
  Test the opposite case:    isEven(7)  should be false
  Test the EDGES:            zero, negative numbers, empty input, the biggest and smallest values.
Most bugs hide at the edges!

Here is how we will check your tests: we give them to a CORRECT function (all your tests must pass) and then to several BUGGY functions (at least one of your tests must fail on each). If a bug slips past, your tests were not sharp enough.`,

  type: `Write the function myTests(isEven, test, expect). It receives the function to test, plus test and expect. Inside it, write several tests about isEven (true for even numbers, false for odd numbers).
Write at least 4 tests. Catch these sneaky bugs: a version that says odd numbers are even, one that always says true, one that gets negative numbers wrong, and one that gets zero wrong.
Example of one test:  test("2 is even", () => { expect(isEven(2)).toBe(true); });`,

  break: `Break it on purpose: leave out the tests for 0 and for negative numbers. The "bug hiding at the edges" tests will say "Your tests did not notice the bug". A test suite is only as good as the cases it thinks of.`,

  say: `In one sentence: what is a unit test, and why should you test the edges (like zero and empty input)?`,

  starterCode: `// Strike 11: unit tests.
// You are writing tests here, not the isEven function.

function myTests(isEven, test, expect) {
  // write at least 4 tests, for example:
  // test("2 is even", () => { expect(isEven(2)).toBe(true); });
}
`,

  tests: `function runMyTests(candidate) {
  const run = newTestRun();
  myTests(candidate, run.test, run.expect);
  return run.results;
}

function mustNotice(bugName, buggyIsEven) {
  const results = runMyTests(buggyIsEven);
  if (!results.some((result) => !result.passed)) {
    throw new Error("Your tests did not notice this bug: " + bugName);
  }
}

test("you wrote at least 4 tests", () => {
  const results = runMyTests((n) => n % 2 === 0);
  if (results.length < 4) {
    throw new Error("Write at least 4 tests (you wrote " + results.length + ")");
  }
});

test("all your tests pass on a CORRECT isEven", () => {
  const results = runMyTests((n) => n % 2 === 0);
  const failing = results.filter((result) => !result.passed);
  if (failing.length > 0) {
    throw new Error('Your test "' + failing[0].name + '" failed on a correct isEven, so the test itself is wrong: ' + failing[0].message);
  }
});

test("your tests catch: says odd numbers are even (n % 2 === 1)", () => {
  mustNotice("inverted", (n) => n % 2 === 1);
});

test("your tests catch: always says true", () => {
  mustNotice("always true", () => true);
});

test("your tests catch: gets zero wrong (edge)", () => {
  mustNotice("zero", (n) => n % 2 === 0 && n !== 0);
});

test("your tests catch: gets negative numbers wrong (edge)", () => {
  mustNotice("negatives", (n) => n > 0 && n % 2 === 0);
});
`,

  hints: [
    "Write one test for a normal even number, one for a normal odd number. That catches the first two bugs.",
    "Now the edges: zero is an even number, and negative numbers can be even or odd too (-4 is even, -3 is odd).",
    'Each test looks like test("name", () => { expect(isEven(NUMBER)).toBe(true or false); });',
  ],

  solution: `=== CODE ===
function myTests(isEven, test, expect) {
  test("2 is even", () => {
    expect(isEven(2)).toBe(true);
  });
  test("7 is odd", () => {
    expect(isEven(7)).toBe(false);
  });
  test("0 is even (edge)", () => {
    expect(isEven(0)).toBe(true);
  });
  test("-4 is even (negative edge)", () => {
    expect(isEven(-4)).toBe(true);
  });
  test("-3 is odd (negative edge)", () => {
    expect(isEven(-3)).toBe(false);
  });
}
=== LINE BY LINE ===
"2 is even" and "7 is odd" cover the normal case and its opposite. They catch a function that is inverted, or one that always says true.
"0 is even" is an edge. A buggy version that treats zero as special would say false, and this test would fail on it, which is exactly what we want a test to do.
"-4 is even" and "-3 is odd" cover negative numbers. A buggy version that only works for numbers above zero says false for -4, so this test catches it.
Five small tests, each checking one idea. When a test fails, its name tells you exactly what broke.`,
};
