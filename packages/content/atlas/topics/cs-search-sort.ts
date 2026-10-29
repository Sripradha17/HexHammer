// Topic: Searching and sorting. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csSearchSort: Topic = {
  id: "cs-search-sort",
  domainId: "",
  moduleId: "",
  title: "Searching and sorting",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Implement linear and binary search, and say when binary search applies.",
    "Explain how merge sort and quicksort work, with their time and space complexities.",
    "Explain sort stability and use a comparator correctly in JavaScript.",
  ],
  prerequisites: ["cs-big-o"],
  subtopics: ["Linear search", "Binary search and its edge cases", "Merge sort", "Quicksort and pivots", "Stability", "Array.prototype.sort and comparators", "Binary search on the answer"],
  strikeIds: ["dsa-s09", "dsa-s14"],

  story:
    "An order history page sorts prices and shows 100 before 25. A 'find version' feature scans a sorted list of 2 million releases one by one, taking seconds when it could take 21 steps. Sorting and searching are the most reused algorithms in computing; the bugs are rarely in the algorithm itself, but in not knowing what the built-in one does.",
  mentalModel: {
    plain:
      "Linear search checks items one by one: O(n), works on anything. Binary search on SORTED data checks the middle, throws away the half that cannot contain the target, and repeats: O(log n). Good general sorts split the problem: merge sort splits in half, sorts each half, then merges; quicksort picks a pivot and partitions smaller items left, larger right. Both average O(n log n).",
    analogy:
      "Finding a word in a dictionary: you open near the middle, see you are too far, and jump back by half: binary search. Sorting a pile of exam papers: split the pile between two friends, each sorts their half, then you merge the two sorted piles by repeatedly taking the smaller top paper: merge sort.",
    analogyLimit:
      "Binary search only works because a dictionary is sorted and you can jump to any page instantly. On an unsorted pile, or a linked list where you must walk page by page, the trick fails.",
  },
  lessonSections: [
    {
      heading: "1. Linear search",
      body:
        "Walk the list until you find the target or reach the end. O(n). It is the right choice for small or unsorted data, and it is what includes, indexOf and find do.",
    },
    {
      heading: "2. Binary search",
      body:
        "Keep two bounds, lo and hi. Look at mid = Math.floor((lo + hi) / 2). If the middle is the target, done. If it is too small, the target must be to the right: lo = mid + 1. Too big: hi = mid - 1. Stop when lo > hi (not found).\n\nEach step halves the range: a million items need at most about 20 steps. Requirements: sorted data and fast access by index. The classic bugs are in the bounds: < versus <=, and mid ± 1.",
    },
    {
      heading: "3. Merge sort",
      body:
        "Split the array in half, sort each half (recursively), then merge two sorted halves by repeatedly taking the smaller front item.\n\nAlways O(n log n): log n levels of splitting, n work to merge at each level. It needs O(n) extra space for merging, and it is stable (equal items keep their original order).",
    },
    {
      heading: "4. Quicksort",
      body:
        "Pick a pivot, partition the array so smaller items go left and larger go right, then quicksort each side.\n\nAverage O(n log n) and in-place (O(log n) stack space), so it is fast in practice. Worst case O(n²) when pivots are always the smallest or largest, for example the first item of already-sorted data; random or median-of-three pivots avoid it. It is not stable.",
    },
    {
      heading: "5. Sorting in JavaScript",
      body:
        "`arr.sort()` with no comparator converts items to strings and sorts them alphabetically: [100, 25, 3] becomes [100, 25, 3]. For numbers always pass a comparator: `arr.sort((a, b) => a - b)`. A negative result puts a first, positive puts b first.\n\nsort mutates the array; `toSorted` returns a sorted copy. Since ES2019 Array.prototype.sort is required to be stable, so sorting by one key and then another keeps the earlier order among ties.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "The worked example counts the steps binary search takes and shows the default-sort trap; the Big O lab in the previous topic shows how n log n compares with n².",
  codeExamples: [
    {
      title: "Binary search, and the default-sort trap",
      language: "js",
      code: `function binarySearch(sorted, target) {
  let lo = 0, hi = sorted.length - 1, steps = 0;
  while (lo <= hi) {
    steps++;
    const mid = Math.floor((lo + hi) / 2);
    if (sorted[mid] === target) return { index: mid, steps };
    if (sorted[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return { index: -1, steps };
}

const ids = Array.from({ length: 1_000_000 }, (_, i) => i * 2);   // 0, 2, 4, ... sorted
console.log(binarySearch(ids, 1_234_566));
console.log(binarySearch(ids, 7).index);

const prices = [100, 25, 3, 1000];
console.log([...prices].sort());
console.log([...prices].sort((a, b) => a - b));`,
      expectedOutput: `{ index: 617283, steps: 20 }
-1
[ 100, 1000, 25, 3 ]
[ 3, 25, 100, 1000 ]`,
      steps: [
        "ids holds a million even numbers in order. 1,234,566 is at index 617,283, found in 20 steps: each step halves the remaining range.",
        "7 is odd, so it is not in the list. The bounds cross (lo > hi) and the search returns -1 after about 20 steps too.",
        "sort() with no comparator compares as STRINGS, character by character: \"100\" < \"1000\" (a prefix comes first) < \"25\" < \"3\", so 1000 lands between 100 and 25.",
        "With a numeric comparator (a - b), the prices sort as numbers.",
      ],
    },
  ],
  practicalApplication:
    "Always pass a comparator when sorting numbers or objects, and use toSorted when the array belongs to someone else. Use binary search for lookups in large sorted arrays (timestamps in logs, version lists), or let the database do it with an index, which is a tree built for exactly this. In interviews, binary search shows up far beyond 'find in sorted array': searching for the first bad version, the smallest capacity that works, or a rotation point.",
  commonMistakes: [
    {
      mistake: "Sorting numbers without a comparator.",
      symptom: "[10, 9, 100] sorts to [10, 100, 9].",
      fix: "arr.sort((a, b) => a - b) for ascending numbers.",
    },
    {
      mistake: "Off-by-one bounds in binary search.",
      symptom: "Infinite loops, or the first or last element is never found.",
      fix: "With inclusive bounds use while (lo <= hi), lo = mid + 1 and hi = mid - 1. Test arrays of length 0, 1 and 2.",
    },
    {
      mistake: "Binary searching unsorted data.",
      symptom: "Sometimes finds the item, sometimes says it is missing.",
      fix: "Sort first (O(n log n)) if you will search many times, or use a linear search or a Set.",
    },
  ],
  misconceptions: [
    { myth: "Quicksort is always O(n log n).", truth: "Its worst case is O(n²) with bad pivots; random pivots make that extremely unlikely." },
    { myth: "Binary search is always better than linear search.", truth: "It needs sorted data with random access. For a handful of items, or a single search on unsorted data, linear is simpler and fine." },
    { myth: "sort() sorts numbers numerically.", truth: "Without a comparator it compares string versions of the values." },
  ],
  exercises: [
    { kind: "strike", strikeId: "dsa-s09", why: "Write binary search by hand and pass tests for the edge cases that break it." },
    { kind: "strike", strikeId: "dsa-s14", why: "Implement a real sort and compare it against the built-in one." },
    {
      kind: "predict",
      question: {
        id: "cs-search-sort-p1",
        prompt: "What does this print?",
        code: `console.log(["b", "a", "C", "B"].sort());`,
        choices: ["[ 'a', 'b', 'B', 'C' ]", "[ 'B', 'C', 'a', 'b' ]", "[ 'a', 'B', 'b', 'C' ]", "[ 'C', 'B', 'b', 'a' ]"],
        answerIndex: 1,
        explanation: "The default sort compares UTF-16 code units, and all capital letters come before lowercase ones. For human-friendly order use a.localeCompare(b).",
        objective: 2,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-search-sort-k1",
      prompt: "What does binary search require?",
      choices: ["Unique values", "Sorted data with fast index access", "A linked list", "Numbers only"],
      answerIndex: 1,
      explanation: "It relies on the order to discard halves, and on jumping straight to the middle.",
      objective: 0,
    },
    {
      id: "cs-search-sort-k2",
      prompt: "What does a stable sort guarantee?",
      choices: ["It never crashes", "Equal items keep their original relative order", "It is always O(n)", "It does not mutate the array"],
      answerIndex: 1,
      explanation: "Stability matters when sorting by several keys one after another.",
      objective: 2,
    },
  ],
  project: {
    title: "Sort Lab: implement, test and race sorting algorithms",
    summary: "Implement insertion sort, merge sort and quicksort, prove them correct with property-based tests against the built-in sort, and measure them on random, sorted and reversed data.",
    type: "implementation",
    objectivesCovered: [0, 1, 2],
    requirements: [
      "Insertion sort, merge sort and quicksort (with random pivots) that accept a comparator.",
      "A binary search that returns the first index where a value could be inserted (lower bound).",
      "Tests comparing each sort with toSorted on hundreds of random arrays.",
      "A benchmark table for n = 1,000, 10,000 and 100,000 on random, sorted and reversed input.",
    ],
    acceptanceCriteria: [
      "A test shows merge sort is stable (objects with equal keys keep their order).",
      "Tests cover empty arrays, one item and all-equal items.",
      "The README explains why insertion sort wins on nearly sorted data and loses on random data.",
    ],
    technologies: ["TypeScript", "Vitest"],
    milestones: [
      { title: "Three sorts", done_when: "All three pass the random comparison tests." },
      { title: "Lower bound", done_when: "Binary search insertion point is tested at both ends." },
      { title: "Benchmarks", done_when: "The table is produced by a script." },
      { title: "Explain", done_when: "README discusses complexity and the results." },
    ],
    testIdeas: ["Negative numbers", "Duplicates", "Comparator for objects by two keys"],
    stretchGoals: ["Add a hybrid sort that switches to insertion sort for small slices", "Visualise each sort step by step"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-search-sort-a1",
        prompt: "About how many steps does binary search need for 1,000,000 sorted items in the worst case?",
        choices: ["20", "1,000", "500,000", "1,000,000"],
        answerIndex: 0,
        explanation: "log₂(1,000,000) ≈ 20, because each step halves the range.",
        objective: 0,
      },
      {
        id: "cs-search-sort-a2",
        prompt: "What is merge sort's time complexity, and its extra space?",
        choices: ["O(n²) time, O(1) space", "O(n log n) time, O(n) space", "O(n) time, O(n) space", "O(log n) time, O(1) space"],
        answerIndex: 1,
        explanation: "log n levels of splitting with O(n) merging work each; merging needs a temporary array.",
        objective: 1,
      },
      {
        id: "cs-search-sort-a3",
        prompt: "When does quicksort hit its O(n²) worst case?",
        choices: ["On random data", "When the pivot is always the smallest or largest item, e.g. first item of sorted input", "On arrays with duplicates", "Never"],
        answerIndex: 1,
        explanation: "Bad pivots split n items into 0 and n - 1, giving n levels instead of log n. Random pivots avoid this.",
        objective: 1,
      },
      {
        id: "cs-search-sort-a4",
        prompt: "Which call sorts objects by price, lowest first?",
        choices: [
          "items.sort((a, b) => a.price > b.price)",
          "items.sort((a, b) => a.price - b.price)",
          "items.sort(\"price\")",
          "items.sort((a, b) => b.price - a.price)",
        ],
        answerIndex: 1,
        explanation: "The comparator must return a negative, zero or positive number. Returning a boolean is wrong, and b - a sorts highest first.",
        objective: 2,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-search-sort-q01", tags: ["binary-search"], difficulty: "core", kind: "implementation",
      prompt: "Talk through binary search, including the edge cases you test.",
      expectedElements: ["lo/hi bounds", "mid calculation", "move lo or hi past mid", "loop condition lo <= hi", "tests: empty, one item, first, last, missing"],
      modelAnswer: "I keep lo = 0 and hi = length - 1. While lo <= hi, I take mid = floor((lo + hi) / 2); if it matches I return it; if the middle value is smaller than the target I set lo = mid + 1, otherwise hi = mid - 1. When the loop ends the target is absent. I test an empty array, a single element, the first and last elements, a missing value smaller than all, larger than all, and in between, and duplicates if I need the first occurrence.",
      explanation: "Edge cases are what interviewers grade.",
      commonWrongAnswers: ["while (lo < hi) with hi = mid - 1 (misses elements)."],
    },
    {
      id: "cs-search-sort-q02", tags: ["sorting"], difficulty: "core", kind: "concept",
      prompt: "Compare merge sort and quicksort.",
      expectedElements: ["both O(n log n) average", "merge: guaranteed, stable, O(n) space", "quick: in-place, cache friendly, O(n²) worst, unstable", "pivot strategy"],
      modelAnswer: "Both are divide and conquer with O(n log n) average time. Merge sort guarantees O(n log n) in every case and is stable, but needs O(n) extra space. Quicksort sorts in place with O(log n) stack space and is usually faster in practice thanks to cache-friendly access, but has an O(n²) worst case with bad pivots, mitigated by random or median-of-three pivots, and it is not stable.",
      explanation: "Stability and space are the deciding factors.",
      commonWrongAnswers: ["Quicksort is always faster."],
    },
    {
      id: "cs-search-sort-q03", tags: ["javascript", "sort"], difficulty: "foundation", kind: "debugging",
      prompt: "Why does [10, 9, 1, 100].sort() give [1, 10, 100, 9]?",
      expectedElements: ["default compares strings", "lexicographic order", "use (a, b) => a - b"],
      modelAnswer: "Without a comparator, Array.prototype.sort converts elements to strings and compares them character by character, so \"100\" comes before \"9\" because \"1\" < \"9\". Passing (a, b) => a - b sorts numerically.",
      explanation: "A JavaScript classic.",
      commonWrongAnswers: ["The sort is buggy."],
    },
    {
      id: "cs-search-sort-q04", tags: ["binary-search", "patterns"], difficulty: "advanced", kind: "concept",
      prompt: "What does 'binary search on the answer' mean? Give an example.",
      expectedElements: ["search over possible answer values", "monotonic yes/no check", "e.g. first bad version / minimum capacity / koko bananas", "O(log range × check)"],
      modelAnswer: "Instead of searching an array, you binary-search the range of possible answers when there is a monotonic yes/no test: every value above some threshold works and every value below fails. Example: the smallest truck capacity that ships all packages within D days. You try a middle capacity, simulate it, and halve the range depending on the result. Cost is log of the range times the cost of one check.",
      explanation: "Recognising monotonicity is the skill.",
      commonWrongAnswers: ["Binary search only works on arrays."],
    },
    {
      id: "cs-search-sort-q05", tags: ["sorting", "stability"], difficulty: "core", kind: "concept",
      prompt: "What is a stable sort, and when does it matter?",
      expectedElements: ["equal keys keep original order", "multi-key sorting", "JS sort is stable since ES2019", "UI table sorting"],
      modelAnswer: "A stable sort keeps items with equal keys in the order they had before. It matters when sorting by several keys in steps, for example sort orders by date and then stably by customer, so each customer's orders stay in date order, and in UIs where clicking a column should not shuffle ties. JavaScript's sort has been required to be stable since ES2019.",
      explanation: "A practical example sells it.",
      commonWrongAnswers: ["Stable means it does not crash."],
    },
    {
      id: "cs-search-sort-q06", tags: ["complexity"], difficulty: "core", kind: "scenario",
      prompt: "You need to check 1,000 lookups against a list of 1,000,000 numbers. Sort and binary search, or use a Set?",
      expectedElements: ["Set: O(n) build + O(1) lookups", "sort: O(n log n) + O(log n) lookups", "Set usually simpler/faster", "sorted helps for range queries/nearest"],
      modelAnswer: "For exact membership checks a Set is simplest: building it is O(n) and each lookup is O(1) on average. Sorting is O(n log n) and each binary search O(log n), so it is slower for this case, but sorted data wins when I need range queries, the nearest value, or the count below a threshold, which a Set cannot answer.",
      explanation: "Choosing by the question being asked.",
      commonWrongAnswers: ["Always sort first."],
    },
    {
      id: "cs-search-sort-q07", tags: ["sorting", "lower-bound"], difficulty: "advanced", kind: "implementation",
      prompt: "How do you find the FIRST occurrence of a value in a sorted array with duplicates?",
      expectedElements: ["keep searching left after a match", "record candidate", "or lower-bound with half-open range", "O(log n)"],
      modelAnswer: "Run binary search, but when the middle equals the target, record mid as a candidate and continue searching the left half (hi = mid - 1) instead of returning. When the loop ends, the last recorded candidate is the first occurrence. Equivalently, compute a lower bound: the first index whose value is not less than the target. Still O(log n).",
      explanation: "Variants of binary search are favourites.",
      commonWrongAnswers: ["Find any match and walk left one by one (O(n) worst case)."],
    },
    {
      id: "cs-search-sort-q08", tags: ["sorting", "lower-bound-theory"], difficulty: "core", kind: "concept",
      prompt: "Can you sort faster than O(n log n)?",
      expectedElements: ["not with comparisons in general", "counting/radix sort for limited integer ranges", "O(n + k)", "trade-offs"],
      modelAnswer: "Not with a general comparison-based sort: the lower bound is O(n log n) comparisons. But when keys are small integers or fixed-length strings, non-comparison sorts like counting sort, O(n + k) for a key range k, or radix sort can be linear. They trade generality and extra memory for speed.",
      explanation: "Knowing when the bound does not apply.",
      commonWrongAnswers: ["Yes, quicksort is O(n)."],
    },
  ],
  references: [
    { title: "MDN: Array.prototype.sort", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort", kind: "official-docs" },
    { title: "Introduction to Algorithms (CLRS), ch. 2 and 7: Merge sort and Quicksort", url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/", kind: "book" },
    { title: "MIT 6.006 Introduction to Algorithms (OpenCourseWare)", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", kind: "course" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Binary search and the O(n log n) comparison bound are fundamental results."],
  versionSpecific: ["JavaScript's required sort stability (ES2019) and toSorted (ES2023) are language-version details."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
