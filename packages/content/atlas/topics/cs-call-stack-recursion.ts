// Topic: The call stack and recursion. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csCallStackRecursion: Topic = {
  id: "cs-call-stack-recursion",
  domainId: "",
  moduleId: "",
  title: "The call stack and recursion",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Trace a call stack frame by frame for nested calls.",
    "Write a recursive function with a correct base case and a step that shrinks the problem.",
    "Explain what causes a stack overflow and how to avoid it.",
    "Recognise problems that suit recursion: trees, nested data, backtracking.",
  ],
  prerequisites: ["cs-functions-scope"],
  subtopics: ["Stack frames", "Last in, first out", "Base case and recursive case", "Stack overflow", "Recursion vs loops", "Recursion on nested data", "Backtracking"],
  strikeIds: ["l2-s09", "dsa-s08", "l3-s20"],

  story:
    "A comment section with replies to replies to replies needs to be counted and shown. A loop gets tangled after two levels. A function that says 'count this comment, then count each reply the same way' solves any depth in five lines. The same idea, given a cyclic data structure by mistake, brings the server down with 'Maximum call stack size exceeded'. Recursion is powerful precisely because it leans on the call stack, so you need to see that stack clearly.",
  mentalModel: {
    plain:
      "Every time a function is called, JavaScript puts a frame on the call stack: a note holding that call's arguments, local variables and where to return to. When the function returns, its frame comes off. Recursion is a function calling itself on a smaller piece of the problem, stacking frames until it reaches a case small enough to answer directly (the base case), then unstacking with the answers.",
    analogy:
      "A stack of plates. Each call puts a plate on top; you can only take the top plate off. Recursion is like asking 'how many people are in this line?' by tapping the person in front and asking them the same question; the person at the front says 'just me', and the answers come back one by one, each adding one.",
    analogyLimit:
      "A real stack has a fixed height limit (a few thousand to tens of thousands of frames in JavaScript). A line of people can be any length; the call stack cannot.",
  },
  lessonSections: [
    {
      heading: "1. Frames on the stack",
      body:
        "When `main` calls `a`, and `a` calls `b`, the stack holds main, a, b, with b on top. b must finish before a can continue, and a before main: last in, first out.\n\nAn error's stack trace is a printout of exactly this stack at the moment of the error.",
    },
    {
      heading: "2. The two parts of every recursive function",
      body:
        "Base case: an input small enough to answer directly, without calling itself (an empty list sums to 0).\n\nRecursive case: break the problem into a smaller piece of the same kind and call yourself on it (sum = first item + sum of the rest).\n\nEvery recursive call must move closer to the base case. If it does not, the calls never stop.",
    },
    {
      heading: "3. Trace it with a small input",
      body:
        "factorial(3) calls factorial(2), which calls factorial(1), which hits the base case and returns 1. Then factorial(2) finishes with 2 × 1 = 2, and factorial(3) with 3 × 2 = 6.\n\nWriting the calls going down and the returns coming back up, on paper, is the most reliable way to understand or debug any recursive function.",
    },
    {
      heading: "4. Stack overflow",
      body:
        "Each pending call holds a frame. Missing base case, a step that does not shrink, or simply very deep input (a 100,000-item linked list) exhausts the stack: RangeError: Maximum call stack size exceeded.\n\nFixes: correct the base case, convert deep linear recursion to a loop, or use an explicit stack (an array you push and pop) for deep trees.",
    },
    {
      heading: "5. Where recursion shines",
      body:
        "Recursive data: trees, nested comments, folders inside folders, JSON of unknown depth. The code shape mirrors the data shape.\n\nDivide and conquer: merge sort, quicksort, binary search.\n\nBacktracking: try a choice, recurse, undo it, try the next (generating permutations, solving sudoku, finding paths in a maze).",
    },
  ],
  visualizationType: "none",
  visualNote:
    "The worked example prints its own call stack with indentation as it runs, which is the clearest visualisation: you see every frame go on and come off.",
  codeExamples: [
    {
      title: "Watch the stack grow and shrink",
      language: "js",
      code: `function sumNested(value, depth = 0) {
  const pad = "  ".repeat(depth);
  if (typeof value === "number") {           // base case: a plain number
    console.log(pad + "number " + value);
    return value;
  }
  console.log(pad + "list of " + value.length);
  let total = 0;
  for (const item of value) total += sumNested(item, depth + 1);   // smaller pieces
  console.log(pad + "= " + total);
  return total;
}

sumNested([1, [2, 3], 4]);`,
      expectedOutput: `list of 3
  number 1
  list of 2
    number 2
    number 3
  = 5
  number 4
= 10`,
      steps: [
        "The first call gets the outer list of 3 items. Each item is handled by a new call, one level deeper (two more spaces).",
        "1 is a number: the base case returns it straight away.",
        "[2, 3] is a list, so that call makes two more calls (depth 2) for 2 and 3, adds them to 5 and returns 5. Its frame comes off the stack.",
        "4 is a number. The outer call now has 1 + 5 + 4 = 10. Notice each '=' line prints only after all its inner calls have finished: last in, first out.",
      ],
    },
  ],
  practicalApplication:
    "Recursion is the natural fit for tree-shaped data: rendering nested comments or menus, walking a file system, traversing the DOM, deep-cloning or comparing JSON. For very deep or untrusted data, use an explicit stack to avoid overflows and guard against cycles with a visited Set. In interviews, recursive solutions to tree problems are expected, and being able to trace them aloud, then discuss stack depth as O(height) space, is a strong signal.",
  commonMistakes: [
    {
      mistake: "No base case, or a base case that is never reached.",
      symptom: "RangeError: Maximum call stack size exceeded.",
      fix: "Write the base case first, and check that every recursive call gets strictly closer to it.",
    },
    {
      mistake: "Forgetting to return the recursive result.",
      symptom: "The function returns undefined even though the inner calls compute the right value.",
      fix: "Write `return recurse(...)` (or combine and return it), not just `recurse(...)`.",
    },
    {
      mistake: "Recursing over data that can contain cycles.",
      symptom: "Stack overflow on objects that reference themselves (a parent pointing to a child pointing back).",
      fix: "Keep a Set of visited nodes and skip ones you have already seen.",
    },
  ],
  misconceptions: [
    { myth: "Recursion is always slower than a loop.", truth: "For tree-shaped work the cost is similar; the main real cost is stack memory and the depth limit." },
    { myth: "Recursion uses no extra memory.", truth: "Every pending call holds a frame: depth n means O(n) stack space." },
    { myth: "JavaScript optimises tail calls, so deep tail recursion is safe.", truth: "Tail call optimisation is in the specification but V8 and most engines do not implement it. Use loops for deep linear recursion." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l2-s09", why: "Write recursive functions by hand, base case first, with tests that catch a missing one." },
    { kind: "strike", strikeId: "dsa-s08", why: "Recursion on real data structures, the way interviews ask it." },
    {
      kind: "predict",
      question: {
        id: "cs-call-stack-recursion-p1",
        prompt: "What does this print?",
        code: `function countdown(n) {
  if (n === 0) return "liftoff";
  console.log(n);
  return countdown(n - 1);
}
console.log(countdown(3));`,
        choices: ["3 2 1 liftoff", "3 2 1 0 liftoff", "liftoff 1 2 3", "1 2 3 liftoff"],
        answerIndex: 0,
        explanation: "Each call logs its n before recursing, so 3, 2, 1 print going down. countdown(0) hits the base case and returns 'liftoff', which every frame passes back up to the final console.log.",
        objective: 1,
      },
    },
    {
      kind: "debug",
      question: {
        id: "cs-call-stack-recursion-d1",
        prompt: "This should sum an array but returns undefined for [1, 2, 3]. Why?",
        code: `function sum(list) {
  if (list.length === 0) return 0;
  list[0] + sum(list.slice(1));
}`,
        choices: ["slice(1) is wrong", "The base case should return 1", "The recursive case does not return its result", "Arrays cannot be summed recursively"],
        answerIndex: 2,
        explanation: "The last line computes the right value and then throws it away. It needs `return list[0] + sum(list.slice(1));`.",
        objective: 1,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-call-stack-recursion-k1",
      prompt: "main() calls a(), which calls b(). Which frame is on top of the stack while b runs?",
      choices: ["main", "a", "b", "None"],
      answerIndex: 2,
      explanation: "The most recent call sits on top. b must finish before a can continue.",
      objective: 0,
    },
    {
      id: "cs-call-stack-recursion-k2",
      prompt: "What is the space complexity of a recursive function that goes n levels deep?",
      choices: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      answerIndex: 2,
      explanation: "n frames are waiting on the stack at the deepest point.",
      objective: 2,
    },
  ],
  project: {
    title: "Folder Explorer: a recursive file-tree tool",
    summary: "Build a command-line tool that walks a folder recursively, prints a tree, totals sizes per folder, finds the largest files, and is safe on huge or looping directory structures.",
    type: "implementation",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "A recursive walk that prints an indented tree of folders and files.",
      "Each folder shows the total size of everything inside it.",
      "A second version that uses an explicit stack (array) instead of recursion, producing identical output.",
      "Skip symbolic links already visited, so loops cannot cause infinite recursion.",
    ],
    acceptanceCriteria: [
      "A test on a temporary folder structure checks the tree output and totals exactly.",
      "A test proves the recursive and explicit-stack versions give the same result.",
      "A test with a symlink loop finishes without a stack overflow.",
    ],
    technologies: ["Node.js", "fs/promises", "Vitest"],
    milestones: [
      { title: "Walk", done_when: "Recursive tree printing works on a test folder." },
      { title: "Sizes", done_when: "Folder totals are computed on the way back up." },
      { title: "Explicit stack", done_when: "The loop-based version matches the recursive one." },
      { title: "Safety", done_when: "Symlink loops are detected and skipped." },
    ],
    testIdeas: ["Empty folder", "Folder 50 levels deep", "Unreadable folder (permission error)"],
    stretchGoals: ["Print the 10 largest files using a heap", "Ignore patterns like .gitignore"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-call-stack-recursion-a1",
        prompt: "What must every recursive function have to stop?",
        choices: ["A loop", "A base case that returns without recursing", "A global counter", "A try/catch"],
        answerIndex: 1,
        explanation: "The base case answers directly. Without it, calls never stop and the stack overflows.",
        objective: 1,
      },
      {
        id: "cs-call-stack-recursion-a2",
        prompt: "What does fact(4) return?",
        code: `function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1);
}`,
        choices: ["4", "10", "24", "Stack overflow"],
        answerIndex: 2,
        explanation: "4 × 3 × 2 × 1 = 24. The calls go down to fact(1) = 1 and multiply on the way back up.",
        objective: 0,
      },
      {
        id: "cs-call-stack-recursion-a3",
        prompt: "A recursive function crashes with 'Maximum call stack size exceeded' only on a 200,000-item linked list. The logic is correct. What is the best fix?",
        choices: ["Increase the base case", "Rewrite it as a loop (or use an explicit stack)", "Catch the error and retry", "Use var instead of let"],
        answerIndex: 1,
        explanation: "The depth itself is the problem: 200,000 frames exceed the stack. A loop uses constant stack space.",
        objective: 2,
      },
      {
        id: "cs-call-stack-recursion-a4",
        prompt: "Which problem is the most natural fit for recursion?",
        choices: ["Summing a flat array of 10 numbers", "Counting all replies in a comment thread where replies can have replies", "Reading one config value", "Adding two numbers"],
        answerIndex: 1,
        explanation: "Nested data of unknown depth mirrors recursion: handle one comment, then recurse into its replies.",
        objective: 3,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-call-stack-recursion-q01", tags: ["recursion"], difficulty: "foundation", kind: "concept",
      prompt: "Explain recursion and what makes a recursive function correct.",
      expectedElements: ["function calls itself on a smaller problem", "base case", "progress toward base case", "combine results"],
      modelAnswer: "Recursion is solving a problem by having a function call itself on a smaller version of the same problem. It is correct when there is a base case that answers directly without recursing, every recursive call makes the problem strictly smaller so it eventually reaches the base case, and the results of the smaller calls are combined correctly into the answer for the current call.",
      explanation: "Base case plus progress plus combination.",
      commonWrongAnswers: ["A function that loops."],
    },
    {
      id: "cs-call-stack-recursion-q02", tags: ["call-stack"], difficulty: "foundation", kind: "concept",
      prompt: "What is the call stack?",
      expectedElements: ["stack of frames for active calls", "LIFO", "frame holds args/locals/return address", "stack traces show it", "limited size"],
      modelAnswer: "The call stack tracks the functions that are currently running. Each call pushes a frame holding its arguments, local variables and where to return; when the function returns, its frame is popped. It is last-in-first-out, so the most recent call must finish first. A stack trace is a snapshot of it, and it has a limited size, which is why runaway recursion overflows.",
      explanation: "Linking it to stack traces shows practical understanding.",
      commonWrongAnswers: ["Where objects are stored."],
    },
    {
      id: "cs-call-stack-recursion-q03", tags: ["recursion", "trees"], difficulty: "core", kind: "implementation",
      prompt: "Describe a recursive function to find the maximum depth of a binary tree.",
      expectedElements: ["base case: null node depth 0", "1 + max(left, right)", "O(n) time", "O(h) space"],
      modelAnswer: "If the node is null, return 0: that is the base case. Otherwise return 1 plus the larger of the depths of the left and right subtrees, each computed by the same function. It visits every node once, so it is O(n) time, and the stack holds one frame per level, so it uses O(h) space where h is the tree's height, which is O(n) for a completely unbalanced tree.",
      explanation: "Time and space complexity make the answer complete.",
      commonWrongAnswers: ["Use a loop over all nodes counting them."],
    },
    {
      id: "cs-call-stack-recursion-q04", tags: ["recursion", "stack-overflow"], difficulty: "core", kind: "debugging",
      prompt: "A recursive JSON-cleaning function crashes with a stack overflow on some customer data. What could cause it?",
      expectedElements: ["cyclic references", "extremely deep nesting", "missing/unreachable base case", "visited set, depth limit, iterative approach"],
      modelAnswer: "Three common causes: the data contains a cycle, such as an object that references its parent, so recursion never ends; the data is legitimately extremely deep; or a code path never reaches the base case. I would add a visited set to skip objects already seen, a maximum depth guard with a clear error, and for very deep data switch to an explicit stack.",
      explanation: "Cycles are the most common real-world cause.",
      commonWrongAnswers: ["The server needs more memory."],
    },
    {
      id: "cs-call-stack-recursion-q05", tags: ["recursion", "memoization"], difficulty: "core", kind: "concept",
      prompt: "Why is the naive recursive Fibonacci slow, and how do you fix it?",
      expectedElements: ["same subproblems recomputed", "exponential O(2^n)", "memoization cache", "or bottom-up loop O(n)"],
      modelAnswer: "fib(n) calls fib(n-1) and fib(n-2), and each of those recompute the same smaller values over and over, so the number of calls grows exponentially, roughly O(2^n). Caching each result the first time it is computed (memoization) brings it to O(n), and a bottom-up loop keeping only the last two values gives O(n) time with O(1) space.",
      explanation: "This is the gateway to dynamic programming questions.",
      commonWrongAnswers: ["Recursion is just slow in JavaScript."],
    },
    {
      id: "cs-call-stack-recursion-q06", tags: ["backtracking"], difficulty: "advanced", kind: "concept",
      prompt: "What is backtracking? Give an example.",
      expectedElements: ["build a solution choice by choice", "recurse", "undo choice and try next", "prune invalid paths", "permutations/sudoku/N-queens"],
      modelAnswer: "Backtracking builds a solution step by step: make a choice, recurse to make the next one, and if that path cannot lead to a valid solution, undo the choice and try the next option. Pruning stops exploring paths early when they already break a rule. Generating all permutations of a string, solving sudoku and placing N queens on a chessboard are classic examples.",
      explanation: "Choose, explore, un-choose is the pattern to name.",
      commonWrongAnswers: ["Going back to a previous Git commit."],
    },
    {
      id: "cs-call-stack-recursion-q07", tags: ["recursion", "iteration"], difficulty: "core", kind: "design",
      prompt: "When would you choose an iterative solution over a recursive one?",
      expectedElements: ["deep inputs risk overflow", "linear problems are simpler as loops", "no TCO in JS", "explicit stack for trees when depth unbounded", "readability for tree shapes favours recursion"],
      modelAnswer: "I choose iteration when the depth could be large or is controlled by input, because JavaScript engines do not do tail-call optimisation and the stack is limited; and when the problem is naturally linear, like walking a list, where a loop is clearer. For tree-shaped data recursion reads better, but if the trees can be very deep I convert to an explicit stack to keep the same logic without the depth limit.",
      explanation: "Trade-off thinking, not dogma.",
      commonWrongAnswers: ["Never use recursion in production."],
    },
    {
      id: "cs-call-stack-recursion-q08", tags: ["recursion", "code-reading"], difficulty: "foundation", kind: "code-reading",
      prompt: "What does this return for \"abc\"?",
      code: `function rev(s) {
  if (s === "") return "";
  return rev(s.slice(1)) + s[0];
}`,
      expectedElements: ["\"cba\"", "trace: rev(\"bc\") + \"a\"", "base case empty string"],
      modelAnswer: "It returns \"cba\". rev(\"abc\") is rev(\"bc\") + \"a\"; rev(\"bc\") is rev(\"c\") + \"b\"; rev(\"c\") is rev(\"\") + \"c\", and rev(\"\") is the base case \"\". Coming back up: \"c\", then \"cb\", then \"cba\".",
      explanation: "Tracing out loud is exactly what is being tested.",
      commonWrongAnswers: ["\"abc\""],
    },
  ],
  references: [
    { title: "MDN: Call stack (glossary)", url: "https://developer.mozilla.org/en-US/docs/Glossary/Call_stack", kind: "official-docs" },
    { title: "MDN: Recursion (glossary)", url: "https://developer.mozilla.org/en-US/docs/Glossary/Recursion", kind: "official-docs" },
    { title: "Wikipedia: Recursion (computer science)", url: "https://en.wikipedia.org/wiki/Recursion_(computer_science)", kind: "article" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Stack frames, base cases and divide-and-conquer are the same in every language."],
  versionSpecific: ["The exact maximum stack depth depends on the engine and its settings."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
