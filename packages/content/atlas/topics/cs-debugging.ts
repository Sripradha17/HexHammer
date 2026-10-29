// Topic: Debugging: breakpoints, stack traces and logging. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csDebugging: Topic = {
  id: "cs-debugging",
  domainId: "",
  moduleId: "",
  title: "Debugging: breakpoints, stack traces and logging",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Read a stack trace and find the first frame in your own code.",
    "Use breakpoints, stepping and watch expressions to inspect a running program.",
    "Follow a repeatable method: reproduce, isolate, hypothesise, test, fix, prevent.",
    "Write logs that help the next person debug production problems.",
  ],
  prerequisites: ["cs-call-stack-recursion"],
  subtopics: ["The scientific method for bugs", "Reproducing reliably", "Stack traces", "Breakpoints, stepping, watch and the call stack panel", "Binary search for bugs (git bisect)", "Rubber-duck debugging", "Useful logs"],
  strikeIds: ["l3-s18", "l3-s19", "l3-s20", "prof-s04"],

  story:
    "Two developers get the same bug report: 'checkout total is sometimes wrong'. One changes five lines that look suspicious, adds console.logs everywhere, and after two days ships a fix that breaks discounts. The other reproduces it in ten minutes with a specific cart, sets one breakpoint, sees a string where a number should be, writes a failing test, fixes one line and ships before lunch. Debugging is not a talent; it is a method, and it is the skill you need most when you build without leaning on AI.",
  mentalModel: {
    plain:
      "A bug is a gap between what you believe the code does and what it actually does. Debugging is shrinking that gap with evidence: make the bug happen on demand, narrow down WHERE it starts, form one guess about WHY, test that guess, then fix and add a test so it cannot come back.",
    analogy:
      "A detective at a crime scene. They do not arrest the person who looks suspicious; they collect evidence, rebuild the timeline, test one theory at a time, and only then make an arrest. A stack trace is the timeline; a breakpoint is freezing time to look around the room.",
    analogyLimit:
      "Detectives cannot rerun the crime. You can: reproducing the bug again and again is your biggest advantage, so never skip it.",
  },
  lessonSections: [
    {
      heading: "1. Reproduce it on demand",
      body:
        "Before changing anything, find exact steps or input that make the bug happen every time. Write them down. Shrink them: the smallest input that still fails is the best clue.\n\nIf you cannot reproduce it, you cannot know you fixed it. For intermittent bugs, collect more data (logs, request ids, timestamps) until you can.",
    },
    {
      heading: "2. Read the error properly",
      body:
        "Read the whole message, then the stack trace from the top. Skip frames in node_modules and find the first frame in YOUR code: that is where your code handed something bad on or used a missing value.\n\n`TypeError: Cannot read properties of undefined (reading 'price')` means something.price was read while something was undefined. The real question is: why was it undefined?",
    },
    {
      heading: "3. Breakpoints beat guessing",
      body:
        "A breakpoint pauses the program on a line. While paused you can read every variable, see the call stack, and step: over (run this line), into (enter the function), out (finish this function).\n\nIn the browser: DevTools Sources panel, or put `debugger;` in the code. In Node: `node --inspect` and attach Chrome or VS Code. Conditional breakpoints pause only when, say, `order.total < 0`.",
    },
    {
      heading: "4. Isolate: binary search the problem",
      body:
        "Halve the search space. Does the data look right halfway through the pipeline? Then the bug is later. Comment out half the logic, swap in fixed inputs, or compare with a version that worked.\n\n`git bisect` does this across history: mark a good and a bad commit, and Git checks out the middle until it finds the exact commit that introduced the bug.",
    },
    {
      heading: "5. One hypothesis at a time",
      body:
        "State a guess you can test: 'the price arrives as a string from the form'. Design a check that would prove it wrong. Change one thing at a time; if you change five things, you learn nothing.\n\nStuck? Explain the code line by line, out loud, to a rubber duck or a colleague. Saying what each line SHOULD do often reveals where it does not.",
    },
    {
      heading: "6. Fix, prove, prevent",
      body:
        "Write a test that fails because of the bug BEFORE fixing it. Fix the cause, not the symptom. Watch the test pass.\n\nThen ask: where else could this happen? Could validation at the boundary, a type or a better error message have caught it earlier? Good logs (structured, with ids and the values that mattered, never secrets) make the next bug faster to find.",
    },
  ],
  visualizationType: "log-trace",
  codeExamples: [
    {
      title: "Evidence instead of guesses",
      language: "js",
      code: `// Bug report: "the cart total is sometimes wrong"
function cartTotal(items) {
  let total = 0;
  for (const item of items) total += item.price;
  return total;
}

// 1. Reproduce with the smallest failing input
const items = [{ name: "tea", price: 10 }, { name: "cake", price: "5" }];
console.log("total:", cartTotal(items), typeof cartTotal(items));

// 2. Look at the evidence (what a breakpoint inside the loop would show)
for (const item of items) console.log(item.name, typeof item.price);

// 3. Hypothesis: a price arrives as text from the form. Test it.
const bad = items.filter((i) => typeof i.price !== "number");
console.log("non-number prices:", bad.map((i) => i.name));

// 4. Fix the cause where the data enters, then check again
const clean = items.map((i) => ({ ...i, price: Number(i.price) }));
console.log("fixed total:", cartTotal(clean));`,
      expectedOutput: `total: 105 string
tea number
cake string
non-number prices: [ 'cake' ]
fixed total: 15`,
      steps: [
        "Reproduce: two items are enough. The total prints 105 and its type is string, not number: the bug happens on demand.",
        "Evidence: looking at each item's type (exactly what a breakpoint in the loop would show) reveals cake's price is a string.",
        "Hypothesis tested: 10 + \"5\" glues text into \"105\". Exactly one item has a non-number price, so the bad value came from where the data entered.",
        "Fix the cause at the boundary, not the symptom in the loop: converting prices once makes the total 15. Next, a test with a string price stops it coming back.",
      ],
    },
  ],
  practicalApplication:
    "Make the debugger your first tool, not your last: learn the DevTools Sources panel, conditional breakpoints, and attaching to Node with --inspect. In production, rely on structured logs with request ids, error tracking with stack traces, and the ability to reproduce with real (anonymised) data. When you use AI for help later, the same method applies: an AI suggestion is a hypothesis, and you verify it with evidence before accepting it.",
  commonMistakes: [
    {
      mistake: "Changing code before reproducing the bug.",
      symptom: "You 'fix' it, the report comes back, and you do not know whether your change mattered.",
      fix: "Reproduce first, ideally as a failing test.",
    },
    {
      mistake: "Changing several things at once.",
      symptom: "The bug disappears (or moves) and nobody knows why.",
      fix: "One change per experiment, then observe.",
    },
    {
      mistake: "Fixing the symptom where the crash appears.",
      symptom: "Adding `if (!user) return` everywhere; the real source of the bad data keeps creating new bugs.",
      fix: "Trace the bad value back to where it was created and fix it there.",
    },
    {
      mistake: "Leaving debugging console.logs and secrets in logs.",
      symptom: "Noisy logs, and passwords or tokens stored in log systems.",
      fix: "Remove temporary logs; use a structured logger with levels and redaction.",
    },
  ],
  misconceptions: [
    { myth: "Good developers just see the bug.", truth: "Experienced developers follow a method faster, often without saying it. The method is learnable." },
    { myth: "console.log is all you need.", truth: "Logs are great in production; locally, a breakpoint shows every variable and the whole call stack at once." },
    { myth: "If the tests pass, there is no bug.", truth: "Tests only check what they test. A bug means a missing test, which you add when you fix it." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l3-s18", why: "Read stack traces and find the first frame in your own code." },
    { kind: "strike", strikeId: "l3-s19", why: "Use the debugger: breakpoints, stepping and watching values." },
    { kind: "lab", lab: "log-trace", task: "Follow one request through structured logs and a trace waterfall.", goal: "Blame the slow span in the trace, then filter the logs by that request's trace id." },
    {
      kind: "debug",
      question: {
        id: "cs-debugging-d1",
        prompt: "Which line should you look at first?",
        code: `TypeError: Cannot read properties of undefined (reading 'name')
    at formatUser (src/format.js:4:22)
    at renderProfile (src/profile.js:17:10)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)`,
        choices: [
          "node:internal/process/task_queues:95",
          "src/format.js line 4: it read .name of something undefined, called from profile.js line 17",
          "There is no way to know",
          "The last line, because errors start at the bottom",
        ],
        answerIndex: 1,
        explanation: "The top frame in your own code is where .name was read on undefined. Then look one frame down (profile.js:17) to see why it passed undefined.",
        objective: 0,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-debugging-k1",
      prompt: "What is the FIRST step of debugging a reported bug?",
      choices: ["Rewrite the module", "Reproduce it reliably", "Add logs everywhere", "Ask for a new laptop"],
      answerIndex: 1,
      explanation: "Without a reliable reproduction you cannot test hypotheses or prove a fix.",
      objective: 2,
    },
    {
      id: "cs-debugging-k2",
      prompt: "What does 'step into' do at a breakpoint?",
      choices: ["Runs to the end of the program", "Enters the function called on the current line", "Skips the current line", "Restarts the program"],
      answerIndex: 1,
      explanation: "Step into follows the call into the function; step over runs it without entering; step out finishes the current function.",
      objective: 1,
    },
  ],
  project: {
    title: "Bug Hunt Kit: five planted bugs, five written investigations",
    summary: "Take a small app with five deliberately planted bugs (wrong type, off-by-one, async race, stale closure, bad config), and for each write a short investigation report: reproduction, evidence, hypothesis, fix and the test that prevents it.",
    type: "debugging-lab",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "A small app (or use a provided one) with five planted bugs of different kinds.",
      "For each bug: minimal reproduction steps and a failing test written BEFORE the fix.",
      "Use the debugger for at least three bugs and include a screenshot of the paused state.",
      "Add structured logging (JSON lines with a request id) to the app's request path.",
    ],
    acceptanceCriteria: [
      "Each bug has a test that fails on the original code and passes after the fix.",
      "Each report names the first stack frame or evidence that pointed to the cause.",
      "Logs contain no secrets (a test checks that a password field is redacted).",
    ],
    technologies: ["Node.js or the browser", "Chrome DevTools or VS Code debugger", "Vitest"],
    milestones: [
      { title: "Reproduce", done_when: "All five bugs have reliable reproductions." },
      { title: "Investigate", done_when: "Evidence and a hypothesis are written for each." },
      { title: "Fix and test", done_when: "Five failing-then-passing tests exist." },
      { title: "Prevent", done_when: "Structured logging and one validation guard are added." },
    ],
    testIdeas: ["A test for each planted bug", "Redaction of secrets in logs"],
    stretchGoals: ["Use git bisect to find when a bug was introduced", "Add error tracking with source maps"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-debugging-a1",
        prompt: "Why write a failing test before fixing a bug?",
        choices: ["It is faster to write tests than code", "It proves you reproduced the bug and that the fix works, and stops it returning", "Tests are required to commit", "It hides the bug"],
        answerIndex: 1,
        explanation: "The test captures the reproduction, proves the fix, and guards against regressions.",
        objective: 2,
      },
      {
        id: "cs-debugging-a2",
        prompt: "A bug appeared somewhere in the last 200 commits. What finds the culprit fastest?",
        choices: ["Read every commit", "git bisect (binary search over commits)", "Revert everything", "Ask in a chat"],
        answerIndex: 1,
        explanation: "Bisect halves the range each time: about 8 tests for 200 commits.",
        objective: 2,
      },
      {
        id: "cs-debugging-a3",
        prompt: "What does a conditional breakpoint do?",
        choices: ["Pauses on every line", "Pauses only when a condition you give is true", "Deletes code", "Logs and never pauses"],
        answerIndex: 1,
        explanation: "Useful in loops: pause only when, for example, total < 0.",
        objective: 1,
      },
      {
        id: "cs-debugging-a4",
        prompt: "Which log line is most useful in production?",
        choices: [
          "console.log(\"here\")",
          "{ \"level\": \"error\", \"msg\": \"payment failed\", \"requestId\": \"r-81\", \"orderId\": 42, \"provider\": \"stripe\", \"status\": 402 }",
          "console.log(user) including the password hash",
          "\"something broke\"",
        ],
        answerIndex: 1,
        explanation: "Structured fields with ids and the relevant values let you search and correlate; no secrets.",
        objective: 3,
      },
      {
        id: "cs-debugging-a5",
        prompt: "A stack trace lists frames in node_modules first, then src/cart.js:42, then src/routes.js:10. Where do you start?",
        choices: ["The first node_modules frame", "src/cart.js line 42: the first frame in your own code", "src/routes.js line 10", "The bottom of the trace"],
        answerIndex: 1,
        explanation: "Library frames show where the error surfaced. The first frame in your code shows what you called and with what; routes.js:10 then shows how you got there.",
        objective: 0,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-debugging-q01", tags: ["debugging", "process"], difficulty: "foundation", kind: "behavioral",
      prompt: "Walk me through how you debug a problem you have never seen before.",
      expectedElements: ["reproduce", "read error and stack trace", "isolate / narrow down", "hypothesis, one change at a time", "fix root cause with a test", "prevent recurrence"],
      modelAnswer: "First I reproduce it reliably and shrink it to the smallest failing case. I read the full error and stack trace and find the first frame in our code. Then I narrow down where correct data turns wrong, with breakpoints or by checking intermediate values, halving the search space. I form one hypothesis at a time and test it. Once I find the root cause, I write a failing test, fix the cause rather than the symptom, and look for similar code that could fail the same way.",
      explanation: "A structured method is exactly what is asked.",
      commonWrongAnswers: ["I add console.logs until I find it."],
    },
    {
      id: "cs-debugging-q02", tags: ["debugging", "production"], difficulty: "core", kind: "scenario",
      prompt: "A bug happens only in production, never locally. How do you approach it?",
      expectedElements: ["differences: data, config, scale, timing, versions", "logs/traces/error tracking with ids", "reproduce with production-like data", "feature flags / more logging", "safe experiments"],
      modelAnswer: "I list what differs between production and local: data volume and shape, configuration and environment variables, dependency versions, concurrency and timing, and infrastructure such as proxies or caches. I use the evidence production gives me, error tracking with stack traces, structured logs and traces correlated by request id, to find the failing requests. Then I reproduce with production-like data or config locally or in staging. If I still need more data, I add targeted logging behind a flag rather than guessing.",
      explanation: "Systematic difference-hunting is the key.",
      commonWrongAnswers: ["Debug directly in production by editing code."],
    },
    {
      id: "cs-debugging-q03", tags: ["debugging", "tools"], difficulty: "foundation", kind: "concept",
      prompt: "What can a debugger do that console.log cannot?",
      expectedElements: ["pause execution", "inspect all variables and call stack", "step through", "conditional breakpoints", "change values live"],
      modelAnswer: "A debugger pauses the program at a chosen point and shows every variable in scope and the whole call stack at that moment, without deciding in advance what to print. I can step line by line or into functions, use conditional breakpoints that pause only on the bad case, watch expressions, and even change values to test a hypothesis. console.log is still great for timing-sensitive bugs and production.",
      explanation: "Balanced answers value both tools.",
      commonWrongAnswers: ["Nothing, logs are enough."],
    },
    {
      id: "cs-debugging-q04", tags: ["git-bisect"], difficulty: "core", kind: "concept",
      prompt: "What is git bisect and when would you use it?",
      expectedElements: ["binary search over commits", "mark good and bad", "test each midpoint", "log2(n) steps", "can automate with a test script"],
      modelAnswer: "git bisect binary-searches the commit history to find the commit that introduced a bug. I mark a known good commit and a known bad one; Git checks out the midpoint, I test and mark it good or bad, and it halves the range until it finds the culprit, about log₂(n) steps, so around 10 for 1,000 commits. With git bisect run and a test script it is fully automatic.",
      explanation: "Automation with bisect run is a strong extra.",
      commonWrongAnswers: ["It splits a branch into two."],
    },
    {
      id: "cs-debugging-q05", tags: ["debugging", "intermittent"], difficulty: "advanced", kind: "scenario",
      prompt: "How do you debug an intermittent bug that happens about once in a hundred runs?",
      expectedElements: ["suspect timing/concurrency/shared state/external dependency", "run many times to reproduce", "add correlation ids and logs", "control randomness/time", "test isolation"],
      modelAnswer: "Intermittent bugs usually come from timing, shared state, ordering, randomness or an external dependency. I first make it reproducible by running it many times in a loop and recording the conditions when it fails. I add logs with ids and timestamps around the suspected area, control sources of nondeterminism with fixed seeds, fake clocks and stubbed services, and check whether tests share state or depend on order. Once it fails reliably, the normal method applies.",
      explanation: "Turning intermittent into deterministic is the goal.",
      commonWrongAnswers: ["Retry until it passes."],
    },
    {
      id: "cs-debugging-q06", tags: ["logging"], difficulty: "core", kind: "concept",
      prompt: "What makes a good log line?",
      expectedElements: ["structured (JSON) fields", "level", "correlation/request id", "relevant ids and values", "no secrets/PII", "actionable message"],
      modelAnswer: "A good log line is structured, usually JSON, so it can be searched and filtered. It has a level, a clear message describing what happened, a correlation or request id to follow one request across services, and the specific ids and values that matter, like the order id and the provider's status code. It never contains secrets or unnecessary personal data, and it is written for the person debugging at 3 a.m.",
      explanation: "Correlation ids and no secrets are must-haves.",
      commonWrongAnswers: ["Log everything, including request bodies."],
    },
    {
      id: "cs-debugging-q07", tags: ["debugging", "ai"], difficulty: "core", kind: "scenario",
      prompt: "An AI assistant suggests a fix for a bug. How do you decide whether to accept it?",
      expectedElements: ["treat it as a hypothesis", "reproduce bug first", "failing test before applying", "understand every line", "check side effects/edge cases"],
      modelAnswer: "I treat the suggestion as a hypothesis, not an answer. I make sure I have a failing test that reproduces the bug, apply the change, and check the test passes and nothing else breaks. I read and understand every line of the fix, check it addresses the root cause rather than hiding the symptom, and think about edge cases and side effects. If I cannot explain why it works, I do not merge it.",
      explanation: "Verifying AI output is now a real interview topic.",
      commonWrongAnswers: ["If the AI is confident, accept it."],
    },
    {
      id: "cs-debugging-q08", tags: ["debugging", "story"], difficulty: "foundation", kind: "behavioral",
      prompt: "Tell me about the hardest bug you have fixed.",
      expectedElements: ["context and impact", "how it was reproduced", "evidence that led to root cause", "the fix and test", "what changed to prevent recurrence"],
      modelAnswer: "A strong answer follows a structure: the context and why it mattered (users affected, money at risk), how you made it reproducible, which piece of evidence finally pointed to the root cause, the fix and the test you added, and what you changed so it could not happen again, such as validation, monitoring or a lint rule. Prepare one real story in this shape and practise telling it in under three minutes.",
      explanation: "Behavioural debugging stories are near-universal; the model answer here is a template to fill with your own.",
      commonWrongAnswers: ["I once fixed a typo."],
    },
  ],
  references: [
    { title: "Chrome DevTools: Debug JavaScript", url: "https://developer.chrome.com/docs/devtools/javascript", kind: "official-docs" },
    { title: "Node.js docs: Debugging guide", url: "https://nodejs.org/en/learn/getting-started/debugging", kind: "official-docs" },
    { title: "Git docs: git-bisect", url: "https://git-scm.com/docs/git-bisect", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Reproduce, isolate, hypothesise, test and prevent is how debugging works in every language."],
  versionSpecific: ["DevTools panel names and debugger flags change between tool versions."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
