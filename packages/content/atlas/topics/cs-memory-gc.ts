// Topic: Memory management and garbage collection. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csMemoryGc: Topic = {
  id: "cs-memory-gc",
  domainId: "",
  moduleId: "",
  title: "Memory management and garbage collection",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Explain stack versus heap memory and what lives in each.",
    "Explain reachability-based garbage collection (mark and sweep).",
    "Recognise the common memory leaks in JavaScript: caches, listeners, timers and closures.",
    "Find a leak with heap snapshots and fix it.",
  ],
  prerequisites: ["cs-references-mutability", "cs-call-stack-recursion"],
  subtopics: ["Stack vs heap", "Reachability and roots", "Mark and sweep", "Generational GC", "Leaks: caches, listeners, timers, closures", "WeakMap and WeakRef", "Heap snapshots"],
  strikeIds: [],

  story:
    "A Node server runs fine after a deploy, slows down over three days, then crashes with 'JavaScript heap out of memory'. Restarting 'fixes' it, so the team schedules nightly restarts, and the leak lives on for a year. The culprit: a Map used as a cache that only ever grew. JavaScript cleans up memory for you, but only memory nothing can reach any more.",
  mentalModel: {
    plain:
      "Small, short-lived values for a function call live on the stack and vanish when it returns. Objects, arrays and closures live on the heap. The garbage collector periodically finds every object reachable from the 'roots' (global variables, the current stack, active timers and listeners) and frees everything else. A leak is memory you no longer need that is still reachable.",
    analogy:
      "The heap is a huge warehouse; roots are the front doors. The cleaning crew walks from the doors along every rope (reference) and tags every box it can reach. Untagged boxes get thrown out. A leak is a box you forgot about but that is still tied by a rope to something near the door, like a cache that never lets go.",
    analogyLimit:
      "The real collector does not walk the whole warehouse every time: it checks the newest boxes most often (most objects die young) and the old ones rarely, which is why GC pauses are usually short.",
  },
  lessonSections: [
    {
      heading: "1. Stack and heap",
      body:
        "The stack holds call frames: parameters, local primitives and references. It is fast and cleaned automatically when each function returns.\n\nThe heap holds objects, arrays, strings and closures whose size or lifetime is not fixed. A local variable on the stack can hold a REFERENCE to a heap object; when the frame goes, the reference goes, but the object stays until nothing else refers to it.",
    },
    {
      heading: "2. Reachability: the only rule",
      body:
        "An object stays alive if it can be reached from a root by following references. Roots include global variables, every frame on the current call stack, and anything registered with the runtime: pending timers, event listeners, open sockets.\n\nYou never free memory by hand in JavaScript. You make objects unreachable (drop references), and the collector reclaims them.",
    },
    {
      heading: "3. Mark and sweep, generations",
      body:
        "Mark: start from the roots and mark every reachable object. Sweep: free every unmarked object. Cycles (A points to B, B points to A) are fine: if neither is reachable from a root, both are collected.\n\nV8 splits the heap into a young generation, collected often and quickly, and an old generation for objects that survived, collected less often. Most objects die young, so this is efficient.",
    },
    {
      heading: "4. The four classic leaks",
      body:
        "1. Unbounded caches and arrays: a Map or array that only grows (keyed by request id, user id...).\n2. Forgotten event listeners: added on every page view or component mount, never removed.\n3. Forgotten timers: setInterval callbacks keep everything they reference alive.\n4. Closures holding big data: a long-lived callback that captured a large object it does not need.",
    },
    {
      heading: "5. Fixes and tools",
      body:
        "Bound caches (LRU with a maximum size, or expiry), remove listeners and clear intervals when done (cleanup functions in React effects), and capture only what callbacks need.\n\nWeakMap and WeakSet hold keys weakly: if the key object is unreachable elsewhere, the entry disappears, which is ideal for attaching data to objects you do not own.\n\nTo find leaks, take heap snapshots in Chrome DevTools (or Node with --inspect) before and after a repeated action and compare which object counts keep growing.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "Garbage collection cannot be observed reliably from page code; the worked example shows the core idea instead (a bounded cache versus an unbounded one), and the project uses real heap measurements in Node.",
  codeExamples: [
    {
      title: "A leaky cache and a bounded one",
      language: "js",
      code: `const leaky = new Map();
function rememberForever(requestId, data) {
  leaky.set(requestId, data);          // every request ever seen stays reachable
}

class LruCache {
  constructor(max) { this.max = max; this.map = new Map(); }
  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    this.map.delete(key); this.map.set(key, value);   // move to "most recent"
    return value;
  }
  set(key, value) {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.max) this.map.delete(this.map.keys().next().value);  // drop oldest
  }
}

const lru = new LruCache(3);
for (let i = 1; i <= 1000; i++) {
  rememberForever(i, { payload: "x".repeat(100) });
  lru.set(i, { payload: "x".repeat(100) });
}
lru.get(998);
lru.set(1001, {});
console.log(leaky.size, lru.map.size, [...lru.map.keys()]);`,
      expectedOutput: `1000 3 [ 1000, 998, 1001 ]`,
      steps: [
        "The leaky Map keeps all 1000 entries: each stays reachable from a module-level variable, so the collector can never free them. In a server this grows forever.",
        "The LRU cache keeps at most 3. Map remembers insertion order, so the first key is always the least recently used, and it is deleted when the cache is full.",
        "After the loop the LRU holds 998, 999, 1000. Reading 998 moves it to the newest position.",
        "Adding 1001 evicts the oldest, 999. Evicted values become unreachable, so the garbage collector can free them.",
      ],
    },
  ],
  practicalApplication:
    "In React, every effect that adds a listener, subscription or interval must return a cleanup function. In Node servers, never store per-request data in module-level Maps without a size limit or expiry; use an LRU cache or an external store like Redis. Watch heap usage in production metrics: a sawtooth that keeps rising is a leak. When investigating, compare two heap snapshots taken after repeating the suspected action.",
  commonMistakes: [
    {
      mistake: "Adding an event listener every time a component mounts without removing it.",
      symptom: "Handlers fire multiple times and memory grows as the user navigates.",
      fix: "Return a cleanup that calls removeEventListener (or use an AbortController signal).",
    },
    {
      mistake: "Caching in a plain Map with no limit.",
      symptom: "Memory climbs steadily until the process crashes with heap out of memory.",
      fix: "Use an LRU cache with a maximum size, add expiry, or move the cache to Redis.",
    },
    {
      mistake: "Forgetting clearInterval.",
      symptom: "Work keeps running after the user left the page, and captured data never frees.",
      fix: "Keep the interval id and clear it in the cleanup or when the job finishes.",
    },
  ],
  misconceptions: [
    { myth: "Garbage collection means memory leaks are impossible.", truth: "GC only frees UNREACHABLE memory. Anything you accidentally keep a reference to stays alive forever." },
    { myth: "Setting a variable to null deletes the object.", truth: "It removes one reference. The object is freed only when no references remain, at a time the collector chooses." },
    { myth: "Circular references leak in JavaScript.", truth: "Mark and sweep collects cycles that are unreachable from roots. (Old reference-counting collectors had this problem.)" },
  ],
  exercises: [
    {
      kind: "predict",
      question: {
        id: "cs-memory-gc-p1",
        prompt: "After this runs, can the big array be garbage-collected?",
        code: `function setup() {
  const big = new Array(1_000_000).fill("data");
  const handler = () => console.log(big.length);
  document.addEventListener("click", handler);
}
setup();`,
        choices: ["Yes, setup has returned", "No: the listener is reachable from the document, and its closure keeps big alive", "Yes, closures are always collected", "Only after the first click"],
        answerIndex: 1,
        explanation: "The document (a root) holds the listener, the listener's closure holds big. Until removeEventListener is called, all of it stays reachable.",
        objective: 2,
      },
    },
    {
      kind: "debug",
      question: {
        id: "cs-memory-gc-d1",
        prompt: "A chat page gets slower each time you switch rooms, and messages print twice, then three times. Which line causes it?",
        code: `useEffect(() => {
  const socket = connect(roomId);
  socket.on("message", addMessage);                 // A
  const ping = setInterval(() => socket.ping(), 5000);  // B
}, [roomId]);                                        // C`,
        choices: [
          "Line A: listeners should use arrow functions",
          "The effect returns no cleanup, so old sockets, listeners and intervals are never removed",
          "Line C: roomId should not be a dependency",
          "setInterval should be setTimeout",
        ],
        answerIndex: 1,
        explanation: "Each room switch creates a new socket, listener and interval, but the old ones stay alive. Return () => { clearInterval(ping); socket.off(\"message\", addMessage); socket.close(); }.",
        objective: 2,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-memory-gc-k1",
      prompt: "When does the garbage collector free an object?",
      choices: ["When the function that created it returns", "When it is no longer reachable from any root", "When you set it to null", "After 60 seconds"],
      answerIndex: 1,
      explanation: "Reachability is the only rule. Returning or setting null only removes one path to it.",
      objective: 1,
    },
    {
      id: "cs-memory-gc-k2",
      prompt: "Where do objects and arrays live?",
      choices: ["On the stack", "On the heap", "In the CPU cache only", "On disk"],
      answerIndex: 1,
      explanation: "Objects live on the heap; variables on the stack hold references to them.",
      objective: 0,
    },
  ],
  project: {
    title: "Leak Hunt: build a leak, measure it, fix it",
    summary: "Write a small Node server with three deliberate leaks (cache, listener, interval), prove each with heap measurements, then fix each and prove the memory now stays flat.",
    type: "debugging-lab",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "A server with endpoints that each trigger one kind of leak.",
      "A load script that hits each endpoint 10,000 times and records process.memoryUsage().heapUsed after forced GC (node --expose-gc).",
      "Fixed versions: an LRU cache, removed listeners, cleared intervals.",
      "A README with before/after numbers and one heap-snapshot screenshot.",
    ],
    acceptanceCriteria: [
      "For each leak, the measurement shows heap growing in the leaky version and roughly flat in the fixed one.",
      "Unit tests cover the LRU cache (eviction order, max size).",
      "The README explains, for each leak, which root kept the memory reachable.",
    ],
    technologies: ["Node.js", "Chrome DevTools heap snapshots", "Vitest"],
    milestones: [
      { title: "Leaks", done_when: "Three leaky endpoints exist and the load script shows growth." },
      { title: "Measure", done_when: "Heap numbers after GC are recorded for each." },
      { title: "Fix", done_when: "Each leak is fixed and the numbers stay flat." },
      { title: "Explain", done_when: "README names the root for each leak." },
    ],
    testIdeas: ["LRU get refreshes recency", "Setting an existing key", "Max size of 1"],
    stretchGoals: ["Use WeakMap to attach metadata to request objects", "Add a /metrics endpoint exposing heap usage"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-memory-gc-a1",
        prompt: "Two objects reference each other, and nothing else references either. What happens?",
        choices: ["They leak forever", "Both are collected: they are unreachable from any root", "Only one is collected", "The program crashes"],
        answerIndex: 1,
        explanation: "Mark and sweep starts from roots; an isolated cycle is never marked, so both are swept.",
        objective: 1,
      },
      {
        id: "cs-memory-gc-a2",
        prompt: "Which of these is most likely a memory leak in a long-running server?",
        choices: [
          "A local array created inside a request handler",
          "A module-level Map that stores every user session forever",
          "A string returned from a function",
          "A for loop with 1 million iterations",
        ],
        answerIndex: 1,
        explanation: "Module-level variables are roots for the life of the process. A Map that only grows keeps everything reachable.",
        objective: 2,
      },
      {
        id: "cs-memory-gc-a3",
        prompt: "What is a WeakMap good for?",
        choices: [
          "Storing numbers faster",
          "Attaching data to objects without keeping those objects alive",
          "Encrypting values",
          "Replacing every Map",
        ],
        answerIndex: 1,
        explanation: "WeakMap keys are held weakly: when the key object becomes unreachable elsewhere, its entry can be collected.",
        objective: 3,
      },
      {
        id: "cs-memory-gc-a4",
        prompt: "How do you confirm a suspected memory leak in the browser?",
        choices: [
          "Restart the browser",
          "Take heap snapshots before and after repeating the action, and compare which objects keep growing",
          "Count the lines of code",
          "Disable garbage collection",
        ],
        answerIndex: 1,
        explanation: "Comparing snapshots shows exactly which object types accumulate and what is retaining them.",
        objective: 3,
      },
      {
        id: "cs-memory-gc-a5",
        prompt: "Inside a function, `const user = { name: \"Ada\" }`. Where do the variable and the object live?",
        choices: ["Both on the stack", "Both on the heap", "The variable (a reference) in the call's stack frame; the object on the heap", "Both in the CPU cache"],
        answerIndex: 2,
        explanation: "The frame holds the name and a reference. The object lives on the heap and survives the call if something else still references it.",
        objective: 0,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-memory-gc-q01", tags: ["gc"], difficulty: "core", kind: "concept",
      prompt: "How does garbage collection work in JavaScript?",
      expectedElements: ["reachability from roots", "mark and sweep", "cycles handled", "generational: young/old", "automatic, non-deterministic timing"],
      modelAnswer: "The engine periodically finds every object reachable from roots, such as globals, the current call stack, and active timers and listeners, by following references and marking them. Everything unmarked is swept and its memory reused. Unreachable cycles are collected too. V8 is generational: a young generation collected often and cheaply, because most objects die young, and an old generation collected less often. You cannot control exactly when it runs.",
      explanation: "Reachability and generations are the core.",
      commonWrongAnswers: ["Objects are freed when the function returns."],
    },
    {
      id: "cs-memory-gc-q02", tags: ["memory-leaks"], difficulty: "core", kind: "concept",
      prompt: "Name common causes of memory leaks in JavaScript applications.",
      expectedElements: ["unbounded caches/collections", "event listeners not removed", "timers not cleared", "closures capturing large objects", "detached DOM nodes"],
      modelAnswer: "Unbounded caches or arrays that only grow; event listeners added but never removed; setInterval or subscriptions never cleared; closures in long-lived callbacks that capture large objects they no longer need; and detached DOM nodes still referenced from JavaScript after being removed from the page.",
      explanation: "Five concrete causes is a strong answer.",
      commonWrongAnswers: ["Using too many variables."],
    },
    {
      id: "cs-memory-gc-q03", tags: ["memory", "stack-heap"], difficulty: "foundation", kind: "concept",
      prompt: "What is the difference between stack and heap memory?",
      expectedElements: ["stack: call frames, fast, automatic, LIFO", "heap: objects, dynamic size/lifetime", "GC manages heap", "stack size limited"],
      modelAnswer: "The stack stores call frames: arguments, local values and references, allocated and freed automatically in last-in-first-out order as functions are called and return; it is fast but small. The heap stores objects whose size or lifetime is not tied to one call, like arrays and closures; it is larger, managed by the garbage collector, and objects there live as long as they are reachable.",
      explanation: "Lifetime is the key difference.",
      commonWrongAnswers: ["Stack is for numbers, heap is for strings."],
    },
    {
      id: "cs-memory-gc-q04", tags: ["debugging", "memory"], difficulty: "core", kind: "scenario",
      prompt: "A Node service's memory climbs until it crashes every few days. How do you investigate?",
      expectedElements: ["confirm with metrics (heapUsed trend)", "reproduce under load", "heap snapshots and compare", "retainers path", "fix and verify flat"],
      modelAnswer: "First confirm it is a leak and not normal caching by graphing heap used over time: a steadily rising floor after GCs is a leak. Then reproduce it locally under load, take a heap snapshot, run more load, take another, and compare: the object types that keep growing, and their retainer path, show what holds them, often a module-level Map, listener or interval. I fix it, then rerun the load test to show the heap stays flat.",
      explanation: "A methodical process beats guessing.",
      commonWrongAnswers: ["Increase --max-old-space-size."],
    },
    {
      id: "cs-memory-gc-q05", tags: ["weakmap"], difficulty: "advanced", kind: "concept",
      prompt: "When would you use WeakMap instead of Map?",
      expectedElements: ["keys must be objects", "weakly held: entries vanish when key unreachable", "metadata for objects you don't own", "not iterable"],
      modelAnswer: "When I want to associate data with objects without extending their lifetime, such as caching computed results per DOM node or per request object. WeakMap keys must be objects and are held weakly, so when the key object becomes unreachable elsewhere, its entry is collected too. The trade-off is that you cannot iterate a WeakMap or ask its size.",
      explanation: "Non-iterability is a good detail.",
      commonWrongAnswers: ["WeakMap is a faster Map."],
    },
    {
      id: "cs-memory-gc-q06", tags: ["react", "memory"], difficulty: "core", kind: "debugging",
      prompt: "Why must a React effect that subscribes to something return a cleanup function?",
      expectedElements: ["effect runs on mount/dependency change", "subscription keeps component data reachable", "duplicates on re-run", "cleanup unsubscribes"],
      modelAnswer: "The effect runs on mount and again whenever its dependencies change. Each run adds a subscription, listener or interval that the runtime holds, and through its callback closure it keeps the component's data reachable. Without cleanup, old subscriptions pile up: handlers fire multiple times and memory grows. The cleanup function unsubscribes before the next run and on unmount.",
      explanation: "Connects GC to everyday frontend work.",
      commonWrongAnswers: ["React cleans everything up automatically."],
    },
    {
      id: "cs-memory-gc-q07", tags: ["gc", "performance"], difficulty: "advanced", kind: "concept",
      prompt: "What are GC pauses, and how can code reduce them?",
      expectedElements: ["collector pauses JS (stop-the-world, mostly incremental now)", "allocation rate drives GC work", "avoid churn in hot loops", "reuse objects carefully"],
      modelAnswer: "While parts of garbage collection run, JavaScript execution may be paused; modern engines do much of the work incrementally and in parallel, but pauses still exist. The amount of GC work grows with how fast you allocate, so code that creates many short-lived objects in hot paths, such as per-frame arrays in an animation loop, causes more frequent collections. Reducing allocation in hot paths, and measuring with the performance profiler, helps.",
      explanation: "Allocation rate is the lever developers control.",
      commonWrongAnswers: ["Call the garbage collector manually."],
    },
    {
      id: "cs-memory-gc-q08", tags: ["memory", "closures"], difficulty: "core", kind: "code-reading",
      prompt: "Does this leak? Why or why not?",
      code: `function makeLogger() {
  const history = [];
  return (msg) => { history.push(msg); console.log(msg); };
}
export const log = makeLogger();`,
      expectedElements: ["yes, history grows forever", "closure keeps history reachable", "exported module-level root", "cap the size"],
      modelAnswer: "Yes, in a long-running process. log is exported at module level, so it lives forever, and its closure keeps history reachable. Every message is pushed and never removed, so the array grows without bound. Capping history to the last N messages, or not storing them at all, fixes it.",
      explanation: "Closures plus module scope equals lifetime.",
      commonWrongAnswers: ["No, closures are garbage collected automatically."],
    },
  ],
  references: [
    { title: "MDN: Memory management", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management", kind: "official-docs" },
    { title: "V8 blog: Trash talk: the Orinoco garbage collector", url: "https://v8.dev/blog/trash-talk", kind: "article" },
    { title: "Chrome DevTools: Fix memory problems", url: "https://developer.chrome.com/docs/devtools/memory-problems", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Reachability-based collection and the classic leak patterns apply to Java, C#, Go and Python too."],
  versionSpecific: ["V8's collector internals (Orinoco, generation sizes) change between versions."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
