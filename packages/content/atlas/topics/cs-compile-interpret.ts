// Topic: Source code, compilers, interpreters and runtimes. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csCompileInterpret: Topic = {
  id: "cs-compile-interpret",
  domainId: "",
  moduleId: "",
  title: "Source code, compilers, interpreters and runtimes",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Explain the difference between compiling ahead of time and interpreting or JIT-compiling.",
    "Describe what a runtime (like Node.js or a browser engine) adds around your code.",
    "Name the main programming paradigms and recognise each in a short snippet.",
  ],
  prerequisites: ["cs-binary-encoding"],
  subtopics: ["Source code to machine code", "Ahead-of-time compilers", "Interpreters", "Bytecode and JIT", "Runtimes and their APIs", "Transpilers (TypeScript, Babel)", "Paradigms"],
  strikeIds: [],

  story:
    "A new developer asks why `setTimeout` works in Node and in the browser, but `document` only works in the browser and `fs` only in Node. Same language, different results. The answer is that JavaScript the language is only half of what runs: the other half is the runtime around it. Understanding the path from your text file to running instructions explains error messages, performance surprises and why TypeScript types vanish at runtime.",
  mentalModel: {
    plain:
      "The CPU only understands machine code. A compiler translates your whole program into machine code before it runs. An interpreter reads and runs your program step by step. Modern JavaScript engines do both: they start interpreting quickly and compile the hot parts to fast machine code while running (just-in-time, JIT). The runtime is everything around the language: the engine plus APIs like timers, files and the network.",
    analogy:
      "Translating a book. A compiler translates the whole book before anyone reads it. An interpreter is a live interpreter at a meeting, translating sentence by sentence. A JIT is an interpreter who notices you keep saying the same paragraph and writes a polished translation of it to read out instantly next time.",
    analogyLimit:
      "Real engines can also throw away a compiled version if assumptions change (deoptimisation), something no human translator does.",
  },
  lessonSections: [
    {
      heading: "1. From text to instructions",
      body:
        "Your code is text. To run it, a program first parses it: reads the characters and builds a tree of meaning (an abstract syntax tree). A typo found at this stage is a SyntaxError, before a single line runs.\n\nThen the code is turned into instructions something can execute: machine code for the CPU, or bytecode for a virtual machine.",
    },
    {
      heading: "2. Compiled ahead of time",
      body:
        "Languages like C, C++, Go and Rust are compiled before they run. You get an executable file of machine code for one kind of CPU and operating system.\n\nPros: fast start, fast execution, many errors found early. Cons: a build step, and you must compile separately for each platform.",
    },
    {
      heading: "3. Interpreted, bytecode and JIT",
      body:
        "An interpreter runs code without producing a native executable first. Python compiles to bytecode and runs it on its virtual machine. Java and C# compile to bytecode ahead of time, then a JIT compiles hot methods to machine code while running.\n\nJavaScript engines (V8 in Chrome and Node, SpiderMonkey in Firefox) parse your code, run it in an interpreter, watch which functions are hot, and JIT-compile those, betting on the types they have seen.",
    },
    {
      heading: "4. The runtime: language plus a world",
      body:
        "ECMAScript, the JavaScript language, has no way to read a file or draw on a screen. Runtimes add that.\n\nBrowsers add the DOM, fetch, localStorage and timers. Node.js adds fs, http, process and timers. Deno and Bun are other runtimes. So `document` is a browser API, `fs` is a Node API, and `Array.map` is the language itself, available everywhere.",
    },
    {
      heading: "5. Transpilers: compiling one language to another",
      body:
        "TypeScript is compiled (transpiled) to JavaScript: types are checked and then erased. That is why types cannot validate data at runtime.\n\nBuild tools like Vite, esbuild and Babel also transpile modern syntax and JSX into JavaScript that the target runtime understands.",
    },
    {
      heading: "6. Paradigms: styles of telling the computer what to do",
      body:
        "Imperative: step-by-step instructions that change state (a for loop with a counter).\nObject-oriented: data and behaviour bundled into objects (a class with methods).\nFunctional: small pure functions combined, avoiding changing data (map, filter, reduce).\nDeclarative: describe WHAT you want, not how (SQL, HTML, CSS, React components).\n\nMost real languages, including JavaScript, mix all of them.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "The pipeline (parse, compile, run) is shown through the worked example, which demonstrates a SyntaxError happening before any line runs; a diagram would add nothing the example does not show more truthfully.",
  codeExamples: [
    {
      title: "Parsing happens before running",
      language: "js",
      code: `// new Function parses the text first, then we choose whether to run it
const sources = ["console.log('A'); return 1 + 1;", "console.log('B'); return 1 +;"];

for (const src of sources) {
  try {
    const fn = new Function(src);   // parse + compile
    console.log("parsed OK, result:", fn());
  } catch (err) {
    console.log(err.name, "before anything ran");
  }
}

// The same three ideas, written in three paradigms
const nums = [1, 2, 3, 4];
let total = 0;
for (const n of nums) if (n % 2 === 0) total += n;           // imperative
console.log(total, nums.filter((n) => n % 2 === 0).reduce((a, b) => a + b, 0));  // functional`,
      expectedOutput: `A
parsed OK, result: 2
SyntaxError before anything ran
6 6`,
      steps: [
        "The first source parses, so its body runs: it logs A and returns 2.",
        "The second source has `1 +;`, which is not valid JavaScript. The parser rejects it, so 'B' is NEVER logged: a SyntaxError happens before execution.",
        "Then the same sum of even numbers is written imperatively (a loop changing total) and functionally (filter then reduce, no variable changed). Both give 6.",
      ],
    },
  ],
  practicalApplication:
    "This knowledge explains everyday errors: 'document is not defined' means browser code ran in Node (often during server-side rendering); 'Cannot use import statement outside a module' is a runtime configuration issue; a SyntaxError means the file never ran at all. It also explains performance advice: keep hot functions receiving the same types so the JIT's guesses hold. And it explains why TypeScript needs runtime validation (zod, valibot) for API input.",
  commonMistakes: [
    {
      mistake: "Using browser APIs in code that also runs on the server.",
      symptom: "ReferenceError: window is not defined during server-side rendering or tests.",
      fix: "Check `typeof window !== \"undefined\"`, or move browser-only code into effects that run in the browser.",
    },
    {
      mistake: "Trusting TypeScript types for data from outside.",
      symptom: "A crash deep in the code because an API returned null where the type said string.",
      fix: "Types are erased at runtime: validate external data at the boundary with a schema.",
    },
    {
      mistake: "Thinking a syntax error only breaks one line.",
      symptom: "Nothing in the file runs, not even code above the typo.",
      fix: "Remember the whole file is parsed first. Fix syntax errors before debugging behaviour.",
    },
  ],
  misconceptions: [
    { myth: "JavaScript is interpreted, so it is slow.", truth: "Modern engines JIT-compile hot code to machine code. JavaScript is often within a small factor of compiled languages for typical work." },
    { myth: "TypeScript runs in the browser.", truth: "Browsers run JavaScript. TypeScript is compiled to JavaScript first, and its types disappear." },
    { myth: "Compiled and interpreted are properties of a language.", truth: "They are properties of an implementation. Python has compilers, C has interpreters; most modern runtimes mix both." },
  ],
  exercises: [
    {
      kind: "predict",
      question: {
        id: "cs-compile-interpret-p1",
        prompt: "A file contains `console.log(\"start\");` on line 1 and a missing closing bracket on line 50. What happens when Node runs it?",
        choices: ["Prints start, then crashes at line 50", "Prints nothing: SyntaxError before running", "Prints start and ignores line 50", "Runs lines 1 to 49 only"],
        answerIndex: 1,
        explanation: "The whole file is parsed before any of it runs. A syntax error anywhere stops everything, so 'start' is never printed.",
        objective: 0,
      },
    },
    {
      kind: "debug",
      question: {
        id: "cs-compile-interpret-d1",
        prompt: "A shared helper works in the browser but tests (run by Node) fail with 'localStorage is not defined'. Why?",
        code: `export function loadTheme() {
  return localStorage.getItem("theme") ?? "dark";
}`,
        choices: [
          "localStorage is a browser API that Node does not provide",
          "?? is not supported in Node",
          "The function must be async",
          "Exports cannot use globals",
        ],
        answerIndex: 0,
        explanation: "localStorage belongs to the browser runtime, not the JavaScript language. In Node it does not exist unless a test environment (like happy-dom) provides it.",
        objective: 1,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-compile-interpret-k1",
      prompt: "What does a JIT compiler do?",
      choices: ["Compiles everything before running", "Compiles frequently-run code to machine code while the program runs", "Removes type annotations", "Checks code style"],
      answerIndex: 1,
      explanation: "Just-in-time compilers watch the running program and compile the hot parts to fast machine code.",
      objective: 0,
    },
    {
      id: "cs-compile-interpret-k2",
      prompt: "Which of these is part of the JavaScript LANGUAGE, available in every runtime?",
      choices: ["document.querySelector", "fs.readFile", "Array.prototype.map", "localStorage"],
      answerIndex: 2,
      explanation: "map is defined by ECMAScript. document and localStorage come from browsers, fs from Node.",
      objective: 1,
    },
  ],
  project: {
    title: "Tiny Calculator Language: tokenizer, parser and interpreter",
    summary: "Build a mini language for arithmetic expressions with variables, going through the same stages as a real language: tokenize, parse into a tree, then evaluate.",
    type: "implementation",
    objectivesCovered: [0, 2],
    requirements: [
      "A tokenizer that turns `let x = 2 + 3 * 4` into tokens.",
      "A parser that builds a tree respecting precedence (* before +) and parentheses.",
      "An evaluator that walks the tree and keeps variables in an environment.",
      "Clear errors with a position: 'Unexpected token ) at column 7'.",
    ],
    acceptanceCriteria: [
      "A test shows 2 + 3 * 4 evaluates to 14 and (2 + 3) * 4 to 20.",
      "A test shows a syntax error is reported before ANY statement in the program runs.",
      "A test shows using an undefined variable gives a runtime error naming it.",
    ],
    technologies: ["TypeScript", "Vitest"],
    milestones: [
      { title: "Tokens", done_when: "The tokenizer handles numbers, names, operators and parentheses, with tests." },
      { title: "Tree", done_when: "The parser produces a correct tree for precedence and parentheses." },
      { title: "Evaluate", done_when: "The evaluator computes results and stores variables." },
      { title: "Errors", done_when: "Syntax and runtime errors are reported with positions." },
    ],
    testIdeas: ["Empty input", "Unary minus", "Division by zero", "Very long expressions"],
    stretchGoals: ["Compile the tree to JavaScript source instead of interpreting it", "Add functions"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-compile-interpret-a1",
        prompt: "What does an ahead-of-time compiler produce?",
        choices: ["A running program", "Machine code (an executable) before the program runs", "A stack trace", "Bytecode only for browsers"],
        answerIndex: 1,
        explanation: "AOT compilers (C, Go, Rust) translate the whole program into machine code for a target platform before it ever runs.",
        objective: 0,
      },
      {
        id: "cs-compile-interpret-a2",
        prompt: "Why does `fs.readFileSync` work in Node but not in the browser?",
        choices: ["Browsers are older", "fs is a Node runtime API, not part of the JavaScript language", "It needs TypeScript", "Browsers block all file names"],
        answerIndex: 1,
        explanation: "Each runtime adds its own APIs. Node provides file system access; browsers do not, for security.",
        objective: 1,
      },
      {
        id: "cs-compile-interpret-a3",
        prompt: "Which snippet is written in a declarative style?",
        choices: [
          "for (let i = 0; i < a.length; i++) out.push(a[i] * 2);",
          "SELECT name FROM users WHERE age > 30;",
          "let x = 0; x = x + 1;",
          "while (!done) step();",
        ],
        answerIndex: 1,
        explanation: "SQL says WHAT rows you want and lets the database decide HOW to find them. The others are step-by-step (imperative).",
        objective: 2,
      },
      {
        id: "cs-compile-interpret-a4",
        prompt: "What happens to TypeScript types when the code runs?",
        choices: ["They are checked again at runtime", "They are erased: only JavaScript runs", "They make the code faster", "They become comments"],
        answerIndex: 1,
        explanation: "TypeScript checks types during compilation, then removes them. The runtime never sees a type.",
        objective: 1,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-compile-interpret-q01", tags: ["compilers"], difficulty: "foundation", kind: "concept",
      prompt: "What is the difference between a compiled and an interpreted language?",
      expectedElements: ["compiler translates ahead of time to machine code", "interpreter executes step by step", "it's really about implementations", "JIT blends both"],
      modelAnswer: "A compiler translates the whole program into machine code before it runs, giving fast execution and early error checking but a build step per platform. An interpreter reads and executes the program as it goes, so it starts quickly and is portable but each step has overhead. Strictly, these describe implementations, not languages, and most modern runtimes mix them: JavaScript engines and the JVM interpret first and JIT-compile hot code.",
      explanation: "The 'implementations, not languages' nuance is the senior signal.",
      commonWrongAnswers: ["Interpreted languages cannot be fast."],
    },
    {
      id: "cs-compile-interpret-q02", tags: ["javascript", "runtime"], difficulty: "foundation", kind: "concept",
      prompt: "What is the difference between JavaScript and Node.js?",
      expectedElements: ["JavaScript is the language (ECMAScript)", "Node is a runtime: V8 + APIs", "fs, http, process", "browser is another runtime"],
      modelAnswer: "JavaScript is the language, standardised as ECMAScript: syntax, types, objects, Array methods, promises. Node.js is a runtime that runs JavaScript outside the browser: it embeds the V8 engine and adds APIs such as fs for files, http for servers, process for the environment, plus an event loop built on libuv. A browser is a different runtime that adds the DOM, fetch and storage instead.",
      explanation: "Interviewers want the language/runtime split stated clearly.",
      commonWrongAnswers: ["Node is a JavaScript framework."],
    },
    {
      id: "cs-compile-interpret-q03", tags: ["jit", "performance"], difficulty: "advanced", kind: "concept",
      prompt: "How does a JavaScript engine like V8 make code fast?",
      expectedElements: ["parse to AST", "interpreter/bytecode first", "profile hot functions", "optimising JIT with type assumptions", "deoptimisation when assumptions break"],
      modelAnswer: "V8 parses source into an abstract syntax tree, generates bytecode and runs it in its interpreter so code starts quickly. While running, it collects feedback about which functions are hot and what types they receive. Hot functions are compiled by an optimising compiler into machine code that assumes those types. If an assumption breaks, for example a function that always got numbers suddenly gets a string, the engine deoptimises back to bytecode.",
      explanation: "Deoptimisation explains the advice to keep types consistent in hot paths.",
      commonWrongAnswers: ["It compiles all code to machine code before running."],
    },
    {
      id: "cs-compile-interpret-q04", tags: ["typescript"], difficulty: "core", kind: "concept",
      prompt: "If TypeScript checks types, why do teams still validate API responses at runtime?",
      expectedElements: ["types erased at compile time", "external data is untyped", "server can change", "schema validation (zod etc.)"],
      modelAnswer: "TypeScript checks only the code it compiles, then erases the types, so at runtime there is nothing checking that a JSON response matches the interface. External data from APIs, forms or files can be missing fields or have wrong types, especially if the other service changes. So we validate at the boundary with a schema library, which also gives us a TypeScript type derived from the schema.",
      explanation: "A very common practical interview question for TypeScript roles.",
      commonWrongAnswers: ["TypeScript validates JSON automatically."],
    },
    {
      id: "cs-compile-interpret-q05", tags: ["paradigms"], difficulty: "foundation", kind: "concept",
      prompt: "Name the main programming paradigms and give a JavaScript example of each.",
      expectedElements: ["imperative: loops and mutation", "OOP: classes/objects", "functional: pure functions, map/filter", "declarative: JSX/SQL"],
      modelAnswer: "Imperative: step-by-step instructions that change state, like a for loop pushing into an array. Object-oriented: data and behaviour in objects, like a Cart class with addItem. Functional: pure functions composed together, like items.filter(...).map(...). Declarative: describing the result rather than the steps, like a React component's JSX or an SQL query. JavaScript supports all of them, and good code picks the clearest one for each job.",
      explanation: "Concrete examples per paradigm make the answer credible.",
      commonWrongAnswers: ["JavaScript is only object-oriented."],
    },
    {
      id: "cs-compile-interpret-q06", tags: ["debugging", "runtime"], difficulty: "core", kind: "debugging",
      prompt: "A Next.js page crashes during server rendering with 'window is not defined'. Explain and fix.",
      expectedElements: ["code ran on the server runtime (Node)", "window is a browser API", "guard or move into useEffect / client-only", "dynamic import with ssr false"],
      modelAnswer: "The component ran on the server, inside Node, where browser globals like window do not exist. The fix is to touch window only in code that runs in the browser: inside a useEffect, behind a typeof window check, in a client-only component, or by loading the module with a dynamic import that disables server rendering.",
      explanation: "Very common in real React work.",
      commonWrongAnswers: ["Install a window package."],
    },
    {
      id: "cs-compile-interpret-q07", tags: ["bytecode"], difficulty: "core", kind: "concept",
      prompt: "What is bytecode, and why do platforms like the JVM use it?",
      expectedElements: ["intermediate, portable instruction set", "runs on a virtual machine", "compile once, run anywhere", "JIT turns hot bytecode into native code"],
      modelAnswer: "Bytecode is a compact, low-level instruction format for a virtual machine rather than for a real CPU. Java compiles source to bytecode once, and any machine with a JVM can run it, which gives portability. The JVM then interprets the bytecode and JIT-compiles hot parts to native machine code for speed.",
      explanation: "Portability plus later optimisation is the core trade-off.",
      commonWrongAnswers: ["Bytecode is machine code."],
    },
    {
      id: "cs-compile-interpret-q08", tags: ["build-tools"], difficulty: "foundation", kind: "concept",
      prompt: "What does a build tool like Vite or esbuild do with your code?",
      expectedElements: ["transpile TS/JSX to JS", "bundle modules", "minify", "dev server with fast reload"],
      modelAnswer: "It transpiles TypeScript and JSX into plain JavaScript, resolves imports and bundles modules into a few files, minifies the output to make it smaller, and in development serves files quickly with hot reloading. Vite uses esbuild for fast transpiling in development and Rollup for the production bundle.",
      explanation: "Shows you understand the toolchain you use daily.",
      commonWrongAnswers: ["It runs your tests."],
    },
  ],
  references: [
    { title: "MDN: JavaScript technologies overview (language vs APIs)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/JavaScript_technologies_overview", kind: "official-docs" },
    { title: "V8 blog: Ignition and TurboFan", url: "https://v8.dev/blog/launching-ignition-and-turbofan", kind: "article" },
    { title: "Crafting Interpreters (free online book)", url: "https://craftinginterpreters.com/", kind: "book" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Parsing, compiling, interpreting and the language/runtime split are fundamental to every language."],
  versionSpecific: ["V8's exact compiler tiers (Ignition, Sparkplug, Maglev, TurboFan) change over time."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
