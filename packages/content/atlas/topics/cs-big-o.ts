// Topic: Big O — how work grows. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csBigO: Topic = {
  id: "cs-big-o",
  domainId: "",
  moduleId: "",
  title: "Big O: how work grows",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Explain Big O in plain words as 'how the amount of work grows when the input grows'.",
    "Recognise O(1), O(log n), O(n), O(n log n) and O(n²) by reading a short function.",
    "Compare two solutions to the same problem and justify which one scales better.",
    "Describe space complexity separately from time complexity.",
  ],
  prerequisites: ["cs-control-flow", "cs-functions-scope"],
  subtopics: [
    "Counting operations",
    "Dropping constants and smaller terms",
    "Worst, average and best case",
    "Space complexity",
    "Amortised cost (array push)",
  ],
  strikeIds: ["l2-s14", "dsa-s01"],

  story:
    "Your team's 'find duplicate emails' job took 2 seconds on 1,000 users. Marketing imports 100,000 users and the same job runs for over five hours. Nobody changed the code. The code was always slow; the data just finally got big enough to show it. Big O is the tool that lets you see that coming before production does.",
  mentalModel: {
    plain:
      "Big O ignores how fast your computer is and asks one question: if the input gets 10 times bigger, roughly how much more work happens? Same amount (O(1)), a little more (O(log n)), 10 times more (O(n)), or 100 times more (O(n²))?",
    analogy:
      "Finding a name in a phone book. Opening at the right page because you know the page number is O(1). Halving the book again and again is O(log n). Reading every name is O(n). Comparing every name with every other name to find twins is O(n²).",
    analogyLimit:
      "The analogy hides constants. In real code, an O(n) loop that does a network call per item can be far slower than an O(n²) loop over 20 numbers in memory. Big O describes growth, not actual speed for small inputs.",
  },
  lessonSections: [
    {
      heading: "1. Count the steps, not the seconds",
      body:
        "Seconds depend on the machine. Steps do not. So we count the basic steps a function does for an input of size `n` (n items in an array, n characters in a string).\n\nA single loop over the array does about n steps. A loop inside a loop does about n × n steps.",
    },
    {
      heading: "2. Keep only the part that grows fastest",
      body:
        "If a function does 3n + 5 steps, then for a million items the 5 hardly matters and neither does the 3 when comparing growth shapes. We write O(n).\n\nIf it does n² + n steps, the n² part dominates: O(n²). This is called dropping constants and lower-order terms.",
    },
    {
      heading: "3. The five shapes you will meet every week",
      body:
        "O(1): look up `obj[key]` or `arr[5]`. Same cost at any size.\nO(log n): binary search: each step throws away half the data.\nO(n): one pass, like `arr.includes(x)` or a for loop.\nO(n log n): good general sorting, like `arr.sort()` in modern engines.\nO(n²): every item against every other item: nested loops over the same data.",
    },
    {
      heading: "4. Hidden loops",
      body:
        "Some loops hide inside library calls. `arr.includes`, `arr.indexOf`, `arr.find` and `str.includes` each walk the data. Calling `includes` inside a `for` loop is a loop inside a loop: O(n²), even though you only typed one `for`.",
    },
    {
      heading: "5. Space is a separate question",
      body:
        "Space complexity asks how much EXTRA memory grows with n. Building a `Set` of every item is O(n) space. Swapping two variables is O(1) space. A common trade-off: spend O(n) memory on a Set to turn an O(n²) search into an O(n) one.",
    },
    {
      heading: "6. Worst case is the default",
      body:
        "When someone says 'this is O(n)', they normally mean the worst case. Linear search can find the item first try (best case), but you plan for the item being last or absent.\n\nAmortised cost: `arr.push` is usually O(1), but occasionally the engine must copy the array into a bigger block. Averaged over many pushes it is still O(1) per push.",
    },
  ],
  visualizationType: "big-o",
  codeExamples: [
    {
      title: "Duplicate check: O(n²) versus O(n)",
      language: "js",
      code: `function hasDuplicateSlow(items) {
  let comparisons = 0;
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      comparisons++;
      if (items[i] === items[j]) return { found: true, comparisons };
    }
  }
  return { found: false, comparisons };
}

function hasDuplicateFast(items) {
  const seen = new Set();
  let steps = 0;
  for (const item of items) {
    steps++;
    if (seen.has(item)) return { found: true, steps };
    seen.add(item);
  }
  return { found: false, steps };
}

const ids = Array.from({ length: 1000 }, (_, i) => i); // 1000 unique numbers
console.log(hasDuplicateSlow(ids));
console.log(hasDuplicateFast(ids));`,
      expectedOutput: `{ found: false, comparisons: 499500 }
{ found: false, steps: 1000 }`,
      steps: [
        "ids holds 1000 different numbers, so there is no duplicate: both functions must do their worst case.",
        "The slow version compares item 0 with 999 others, item 1 with 998 others, and so on: 999 + 998 + ... + 1 = 499,500 comparisons. That is n(n−1)/2, which grows like n².",
        "The fast version visits each item once. Set.has and Set.add are O(1) on average, so it does exactly 1000 steps.",
        "Ten times more data (10,000 items) would make the slow one do about 50 million comparisons and the fast one 10,000 steps.",
      ],
    },
  ],
  practicalApplication:
    "Code review: when you see `.includes`, `.find` or `.filter` inside a loop over the same-sized data, ask 'how big can this get?'. If the answer is 'thousands or more', a Map or Set usually turns O(n²) into O(n). In SQL the same idea appears as a missing index turning a lookup into a full table scan.",
  commonMistakes: [
    {
      mistake: "Counting only the `for` keywords you typed.",
      symptom: "You call a function O(n) but it slows down quadratically in production.",
      fix: "Look inside every call in the loop body. `includes`, `indexOf`, `find`, `splice` and `shift` all loop over data.",
    },
    {
      mistake: "Optimising a loop over 10 items.",
      symptom: "Harder-to-read code with no measurable speedup.",
      fix: "Ask how large n can actually get. For tiny, fixed n, readability wins.",
    },
    {
      mistake: "Forgetting the memory cost of the fast version.",
      symptom: "An out-of-memory crash when the Set holds tens of millions of large objects.",
      fix: "State both: 'O(n) time, O(n) extra space'. Then decide if the memory is acceptable.",
    },
  ],
  misconceptions: [
    { myth: "O(1) means instant.", truth: "O(1) means the cost does not grow with n. A constant 2-second network call is still O(1)." },
    { myth: "O(n log n) is always slower than O(n).", truth: "For growth, yes, but for real inputs constants matter. A tuned O(n log n) sort can beat a clumsy O(n) pass over small data." },
    { myth: "Big O tells you how many milliseconds code takes.", truth: "It describes the growth shape only. To get milliseconds you measure (profile) on real data." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l2-s14", why: "Type a counting function by hand and see O(n) vs O(n²) in your own numbers." },
    { kind: "strike", strikeId: "dsa-s01", why: "Classify and improve real functions, with tests that check your counts." },
    {
      kind: "predict",
      question: {
        id: "cs-big-o-p1",
        prompt: "What is the time complexity of this function, for an array of length n?",
        code: `function countCommon(a, b) {   // a and b both have length n
  let count = 0;
  for (const x of a) {
    if (b.includes(x)) count++;
  }
  return count;
}`,
        choices: ["O(1)", "O(n)", "O(n log n)", "O(n²)"],
        answerIndex: 3,
        explanation: "The loop runs n times and `b.includes(x)` scans up to n items each time: n × n = O(n²). Turning `b` into a Set first makes each lookup O(1) on average, giving O(n) overall.",
        objective: 1,
      },
    },
    { kind: "lab", lab: "big-o", task: "Slide n up and watch the step counters for each growth shape.", goal: "Find the smallest n where the O(n²) counter passes 1,000,000 steps." },
  ],
  knowledgeChecks: [
    {
      id: "cs-big-o-k1",
      prompt: "A function does 4n + 12 steps. What is its Big O?",
      choices: ["O(4n + 12)", "O(n)", "O(12)", "O(n²)"],
      answerIndex: 1,
      explanation: "Drop constants (4) and smaller terms (12): only the growth shape, O(n), remains.",
      objective: 0,
    },
    {
      id: "cs-big-o-k2",
      prompt: "Binary search on a sorted array of 1,000,000 items needs at most about how many steps?",
      choices: ["20", "1,000", "500,000", "1,000,000"],
      answerIndex: 0,
      explanation: "Each step halves the data. 2²⁰ ≈ 1,048,576, so about 20 halvings reach a single item. That is O(log n).",
      objective: 1,
    },
  ],
  project: {
    title: "Growth Lab: a tiny algorithm visualiser",
    summary: "Build a page that runs several real implementations on growing inputs, counts their steps and charts the growth, so you can SEE complexity instead of memorising it.",
    type: "implementation",
    objectivesCovered: [1, 2, 3],
    requirements: [
      "Implement at least four functions with different complexities (e.g. array index lookup, binary search, linear search, nested-loop duplicate check).",
      "Instrument each one with a step counter (no timing needed).",
      "Run each on n = 10, 100, 1,000, 10,000 and show the counts in a table and a simple chart.",
      "Show the extra memory each one allocates (e.g. size of any Set or Map created).",
    ],
    acceptanceCriteria: [
      "A unit test proves the duplicate check reports n(n−1)/2 comparisons for n unique items.",
      "A unit test proves binary search takes at most ⌈log₂(n)⌉ + 1 steps on sorted input.",
      "The chart axis labels state 'steps', not 'milliseconds'.",
      "The README explains, in your own words, why one curve bends upward.",
    ],
    technologies: ["TypeScript", "Vitest", "HTML canvas or SVG"],
    milestones: [
      { title: "Counted functions", done_when: "Four functions return { result, steps } and have unit tests." },
      { title: "Runner", done_when: "A script prints a table of steps for each n." },
      { title: "Visual", done_when: "A page draws the curves from that table." },
      { title: "Write-up", done_when: "README explains each curve and one trade-off of time vs memory." },
    ],
    testIdeas: ["Exact step counts for small n", "Binary search on an empty array", "Duplicate check when the duplicate is first vs last"],
    stretchGoals: ["Add an O(n log n) merge sort with a counter", "Add an 'amortised push' experiment that counts array growth copies"],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      {
        id: "cs-big-o-a1",
        prompt: "In plain words, what does it mean that an algorithm is O(n)?",
        choices: [
          "It always takes n milliseconds.",
          "Its work grows in proportion to the input size.",
          "It uses n bytes of memory.",
          "It runs n times faster than O(n²).",
        ],
        answerIndex: 1,
        explanation: "O(n) describes growth: double the input, roughly double the work. It says nothing about exact time or memory.",
        objective: 0,
      },
      {
        id: "cs-big-o-a2",
        prompt: "What is the time complexity?",
        code: `function firstAndLast(arr) {
  return [arr[0], arr[arr.length - 1]];
}`,
        choices: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        answerIndex: 0,
        explanation: "Two index lookups and reading `.length` are constant-time regardless of array size.",
        objective: 1,
      },
      {
        id: "cs-big-o-a3",
        prompt: "What is the time complexity?",
        code: `function pairs(arr) {
  const out = [];
  for (const a of arr) for (const b of arr) out.push([a, b]);
  return out;
}`,
        choices: ["O(n)", "O(n log n)", "O(n²)", "O(2n)"],
        answerIndex: 2,
        explanation: "Two nested loops over the same n items: n × n pushes. (Its space is also O(n²): it stores every pair.)",
        objective: 1,
      },
      {
        id: "cs-big-o-a4",
        prompt: "You must check 50,000 incoming order ids against 50,000 known fraud ids. Which approach scales best?",
        choices: [
          "For each order, call fraudIds.includes(id).",
          "Sort both arrays, then for each order binary-search the fraud list.",
          "Build a Set of fraud ids once, then check each order with set.has(id).",
          "Compare every pair with two nested loops.",
        ],
        answerIndex: 2,
        explanation: "Building the Set is O(n) and each lookup is O(1) on average: O(n) total. Sort + binary search is O(n log n), fine but slower to grow. includes and nested loops are both O(n²): about 2.5 billion comparisons.",
        objective: 2,
      },
      {
        id: "cs-big-o-a5",
        prompt: "The Set-based duplicate check is O(n) time. What is its extra space?",
        choices: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        answerIndex: 2,
        explanation: "In the worst case (no duplicates) the Set ends up holding all n items.",
        objective: 3,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-big-o-q01", tags: ["big-o", "fundamentals"], difficulty: "foundation", kind: "concept",
      prompt: "Explain Big O notation to a non-engineer in two sentences.",
      expectedElements: ["describes growth, not speed", "relative to input size", "a concrete example"],
      modelAnswer: "Big O describes how the amount of work grows as the input grows. For example, checking every name in a list takes twice as long when the list doubles, while looking something up by its exact page number takes the same time no matter how big the book is.",
      explanation: "Interviewers listen for 'growth' and 'input size'. Mentioning seconds or a specific machine signals a misunderstanding.",
      commonWrongAnswers: ["It measures how fast code runs.", "It is the number of lines of code."],
    },
    {
      id: "cs-big-o-q02", tags: ["big-o", "arrays"], difficulty: "foundation", kind: "code-reading",
      prompt: "What is the time complexity of this code, and why?",
      code: `const result = users.filter(u => admins.includes(u.id));`,
      expectedElements: ["O(n × m) or O(n²) when sizes are similar", "includes is a hidden loop", "fix with a Set"],
      modelAnswer: "O(n × m), where n is users.length and m is admins.length. `filter` loops over users and `includes` scans admins for each one. If both are similar in size that is O(n²). Building `new Set(admins)` first and using `set.has` makes it O(n + m).",
      explanation: "The key insight is that library methods can hide loops.",
      commonWrongAnswers: ["O(n), because there is only one loop."],
      followUps: ["What if admins only ever has 3 items?", "What does the Set cost in memory?"],
    },
    {
      id: "cs-big-o-q03", tags: ["big-o", "search"], difficulty: "core", kind: "concept",
      prompt: "Why is binary search O(log n), and what does it require?",
      expectedElements: ["halves the search space each step", "log₂(n) halvings", "requires sorted data", "random access"],
      modelAnswer: "Each comparison with the middle element discards half of the remaining items, so after k steps only n / 2ᵏ items remain. That reaches 1 when k ≈ log₂(n). It requires sorted data and cheap access to the middle element, like an array index.",
      explanation: "Without random access (e.g. a linked list), finding the middle is itself O(n), destroying the benefit.",
      commonWrongAnswers: ["It works on any array.", "It is O(n/2)."],
    },
    {
      id: "cs-big-o-q04", tags: ["big-o", "trade-offs"], difficulty: "core", kind: "design",
      prompt: "You can make a lookup faster by using more memory. Give an example and explain when you would NOT do it.",
      expectedElements: ["Set/Map/index trades space for time", "memory limits", "small n", "data that changes often (index maintenance)"],
      modelAnswer: "A hash map index turns an O(n) scan into O(1) average lookups at the cost of O(n) extra memory. I would skip it when n is small and fixed, when memory is the real constraint (e.g. a tiny device or millions of large objects), or when the data changes so often that keeping the index updated costs more than it saves, which is the same trade-off as adding a database index to a write-heavy table.",
      explanation: "Good answers name both sides of the trade-off and a concrete reason to decline.",
      commonWrongAnswers: ["Always add a cache/index, memory is cheap."],
    },
    {
      id: "cs-big-o-q05", tags: ["big-o", "sorting"], difficulty: "core", kind: "concept",
      prompt: "Why can't a general comparison-based sort beat O(n log n) in the worst case?",
      expectedElements: ["n! possible orderings", "each comparison gives one bit / two outcomes", "log₂(n!) ≈ n log n"],
      modelAnswer: "There are n! possible orderings of n items, and each comparison only splits the possibilities into two groups. To single out one ordering you need at least log₂(n!) comparisons, and log₂(n!) grows like n log n.",
      explanation: "Non-comparison sorts (counting sort, radix sort) escape this bound by using the values' structure, not comparisons.",
      commonWrongAnswers: ["Because computers are not fast enough."],
      followUps: ["When can counting sort be O(n)?"],
    },
    {
      id: "cs-big-o-q06", tags: ["big-o", "amortised"], difficulty: "advanced", kind: "concept",
      prompt: "Array push is described as 'amortised O(1)'. What does amortised mean here?",
      expectedElements: ["occasional expensive resize/copy", "capacity grows geometrically", "average cost per push stays constant"],
      modelAnswer: "Most pushes write into spare capacity in O(1). When capacity runs out the engine allocates a bigger block, often about double, and copies everything: an O(n) step. Because capacity grows geometrically, those copies happen rarely enough that the total cost of n pushes is O(n), so each push costs O(1) on average.",
      explanation: "Amortised is a guarantee over a sequence of operations, unlike 'average case', which is about random inputs.",
      commonWrongAnswers: ["It means usually fast, sometimes slow, with no guarantee."],
    },
    {
      id: "cs-big-o-q07", tags: ["big-o", "debugging"], difficulty: "core", kind: "debugging",
      prompt: "A page that lists comments got very slow once posts reached 5,000 comments. The code removes items one at a time with `arr.shift()` in a loop. What is likely wrong?",
      expectedElements: ["shift is O(n) (re-indexes)", "loop of shifts is O(n²)", "use an index pointer or a queue"],
      modelAnswer: "`shift()` removes the first element and moves every other element down one slot, so it is O(n). Doing it in a loop over n items is O(n²). Iterate with an index instead, or use a real queue structure with head/tail pointers.",
      explanation: "Hidden linear work inside a loop is the most common real-world quadratic bug.",
      commonWrongAnswers: ["The browser is slow.", "5,000 is too many for JavaScript."],
    },
    {
      id: "cs-big-o-q08", tags: ["big-o", "space"], difficulty: "foundation", kind: "concept",
      prompt: "What is the space complexity of a recursive function that calls itself n levels deep?",
      expectedElements: ["O(n) because of stack frames", "each pending call holds a frame", "risk of stack overflow"],
      modelAnswer: "O(n), because every call waiting for its child to finish keeps a stack frame in memory. At very large n this can overflow the call stack.",
      explanation: "Recursion uses memory even if you never allocate an array.",
      commonWrongAnswers: ["O(1), since no arrays are created."],
    },
    {
      id: "cs-big-o-q09", tags: ["big-o", "misconception"], difficulty: "foundation", kind: "misconception",
      prompt: "True or false, and explain: 'An O(n) algorithm is always faster than an O(n²) algorithm.'",
      expectedElements: ["false for small n", "constants and overhead", "true for large enough n"],
      modelAnswer: "False in general. Big O hides constant factors, so for small inputs an O(n²) algorithm with tiny constants (like insertion sort on 10 items) can be faster. For large enough n, the O(n) one eventually wins.",
      explanation: "Real libraries mix algorithms for this reason, e.g. using insertion sort for small slices inside a bigger sort.",
      commonWrongAnswers: ["True, always."],
    },
    {
      id: "cs-big-o-q10", tags: ["big-o", "scenario"], difficulty: "core", kind: "scenario",
      prompt: "An API endpoint is fast in testing but times out in production. How would you check whether algorithmic complexity is the cause?",
      expectedElements: ["compare data sizes test vs prod", "measure at several sizes", "profile hot path", "look for nested loops/hidden loops/N+1 queries"],
      modelAnswer: "First compare data sizes between test and production. Then measure the endpoint at a few input sizes (say 1k, 10k, 100k). If time grows 10× per 10× input it is linear, if 100× it is quadratic. Profile to find the hot function, and look for nested loops, hidden loops like includes, or N+1 database queries.",
      explanation: "Growth measured at multiple sizes is direct evidence of complexity; a single timing is not.",
      commonWrongAnswers: ["Add more servers."],
    },
  ],
  references: [
    { title: "MDN: Set (average O(1) lookup via Set.prototype.has)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set", kind: "official-docs" },
    { title: "Introduction to Algorithms (CLRS), ch. 3: Growth of Functions", url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/", kind: "book" },
    { title: "MIT 6.006 Introduction to Algorithms (OpenCourseWare)", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", kind: "course" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Growth rates and asymptotic analysis do not change with languages or versions."],
  versionSpecific: ["The exact sort algorithm a JavaScript engine uses (V8 uses TimSort since 2018) can change between engine versions."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
