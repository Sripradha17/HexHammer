// Topic: Functions, scope and closures. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csFunctionsScope: Topic = {
  id: "cs-functions-scope",
  domainId: "",
  moduleId: "",
  title: "Functions, scope and closures",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Write functions that take parameters and return values, and tell returning apart from printing.",
    "Explain lexical scope and predict which variable a line of code can see.",
    "Explain a closure in one sentence and use one to keep private state.",
    "Recognise pure functions and side effects, and say why pure functions are easier to test.",
  ],
  prerequisites: ["cs-control-flow"],
  subtopics: ["Declarations, expressions and arrows", "Parameters, defaults and return", "Block and function scope", "Lexical scope", "Closures", "Pure functions and side effects"],
  strikeIds: ["l1-s01", "l1-s07", "l2-s06", "l2-s05"],

  story:
    "A page has five 'Delete' buttons, and every one of them deletes the LAST row. A rate limiter lets every request through because its counter resets on every call. Both bugs come from not knowing where a variable lives and how long it stays alive. Functions are how you package work; scope and closures decide what that work can remember.",
  mentalModel: {
    plain:
      "A function is a named recipe: inputs go in (parameters), a result comes out (return). Scope is the set of names a line of code can see. A closure is a function that remembers the variables from the place it was created, even after that place has finished running.",
    analogy:
      "Scope is a house with rooms. From inside a room you can see your room and look out into the hallway and the rest of the house, but people in the hallway cannot see into your room. A closure is a backpack: when a function leaves the room where it was made, it carries the variables it uses with it.",
    analogyLimit:
      "The backpack does not hold COPIES. It holds the real variables, so if something changes them later, the function sees the change. That is exactly why the 'every button deletes the last row' bug happens with var.",
  },
  lessonSections: [
    {
      heading: "1. Input, output: parameters and return",
      body:
        "`function add(a, b) { return a + b; }` takes two inputs and hands back one result. The caller decides what to do with it: `const total = add(2, 3);`.\n\n`console.log` only SHOWS a value on screen; `return` GIVES it back to the caller. A function without a return gives back undefined.\n\nDefault parameters cover missing inputs: `function greet(name = \"friend\")`.",
    },
    {
      heading: "2. Three ways to write a function",
      body:
        "Declaration: `function area(w, h) { return w * h; }` can be called before the line where it is written (hoisting).\n\nExpression: `const area = function (w, h) { return w * h; };`.\n\nArrow: `const area = (w, h) => w * h;`. Short and common for callbacks. Arrows do not get their own `this`, which matters in the classes topic.",
    },
    {
      heading: "3. Scope: who can see which name",
      body:
        "A name declared with let or const lives inside the nearest `{ }` block. A name declared inside a function is invisible outside it.\n\nInner code can see outer names; outer code cannot see inner names. If two scopes use the same name, the closest one wins (shadowing).\n\nThis is lexical scope: what a function can see is decided by WHERE it is written in the source, not where it is called from.",
    },
    {
      heading: "4. Closures: functions that remember",
      body:
        "When a function is created inside another function, it keeps access to the outer function's variables even after the outer function has returned.\n\n`function makeCounter() { let count = 0; return () => ++count; }` gives back a function that still sees `count`. Each call to makeCounter creates a fresh `count`, so two counters never share.\n\nThis is how you get private state in JavaScript without classes, and how event handlers, timers and memoisation remember things.",
    },
    {
      heading: "5. The loop-closure trap",
      body:
        "With `var` in a loop, there is ONE variable for the whole loop, so every function created in the loop remembers the same variable, which ends at its final value.\n\nWith `let`, each lap gets its own fresh binding, so each function remembers its own value. This one difference explains the 'every button deletes the last row' bug, and is a favourite interview question.",
    },
    {
      heading: "6. Pure functions and side effects",
      body:
        "A pure function returns the same output for the same input and changes nothing outside itself: `(a, b) => a + b`.\n\nA side effect is anything else: changing a global, writing to a database, logging, reading the clock. Real programs need side effects, but keeping the core logic pure and pushing effects to the edges makes code easy to test: give input, check output, no setup.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "Scope and closures are traced by predicting what each line sees: the predict and debug exercises below do that, and the Scope and closures strike has you build a counter and a once() helper with tests.",
  codeExamples: [
    {
      title: "Private state with a closure, and the loop trap",
      language: "js",
      code: `function makeCounter() {
  let count = 0;
  return () => {
    count = count + 1;
    return count;
  };
}

const a = makeCounter();
const b = makeCounter();
console.log(a(), a(), b());

const withVar = [];
for (var i = 0; i < 3; i++) withVar.push(() => i);
const withLet = [];
for (let j = 0; j < 3; j++) withLet.push(() => j);

console.log(withVar.map((f) => f()));
console.log(withLet.map((f) => f()));`,
      expectedOutput: `1 2 1
[ 3, 3, 3 ]
[ 0, 1, 2 ]`,
      steps: [
        "Each call to makeCounter creates a NEW count variable set to 0 and returns a function that remembers it.",
        "a() twice gives 1 then 2: it is the same count. b() gives 1: b has its own count.",
        "With var, there is one i shared by all three functions. When they finally run, the loop has finished and i is 3, so all three return 3.",
        "With let, each lap creates a fresh j, so the three functions remember 0, 1 and 2.",
      ],
    },
  ],
  practicalApplication:
    "Closures are everywhere in real code: React hooks and event handlers remember props and state through closures (and stale closures are a top React bug), debounce and throttle helpers keep their timer in a closure, and middleware factories like `requireRole(\"admin\")` return a function that remembers its argument. In reviews, prefer small pure functions for business rules and keep database or network calls at the edges, so tests stay fast and simple.",
  commonMistakes: [
    {
      mistake: "Printing a value instead of returning it.",
      symptom: "The output looks right in the console, but the caller receives undefined.",
      fix: "Return the value; let the caller decide whether to print it.",
    },
    {
      mistake: "Creating functions in a loop with var.",
      symptom: "Every handler uses the last value (every Delete button deletes the last row).",
      fix: "Use let (or const in for...of), which gives each lap its own variable.",
    },
    {
      mistake: "Putting a counter inside the function that should remember it.",
      symptom: "The count resets to 0 on every call, so a limiter never limits.",
      fix: "Move the state outside the function that is called repeatedly: into a closure (a factory) or a module-level variable.",
    },
    {
      mistake: "Shadowing a variable by accident.",
      symptom: "Changes to `total` inside a block do not show up outside it.",
      fix: "Do not redeclare (let total) an outer name inside a block; assign to it instead, or use a different name.",
    },
  ],
  misconceptions: [
    { myth: "A closure copies the variables it uses.", truth: "It keeps a live link to the real variables. If they change, the closure sees the new values." },
    { myth: "Scope depends on where a function is called.", truth: "JavaScript uses lexical scope: what a function can see is fixed by where it is written." },
    { myth: "Arrow functions are just shorter regular functions.", truth: "They also do not have their own `this` or `arguments`, which changes behaviour inside objects and classes." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l1-s07", why: "Write functions that return values (not print them), tested by real callers." },
    { kind: "strike", strikeId: "l2-s06", why: "Build a counter and a once() helper with closures, by hand." },
    { kind: "strike", strikeId: "l2-s05", why: "Chain small functions into a pipeline and see how order changes the result." },
    {
      kind: "predict",
      question: {
        id: "cs-functions-scope-p1",
        prompt: "What does this print?",
        code: `let message = "outer";
function show() {
  console.log(message);
}
function run() {
  let message = "inner";
  show();
}
run();`,
        choices: ["\"inner\"", "\"outer\"", "undefined", "A ReferenceError"],
        answerIndex: 1,
        explanation: "Lexical scope: show was WRITTEN at the top level, so it sees the top-level message (\"outer\"). It does not matter that run called it, or that run has its own message.",
        objective: 1,
      },
    },
    {
      kind: "debug",
      question: {
        id: "cs-functions-scope-d1",
        prompt: "This should allow 3 calls and then refuse, but it allows every call. Why?",
        code: `function tryLogin() {
  let attempts = 0;
  attempts = attempts + 1;
  return attempts <= 3 ? "ok" : "locked";
}`,
        choices: ["<= should be <", "attempts is created fresh at 0 on every call, so it is always 1", "let should be var", "The ternary operator is reversed"],
        answerIndex: 1,
        explanation: "State that must survive between calls cannot live inside the function. A factory with a closure, `function makeLogin() { let attempts = 0; return () => ... }`, keeps one attempts counter alive across calls.",
        objective: 2,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-functions-scope-k1",
      prompt: "What does a function return if it has no return statement?",
      choices: ["null", "0", "undefined", "The last value it calculated"],
      answerIndex: 2,
      explanation: "Without return, every JavaScript function gives back undefined. Printing inside it does not change that.",
      objective: 0,
    },
    {
      id: "cs-functions-scope-k2",
      prompt: "Which best describes a closure?",
      choices: ["A function that has finished running", "A function that keeps access to the variables of the scope it was created in", "A function with no parameters", "A way to close a file"],
      answerIndex: 1,
      explanation: "A closure is a function plus the variables it captured from where it was written. It can keep using them after that outer scope is gone.",
      objective: 2,
    },
  ],
  project: {
    title: "Tiny Toolkit: once, debounce and memoize, built by hand",
    summary: "Implement three helpers every codebase uses, each powered by a closure, and prove their behaviour with tests (including fake timers for debounce).",
    type: "implementation",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "`once(fn)` returns a function that runs fn the first time only and returns that first result forever after.",
      "`memoize(fn)` caches results of a single-argument pure function by argument.",
      "`debounce(fn, ms)` waits until calls stop for ms milliseconds, then calls fn once with the latest arguments.",
      "No global variables: all state lives in closures.",
    ],
    acceptanceCriteria: [
      "A test calls once(fn) three times and shows fn ran exactly once.",
      "A test shows memoize calls the slow function once for repeated arguments and again for a new argument.",
      "A test with fake timers shows debounce calls fn once after a burst of 5 calls, with the last arguments.",
      "Two separate memoized functions do not share a cache.",
    ],
    technologies: ["JavaScript or TypeScript", "Vitest (with fake timers)"],
    milestones: [
      { title: "once", done_when: "Implemented and tested, including the returned value." },
      { title: "memoize", done_when: "Implemented with a Map; tests count calls to the original." },
      { title: "debounce", done_when: "Implemented with setTimeout and clearTimeout; fake-timer tests pass." },
      { title: "Explain", done_when: "README explains, per helper, which variable the closure keeps and why." },
    ],
    testIdeas: ["once returning undefined", "memoize with 0 and \"0\" as different keys", "debounce called once vs many times"],
    stretchGoals: ["throttle(fn, ms)", "memoize for multiple arguments", "A cache size limit (LRU)"],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      {
        id: "cs-functions-scope-a1",
        prompt: "What is the value of `result`?",
        code: `function double(n) {
  console.log(n * 2);
}
const result = double(4);`,
        choices: ["8", "\"8\"", "undefined", "4"],
        answerIndex: 2,
        explanation: "double PRINTS 8 but returns nothing, so result is undefined. To use the value, the function must return n * 2.",
        objective: 0,
      },
      {
        id: "cs-functions-scope-a2",
        prompt: "What happens on the last line?",
        code: `if (true) {
  const secret = 42;
}
console.log(secret);`,
        choices: ["Prints 42", "Prints undefined", "ReferenceError: secret is not defined", "Prints null"],
        answerIndex: 2,
        explanation: "const and let live inside their block { }. Outside the block the name does not exist, so it throws a ReferenceError.",
        objective: 1,
      },
      {
        id: "cs-functions-scope-a3",
        prompt: "What does this print?",
        code: `function makeAdder(x) {
  return (y) => x + y;
}
const add5 = makeAdder(5);
console.log(add5(2), add5(10));`,
        choices: ["7 15", "5 5", "NaN NaN", "7 7"],
        answerIndex: 0,
        explanation: "add5 remembers x = 5 through a closure. add5(2) is 7 and add5(10) is 15.",
        objective: 2,
      },
      {
        id: "cs-functions-scope-a4",
        prompt: "Which function is pure?",
        choices: [
          "const total = (items) => items.reduce((s, i) => s + i.price, 0);",
          "let count = 0; const bump = () => ++count;",
          "const now = () => new Date().toISOString();",
          "const save = (user) => db.insert(user);",
        ],
        answerIndex: 0,
        explanation: "total depends only on its input and changes nothing outside. bump changes a variable outside itself, now depends on the clock, and save writes to a database: all side effects.",
        objective: 3,
      },
      {
        id: "cs-functions-scope-a5",
        prompt: "Why do all three functions return 3?",
        code: `const fns = [];
for (var i = 0; i < 3; i++) fns.push(() => i);
fns.map((f) => f()); // [3, 3, 3]`,
        choices: ["Arrow functions cannot see i", "var creates one i for the whole loop, and by the time the functions run it is 3", "push copies the last value", "map runs the functions in reverse"],
        answerIndex: 1,
        explanation: "All three closures share the same var i. Switching to let gives each lap its own i, and the result becomes [0, 1, 2].",
        objective: 2,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-functions-scope-q01", tags: ["closures"], difficulty: "foundation", kind: "concept",
      prompt: "What is a closure? Give a real use.",
      expectedElements: ["function + captured variables from where it was created", "survives after outer function returns", "real use: private state, counters, handlers, debounce"],
      modelAnswer: "A closure is a function bundled with the variables from the scope where it was created; it can keep using them after that outer function has returned. A real use is private state: makeCounter returns a function that increments a count nobody else can touch. Debounce helpers and event handlers rely on the same thing to remember timers and data.",
      explanation: "One sentence of definition plus one concrete example is the ideal shape.",
      commonWrongAnswers: ["A function inside another function (without mentioning the remembered variables)."],
    },
    {
      id: "cs-functions-scope-q02", tags: ["closures", "loops"], difficulty: "core", kind: "code-reading",
      prompt: "What does this log, and how would you fix it?",
      code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
      expectedElements: ["3, 3, 3", "var is function-scoped: one shared i", "timeouts run after the loop ends", "fix with let (or an IIFE)"],
      modelAnswer: "It logs 3, 3, 3. var creates a single i for the whole loop, the callbacks run after the loop has finished, and by then i is 3. Changing var to let fixes it, because let creates a new binding for each iteration, so it logs 0, 1, 2. The pre-ES6 fix was wrapping the body in an immediately invoked function that captured i as a parameter.",
      explanation: "Mentioning that the timeouts run after the loop (event loop) adds depth.",
      commonWrongAnswers: ["0, 1, 2."],
    },
    {
      id: "cs-functions-scope-q03", tags: ["scope"], difficulty: "foundation", kind: "concept",
      prompt: "Explain lexical scope.",
      expectedElements: ["scope decided by where code is written", "inner sees outer, not the reverse", "shadowing", "contrast with dynamic scope"],
      modelAnswer: "Lexical scope means the variables a function can see are decided by where it is written in the source code, not by where it is called from. Inner functions can see names from enclosing scopes, outer code cannot see inner names, and an inner name with the same spelling shadows the outer one. That is what makes closures possible.",
      explanation: "Interviewers often follow up with a 'where was it called from' trick question.",
      commonWrongAnswers: ["Scope depends on who calls the function."],
    },
    {
      id: "cs-functions-scope-q04", tags: ["functions", "hoisting"], difficulty: "core", kind: "concept",
      prompt: "What is hoisting, and how does it differ between function declarations, let/const and var?",
      expectedElements: ["declarations registered before code runs", "function declarations fully usable early", "var hoisted as undefined", "let/const in temporal dead zone (ReferenceError)"],
      modelAnswer: "Before running a scope, JavaScript registers its declarations. Function declarations are hoisted completely, so you can call them above where they are written. var is hoisted but set to undefined until its line runs. let and const are hoisted too but sit in the temporal dead zone: touching them before their line throws a ReferenceError, which surfaces bugs instead of hiding them.",
      explanation: "The temporal dead zone is the detail that marks a strong answer.",
      commonWrongAnswers: ["let and const are not hoisted at all."],
    },
    {
      id: "cs-functions-scope-q05", tags: ["pure-functions", "testing"], difficulty: "core", kind: "design",
      prompt: "What is a pure function, and why do teams push side effects to the edges?",
      expectedElements: ["same input same output", "no side effects", "easy to test and reason about", "functional core, imperative shell"],
      modelAnswer: "A pure function always gives the same output for the same input and changes nothing outside itself. Business rules written as pure functions can be tested with plain input and output, no mocks or databases, and are safe to reuse and cache. So teams keep a pure core (calculate the discount) and do the effects (read the cart from the DB, save the order) in a thin outer layer, sometimes called 'functional core, imperative shell'.",
      explanation: "Naming the pattern shows you have seen it in real codebases.",
      commonWrongAnswers: ["Pure functions are faster."],
    },
    {
      id: "cs-functions-scope-q06", tags: ["closures", "implementation"], difficulty: "core", kind: "implementation",
      prompt: "Describe how you would implement a once(fn) helper.",
      expectedElements: ["closure holds a 'called' flag and the result", "first call runs fn and stores result", "later calls return stored result", "preserve arguments"],
      modelAnswer: "once takes fn and returns a new function. Inside the closure I keep two variables: a boolean called = false and the result. When the returned function runs, if called is false I set it to true, call fn with the arguments I received, store the result and return it. On later calls I skip fn and return the stored result. All state lives in the closure, so separate once wrappers never interfere.",
      explanation: "Explaining it in words (not just code) is what is tested here.",
      commonWrongAnswers: ["Use a global variable to track calls."],
    },
    {
      id: "cs-functions-scope-q07", tags: ["closures", "memory"], difficulty: "advanced", kind: "concept",
      prompt: "Can closures cause memory leaks? How?",
      expectedElements: ["closure keeps captured variables alive", "long-lived handlers/timers capturing large data", "remove listeners/clear timers", "capture only what you need"],
      modelAnswer: "Yes. Anything a closure captures stays alive as long as the closure does. A setInterval or a global event listener that captures a large array or a DOM node keeps them in memory forever, even after the page section is gone. The fixes are clearing timers and removing listeners when done, and capturing only the small values you need instead of whole objects.",
      explanation: "This connects closures to garbage collection, a common senior follow-up.",
      commonWrongAnswers: ["No, JavaScript has garbage collection."],
    },
    {
      id: "cs-functions-scope-q08", tags: ["functions"], difficulty: "foundation", kind: "concept",
      prompt: "What is the difference between returning a value and logging it?",
      expectedElements: ["return gives the value to the caller", "log only displays it", "functions without return give undefined", "testability"],
      modelAnswer: "return hands a value back to whoever called the function, so they can store it, compare it or pass it on. console.log only displays it for a human; the caller gets nothing. A function that only logs returns undefined, and you cannot test its result. Good functions return values and let the caller decide what to print.",
      explanation: "Basic, but a frequent beginner mix-up that interviewers check for in live coding.",
      commonWrongAnswers: ["They are the same if you can see the output."],
    },
  ],
  references: [
    { title: "MDN: Closures", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures", kind: "official-docs" },
    { title: "MDN: Functions guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions", kind: "official-docs" },
    { title: "MDN: Scope (glossary)", url: "https://developer.mozilla.org/en-US/docs/Glossary/Scope", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Functions, lexical scope and closures work the same way in Python, Swift, Kotlin, Go and most modern languages."],
  versionSpecific: ["var, let, const and arrow-function details are JavaScript-specific."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
