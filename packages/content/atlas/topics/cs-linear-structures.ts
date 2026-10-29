// Topic: Arrays, linked lists, stacks and queues. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csLinearStructures: Topic = {
  id: "cs-linear-structures",
  domainId: "",
  moduleId: "",
  title: "Arrays, linked lists, stacks and queues",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Pick between an array and a linked list for a workload, using the cost of each operation.",
    "Implement a stack and a queue and name real uses of each.",
    "Solve classic problems with a stack (matching brackets, undo) and a queue (breadth-first processing).",
  ],
  prerequisites: ["cs-big-o"],
  subtopics: ["Arrays and dynamic arrays", "Linked lists: singly and doubly", "Stacks (LIFO)", "Queues (FIFO) and deques", "Why shift() is slow", "Ring buffers", "Monotonic stack"],
  strikeIds: ["dsa-s02", "dsa-s06", "dsa-s07", "l2-s16"],

  story:
    "A job processor takes the oldest job from an array with `jobs.shift()`. With 50 jobs it is instant; with 200,000 queued during a traffic spike, each shift moves every remaining item one slot left, and the processor falls further behind the more work it has. The fix is not a faster server; it is the right shape of data structure. Stacks and queues are tiny ideas that run undo buttons, browsers, compilers and every job system.",
  mentalModel: {
    plain:
      "An array stores items side by side in memory, so jumping to item 500 is instant, but inserting at the front means shifting everyone. A linked list stores each item in its own node with a pointer to the next, so inserting at a known spot is instant, but finding item 500 means walking 500 links. A stack adds and removes at the same end (last in, first out). A queue adds at the back and removes at the front (first in, first out).",
    analogy:
      "An array is a row of numbered lockers: go straight to locker 500, but squeezing a new locker in at the start means renumbering them all. A linked list is a treasure hunt: each clue points to the next. A stack is a pile of plates. A queue is the line at a coffee shop.",
    analogyLimit:
      "In JavaScript, arrays are dynamic and highly optimised, and linked lists lose memory locality, so in practice arrays win more often than the textbook costs suggest. Measure before switching.",
  },
  lessonSections: [
    {
      heading: "1. Arrays: fast by position",
      body:
        "Reading or writing `arr[i]` is O(1). Adding or removing at the END (push, pop) is O(1) amortised.\n\nAdding or removing at the FRONT or middle (unshift, shift, splice) is O(n): every later item moves. So `shift()` in a loop over a big array is O(n²).",
    },
    {
      heading: "2. Linked lists: fast at the ends you hold",
      body:
        "Each node holds a value and a `next` pointer (doubly linked lists also hold `prev`). Keeping head and tail pointers makes adding at either end and removing from the front O(1).\n\nBut reading the 500th item is O(n): there is no index, you walk. Linked lists shine when you insert and remove a lot at known positions (an LRU cache's recency list is a doubly linked list plus a Map).",
    },
    {
      heading: "3. Stacks: last in, first out",
      body:
        "Operations: push (add on top), pop (take from top), peek. An array's push and pop make a perfect O(1) stack.\n\nReal uses: the call stack, undo history, the browser's back button, matching brackets in code, depth-first search, and evaluating expressions.",
    },
    {
      heading: "4. Queues: first in, first out",
      body:
        "Operations: enqueue at the back, dequeue from the front. An array with shift is O(n) per dequeue. A proper queue uses a linked list, or an array with a moving `head` index, so both ends are O(1).\n\nReal uses: job and message queues, print queues, breadth-first search, rate-limiting windows. A deque (double-ended queue) allows both ends.",
    },
    {
      heading: "5. Choosing",
      body:
        "Need random access by index, or mostly append and iterate? Array.\nNeed O(1) removal from the front under heavy load? A queue (head index or linked list).\nNeed last-in-first-out? Array as a stack.\nNeed to remove items from the middle when you already hold a reference to them? Doubly linked list.\n\nAnd measure: JavaScript arrays are extremely optimised.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "The worked example runs a real stack and a real O(1) queue and prints what comes out, and the project benchmarks shift() against a head index so you can see the O(n) cost grow.",
  codeExamples: [
    {
      title: "A stack checks brackets; a queue processes in order",
      language: "js",
      code: `function balanced(code) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const ch of code) {
    if ("([{".includes(ch)) stack.push(ch);
    else if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;   // wrong closer
    }
  }
  return stack.length === 0;                          // nothing left open
}
console.log(balanced("if (a[0]) { go(); }"), balanced("call(x]"), balanced("{ open"));

class Queue {
  #items = []; #head = 0;
  enqueue(x) { this.#items.push(x); }
  dequeue() {                                          // O(1): move the head, never shift
    if (this.#head === this.#items.length) return undefined;
    return this.#items[this.#head++];
  }
  get size() { return this.#items.length - this.#head; }
}
const q = new Queue();
["job1", "job2", "job3"].forEach((j) => q.enqueue(j));
console.log(q.dequeue(), q.dequeue(), q.size);`,
      expectedOutput: `true false false
job1 job2 1`,
      steps: [
        "For each opening bracket the stack grows; for each closing bracket, the most recent opener is popped and must match. That is exactly last-in-first-out.",
        "\"call(x]\" pops \"(\" when it sees \"]\": the wrong partner, so false. \"{ open\" ends with \"{\" still on the stack, so false.",
        "The queue never calls shift. It keeps a head index and moves it forward, so dequeue is O(1) no matter how many jobs wait.",
        "Jobs come out in the order they went in: job1, then job2, leaving 1 in the queue.",
      ],
    },
  ],
  practicalApplication:
    "Use arrays by default. Reach for a real queue (head index, ring buffer or a library) when items are removed from the front under load, such as job processors or BFS over large graphs. Stacks appear in undo/redo, parsers, navigation history and iterative DFS. In interviews, 'valid parentheses', 'implement a queue with two stacks', 'reverse a linked list' and 'detect a cycle' (fast and slow pointers) are staple questions.",
  commonMistakes: [
    {
      mistake: "Using shift() as a queue's dequeue on large data.",
      symptom: "Processing slows down as the backlog grows: O(n) per dequeue, O(n²) overall.",
      fix: "Track a head index, or use a linked list or ring buffer.",
    },
    {
      mistake: "Losing the rest of a linked list while rewiring pointers.",
      symptom: "Items vanish after an insert or reverse.",
      fix: "Save `next` in a variable before changing `node.next`, and draw the pointers on paper first.",
    },
    {
      mistake: "Popping from an empty stack without checking.",
      symptom: "undefined sneaks into logic (\"])\" passes a bracket check).",
      fix: "Check the stack is not empty before popping, or compare the popped value carefully as in the example.",
    },
  ],
  misconceptions: [
    { myth: "Linked lists are always faster for inserts.", truth: "Only when you already hold the node. Finding the position is O(n), and poor memory locality often makes arrays faster in practice." },
    { myth: "JavaScript arrays are fixed-size like in C.", truth: "They grow automatically; push is amortised O(1)." },
    { myth: "A queue and a stack differ only in name.", truth: "Their removal order is opposite (FIFO vs LIFO), which changes algorithms: BFS needs a queue, DFS a stack." },
  ],
  exercises: [
    { kind: "strike", strikeId: "dsa-s02", why: "Implement array-backed structures by hand." },
    { kind: "strike", strikeId: "dsa-s06", why: "Build and manipulate a linked list, pointer by pointer." },
    { kind: "strike", strikeId: "dsa-s07", why: "Stacks and queues on interview-style problems." },
    {
      kind: "predict",
      question: {
        id: "cs-linear-structures-p1",
        prompt: "Items 1, 2, 3 are pushed onto a stack, then one item is popped; then 4 is pushed and two items are popped. What are the popped values, in order?",
        choices: ["3, 4, 2", "1, 2, 3", "3, 2, 1", "1, 4, 3"],
        answerIndex: 0,
        explanation: "After pushing 1, 2, 3 the top is 3: pop gives 3. Push 4: stack is 1, 2, 4. Pop gives 4, then 2. Last in, first out.",
        objective: 1,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-linear-structures-k1",
      prompt: "What is the cost of arr.shift() on an array of n items?",
      choices: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      answerIndex: 2,
      explanation: "Every remaining item moves one slot towards the front.",
      objective: 0,
    },
    {
      id: "cs-linear-structures-k2",
      prompt: "Which structure does breadth-first search use?",
      choices: ["Stack", "Queue", "Hash map", "Heap"],
      answerIndex: 1,
      explanation: "BFS visits nodes in the order they were discovered, which is first-in-first-out.",
      objective: 2,
    },
  ],
  project: {
    title: "Undo, Redo and a Job Queue",
    summary: "Build a tiny text editor model with undo and redo (two stacks) and a background job queue with O(1) operations, both tested under load.",
    type: "implementation",
    objectivesCovered: [0, 1, 2],
    requirements: [
      "An editor model with insert and delete commands, undo and redo, implemented with two stacks.",
      "A new edit clears the redo stack.",
      "A Queue class with enqueue, dequeue, peek and size, all O(1), without shift.",
      "A benchmark comparing your queue with an array using shift for 100,000 items.",
    ],
    acceptanceCriteria: [
      "Tests cover undo after several edits, redo, and redo cleared by a new edit.",
      "Tests cover dequeue on an empty queue and interleaved enqueue/dequeue.",
      "The benchmark shows the shift-based queue getting dramatically slower as n grows while yours stays flat.",
    ],
    technologies: ["TypeScript", "Vitest"],
    milestones: [
      { title: "Commands", done_when: "Insert and delete are commands that can be applied and reversed." },
      { title: "Undo/redo", done_when: "Two-stack history passes its tests." },
      { title: "Queue", done_when: "O(1) queue passes its tests." },
      { title: "Benchmark", done_when: "Results and explanation are in the README." },
    ],
    testIdeas: ["Undo with empty history", "1 million enqueues", "Memory after many dequeues (compact the array occasionally)"],
    stretchGoals: ["Implement a ring buffer with a fixed capacity", "Implement a queue using two stacks"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-linear-structures-a1",
        prompt: "Which operation is O(1) on an array but O(n) on a singly linked list?",
        choices: ["Add at the front", "Read the item at index i", "Remove the first item", "Add at the tail (when a tail pointer is kept)"],
        answerIndex: 1,
        explanation: "Arrays jump to any index directly; a linked list must walk node by node.",
        objective: 0,
      },
      {
        id: "cs-linear-structures-a2",
        prompt: "Which real feature is naturally a stack?",
        choices: ["A print queue", "The browser's Back button", "A round-robin scheduler", "A message queue"],
        answerIndex: 1,
        explanation: "Back returns to the most recently visited page first: last in, first out.",
        objective: 1,
      },
      {
        id: "cs-linear-structures-a3",
        prompt: "What does balanced(\"([)]\") return with the stack-based checker?",
        choices: ["true", "false", "undefined", "It throws"],
        answerIndex: 1,
        explanation: "When ')' arrives, the top of the stack is '[', not '(': a mismatch, so false.",
        objective: 2,
      },
      {
        id: "cs-linear-structures-a4",
        prompt: "A queue implemented with an array and a moving head index: what is the cost of dequeue?",
        choices: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        answerIndex: 0,
        explanation: "It reads one slot and moves the index; nothing is shifted.",
        objective: 1,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-linear-structures-q01", tags: ["arrays", "linked-lists"], difficulty: "foundation", kind: "concept",
      prompt: "Compare arrays and linked lists.",
      expectedElements: ["array: O(1) index access, O(n) insert at front", "linked list: O(1) insert/delete at known node, O(n) access", "memory locality", "when to use each"],
      modelAnswer: "Arrays store elements contiguously, so access by index is O(1) and iteration is cache-friendly, but inserting or deleting anywhere except the end shifts elements, O(n). Linked lists store nodes with pointers, so inserting or removing at a node you already hold is O(1), but reaching the i-th element is O(n), and scattered nodes are less cache-friendly. I default to arrays and use linked lists when I need constant-time removals from the middle, as in an LRU cache.",
      explanation: "Mentioning locality and the LRU example lifts this.",
      commonWrongAnswers: ["Linked lists are always faster."],
    },
    {
      id: "cs-linear-structures-q02", tags: ["stack"], difficulty: "foundation", kind: "implementation",
      prompt: "How do you check if a string of brackets is balanced?",
      expectedElements: ["stack of openers", "on closer, pop and compare", "fail on mismatch or empty stack", "stack empty at end", "O(n)"],
      modelAnswer: "I scan the string with a stack. Every opening bracket is pushed. For each closing bracket, I pop and check that it is the matching opener; if the stack is empty or it does not match, the string is unbalanced. At the end the stack must be empty, otherwise something was left open. It is O(n) time and O(n) space.",
      explanation: "Classic warm-up; empty-stack and leftover cases are the details.",
      commonWrongAnswers: ["Count opening and closing brackets."],
    },
    {
      id: "cs-linear-structures-q03", tags: ["queue", "stack"], difficulty: "core", kind: "implementation",
      prompt: "Implement a queue using two stacks. What is the complexity?",
      expectedElements: ["inbox stack for enqueue", "outbox stack for dequeue", "move all when outbox empty", "amortised O(1)"],
      modelAnswer: "Keep an inbox stack and an outbox stack. Enqueue pushes onto the inbox. Dequeue pops from the outbox; if the outbox is empty, first pop every item from the inbox and push it onto the outbox, which reverses their order so the oldest is on top. Each item is moved at most once, so both operations are amortised O(1).",
      explanation: "Amortised analysis is the point of the question.",
      commonWrongAnswers: ["Dequeue is always O(n)."],
    },
    {
      id: "cs-linear-structures-q04", tags: ["linked-list"], difficulty: "core", kind: "implementation",
      prompt: "How do you reverse a singly linked list?",
      expectedElements: ["three pointers prev/current/next", "save next before rewiring", "O(n) time, O(1) space", "return new head"],
      modelAnswer: "I walk the list with prev = null and current = head. At each node I save next = current.next, point current.next back to prev, then move prev to current and current to next. When current is null, prev is the new head. It is O(n) time and O(1) extra space.",
      explanation: "Saving next before rewiring is what people forget.",
      commonWrongAnswers: ["Copy values into an array and rebuild."],
    },
    {
      id: "cs-linear-structures-q05", tags: ["linked-list", "cycle"], difficulty: "core", kind: "implementation",
      prompt: "How do you detect a cycle in a linked list?",
      expectedElements: ["fast and slow pointers", "fast moves two, slow one", "meet means cycle", "null means no cycle", "O(1) space vs Set"],
      modelAnswer: "With Floyd's fast and slow pointers: slow moves one node at a time, fast moves two. If fast reaches null, there is no cycle. If there is a cycle, fast eventually laps slow and they meet. It is O(n) time and O(1) space; a simpler alternative is storing visited nodes in a Set, at O(n) space.",
      explanation: "Offering both options shows judgement.",
      commonWrongAnswers: ["Loop until you see the head again."],
    },
    {
      id: "cs-linear-structures-q06", tags: ["performance", "queue"], difficulty: "core", kind: "debugging",
      prompt: "A worker processes jobs with `while (jobs.length) handle(jobs.shift())`. It slows to a crawl under load. Why?",
      expectedElements: ["shift is O(n)", "overall O(n²)", "head index / proper queue", "or process in batches"],
      modelAnswer: "Each shift removes the first element and moves all the others down, O(n), so draining n jobs is O(n²): with 200,000 queued jobs that is billions of moves. A queue with a head index, a ring buffer or a linked list makes each dequeue O(1). For production systems, a real message queue such as Redis or SQS is better still.",
      explanation: "Directly from real incidents.",
      commonWrongAnswers: ["handle() must be slow."],
    },
    {
      id: "cs-linear-structures-q07", tags: ["stack", "patterns"], difficulty: "advanced", kind: "concept",
      prompt: "What is a monotonic stack, and what problems does it solve?",
      expectedElements: ["stack kept increasing or decreasing", "pop while new item breaks order", "next greater element / daily temperatures / histogram", "O(n)"],
      modelAnswer: "A monotonic stack keeps its items in increasing or decreasing order. When a new item would break the order, you pop items until it fits, and each popped item has just found its 'next greater' (or smaller) element. It solves next-greater-element, daily temperatures and largest rectangle in a histogram in O(n), because each item is pushed and popped at most once.",
      explanation: "A pattern that unlocks a whole family of problems.",
      commonWrongAnswers: ["A stack that never changes."],
    },
    {
      id: "cs-linear-structures-q08", tags: ["design", "lru"], difficulty: "advanced", kind: "design",
      prompt: "How would you design an LRU cache with O(1) get and put?",
      expectedElements: ["hash map key to node", "doubly linked list for recency", "move to front on access", "evict tail when full"],
      modelAnswer: "Combine a hash map from key to node with a doubly linked list ordered by recency. get looks up the node in O(1) and moves it to the front of the list. put inserts or updates the node at the front; if the size exceeds capacity, remove the node at the tail and delete its key from the map. Every step touches a fixed number of pointers, so both are O(1). In JavaScript, a Map's insertion order can simulate this more simply.",
      explanation: "One of the most common design-implementation questions.",
      commonWrongAnswers: ["Sort by access time on every get."],
    },
  ],
  references: [
    { title: "MDN: Array", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array", kind: "official-docs" },
    { title: "Introduction to Algorithms (CLRS), ch. 10: Elementary Data Structures", url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/", kind: "book" },
    { title: "MIT 6.006 Introduction to Algorithms (OpenCourseWare)", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", kind: "course" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Stacks, queues, arrays and linked lists and their costs are universal."],
  versionSpecific: ["How fast JavaScript arrays are in practice depends on engine optimisations."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
