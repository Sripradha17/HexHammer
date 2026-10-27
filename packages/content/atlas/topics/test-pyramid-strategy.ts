// Topic: Test strategy, the testing pyramid and choosing test cases. A COMPLETE topic.
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const testPyramidStrategy: Topic = {
  id: "test-pyramid-strategy",
  domainId: "",
  moduleId: "",
  title: "Test strategy: the pyramid, boundaries and tests you can trust",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Explain unit, integration and end-to-end tests by what they exercise, their speed and what failures they catch.",
    "Design a test mix for a feature using the testing pyramid (and know when a different shape fits).",
    "Choose test cases with equivalence partitions and boundary values.",
    "Recognise flaky and low-value tests and explain why coverage percentage is not quality.",
  ],
  prerequisites: ["cs-functions-scope"],
  subtopics: ["Unit tests", "Integration tests", "End-to-end tests", "The pyramid and the trophy", "Equivalence partitions", "Boundary values", "Flaky tests", "Coverage limits"],
  strikeIds: ["l3-s11", "l3-s12", "l3-s13"],

  story:
    "The team has 94% code coverage and 2,300 tests, and production still breaks every other release. The suite takes 40 minutes, a quarter of the tests are 'known flaky' and get re-run until green, and nobody tested what happens at exactly 50.00 in the free-shipping rule. Lots of tests is not the same as a good test strategy.",
  mentalModel: {
    plain:
      "Each kind of test is a trade between confidence and cost. Small tests of one function are fast and pinpoint bugs, but cannot see how parts fit together. Big tests through the real UI and database catch wiring bugs, but are slow and fragile. A strategy decides how much of each you need, and which inputs are worth testing.",
    analogy:
      "Checking a car: test each part on a bench (unit), test the engine and gearbox together (integration), then take the whole car for a drive (end-to-end). You would not discover a bad spark plug only by test-driving 1,000 cars, and you would not trust a car that has never been driven.",
    analogyLimit:
      "Car parts are fixed. Software 'parts' are defined by you; if you split code badly, unit tests end up testing mocks of mocks and give false confidence. The pyramid's proportions depend on how your system is shaped.",
  },
  lessonSections: [
    {
      heading: "1. Three sizes of test",
      body:
        "Unit test: one function or class, no network, no real database. Milliseconds. It tells you exactly what broke.\nIntegration test: several real parts together, for example an Express route with a real (throwaway) database. Slower, catches wiring and query bugs.\nEnd-to-end (E2E) test: the real app driven like a user would, in a browser. Slowest and most fragile, but proves a whole journey works.",
    },
    {
      heading: "2. The pyramid",
      body:
        "Many fast unit tests at the bottom, fewer integration tests in the middle, a handful of E2E tests for the most important journeys at the top. Fast feedback for most bugs, real confidence for critical flows.\n\nSome teams prefer a 'trophy' shape with more integration tests, because modern tools make them cheap and they test behaviour closer to reality. The principle is the same: put each check at the cheapest level that can catch the bug.",
    },
    {
      heading: "3. Test behaviour, not implementation",
      body:
        "A good test describes what the code should DO for its user: 'orders over 50 ship free'. A brittle test describes HOW: 'calls calculateDiscount exactly once'. Behaviour tests survive refactoring; implementation tests break whenever code is reorganised, even when nothing is wrong.",
    },
    {
      heading: "4. Choosing inputs: partitions and boundaries",
      body:
        "Equivalence partitioning: group inputs that should behave the same, and test one from each group (negative, below threshold, at/above threshold).\n\nBoundary values: bugs cluster at edges. For 'free shipping from 50', test 49.99, 50 and 50.01, plus the edges of validity: 0 and just below 0. `>` vs `>=` mistakes live exactly here.",
    },
    {
      heading: "5. Flaky tests destroy trust",
      body:
        "A flaky test passes and fails without code changes, usually because of time, randomness, test order, shared state or real network calls. Once people re-run until green, the suite stops protecting anyone. Fix the cause: fake timers, fixed random seeds, isolated data, and waiting for conditions instead of sleeping.",
    },
    {
      heading: "6. Coverage is a flashlight, not a score",
      body:
        "Coverage shows which lines ran during tests. It cannot tell you whether the tests checked the right things: a test with no assertions still 'covers' code. Use coverage to find untested areas, not as a target. Mutation testing (changing code to see whether any test fails) measures test quality more honestly.",
    },
  ],
  visualizationType: "ci-pipeline",
  codeExamples: [
    {
      title: "Boundary-value cases for a free-shipping rule",
      language: "js",
      code: `// Rule: orders of 50.00 or more ship free; negative totals are invalid.
function shippingCost(total) {
  if (total < 0) throw new RangeError("total must be >= 0");
  return total >= 50 ? 0 : 4.99;
}

const cases = [
  [-0.01, "RangeError"], // just below the valid range
  [0, 4.99],             // lowest valid value
  [49.99, 4.99],         // just below the threshold
  [50, 0],               // exactly on the threshold
  [50.01, 0],            // just above
];

for (const [input, expected] of cases) {
  let actual;
  try { actual = shippingCost(input); } catch (e) { actual = e.name; }
  console.log(\`\${input} -> \${actual} \${actual === expected ? "PASS" : "FAIL"}\`);
}`,
      expectedOutput: `-0.01 -> RangeError PASS
0 -> 4.99 PASS
49.99 -> 4.99 PASS
50 -> 0 PASS
50.01 -> 0 PASS`,
      steps: [
        "The inputs fall into three partitions: invalid (< 0), paid shipping (0 to 49.99) and free shipping (50 and above).",
        "Instead of testing random values, we test each edge: just outside the valid range, the lowest valid value, and both sides of 50.",
        "If someone changes `>=` to `>`, the case for exactly 50 prints FAIL, and that is the bug customers would notice.",
        "In a real project these would be `test(...)` cases in Vitest; the idea is identical.",
      ],
    },
  ],
  practicalApplication:
    "For each new feature, write a short test plan before coding: the critical user journey (one E2E test), the parts that integrate with the database or other services (integration tests), and the rules with thresholds or branches (unit tests at every boundary). In code review, ask 'which test would fail if this line were wrong?'.",
  commonMistakes: [
    { mistake: "Testing only the happy path.", symptom: "Bugs at limits, empty inputs and errors reach production.", fix: "For every rule, list partitions and boundaries; add a test per edge." },
    { mistake: "Mocking everything in unit tests.", symptom: "Tests pass while the real integration is broken.", fix: "Mock only slow or uncontrollable edges (network, clock); add integration tests for the real wiring." },
    { mistake: "Re-running flaky tests until they pass.", symptom: "Real failures get ignored as 'just flaky'.", fix: "Quarantine and fix the cause; track flaky tests as bugs." },
  ],
  misconceptions: [
    { myth: "100% coverage means the code is fully tested.", truth: "Coverage measures executed lines, not checked behaviour. A test without assertions covers lines and tests nothing." },
    { myth: "E2E tests are the most valuable, so write mostly those.", truth: "They give broad confidence but are slow, flaky and vague about the cause. Use them for critical journeys only." },
    { myth: "Tests slow development down.", truth: "Slow, brittle tests do. Fast, behaviour-focused tests let you change code with confidence and speed up delivery over time." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l3-s11", why: "Write unit tests by hand for a real function." },
    { kind: "strike", strikeId: "l3-s12", why: "Use a mock correctly, and learn where mocking hides bugs." },
    { kind: "strike", strikeId: "l3-s13", why: "Practise red-green-refactor (TDD) on a small feature." },
    { kind: "lab", lab: "ci-pipeline", task: "Arrange test stages in the pipeline lab and inject bugs of different kinds.", goal: "Block every injected bug before deploy, with an average time-to-first-failure under 5 simulated minutes." },
    {
      kind: "debug",
      question: {
        id: "test-pyramid-strategy-d1",
        prompt: "This test passes on a developer's laptop in the morning but fails in CI at night. Which line is the cause?",
        code: `test("greeting", () => {                          // line 1
  const hour = new Date().getHours();               // line 2
  const expected = hour < 12 ? "Good morning" : "Hello"; // line 3
  expect(greet("Ana")).toBe(\`\${expected}, Ana\`);   // line 4
});`,
        choices: ["Line 1", "Line 2", "Line 3", "Line 4"],
        answerIndex: 1,
        explanation: "The test reads the real clock, so its expectation depends on when (and in which time zone) it runs, and greet probably reads the clock at a slightly different moment too. Control time with fake timers (e.g. vi.setSystemTime) or pass the time into greet.",
        objective: 3,
      },
    },
  ],
  knowledgeChecks: [
    { id: "test-pyramid-strategy-k1", prompt: "Which test type gives the most precise location of a bug?", choices: ["End-to-end", "Integration", "Unit", "Manual exploratory"], answerIndex: 2, explanation: "A failing unit test points to one small piece of code.", objective: 0 },
    { id: "test-pyramid-strategy-k2", prompt: "Rule: 'age must be 18 to 65 inclusive'. Which set best covers the boundaries?", choices: ["30, 40, 50", "17, 18, 65, 66", "0, 100", "18, 65"], answerIndex: 1, explanation: "Test both sides of each boundary: 17/18 and 65/66.", objective: 2 },
  ],
  project: {
    title: "Test suite makeover",
    summary: "Take a small existing app (or one of your earlier projects), write a test strategy document, then build a balanced suite: boundary-focused unit tests, integration tests against a real database, and E2E tests for two critical journeys, all running in CI.",
    type: "implementation",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "A TESTING.md with the strategy: what each level covers and why.",
      "Unit tests with explicit partition/boundary cases for at least three business rules.",
      "Integration tests for API routes using a throwaway database.",
      "Two Playwright E2E tests for the most important user journeys.",
      "A CI workflow that runs unit tests first and fails fast.",
    ],
    acceptanceCriteria: [
      "Changing any tested threshold comparison (e.g. >= to >) makes at least one test fail.",
      "The full suite passes 20 times in a row with no retries (no flakiness).",
      "Unit tests complete in under 10 seconds.",
      "TESTING.md explains one bug each level would catch that the others would miss.",
    ],
    technologies: ["Vitest", "supertest", "Playwright", "GitHub Actions", "Docker"],
    milestones: [
      { title: "Strategy", done_when: "TESTING.md is written and reviewed." },
      { title: "Unit layer", done_when: "Boundary tests for three rules pass." },
      { title: "Integration layer", done_when: "API routes are tested with a real test database." },
      { title: "E2E and CI", done_when: "Two journeys pass in CI, 20 runs in a row." },
    ],
    testIdeas: ["Mutation test a threshold", "Fake timers for date logic", "Seeded random data"],
    stretchGoals: ["Run a mutation testing tool and raise the mutation score of one module."],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      { id: "test-pyramid-strategy-a1", prompt: "An integration test differs from a unit test mainly because it…", choices: ["uses a different framework", "exercises several real components together (e.g. route + database)", "always runs in a browser", "has no assertions"], answerIndex: 1, explanation: "Integration tests check how real parts work together.", objective: 0 },
      { id: "test-pyramid-strategy-a2", prompt: "Why does the pyramid put few E2E tests at the top?", choices: ["E2E tests are useless", "They are slow and brittle and give vague failures, so use them for critical journeys", "Browsers cannot run many tests", "They do not need maintenance"], answerIndex: 1, explanation: "Confidence per test is high, but so is cost; keep them for what matters most.", objective: 1 },
      { id: "test-pyramid-strategy-a3", prompt: "A discount applies to orders strictly above 100. Which inputs best test the boundary?", choices: ["50, 150", "100, 100.01", "99, 101", "0, 1000"], answerIndex: 1, explanation: "100 (no discount) and the smallest value above it (discount) catch > vs >= mistakes.", objective: 2 },
      { id: "test-pyramid-strategy-a4", prompt: "Which is most likely to cause a flaky test?", choices: ["A pure function with fixed inputs", "A test that depends on the current time or a real network call", "A test with many assertions", "A slow test"], answerIndex: 1, explanation: "Uncontrolled time, randomness, order and network make results vary.", objective: 3 },
      { id: "test-pyramid-strategy-a5", prompt: "Coverage rose from 70% to 95% by adding tests without assertions. What happened to quality?", choices: ["It improved a lot", "Effectively nothing: lines ran, but nothing is checked", "It got worse because tests are slower", "Coverage and quality are the same thing"], answerIndex: 1, explanation: "Coverage measures execution, not verification.", objective: 3 },
    ],
  },
  interviewQuestions: [
    { id: "test-pyramid-strategy-q01", tags: ["testing", "strategy"], difficulty: "foundation", kind: "concept", prompt: "Explain the testing pyramid.", expectedElements: ["many unit, fewer integration, few E2E", "speed vs confidence", "cost of maintenance", "trophy alternative"], modelAnswer: "The pyramid recommends many fast unit tests, fewer integration tests, and a small number of end-to-end tests for critical journeys. Lower levels are fast, stable and precise; higher levels give more realistic confidence but are slower and more brittle. Some teams favour a 'trophy' with more integration tests. The idea is to catch each bug at the cheapest level that can catch it.", explanation: "Mention the trade-off, not just the shape.", commonWrongAnswers: ["Write tests in the order unit, then integration, then E2E."] },
    { id: "test-pyramid-strategy-q02", tags: ["testing", "test-design"], difficulty: "core", kind: "implementation", prompt: "How would you choose test cases for a password rule: 8-64 characters, at least one digit?", expectedElements: ["partitions: too short, valid, too long, no digit", "boundaries 7,8,64,65", "digit present/absent", "empty string", "unicode/emoji length"], modelAnswer: "Partitions: too short, valid length, too long, missing a digit, and an empty string. Boundaries: lengths 7, 8, 64 and 65. One valid example with a digit and one without. I would also clarify how length is counted (characters vs bytes) and test an emoji, because .length counts UTF-16 units.", explanation: "The emoji follow-up shows depth.", commonWrongAnswers: ["Try a few random passwords."] },
    { id: "test-pyramid-strategy-q03", tags: ["testing", "flaky"], difficulty: "core", kind: "debugging", prompt: "A test fails 1 time in 20 in CI. How do you approach it?", expectedElements: ["do not just retry", "reproduce (loop, seed)", "suspect time, order, shared state, network, async waits", "fix root cause", "quarantine meanwhile"], modelAnswer: "I would not just add retries. I would try to reproduce it by running it in a loop, in a random order, and with the CI settings. Then check the usual causes: real time or time zone, randomness without a seed, shared state between tests, test order, real network calls, and fixed sleeps instead of waiting for a condition. Fix the root cause, quarantining the test meanwhile so it is tracked rather than ignored.", explanation: "Methodical approach matters.", commonWrongAnswers: ["Increase the timeout."] },
    { id: "test-pyramid-strategy-q04", tags: ["testing", "mocks"], difficulty: "core", kind: "concept", prompt: "Mocks, stubs, fakes and spies: what is the difference?", expectedElements: ["stub returns canned data", "mock verifies interactions/expectations", "fake is a working lightweight implementation", "spy records calls on real or fake"], modelAnswer: "A stub returns canned answers so the code under test can run. A mock is set up with expectations and verifies the interactions, such as 'was called with X'. A fake is a working but simplified implementation, like an in-memory repository. A spy records calls, sometimes while passing them through to the real function. All of these are test doubles.", explanation: "Terms vary by framework; explain intent.", commonWrongAnswers: ["They are all the same."] },
    { id: "test-pyramid-strategy-q05", tags: ["testing", "coverage"], difficulty: "foundation", kind: "misconception", prompt: "Your manager wants 100% coverage as a target. How do you respond?", expectedElements: ["coverage measures execution not verification", "Goodhart's law", "use to find gaps", "mutation testing / critical paths"], modelAnswer: "I would agree that coverage is useful for finding untested code, but warn that as a target it gets gamed: tests that execute lines without meaningful assertions raise the number without raising quality. I would propose targets on what matters instead, such as every business rule having boundary tests and critical journeys having E2E coverage, perhaps with mutation testing on core modules.", explanation: "Diplomatic and evidence-based.", commonWrongAnswers: ["Agree; 100% guarantees no bugs."] },
    { id: "test-pyramid-strategy-q06", tags: ["testing", "tdd"], difficulty: "core", kind: "concept", prompt: "Describe TDD and when you find it most and least useful.", expectedElements: ["red-green-refactor", "design pressure", "great for well-defined logic", "less for exploratory UI/spikes"], modelAnswer: "TDD means writing a failing test first (red), the simplest code to pass it (green), then improving the code safely (refactor). It is most useful for well-specified logic and bug fixes, where the failing test reproduces the bug first, and it pushes code towards testable designs. It is less useful for exploratory spikes or visual work where the requirements are still unclear.", explanation: "Balanced answers beat dogma.", commonWrongAnswers: ["TDD means writing tests after the code."] },
    { id: "test-pyramid-strategy-q07", tags: ["testing", "behaviour"], difficulty: "core", kind: "code-reading", prompt: "What is wrong with this test?", code: `test("checkout", () => {\n  const spy = vi.spyOn(cart, "calculateTax");\n  checkout(cart);\n  expect(spy).toHaveBeenCalledTimes(1);\n});`, expectedElements: ["tests implementation not behaviour", "breaks on refactor", "does not check the total", "assert outcome instead"], modelAnswer: "It tests how checkout works internally (calculateTax is called once), not what it produces. It would pass even if the tax were wrong, and fail if someone refactored to compute tax differently but correctly. Assert the observable outcome instead: the order total and tax lines for a known cart.", explanation: "Behaviour over implementation.", commonWrongAnswers: ["Nothing; spies are good practice."] },
    { id: "test-pyramid-strategy-q08", tags: ["testing", "scenario"], difficulty: "advanced", kind: "scenario", prompt: "The CI suite takes 45 minutes and developers stopped running it locally. What do you do?", expectedElements: ["measure where time goes", "move checks down the pyramid", "parallelise/shard", "fix/quarantine flaky", "run fast tests first, fail fast", "test impact analysis"], modelAnswer: "First measure which tests and stages take the time. Then push checks down the pyramid, replacing slow E2E tests that only verify logic with unit or integration tests. Parallelise and shard what remains, run fast tests first so failures surface early, fix or quarantine flaky tests, and consider running only tests affected by the change on pull requests, with the full suite on main.", explanation: "Systemic improvement, not just more hardware.", commonWrongAnswers: ["Delete the slow tests."] },
  ],
  references: [
    { title: "Martin Fowler: The Practical Test Pyramid (Ham Vocke)", url: "https://martinfowler.com/articles/practical-test-pyramid.html", kind: "article" },
    { title: "Vitest documentation", url: "https://vitest.dev/guide/", kind: "official-docs" },
    { title: "Playwright: Best practices", url: "https://playwright.dev/docs/best-practices", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Confidence vs cost trade-offs, boundary values and test determinism."],
  versionSpecific: ["Specific test runner APIs (vi.setSystemTime, Playwright locators) change between versions."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
