// Topic: The event loop, promises, microtasks and macrotasks. A COMPLETE topic.
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const feEventLoop: Topic = {
  id: "fe-event-loop",
  domainId: "",
  moduleId: "",
  title: "The event loop: microtasks, macrotasks and async/await",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Explain why JavaScript runs on one thread yet still handles many things 'at once'.",
    "Predict the output order of code mixing synchronous code, promises, queueMicrotask, await and setTimeout.",
    "Explain why a long synchronous task freezes the page and how to break it up.",
  ],
  prerequisites: ["cs-concurrency-async"],
  subtopics: ["Call stack", "Web APIs / Node APIs", "Task (macrotask) queue", "Microtask queue", "await as a microtask continuation", "Rendering opportunities", "Blocking the main thread"],
  strikeIds: ["l3-s04", "l3-s02", "l3-s03"],

  story:
    "A search box freezes for two seconds every time someone types, and the spinner you added never even appears. The spinner code runs. It just never gets a chance to paint, because a loop is holding the only thread. Understanding the event loop explains both the freeze and why the 'fix' of wrapping things in setTimeout sometimes works and sometimes makes it worse.",
  mentalModel: {
    plain:
      "JavaScript has one call stack that runs one thing at a time. Slow jobs (timers, network, file reads) are handed to the browser or Node, which put a callback in a queue when they finish. The event loop waits until the stack is empty, then runs ALL waiting microtasks (promise callbacks), then ONE task (like a timer callback), and repeats.",
    analogy:
      "A chef (the one thread) cooks one dish at a time. Waiters (Web APIs) take long jobs, like 'wait 5 minutes', and come back with order slips. Urgent slips from the chef's own sous-chef (microtasks: promise callbacks) are always handled before the chef looks at the next customer order slip (tasks: timers, clicks, network events).",
    analogyLimit:
      "Real kitchens have many chefs. JavaScript's main thread does not; Web Workers are separate kitchens that cannot touch the same pans (no shared DOM). And the browser may paint the screen between tasks, which has no kitchen equivalent.",
  },
  lessonSections: [
    {
      heading: "1. One stack, one thing at a time",
      body:
        "When a function is called, a frame is pushed on the call stack; when it returns, the frame is popped. While anything is on the stack, nothing else in JavaScript runs: not clicks, not timers, not promise callbacks.",
    },
    {
      heading: "2. Slow work is handed off",
      body:
        "`setTimeout`, `fetch`, and file reads are not run by the JavaScript engine itself. The environment (browser or Node) does the waiting, and when the work is done it queues your callback. That is how one thread can have many requests in flight.",
    },
    {
      heading: "3. Two queues with different priority",
      body:
        "Tasks (often called macrotasks): timer callbacks, UI events, message events, network callbacks.\nMicrotasks: `.then/.catch/.finally` callbacks, `queueMicrotask`, and the code after an `await`.\n\nAfter each task, the loop drains the ENTIRE microtask queue, including microtasks added while draining, before taking the next task.",
    },
    {
      heading: "4. await is 'pause here, continue as a microtask'",
      body:
        "Code before the first `await` in an async function runs synchronously, right away. At `await`, the function pauses and returns a promise to its caller. When the awaited value settles, the rest of the function is scheduled as a microtask.",
    },
    {
      heading: "5. Where rendering fits",
      body:
        "In browsers, the screen can only update between tasks, after microtasks finish. A long synchronous loop, or an endless chain of microtasks, blocks rendering and input, so the page freezes.\n\nTo stay responsive: break work into chunks that yield back to the loop (for example `await new Promise(r => setTimeout(r))` between chunks), or move heavy computation to a Web Worker.",
    },
    {
      heading: "6. setTimeout(fn, 0) is not 'now'",
      body:
        "A zero delay means 'as a new task, after the current task and all its microtasks, and after any tasks already waiting'. Browsers also clamp nested timers to a minimum of about 4 ms after several levels of nesting.",
    },
  ],
  visualizationType: "event-loop",
  codeExamples: [
    {
      title: "The classic ordering puzzle",
      language: "js",
      code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
queueMicrotask(() => console.log("D"));
(async () => {
  console.log("E");
  await null;
  console.log("F");
})();
console.log("G");`,
      expectedOutput: `A
E
G
C
D
F
B`,
      steps: [
        "A prints: plain synchronous code.",
        "setTimeout hands a timer to the environment; its callback B will become a TASK.",
        "Promise.resolve().then queues C as a MICROTASK. queueMicrotask queues D right after it.",
        "The async function starts synchronously and prints E, then hits await: the rest (F) is queued as a microtask after D.",
        "G prints. The stack is now empty.",
        "The loop drains microtasks in order: C, D, F.",
        "Only then does it take the next task: B.",
      ],
    },
  ],
  practicalApplication:
    "When a UI freezes, record a Performance profile in DevTools and look for long tasks (over 50 ms) on the main thread. Split the work into chunks that yield, debounce input handlers, or move CPU-heavy work (parsing, image processing, big sorts) into a Web Worker, which is exactly how this app runs your exercise code safely.",
  commonMistakes: [
    { mistake: "Expecting `setTimeout(fn, 0)` to run before a resolved promise's `.then`.", symptom: "Logs appear in an unexpected order; state is read before it is updated.", fix: "Remember: all microtasks run before the next task." },
    { mistake: "Using `forEach` with an async callback and expecting it to wait.", symptom: "The code after the loop runs before the work finishes.", fix: "Use `for...of` with await (sequential) or `await Promise.all(items.map(...))` (parallel)." },
    { mistake: "Forgetting to await a promise inside try/catch.", symptom: "Errors escape the catch and show as 'Unhandled promise rejection'.", fix: "`return await` or `await` inside try, so the rejection is thrown where the catch can see it." },
  ],
  misconceptions: [
    { myth: "async functions run in a background thread.", truth: "They run on the same single thread. await only lets other work run while waiting." },
    { myth: "Promises make CPU-heavy code non-blocking.", truth: "A promise around a heavy loop still runs the loop on the main thread. Only Workers move CPU work off it." },
    { myth: "setTimeout(fn, 1000) runs after exactly one second.", truth: "It runs no EARLIER than one second, and later if the thread is busy." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l3-s04", why: "Write code whose tests check the exact order of microtasks and tasks." },
    { kind: "strike", strikeId: "l3-s03", why: "Convert promise chains to async/await and handle errors correctly." },
    { kind: "lab", lab: "event-loop", task: "Step through the ordering puzzle in the event-loop explorer, one event at a time.", goal: "Predict each next printed letter before you press Step, and get all 7 right in one run." },
    {
      kind: "predict",
      question: {
        id: "fe-event-loop-p1",
        prompt: "What does this print?",
        code: `setTimeout(() => console.log(1));
Promise.resolve().then(() => {
  console.log(2);
  setTimeout(() => console.log(3));
  Promise.resolve().then(() => console.log(4));
});
console.log(5);`,
        choices: ["5 2 4 1 3", "5 1 2 4 3", "2 4 5 1 3", "5 2 1 4 3"],
        answerIndex: 0,
        explanation: "5 is synchronous. Then microtasks drain: 2 prints, and it queues a new microtask (4), which runs in the SAME drain, before any task. Then tasks in order: the timer for 1 was queued first, then 3.",
        objective: 1,
      },
    },
  ],
  knowledgeChecks: [
    { id: "fe-event-loop-k1", prompt: "When does the event loop run the microtask queue?", choices: ["Once per second", "After the current task finishes, completely, before the next task", "Only when the queue has 10 items", "Before any synchronous code"], answerIndex: 1, explanation: "Microtasks are drained fully after the stack empties, before the loop picks the next task.", objective: 1 },
    { id: "fe-event-loop-k2", prompt: "A loop that takes 3 seconds runs on a button click. What happens to a spinner shown at the start of the click handler?", choices: ["It spins smoothly", "It does not appear until the loop finishes, because the page cannot paint while the stack is busy", "It appears in a Web Worker", "It speeds the loop up"], answerIndex: 1, explanation: "Rendering happens between tasks. The click handler's task occupies the thread for 3 seconds.", objective: 2 },
  ],
  project: {
    title: "Event Loop Explorer",
    summary: "An interactive page where you type a small snippet using console.log, setTimeout, promises and await, and see the call stack, microtask queue and task queue animate step by step, with the real output checked against your prediction.",
    type: "application",
    objectivesCovered: [0, 1, 2],
    requirements: [
      "Support a limited, documented instruction set (log, setTimeout, Promise.then, queueMicrotask, await) parsed from simple text, not eval of arbitrary code.",
      "Animate stack, microtask queue and task queue as separate columns.",
      "Let the user enter their predicted output first, then compare with the simulated result.",
      "Include a 'freeze demo' that shows a long task blocking a CSS animation, and a chunked version that keeps it smooth.",
    ],
    acceptanceCriteria: [
      "Unit tests prove the simulator produces A E G C D F B for the classic puzzle.",
      "Unit tests prove nested microtasks run before earlier-queued timers.",
      "The simulator's output matches real Node output for at least 5 test snippets (checked by a test that runs both).",
      "All controls work by keyboard and the queues are announced to screen readers via text, not only animation.",
    ],
    technologies: ["TypeScript", "React", "Vitest"],
    milestones: [
      { title: "Simulator core", done_when: "A pure function steps a program through stack/queues and passes ordering tests." },
      { title: "Visualisation", done_when: "Columns animate per step, with reduced-motion support." },
      { title: "Prediction mode", done_when: "The user predicts first, then sees a diff." },
      { title: "Freeze demo", done_when: "Blocking vs chunked versions are shown side by side." },
    ],
    testIdeas: ["Empty program", "Only timers", "Microtask scheduling a microtask", "await inside a loop"],
    stretchGoals: ["Model requestAnimationFrame callbacks and show where rendering happens."],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      { id: "fe-event-loop-a1", prompt: "How can single-threaded JavaScript handle 100 network requests concurrently?", choices: ["It secretly starts 100 threads", "The environment does the waiting and queues callbacks; the one thread only runs short callbacks", "It runs them one after another very fast", "It cannot"], answerIndex: 1, explanation: "Concurrency without parallelism: waiting happens outside the JS thread; JS just reacts to completions.", objective: 0 },
      { id: "fe-event-loop-a2", prompt: "What prints?", code: `setTimeout(() => console.log("t"));\nawait Promise.resolve();\nconsole.log("m");`, choices: ["t m", "m t", "only m", "only t"], answerIndex: 1, explanation: "In a module with top-level await, the code after await resumes as a microtask, before the timer task.", objective: 1 },
      { id: "fe-event-loop-a3", prompt: "What prints?", code: `console.log(1);\nqueueMicrotask(() => console.log(2));\nconsole.log(3);`, choices: ["1 2 3", "1 3 2", "2 1 3", "3 1 2"], answerIndex: 1, explanation: "Synchronous code first (1, 3), then the microtask (2).", objective: 1 },
      { id: "fe-event-loop-a4", prompt: "Which change keeps a page responsive while processing 1,000,000 rows?", choices: ["Wrap the loop in a Promise", "Make the function async", "Process in chunks that yield to the event loop, or use a Web Worker", "Use setTimeout(fn, 0) once before the loop"], answerIndex: 2, explanation: "Only yielding between chunks or moving to another thread frees the main thread. Wrapping in a promise or async changes nothing about a synchronous loop.", objective: 2 },
      { id: "fe-event-loop-a5", prompt: "Why might an infinite chain of microtasks be worse than an infinite chain of setTimeouts?", choices: ["It is not; they are identical", "Microtasks drain completely before the next task or render, so the page never gets to paint or handle input", "Timers use more memory", "Microtasks are slower"], answerIndex: 1, explanation: "Recursive setTimeout yields between tasks, so rendering and input can still happen; microtasks never yield.", objective: 2 },
    ],
  },
  interviewQuestions: [
    { id: "fe-event-loop-q01", tags: ["event-loop", "javascript"], difficulty: "core", kind: "concept", prompt: "Explain the JavaScript event loop.", expectedElements: ["single call stack", "environment APIs do waiting", "task queue", "microtask queue drained fully after each task", "rendering between tasks"], modelAnswer: "JavaScript runs on one call stack. Asynchronous work such as timers, I/O and events is handled by the environment, which queues callbacks when it finishes. When the stack is empty, the loop runs every pending microtask (promise reactions, queueMicrotask, await continuations), then takes one task from the task queue, then repeats. In browsers, rendering can happen between tasks, after the microtasks have drained.", explanation: "Mentioning microtask priority and rendering separates strong answers.", commonWrongAnswers: ["It runs callbacks in parallel threads."], followUps: ["Where does requestAnimationFrame fit?", "How does Node's loop differ?"] },
    { id: "fe-event-loop-q02", tags: ["event-loop", "promises"], difficulty: "core", kind: "code-reading", prompt: "Predict the output and explain.", code: `console.log('start');\nsetTimeout(() => console.log('timeout'), 0);\nPromise.resolve().then(() => console.log('promise'));\nconsole.log('end');`, expectedElements: ["start end promise timeout", "microtask before task"], modelAnswer: "start, end, promise, timeout. The synchronous logs run first. The promise reaction is a microtask, drained as soon as the stack empties. The timeout callback is a task, which runs next.", explanation: "The most common event loop interview question.", commonWrongAnswers: ["start timeout promise end"] },
    { id: "fe-event-loop-q03", tags: ["async", "await"], difficulty: "core", kind: "concept", prompt: "What does `await` actually do?", expectedElements: ["pauses the async function", "returns control to caller", "continuation scheduled as microtask when settled", "does not block the thread"], modelAnswer: "await pauses only the current async function and returns control to its caller, so the thread is free. When the awaited promise settles, the rest of the function is scheduled as a microtask. If it rejects, the rejection is thrown at the await, so try/catch works.", explanation: "Key point: nothing is blocked; the function is split into pieces.", commonWrongAnswers: ["It blocks the thread until the promise finishes."] },
    { id: "fe-event-loop-q04", tags: ["performance", "main-thread"], difficulty: "core", kind: "scenario", prompt: "A dashboard freezes for 2 seconds when filtering 200k rows. How do you fix it?", expectedElements: ["identify long task with profiler", "reduce work (memoize, index, paginate)", "chunk and yield", "Web Worker", "virtualise rendering"], modelAnswer: "First I would profile to confirm a long task, and whether it is the filtering or the rendering. Then reduce the work: pre-index or memoize, and render only the visible rows with virtualisation. If the computation is still heavy, move it to a Web Worker, or process in chunks that yield to the event loop so input and paint can happen between them.", explanation: "Shows both measurement and the right tool for each cause.", commonWrongAnswers: ["Make the filter function async."] },
    { id: "fe-event-loop-q05", tags: ["async", "debugging"], difficulty: "foundation", kind: "debugging", prompt: "Why does this log 0?", code: `let total = 0;\n[1,2,3].forEach(async (n) => { total += await getPrice(n); });\nconsole.log(total);`, expectedElements: ["forEach ignores returned promises", "log runs synchronously before awaits resume", "use for...of or Promise.all"], modelAnswer: "forEach does not wait for the promises its async callback returns. Each callback pauses at await, so console.log runs immediately while total is still 0. Use `for (const n of items) total += await getPrice(n)` for sequential work, or `(await Promise.all(items.map(getPrice))).reduce(...)` for parallel work.", explanation: "Very common real bug.", commonWrongAnswers: ["getPrice returns 0."] },
    { id: "fe-event-loop-q06", tags: ["promises"], difficulty: "core", kind: "concept", prompt: "Compare Promise.all, Promise.allSettled, Promise.race and Promise.any.", expectedElements: ["all rejects on first rejection", "allSettled waits for every outcome", "race settles with first settled", "any fulfils with first fulfilment / AggregateError"], modelAnswer: "Promise.all fulfils with every value, or rejects as soon as one rejects. allSettled waits for every promise and reports each status. race settles with whichever promise settles first, success or failure, which makes it useful for timeouts. any fulfils with the first success and rejects with an AggregateError only if all of them fail.", explanation: "Choose based on whether partial failure is acceptable.", commonWrongAnswers: ["They are the same except for naming."] },
    { id: "fe-event-loop-q07", tags: ["node", "event-loop"], difficulty: "advanced", kind: "concept", prompt: "In Node.js, where do process.nextTick and setImmediate run relative to promises and timers?", expectedElements: ["nextTick queue before promise microtasks", "setImmediate in check phase after I/O poll", "timers phase", "phases"], modelAnswer: "Node's loop has phases: timers, pending callbacks, poll for I/O, check for setImmediate, and close callbacks. After each callback, Node runs the process.nextTick queue first, then promise microtasks. setImmediate runs in the check phase, so inside an I/O callback it always runs before a setTimeout(0). In the main module, the order of those two is not guaranteed.", explanation: "Node-specific; good for backend roles.", commonWrongAnswers: ["setImmediate runs immediately, before everything."] },
    { id: "fe-event-loop-q08", tags: ["misconception"], difficulty: "foundation", kind: "misconception", prompt: "True or false: 'Wrapping a slow function in a Promise makes it non-blocking.'", expectedElements: ["false", "executor runs synchronously", "CPU work still on main thread"], modelAnswer: "False. The Promise executor runs synchronously, right away, on the main thread, so a slow loop inside it still blocks. Promises help coordinate waiting; they do not move CPU work off the thread. A Web Worker or worker_threads does that.", explanation: "Distinguishes I/O-bound from CPU-bound work.", commonWrongAnswers: ["True."] },
    { id: "fe-event-loop-q09", tags: ["async", "errors"], difficulty: "core", kind: "debugging", prompt: "An error inside an async function is not caught by the surrounding try/catch. Why?", code: `try {\n  saveUser(data); // async function\n} catch (e) {\n  showError(e);\n}`, expectedElements: ["not awaited", "rejection happens later", "await or .catch"], modelAnswer: "saveUser returns a promise, and the rejection happens later, after the try block has already finished. Without await, the catch never sees it. Use `await saveUser(data)` inside an async function, or attach `.catch(showError)`.", explanation: "Also why unhandled rejections show up in logs.", commonWrongAnswers: ["try/catch does not work with async code at all."] },
    { id: "fe-event-loop-q10", tags: ["implementation"], difficulty: "core", kind: "implementation", prompt: "How would you implement a `sleep(ms)` helper and a timeout wrapper for a promise?", expectedElements: ["new Promise with setTimeout resolve", "Promise.race with a rejecting timer", "clear the timer to avoid leaks"], modelAnswer: "sleep: `const sleep = ms => new Promise(r => setTimeout(r, ms))`. For a timeout, race the work against a promise that rejects after ms, and clear the timer when the work finishes so it does not keep the process alive: `let id; const t = new Promise((_, rej) => { id = setTimeout(() => rej(new Error('timeout')), ms); }); return Promise.race([work, t]).finally(() => clearTimeout(id));`. Note that racing does not cancel the underlying work; AbortController does that for fetch.", explanation: "Mentioning that race does not cancel shows depth.", commonWrongAnswers: ["Use a while loop that checks Date.now()."] },
  ],
  references: [
    { title: "HTML Standard: Event loops", url: "https://html.spec.whatwg.org/multipage/webappapis.html#event-loops", kind: "spec" },
    { title: "MDN: Using microtasks in JavaScript with queueMicrotask()", url: "https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide", kind: "official-docs" },
    { title: "Node.js: The Node.js Event Loop", url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Single-threaded run-to-completion, the microtask vs task distinction, and blocking the main thread."],
  versionSpecific: ["Exact timer clamping rules and scheduling APIs such as scheduler.postTask() and scheduler.yield() vary by browser and version."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
