// Topic: Conditionals and loops. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csControlFlow: Topic = {
  id: "cs-control-flow",
  domainId: "",
  moduleId: "",
  title: "Conditionals and loops",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Write if / else if / else chains and switch statements that pick exactly one path.",
    "Choose the right loop (for, while, for...of) for a task and make sure it stops.",
    "Spot and fix off-by-one errors by checking the first and last pass.",
    "Use break, continue and early return to keep logic flat and readable.",
  ],
  prerequisites: ["cs-values-types"],
  subtopics: ["if / else if / else", "switch", "for, while, for...of", "break and continue", "Early return (guard clauses)", "Off-by-one errors", "Infinite loops"],
  strikeIds: ["l1-s05", "l1-s08", "l2-s03"],

  story:
    "A shop's 'buy 3, get 1 free' banner gave the free item for 2 items, and the loyalty program skipped every customer's last purchase. Two different bugs, one cause: a condition that said > instead of >=, and a loop that stopped one step early. Control flow is where programs make decisions and repeat work, and almost every 'it works for most cases' bug lives at its edges.",
  mentalModel: {
    plain:
      "A program normally runs top to bottom. An `if` is a fork in the road: it checks a condition and takes one branch. A loop is a roundabout: it repeats a block until a condition says 'exit now'. Your job is to make sure every fork goes the right way and every roundabout has an exit.",
    analogy:
      "A train on tracks. Conditionals are railway switches that send the train down one track or another. Loops are a circular track with a signal: each lap, the signal is checked, and when it turns red the train leaves the circle.",
    analogyLimit:
      "A real train only takes one switch at a time; a program can nest loops inside loops and ifs inside loops, and each level multiplies the work (see the Big O topic).",
  },
  lessonSections: [
    {
      heading: "1. if, else if, else: exactly one path",
      body:
        "An if chain checks conditions from top to bottom and runs the FIRST block whose condition is true, then skips the rest.\n\nSo order matters: put the most specific case first. If you check `score >= 50` before `score >= 90`, a score of 95 stops at the first check and never reaches 'excellent'.\n\nFinish with an `else` when you want a guaranteed fallback.",
    },
    {
      heading: "2. switch: one value, many exact matches",
      body:
        "`switch (status)` compares one value against several `case` labels with ===. It suits fixed lists (order states, keyboard keys).\n\nEach case needs a `break` (or `return`), otherwise execution 'falls through' into the next case. Always add a `default` for values you did not expect.",
    },
    {
      heading: "3. Picking a loop",
      body:
        "`for (const item of list)`: visit every item in an array or string. Your everyday loop.\n\n`for (let i = 0; i < n; i++)`: when you need the index, or to count a fixed number of times.\n\n`while (condition)`: when you do not know how many laps in advance (keep reading until the file ends, keep retrying until it works).\n\nArray methods (map, filter, reduce) are loops too; they have their own strike.",
    },
    {
      heading: "4. Every loop needs an exit",
      body:
        "A loop stops when its condition becomes false. If nothing inside the loop moves the condition towards false, it never stops: an infinite loop, and the page or server freezes.\n\nBefore running a while loop, point at the line that changes the condition. If you cannot find one, it is a bug.",
    },
    {
      heading: "5. Off-by-one: check the first and the last lap",
      body:
        "The most common loop bug is running one time too many or too few. Arrays start at index 0, so the last index is `length - 1`: `i < arr.length` is right, `i <= arr.length` reads one item past the end (undefined).\n\nThe fix is a habit, not a talent: for any loop, ask 'what is i on the first lap? On the last lap?' and say both out loud.",
    },
    {
      heading: "6. Flatten with early returns",
      body:
        "Deeply nested ifs are hard to read. A guard clause handles the odd case first and leaves: `if (!user) return null;`. The main logic then sits at the left edge, unindented.\n\nInside loops, `continue` skips to the next lap and `break` leaves the loop entirely. Use them to say 'not this one' and 'found it, stop'.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "Control flow is best learned by tracing by hand: the predict and debug exercises ask you to follow each lap, and the FizzBuzz and Loops strikes make you write the branches yourself with tests.",
  codeExamples: [
    {
      title: "Order of conditions, and the off-by-one",
      language: "js",
      code: `function grade(score) {
  if (score >= 90) return "excellent";
  if (score >= 50) return "pass";
  return "try again";
}
console.log(grade(95), grade(50), grade(49));

const days = ["Mon", "Tue", "Wed"];
for (let i = 0; i <= days.length; i++) {
  console.log(i, days[i]);
}`,
      expectedOutput: `excellent pass try again
0 Mon
1 Tue
2 Wed
3 undefined`,
      steps: [
        "grade(95): the first check, 95 >= 90, is true, so it returns \"excellent\" and never looks further.",
        "grade(50): 50 >= 90 is false, 50 >= 50 is true, so \"pass\". grade(49) fails both and reaches the fallback.",
        "The loop starts at i = 0 and prints Mon, Tue and Wed for i = 0, 1 and 2.",
        "Because the condition is <= days.length (3), it runs one extra lap with i = 3. There is no item at index 3, so it prints undefined. Changing <= to < fixes it.",
      ],
    },
  ],
  practicalApplication:
    "Pagination, retries, batch jobs and validation rules are all control flow. Code reviewers look for three things: conditions in the right order (most specific first), loops with a clear exit (especially while loops around network calls), and boundary values tested (0, 1, the last item, the empty list). Interview coding rounds are mostly loops and conditions, so tracing them by hand under pressure is a core skill.",
  commonMistakes: [
    {
      mistake: "Using <= length in an index loop.",
      symptom: "An extra lap that reads undefined, or a 'Cannot read properties of undefined' crash.",
      fix: "Use i < arr.length, or better, for...of when you do not need the index.",
    },
    {
      mistake: "Putting a broad condition before a specific one.",
      symptom: "The specific branch never runs (every 95 is just 'pass').",
      fix: "Order from most specific to most general, and test a value from each band.",
    },
    {
      mistake: "Forgetting break in a switch case.",
      symptom: "Two cases run for one value (fall-through).",
      fix: "End every case with break or return, and add a default.",
    },
    {
      mistake: "A while loop whose condition never changes.",
      symptom: "The tab freezes or the server stops answering.",
      fix: "Make sure something inside the loop moves towards the exit, and add a maximum-attempts limit for retries.",
    },
  ],
  misconceptions: [
    { myth: "else if checks every condition and runs every true one.", truth: "It stops at the FIRST true condition. Later true conditions are never checked." },
    { myth: "for...in is the way to loop over an array.", truth: "for...in loops over property NAMES (as strings) and can include inherited ones. For array items use for...of." },
    { myth: "Nested ifs are the only way to handle many cases.", truth: "Guard clauses (return early), lookup objects and switch statements usually read better than deep nesting." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l1-s05", why: "Write an if / else chain by hand and test every band, including the edges." },
    { kind: "strike", strikeId: "l1-s08", why: "FizzBuzz: the classic interview warm-up. Order of conditions is the whole puzzle." },
    { kind: "strike", strikeId: "l2-s03", why: "Write each kind of loop and pick the right one for each job." },
    {
      kind: "predict",
      question: {
        id: "cs-control-flow-p1",
        prompt: "How many times does this print \"tick\"?",
        code: `let n = 10;
while (n > 0) {
  console.log("tick");
  n = n - 3;
}`,
        choices: ["3", "4", "10", "Forever"],
        answerIndex: 1,
        explanation: "n goes 10, 7, 4, 1, and each of those is > 0, so it prints 4 times. Then n becomes -2 and the loop stops. Tracing every lap is the fastest way to be sure.",
        objective: 1,
      },
    },
    {
      kind: "debug",
      question: {
        id: "cs-control-flow-d1",
        prompt: "This should give a free item for 3 or more items, but it gives one for 2 items too. Which line is wrong?",
        code: `function freeItems(count) {
  if (count > 2) return 1;      // A
  if (count >= 2) return 0;     // B
  return 0;                     // C
}`,
        choices: ["Line A", "Line B", "Line C", "Nothing: the bug must be elsewhere"],
        answerIndex: 3,
        explanation: "Trace it: freeItems(2) fails A (2 > 2 is false) and B returns 0. freeItems(3) returns 1. This function is correct, so the bug is in the caller. Debugging starts with proving which part is right, not guessing which line looks odd.",
        objective: 2,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-control-flow-k1",
      prompt: "An array has 5 items. In `for (let i = 0; i < arr.length; i++)`, what is i on the LAST lap?",
      choices: ["5", "4", "6", "0"],
      answerIndex: 1,
      explanation: "Indexes run 0 to length - 1, so the last lap has i = 4. When i becomes 5 the condition 5 < 5 is false and the loop ends.",
      objective: 2,
    },
    {
      id: "cs-control-flow-k2",
      prompt: "Which loop fits 'keep asking the server until it says ready'?",
      choices: ["for (let i = 0; i < 10; i++)", "for (const x of list)", "while (!ready)", "switch"],
      answerIndex: 2,
      explanation: "You do not know how many laps it takes, so a while loop with a condition fits. In real code you would also add a maximum number of attempts.",
      objective: 1,
    },
  ],
  project: {
    title: "Rule Engine: a discount calculator with no surprises at the edges",
    summary: "Build a checkout discount calculator driven by clear rules (bulk discounts, coupons, free shipping thresholds), and prove every boundary with tests.",
    type: "implementation",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "A function `checkout(items, coupon)` that returns { subtotal, discount, shipping, total }.",
      "Bulk rule: 10% off when 3 to 9 items, 20% off at 10 or more.",
      "Free shipping when the subtotal after discount is 50 or more; otherwise shipping is 4.99.",
      "Coupon codes handled with a switch (SAVE5, FREESHIP, unknown codes ignored with a warning).",
    ],
    acceptanceCriteria: [
      "Tests cover exactly 2, 3, 9 and 10 items (every boundary of the bulk rule).",
      "A test shows a subtotal of exactly 50 gets free shipping and 49.99 does not.",
      "An empty cart returns all zeros without crashing.",
      "No function is nested more than two levels deep (use early returns).",
    ],
    technologies: ["JavaScript or TypeScript", "Vitest"],
    milestones: [
      { title: "Subtotal", done_when: "Sums item prices with a loop; tests for 0, 1 and many items." },
      { title: "Bulk discount", done_when: "All four boundary tests pass." },
      { title: "Shipping and coupons", done_when: "The 50 boundary and every coupon case are tested." },
      { title: "Readable", done_when: "Guard clauses replace nested ifs; a teammate can read it in one pass." },
    ],
    testIdeas: ["Exactly at each threshold", "One below each threshold", "Unknown coupon", "Negative or zero prices rejected"],
    stretchGoals: ["Load the rules from a JSON config instead of code", "Print a receipt that explains which rules applied"],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      {
        id: "cs-control-flow-a1",
        prompt: "What does grade(75) return?",
        code: `function grade(s) {
  if (s >= 50) return "pass";
  else if (s >= 70) return "good";
  else return "fail";
}`,
        choices: ["\"pass\"", "\"good\"", "\"fail\"", "\"pass\" then \"good\""],
        answerIndex: 0,
        explanation: "The first true condition wins. 75 >= 50 is true, so it returns \"pass\" and the \"good\" branch can never run for any score: the conditions are in the wrong order.",
        objective: 0,
      },
      {
        id: "cs-control-flow-a2",
        prompt: "What is printed?",
        code: `for (const n of [1, 2, 3, 4, 5]) {
  if (n === 2) continue;
  if (n === 4) break;
  console.log(n);
}`,
        choices: ["1 2 3", "1 3", "1 3 5", "1 3 4 5"],
        answerIndex: 1,
        explanation: "1 prints. 2 is skipped by continue. 3 prints. At 4, break leaves the loop entirely, so 4 and 5 never print.",
        objective: 3,
      },
      {
        id: "cs-control-flow-a3",
        prompt: "Which loop condition visits every item of `arr` exactly once?",
        choices: ["for (let i = 1; i <= arr.length; i++)", "for (let i = 0; i <= arr.length; i++)", "for (let i = 0; i < arr.length; i++)", "for (let i = 0; i < arr.length - 1; i++)"],
        answerIndex: 2,
        explanation: "Start at 0 (the first index) and stop before length (the last index is length - 1). The others skip the first item, add an extra lap, or miss the last item.",
        objective: 2,
      },
      {
        id: "cs-control-flow-a4",
        prompt: "What happens if a switch case has no break?",
        choices: ["A syntax error", "Execution falls through into the next case", "The default case runs", "Nothing, break is optional and has no effect"],
        answerIndex: 1,
        explanation: "Without break (or return), JavaScript keeps running the following cases' code too. Occasionally this is deliberate, which is why it deserves a comment when used.",
        objective: 0,
      },
      {
        id: "cs-control-flow-a5",
        prompt: "Why does this freeze the page?",
        code: `let tries = 0;
while (tries < 3) {
  console.log("trying");
}`,
        choices: ["console.log is slow", "tries never changes, so tries < 3 is always true", "while loops cannot use <", "3 is too many tries"],
        answerIndex: 1,
        explanation: "Nothing inside the loop moves towards the exit. Adding tries++ (or tries = tries + 1) inside the loop fixes it.",
        objective: 1,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-control-flow-q01", tags: ["fizzbuzz", "loops"], difficulty: "foundation", kind: "implementation",
      prompt: "Talk through how you would write FizzBuzz for 1 to 100, and what the classic mistake is.",
      expectedElements: ["loop 1 to 100 inclusive", "check divisible by 15 (both) first", "% remainder operator", "order of conditions"],
      modelAnswer: "I loop from 1 to 100 inclusive. For each number I check the 'both' case first, divisible by 3 and by 5 (n % 15 === 0), and print FizzBuzz; then divisible by 3 for Fizz, by 5 for Buzz, otherwise the number. The classic mistake is checking 3 first: then 15 prints Fizz and the FizzBuzz branch never runs. I would also confirm the edges: does the loop include 100?",
      explanation: "FizzBuzz tests whether you think about condition order and boundaries, not whether you can loop.",
      commonWrongAnswers: ["Checking % 3 before % 15."],
    },
    {
      id: "cs-control-flow-q02", tags: ["loops", "off-by-one"], difficulty: "foundation", kind: "debugging",
      prompt: "A function that sums an array returns NaN. The loop is `for (let i = 0; i <= arr.length; i++) total += arr[i];`. Explain the bug.",
      expectedElements: ["<= runs one extra lap", "arr[length] is undefined", "number + undefined is NaN", "use < or for...of"],
      modelAnswer: "The condition <= runs one lap too many. On the last lap i equals arr.length, and arr[arr.length] is undefined. total + undefined is NaN, and NaN stays NaN for every later sum. Changing to i < arr.length, or using for (const x of arr), fixes it.",
      explanation: "Connecting the off-by-one to the NaN symptom shows real debugging skill.",
      commonWrongAnswers: ["One of the items must be a string."],
    },
    {
      id: "cs-control-flow-q03", tags: ["loops"], difficulty: "foundation", kind: "concept",
      prompt: "When would you use a while loop instead of a for loop?",
      expectedElements: ["unknown number of iterations", "condition-driven", "examples: polling, reading input, retries", "make sure it terminates"],
      modelAnswer: "I use while when I do not know in advance how many laps I need and the stopping point is a condition: reading until the input ends, retrying until a call succeeds, or walking a linked list until next is null. I use for when the count is known or I am visiting a collection. With while I always check that something inside changes the condition, and for retries I add a maximum count.",
      explanation: "Mentioning termination and a safety limit is what interviewers want to hear.",
      commonWrongAnswers: ["They are the same; it is just style."],
    },
    {
      id: "cs-control-flow-q04", tags: ["readability", "guard-clauses"], difficulty: "core", kind: "design",
      prompt: "How would you refactor a function with four levels of nested if statements?",
      expectedElements: ["guard clauses / early return", "invert conditions", "extract functions", "lookup table for value-to-result mapping"],
      modelAnswer: "First I would invert the error and edge cases into guard clauses at the top: if the input is invalid, return early. That alone usually removes two levels. Then I would extract each remaining branch into a well-named function. If the ifs are just mapping one value to another, a lookup object or a switch is clearer still. Tests around the original behaviour come first, so the refactor cannot change results.",
      explanation: "Saying 'tests first' before refactoring is a strong signal.",
      commonWrongAnswers: ["Add comments to each level."],
    },
    {
      id: "cs-control-flow-q05", tags: ["loops", "break"], difficulty: "foundation", kind: "concept",
      prompt: "What is the difference between break and continue?",
      expectedElements: ["break exits the loop", "continue skips to next iteration", "example of each"],
      modelAnswer: "break stops the whole loop immediately, for example when you have found what you were searching for. continue skips the rest of the current lap and moves to the next one, for example to ignore invalid rows while processing a file.",
      explanation: "A concrete example for each makes the answer memorable.",
      commonWrongAnswers: ["continue exits the function."],
    },
    {
      id: "cs-control-flow-q06", tags: ["loops", "for-in"], difficulty: "core", kind: "code-reading",
      prompt: "What does this print, and why is it a problem?",
      code: `const scores = [10, 20];
for (const i in scores) console.log(i + 1);`,
      expectedElements: ["prints \"01\" and \"11\"", "for...in gives keys as strings", "+ concatenates", "use for...of or a numeric index"],
      modelAnswer: "It prints \"01\" and \"11\". for...in loops over property NAMES, and array indexes come out as strings \"0\" and \"1\", so i + 1 glues text. For array values use for...of; if you need the index use a classic for loop or arr.entries().",
      explanation: "This combines two topics (loops and coercion), which interviewers enjoy.",
      commonWrongAnswers: ["It prints 11 and 21.", "It prints 1 and 2."],
    },
    {
      id: "cs-control-flow-q07", tags: ["loops", "scenario"], difficulty: "core", kind: "scenario",
      prompt: "A background job that polls an API with `while (!done)` sometimes runs forever and burns CPU. What would you change?",
      expectedElements: ["max attempts", "delay/backoff between tries", "timeout", "log and alert on giving up"],
      modelAnswer: "I would give the loop a maximum number of attempts and a delay between tries, ideally with backoff so it does not hammer the API. I would add an overall timeout, and when it gives up, log the reason and surface the failure instead of looping silently. A loop with an external exit condition always needs its own safety exit.",
      explanation: "Links basic loops to the reliability topic (retries and backoff).",
      commonWrongAnswers: ["Make the server faster."],
    },
    {
      id: "cs-control-flow-q08", tags: ["switch"], difficulty: "foundation", kind: "concept",
      prompt: "When is a switch better than an if / else chain?",
      expectedElements: ["one value compared to many exact options", "strict equality", "needs break", "default case"],
      modelAnswer: "A switch reads better when I compare one value against several exact options, like an order status or a key name. It uses strict equality, every case needs a break or return, and a default handles unexpected values. For ranges (score >= 90) or mixed conditions, an if chain is clearer.",
      explanation: "Knowing when NOT to use switch (ranges) completes the answer.",
      commonWrongAnswers: ["switch is always faster."],
    },
  ],
  references: [
    { title: "MDN: Control flow and error handling", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling", kind: "official-docs" },
    { title: "MDN: Loops and iteration", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration", kind: "official-docs" },
    { title: "MDN: for...of", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Branching, looping, termination and boundary checking are the same in every language."],
  versionSpecific: ["for...of and the exact switch semantics are JavaScript syntax; other languages spell them differently."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
