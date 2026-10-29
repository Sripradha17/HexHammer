// Topic: Heaps, priority queues and tries. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csHeapsTries: Topic = {
  id: "cs-heaps-tries",
  domainId: "",
  moduleId: "",
  title: "Heaps, priority queues and tries",
  stage: "complete",
  difficulty: "advanced",
  learningObjectives: [
    "Explain how a binary heap keeps the smallest (or largest) item on top, and its costs.",
    "Use a heap to get the top-k items or merge sorted streams efficiently.",
    "Explain how a trie powers prefix search and autocomplete.",
  ],
  prerequisites: ["cs-trees-graphs"],
  subtopics: ["Heap property", "Heap stored in an array", "Sift up and sift down", "Priority queues", "Top-k with a size-k heap", "Tries and prefix search", "When to use which"],
  strikeIds: ["dsa-s12"],

  story:
    "A support system must always hand agents the most urgent ticket next, while hundreds of new tickets arrive every minute. Sorting the whole list on every arrival is wasteful. A search box must suggest completions for 'jav' from 300,000 product names in under 10 milliseconds, on every keystroke. A heap and a trie are the two specialised trees built exactly for these jobs.",
  mentalModel: {
    plain:
      "A heap is a tree where every parent is smaller than its children (a min-heap), so the smallest item is always at the top. Adding or removing only fixes one path from top to bottom: O(log n). It does NOT keep everything sorted, only the top. A trie is a tree of letters: each path from the root spells a prefix, so every word starting with 'jav' sits under one node.",
    analogy:
      "A heap is a hospital triage line: the most urgent patient is always next, but nobody cares about the exact order of everyone else. A trie is a dictionary's thumb index: find the 'J' tab, then 'a', then 'v', and every word starting with 'jav' is right there.",
    analogyLimit:
      "Triage nurses can re-examine everyone; a heap only ever compares an item with its parent or children, which is exactly why it is fast.",
  },
  lessonSections: [
    {
      heading: "1. The heap property",
      body:
        "In a min-heap every parent is less than or equal to its children; in a max-heap, greater or equal. The root is therefore the minimum (or maximum).\n\nSiblings have no required order, so a heap is only partly sorted. That is enough to answer 'what is next?' and cheaper than keeping everything sorted.",
    },
    {
      heading: "2. A tree stored in an array",
      body:
        "A heap is a complete binary tree, so it fits in an array with no pointers: the children of index i are at 2i + 1 and 2i + 2, and the parent of i is at Math.floor((i - 1) / 2).\n\nPush: add at the end, then sift up (swap with the parent while smaller). Pop: take the root, move the last item to the root, then sift down (swap with the smaller child while larger). Both touch one path: O(log n). Peeking at the top is O(1).",
    },
    {
      heading: "3. Priority queues and top-k",
      body:
        "A priority queue is the heap's job description: take out the highest-priority item next. Uses: task schedulers, Dijkstra's shortest paths, merging k sorted lists, event simulation.\n\nTop-k largest of n items: keep a MIN-heap of size k. For each item, push it; if the heap grows past k, pop the smallest. At the end the heap holds the k largest. O(n log k), far better than sorting everything when k is small.",
    },
    {
      heading: "4. Tries for prefixes",
      body:
        "Each trie node has children keyed by character and a flag marking 'a word ends here'. Inserting or finding a word of length L is O(L), regardless of how many words are stored.\n\nAutocomplete: walk down the prefix (O(L)), then collect the words below that node. Tries also power spell checkers, IP routing tables and word games. The cost is memory: many small nodes.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "The worked example implements both structures in a few dozen lines and prints their results, so you can read every step that makes them fast.",
  codeExamples: [
    {
      title: "A min-heap for top-k, and a trie for autocomplete",
      language: "js",
      code: `class MinHeap {
  items = [];
  get size() { return this.items.length; }
  push(x) {
    const a = this.items; a.push(x);
    let i = a.length - 1;
    while (i > 0) {                                     // sift up
      const p = Math.floor((i - 1) / 2);
      if (a[p] <= a[i]) break;
      [a[p], a[i]] = [a[i], a[p]]; i = p;
    }
  }
  pop() {
    const a = this.items, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {                                        // sift down
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l] < a[m]) m = l;
        if (r < a.length && a[r] < a[m]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]]; i = m;
      }
    }
    return top;
  }
}

function topK(nums, k) {
  const heap = new MinHeap();
  for (const n of nums) { heap.push(n); if (heap.size > k) heap.pop(); }
  const out = []; while (heap.size) out.push(heap.pop());
  return out.reverse();
}
console.log(topK([5, 1, 9, 3, 7, 2, 8], 3));

const trie = {};
for (const w of ["java", "javascript", "jazz", "json"]) {
  let node = trie;
  for (const ch of w) node = node[ch] ??= {};
  node.end = true;
}
function complete(prefix) {
  let node = trie;
  for (const ch of prefix) { node = node[ch]; if (!node) return []; }
  const words = [];
  (function collect(n, sofar) {
    if (n.end) words.push(sofar);
    for (const ch of Object.keys(n)) if (ch !== "end") collect(n[ch], sofar + ch);
  })(node, prefix);
  return words;
}
console.log(complete("jav"), complete("x"));`,
      expectedOutput: `[ 9, 8, 7 ]
[ 'java', 'javascript' ] []`,
      steps: [
        "topK keeps a min-heap of at most 3 numbers. Whenever a 4th arrives, the smallest is popped, so the heap always holds the 3 largest seen so far.",
        "At the end the heap holds 7, 8 and 9. Popping gives them smallest first, and reversing gives [9, 8, 7].",
        "The trie stores each word letter by letter; shared prefixes ('ja', 'jav') share nodes, and `end` marks where a word finishes.",
        "complete('jav') walks j, a, v in three steps, then collects every word below: java and javascript. 'x' has no node, so the result is empty.",
      ],
    },
  ],
  practicalApplication:
    "Heaps: job schedulers that run the most urgent task next, rate limiters and timers (the next timer to fire), Dijkstra in routing, 'top 10 products by sales' over a stream, merging sorted log files. Tries: search-as-you-type, routing tables that match URL or IP prefixes, spell checking. In practice you will often use a library heap or a database query, but recognising 'I only need the top few' or 'I search by prefix' is what lets you pick the right tool. Both are interview favourites at senior levels.",
  commonMistakes: [
    {
      mistake: "Sorting everything to get the top 10.",
      symptom: "O(n log n) work and memory for the whole dataset, painful on large streams.",
      fix: "Keep a min-heap of size 10: O(n log 10) time and O(10) memory.",
    },
    {
      mistake: "Expecting a heap's array to be sorted.",
      symptom: "Reading heap.items in order gives a jumble.",
      fix: "Only the root is guaranteed. Pop repeatedly to get sorted output.",
    },
    {
      mistake: "Using a trie when a Set would do.",
      symptom: "Lots of memory and code for exact-match lookups.",
      fix: "Tries pay off for PREFIX queries. For exact membership, use a Set.",
    },
  ],
  misconceptions: [
    { myth: "A heap is a sorted tree like a BST.", truth: "Only parent-child order is guaranteed; siblings and cousins are in no particular order." },
    { myth: "The 'heap' data structure and 'heap memory' are the same thing.", truth: "Unrelated: heap memory is where objects are allocated; a heap is a tree-shaped priority structure." },
    { myth: "Tries are always faster than hash maps.", truth: "For exact lookups a hash map is usually faster and smaller. Tries win at prefix questions." },
  ],
  exercises: [
    { kind: "strike", strikeId: "dsa-s12", why: "Implement a heap by hand with sift up and sift down, tested against sorting." },
    {
      kind: "predict",
      question: {
        id: "cs-heaps-tries-p1",
        prompt: "Into an empty min-heap, push 5, 3, 8, 1. What does pop() return, and what is then at the root?",
        choices: ["5, then 3", "1, then 3", "1, then 5", "8, then 5"],
        answerIndex: 1,
        explanation: "The root of a min-heap is always the smallest: 1. After removing it, the smallest remaining, 3, rises to the root.",
        objective: 0,
      },
    },
    {
      kind: "debug",
      question: {
        id: "cs-heaps-tries-d1",
        prompt: "This should return the 3 LARGEST numbers but returns the 3 smallest. What is wrong?",
        code: `function top3(nums) {
  const heap = new MaxHeap();          // largest on top
  for (const n of nums) {
    heap.push(n);
    if (heap.size > 3) heap.pop();     // removes the largest!
  }
  return heap.items;
}`,
        choices: ["The loop should start at 1", "It needs a MIN-heap, so the smallest of the kept items is the one evicted", "size should be checked before push", "Heaps cannot do top-k"],
        answerIndex: 1,
        explanation: "To keep the largest k, evict the smallest kept item each time. A min-heap puts that item on top, ready to pop.",
        objective: 1,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-heaps-tries-k1",
      prompt: "In an array-stored heap, where are the children of index 2?",
      choices: ["3 and 4", "4 and 5", "5 and 6", "1 and 3"],
      answerIndex: 2,
      explanation: "Children of i are at 2i + 1 and 2i + 2: 5 and 6.",
      objective: 0,
    },
    {
      id: "cs-heaps-tries-k2",
      prompt: "How long does finding a word of length L take in a trie?",
      choices: ["O(1)", "O(L)", "O(n) for n words", "O(n log n)"],
      answerIndex: 1,
      explanation: "One step per letter, independent of how many words are stored.",
      objective: 2,
    },
  ],
  project: {
    title: "Ticket Triage and Autocomplete",
    summary: "Build a support-ticket triage service backed by a priority queue, and a product search box backed by a trie, both tested and benchmarked against naive versions.",
    type: "implementation",
    objectivesCovered: [0, 1, 2],
    requirements: [
      "A generic priority queue (heap) with a comparator, used to always return the most urgent ticket (priority, then oldest).",
      "A topK(stream, k) helper for 'the 5 customers with the most tickets today'.",
      "A trie built from 10,000 product names with complete(prefix, limit).",
      "Benchmarks: heap vs re-sorting on every insert; trie vs filter(startsWith) on every keystroke.",
    ],
    acceptanceCriteria: [
      "A randomised test shows the heap pops items in the same order as sorting the inputs.",
      "A test shows equal-priority tickets come out oldest first.",
      "A test shows complete returns at most `limit` suggestions, all starting with the prefix.",
    ],
    technologies: ["TypeScript", "Vitest"],
    milestones: [
      { title: "Heap", done_when: "Generic heap passes randomised tests." },
      { title: "Triage", done_when: "Tickets come out by priority, then age." },
      { title: "Trie", done_when: "Autocomplete works with a limit." },
      { title: "Benchmarks", done_when: "Both comparisons are measured and explained." },
    ],
    testIdeas: ["Pop from an empty heap", "Prefix that is a whole word", "Unicode product names"],
    stretchGoals: ["Rank completions by popularity stored in trie nodes", "Merge k sorted log files with a heap"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-heaps-tries-a1",
        prompt: "What is the cost of push and pop on a binary heap with n items?",
        choices: ["O(1) and O(1)", "O(log n) and O(log n)", "O(n) and O(1)", "O(n log n) each"],
        answerIndex: 1,
        explanation: "Both only walk one root-to-leaf path, which has length about log n.",
        objective: 0,
      },
      {
        id: "cs-heaps-tries-a2",
        prompt: "Fastest way to find the 10 largest values in a stream of 100 million numbers?",
        choices: ["Sort them all", "Keep a min-heap of size 10", "Keep a max-heap of all numbers", "Binary search"],
        answerIndex: 1,
        explanation: "O(n log 10) time and only 10 items of memory. Sorting needs the whole stream in memory and O(n log n).",
        objective: 1,
      },
      {
        id: "cs-heaps-tries-a3",
        prompt: "Which feature is a trie built for?",
        choices: ["Finding the median", "Suggesting words that start with what the user typed", "Sorting numbers", "Detecting cycles"],
        answerIndex: 1,
        explanation: "All words with a shared prefix live under one node, so prefix search is a short walk.",
        objective: 2,
      },
      {
        id: "cs-heaps-tries-a4",
        prompt: "Which algorithm relies on a priority queue?",
        choices: ["Binary search", "Dijkstra's shortest path", "Bubble sort", "Two-sum"],
        answerIndex: 1,
        explanation: "Dijkstra repeatedly expands the closest unexplored node, which a min-heap provides efficiently.",
        objective: 1,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-heaps-tries-q01", tags: ["heap"], difficulty: "core", kind: "concept",
      prompt: "What is a heap and how is it implemented?",
      expectedElements: ["complete binary tree with heap property", "array storage, index formulas", "sift up / sift down", "O(log n) push/pop, O(1) peek"],
      modelAnswer: "A heap is a complete binary tree where each parent is no greater than its children in a min-heap (or no smaller in a max-heap), so the root is the minimum. Because it is complete, it is stored in an array: children of i at 2i + 1 and 2i + 2, parent at (i - 1) / 2 rounded down. Push appends and sifts up; pop moves the last item to the root and sifts down. Both are O(log n), and peeking is O(1).",
      explanation: "Array representation is the detail interviewers look for.",
      commonWrongAnswers: ["A heap is a sorted array."],
    },
    {
      id: "cs-heaps-tries-q02", tags: ["top-k"], difficulty: "core", kind: "implementation",
      prompt: "Find the k most frequent words in a large text.",
      expectedElements: ["count with a hash map", "min-heap of size k by count", "O(n + m log k)", "alternative bucket sort O(n)"],
      modelAnswer: "First count occurrences with a Map, O(n). Then keep a min-heap of size k ordered by count: push each word and pop when the heap exceeds k, so the least frequent of the kept words is evicted. That is O(m log k) for m distinct words. Popping the heap gives the answer in reverse. With bounded counts, bucket sort by frequency can do it in O(n).",
      explanation: "Combining hashing and heaps is the classic pattern.",
      commonWrongAnswers: ["Sort all words by count."],
    },
    {
      id: "cs-heaps-tries-q03", tags: ["heap", "streams"], difficulty: "advanced", kind: "design",
      prompt: "How would you keep track of the median of a stream of numbers?",
      expectedElements: ["two heaps: max-heap lower half, min-heap upper half", "balance sizes", "median from tops", "O(log n) insert, O(1) median"],
      modelAnswer: "Use two heaps: a max-heap holding the smaller half and a min-heap holding the larger half. Insert each number into the right half, then rebalance so their sizes differ by at most one. The median is the top of the bigger heap, or the average of both tops when sizes are equal. Insert is O(log n) and reading the median O(1).",
      explanation: "A well-known hard problem with an elegant answer.",
      commonWrongAnswers: ["Sort the stream after every insert."],
    },
    {
      id: "cs-heaps-tries-q04", tags: ["trie"], difficulty: "core", kind: "design",
      prompt: "Design the data structure behind a search box's autocomplete.",
      expectedElements: ["trie of terms", "walk the prefix O(L)", "collect top suggestions", "store popularity/top-k per node", "or server-side index"],
      modelAnswer: "A trie of search terms: walking the typed prefix is O(L), and every completion lives below that node. To return the best few instantly, store popularity counts and cache the top suggestions at each node, updated in the background. Debounce keystrokes on the client. At large scale this moves server-side, into a search engine with prefix or n-gram indexes, but the idea is the same.",
      explanation: "Caching top-k per node is the key optimisation.",
      commonWrongAnswers: ["Filter the whole list on every keystroke."],
    },
    {
      id: "cs-heaps-tries-q05", tags: ["heap", "merge"], difficulty: "advanced", kind: "implementation",
      prompt: "How do you merge k sorted lists efficiently?",
      expectedElements: ["min-heap of the current head of each list", "pop smallest, push its successor", "O(N log k)"],
      modelAnswer: "Put the first element of each list into a min-heap, tagged with which list it came from. Repeatedly pop the smallest, append it to the output, and push the next element from the same list. The heap never holds more than k items, so for N total elements it is O(N log k).",
      explanation: "A staple heap problem.",
      commonWrongAnswers: ["Concatenate and sort: O(N log N)."],
    },
    {
      id: "cs-heaps-tries-q06", tags: ["heap", "sorting"], difficulty: "core", kind: "concept",
      prompt: "What is heapsort and how does it compare to quicksort?",
      expectedElements: ["build heap O(n)", "pop max repeatedly", "O(n log n) worst case", "in place, not stable", "worse cache behaviour"],
      modelAnswer: "Heapsort builds a max-heap from the array in O(n), then repeatedly swaps the root with the last unsorted element and sifts down, giving O(n log n) in every case and sorting in place. It is not stable, and its jumping memory access is less cache-friendly, so quicksort is usually faster on average; heapsort's guaranteed worst case is why some hybrid sorts fall back to it.",
      explanation: "Introsort's fallback is a nice bonus fact.",
      commonWrongAnswers: ["Heapsort is O(n)."],
    },
    {
      id: "cs-heaps-tries-q07", tags: ["trie", "memory"], difficulty: "advanced", kind: "concept",
      prompt: "What are the downsides of a trie, and how can you reduce them?",
      expectedElements: ["memory: many nodes", "pointer overhead", "radix/compressed trie merges single-child chains", "ternary search trees", "hash map may suffice"],
      modelAnswer: "Tries use a lot of memory: one node per character on every unshared path, each with a map of children. Compressed (radix) tries merge chains of single-child nodes into one edge labelled with a string, which saves most of that. Ternary search trees are another compact option. And if you never ask prefix questions, a hash map is simpler and smaller.",
      explanation: "Knowing the costs shows mastery.",
      commonWrongAnswers: ["Tries have no downsides."],
    },
    {
      id: "cs-heaps-tries-q08", tags: ["scheduling"], difficulty: "core", kind: "scenario",
      prompt: "A job scheduler must always run the job with the earliest deadline next. Which structure and why?",
      expectedElements: ["min-heap keyed by deadline", "O(log n) insert and take next", "vs sorted array O(n) insert", "ties by priority/creation"],
      modelAnswer: "A min-heap keyed by deadline: adding a job is O(log n) and taking the next one is O(log n), with peeking at the next deadline O(1) for setting a timer. A sorted array would need O(n) to insert, and scanning an unsorted list O(n) to find the next. I would break ties by priority or creation time in the comparator so ordering is predictable.",
      explanation: "Direct application of the priority queue idea.",
      commonWrongAnswers: ["Sort the jobs every second."],
    },
  ],
  references: [
    { title: "Introduction to Algorithms (CLRS), ch. 6: Heapsort and priority queues", url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/", kind: "book" },
    { title: "MIT 6.006 Introduction to Algorithms (OpenCourseWare)", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", kind: "course" },
    { title: "Wikipedia: Trie", url: "https://en.wikipedia.org/wiki/Trie", kind: "article" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Heaps, priority queues and tries are classic structures that do not change."],
  versionSpecific: [],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
