// Topic: Concurrency and asynchronous execution. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csConcurrencyAsync: Topic = {
  id: "cs-concurrency-async",
  domainId: "",
  moduleId: "",
  title: "Concurrency and asynchronous execution",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Distinguish concurrency from parallelism.",
    "Explain why JavaScript uses an event loop instead of threads for I/O.",
    "Write asynchronous code with promises and async/await, running independent work concurrently.",
    "Recognise race conditions and stale results, and prevent them.",
  ],
  prerequisites: ["cs-call-stack-recursion"],
  subtopics: ["Concurrency vs parallelism", "Blocking vs non-blocking I/O", "Callbacks, promises, async/await", "Promise.all, allSettled, race", "Sequential vs concurrent awaits", "Race conditions", "Cancellation with AbortController"],
  strikeIds: ["l3-s01", "l3-s02", "l3-s03"],

  story:
    "A dashboard loads five widgets, each needing a 300 ms API call. It takes 1.5 seconds, because each call waits for the previous one to finish, although none of them depend on each other. On another page, typing fast in a search box sometimes shows results for an OLD query, because a slow early response arrives after a fast later one. Both are concurrency bugs, and both are fixed with a few lines once you can picture what is waiting for what.",
  mentalModel: {
    plain:
      "Concurrency is dealing with many tasks at once by interleaving them; parallelism is literally doing many at the same instant on several cores. JavaScript runs your code on one thread, but while it waits for I/O (network, disk, timers) it does not sit idle: it starts the I/O, moves on, and runs a callback when the result is ready. A promise is a placeholder for a result that will arrive later; await pauses only the current async function, not the whole program.",
    analogy:
      "One waiter in a restaurant. A blocking waiter takes an order, stands at the kitchen until the food is ready, then serves the next table. A non-blocking waiter (the event loop) takes order after order, and serves each dish when the kitchen rings the bell. One person, many tables in progress: concurrency. Hiring more waiters is parallelism.",
    analogyLimit:
      "If the waiter has to do a long job personally (heavy CPU work, like resizing a big image), every table waits. The event loop helps only with WAITING, not with computing.",
  },
  lessonSections: [
    {
      heading: "1. Concurrency is not parallelism",
      body:
        "Concurrent: several tasks are in progress during the same period, taking turns. Parallel: several tasks run at exactly the same moment on different cores.\n\nA web server handling 1,000 open connections on one thread is concurrent. A video encoder using 8 cores is parallel. Most web work is waiting, so concurrency gives most of the benefit.",
    },
    {
      heading: "2. Why one thread is enough for I/O",
      body:
        "A network call takes milliseconds; the CPU can do millions of operations in that time. Instead of a thread per request, each sleeping while it waits, Node and browsers hand the waiting to the operating system and keep one thread busy with whatever is ready.\n\nThe rule that follows: never block the thread. A long synchronous loop or readFileSync on a busy server freezes every request.",
    },
    {
      heading: "3. Promises and async/await",
      body:
        "A promise is pending, then fulfilled with a value or rejected with an error. `.then` and `.catch` run later, when it settles.\n\n`async` functions always return a promise. Inside them, `await p` pauses that function until p settles, then continues with its value (or throws its error, so try / catch works). Other code keeps running meanwhile.",
    },
    {
      heading: "4. Sequential versus concurrent awaits",
      body:
        "`const a = await getA(); const b = await getB();` waits for A before even starting B: the times add up.\n\nIf they are independent, start both first: `const [a, b] = await Promise.all([getA(), getB()]);`. The total is the slowest one, not the sum.\n\n`Promise.all` rejects as soon as one fails; `Promise.allSettled` waits for all and reports each result; `Promise.race` settles with the first to finish, handy for timeouts.",
    },
    {
      heading: "5. Race conditions",
      body:
        "A race condition is a bug that depends on timing. In JavaScript the usual forms are:\n\nStale responses: an older, slower request finishes after a newer one and overwrites the screen. Fix: cancel the old one (AbortController) or ignore results whose request id is not the latest.\n\nCheck-then-act across an await: you check a balance, await something, then write; another request changed it meanwhile. Fix: do the check and the update together (a database transaction or a single atomic update).",
    },
  ],
  visualizationType: "none",
  visualNote:
    "The step-by-step event loop lab lives in the Frontend event loop topic; here the worked example measures real timings, sequential versus concurrent, so you see the difference in numbers.",
  codeExamples: [
    {
      title: "Sequential versus concurrent, measured",
      language: "js",
      code: `const wait = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

async function sequential() {
  const a = await wait(100, "A");
  const b = await wait(100, "B");
  return a + b;
}

async function concurrent() {
  const [a, b] = await Promise.all([wait(100, "A"), wait(100, "B")]);
  return a + b;
}

async function main() {
  let start = Date.now();
  const s = await sequential();
  const tSeq = Date.now() - start;
  start = Date.now();
  const c = await concurrent();
  const tCon = Date.now() - start;
  console.log(s, tSeq >= 190 ? "about 200 ms" : tSeq);
  console.log(c, tCon < 150 ? "about 100 ms" : tCon);
}

console.log("before main");
main();
console.log("after main (main is still waiting)");`,
      expectedOutput: `before main
after main (main is still waiting)
AB about 200 ms
AB about 100 ms`,
      steps: [
        "\"before main\" prints, then main starts. Its first await pauses main and hands control back, so \"after main\" prints immediately: await never blocks the whole program.",
        "sequential waits 100 ms for A, and only then starts B and waits another 100 ms: about 200 ms in total.",
        "concurrent starts both timers at once and waits for both with Promise.all: about 100 ms, the time of the slowest one.",
        "Both return \"AB\". Same result, half the time, because the two tasks did not depend on each other.",
      ],
    },
  ],
  practicalApplication:
    "Start independent requests together with Promise.all (pages, dashboards, server handlers fetching from several services), but keep concurrency bounded for large batches (process 1,000 uploads 10 at a time) to avoid overloading services. Cancel stale requests in search boxes with AbortController. Keep CPU-heavy work off the main thread with Web Workers or Node worker threads. In databases, use transactions or atomic updates instead of read-then-write across awaits.",
  commonMistakes: [
    {
      mistake: "Awaiting independent calls one after another.",
      symptom: "Pages are slow; the total time equals the sum of every call.",
      fix: "Start them together and await Promise.all.",
    },
    {
      mistake: "Using forEach with an async callback.",
      symptom: "Code after the loop runs before the work finishes, and errors are unhandled.",
      fix: "Use for...of with await for sequential work, or Promise.all(items.map(async ...)) for concurrent work.",
    },
    {
      mistake: "Letting old requests overwrite new results.",
      symptom: "Search results flicker or show answers for an earlier query.",
      fix: "Abort the previous request, or check the result belongs to the latest query before using it.",
    },
    {
      mistake: "Blocking the event loop with CPU work.",
      symptom: "The whole server stops responding while one request computes.",
      fix: "Move heavy computation to a worker thread or a background job.",
    },
  ],
  misconceptions: [
    { myth: "async/await makes code run in parallel.", truth: "It makes waiting non-blocking. Your JavaScript still runs on one thread; only the I/O happens in the background." },
    { myth: "Single-threaded means no race conditions.", truth: "Interleaving at every await allows logical races: stale responses and check-then-act bugs." },
    { myth: "Promise.all runs the functions; listing them is what starts them.", truth: "Promises start when you CALL the function that creates them. Promise.all just waits for promises that are already running." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l3-s01", why: "Write promises by hand and watch when each callback runs." },
    { kind: "strike", strikeId: "l3-s02", why: "Turn callback and promise code into async/await, with error handling." },
    { kind: "strike", strikeId: "l3-s03", why: "Run independent work concurrently and measure the difference." },
    {
      kind: "predict",
      question: {
        id: "cs-concurrency-async-p1",
        prompt: "In what order do the letters print?",
        code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`,
        choices: ["A B C D", "A D C B", "A D B C", "A C D B"],
        answerIndex: 1,
        explanation: "Synchronous code runs first: A, D. Then the microtask queue (promise callbacks) runs: C. Then the timer task: B, even with a 0 ms delay.",
        objective: 1,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-concurrency-async-k1",
      prompt: "Three independent API calls take 200, 300 and 500 ms. Roughly how long does Promise.all on all three take?",
      choices: ["200 ms", "500 ms", "1000 ms", "It depends on the order"],
      answerIndex: 1,
      explanation: "They run concurrently, so you wait for the slowest one: about 500 ms.",
      objective: 2,
    },
    {
      id: "cs-concurrency-async-k2",
      prompt: "Which is parallelism rather than just concurrency?",
      choices: ["One thread handling 1,000 open sockets", "8 worker threads compressing images on 8 cores at once", "A promise chain", "await inside a loop"],
      answerIndex: 1,
      explanation: "Parallelism means work happening at the same instant on several cores.",
      objective: 0,
    },
  ],
  project: {
    title: "Batch Fetcher: concurrency with limits, retries and cancellation",
    summary: "Build a utility that fetches many URLs with a maximum number in flight, retries failures with backoff, supports cancellation, and reports per-item results, the way real background jobs need it.",
    type: "implementation",
    objectivesCovered: [0, 2, 3],
    requirements: [
      "fetchAll(urls, { concurrency, retries, signal }) returns results in input order.",
      "Never more than `concurrency` requests in flight at once.",
      "Failed requests retry with exponential backoff, up to `retries` times.",
      "An AbortSignal cancels all remaining work immediately.",
    ],
    acceptanceCriteria: [
      "A test with a fake fetch proves the in-flight count never exceeds the limit.",
      "A test shows results keep input order even when later items finish first.",
      "A test shows abort stops new requests and rejects with an AbortError.",
      "A test with fake timers checks the backoff delays.",
    ],
    technologies: ["TypeScript", "Vitest (fake timers)", "AbortController"],
    milestones: [
      { title: "Limited pool", done_when: "Concurrency limit works and is tested." },
      { title: "Order", done_when: "Results come back in input order." },
      { title: "Retries", done_when: "Backoff retries are tested with fake timers." },
      { title: "Cancel", done_when: "Abort stops everything cleanly." },
    ],
    testIdeas: ["Empty list", "Concurrency larger than the list", "All requests failing"],
    stretchGoals: ["Report progress events", "Add a per-request timeout with Promise.race"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-concurrency-async-a1",
        prompt: "What does `await` pause?",
        choices: ["The whole program", "Only the async function it is in", "All other promises", "The browser"],
        answerIndex: 1,
        explanation: "await suspends just that function. The event loop keeps running other code meanwhile.",
        objective: 2,
      },
      {
        id: "cs-concurrency-async-a2",
        prompt: "Why does a CPU-heavy loop in a Node request handler hurt every other user?",
        choices: [
          "Node runs each request in its own process",
          "JavaScript runs on one main thread, so while the loop runs, nothing else can",
          "Loops are slower in Node",
          "It uses too much memory",
        ],
        answerIndex: 1,
        explanation: "The event loop cannot pick up other work until the current synchronous code finishes.",
        objective: 1,
      },
      {
        id: "cs-concurrency-async-a3",
        prompt: "How long does this take, roughly?",
        code: `const a = await fetchUser();    // 300 ms
const b = await fetchOrders();  // 300 ms (does not need a)`,
        choices: ["300 ms", "600 ms", "0 ms", "150 ms"],
        answerIndex: 1,
        explanation: "The second request only starts after the first finishes. Starting both and awaiting Promise.all would take about 300 ms.",
        objective: 2,
      },
      {
        id: "cs-concurrency-async-a4",
        prompt: "A search box shows results for 'ca' after you finished typing 'cat'. What is the bug?",
        choices: [
          "The server is wrong",
          "A stale response race: the 'ca' request finished after the 'cat' one and overwrote it",
          "JavaScript is single-threaded",
          "The input is not debounced, so it cannot work",
        ],
        answerIndex: 1,
        explanation: "Responses can arrive out of order. Abort earlier requests or ignore any response that is not for the latest query.",
        objective: 3,
      },
      {
        id: "cs-concurrency-async-a5",
        prompt: "A Node server handles 5,000 open connections on one thread. Is that concurrency, parallelism, or both?",
        choices: ["Parallelism only", "Concurrency: many tasks in progress, interleaved on one thread", "Both", "Neither"],
        answerIndex: 1,
        explanation: "One thread takes turns between connections while they wait on I/O: concurrent, not parallel. Parallelism needs several cores running at the same instant.",
        objective: 0,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-concurrency-async-q01", tags: ["concurrency"], difficulty: "foundation", kind: "concept",
      prompt: "What is the difference between concurrency and parallelism?",
      expectedElements: ["concurrency: multiple tasks in progress, interleaved", "parallelism: simultaneous execution on multiple cores", "example of each", "JS event loop is concurrent"],
      modelAnswer: "Concurrency is structuring a program so several tasks make progress during the same period, by interleaving them; parallelism is actually executing several things at the same instant on multiple cores. A Node server handling thousands of connections on one thread is concurrent; a video encoder using all cores is parallel. You can have concurrency without parallelism.",
      explanation: "Rob Pike's framing: dealing with many things versus doing many things.",
      commonWrongAnswers: ["They are the same."],
    },
    {
      id: "cs-concurrency-async-q02", tags: ["event-loop", "node"], difficulty: "core", kind: "concept",
      prompt: "How can Node.js handle many connections with a single thread?",
      expectedElements: ["non-blocking I/O delegated to OS/libuv", "event loop runs callbacks when ready", "thread does not wait", "CPU-bound work is the weakness"],
      modelAnswer: "Node never makes its main thread wait for I/O. It hands network and file operations to the operating system or libuv's thread pool, keeps running other JavaScript, and when an operation completes, its callback is queued and run by the event loop. Since web servers spend most of their time waiting, one thread can juggle thousands of connections. The weakness is CPU-heavy work, which blocks everything and belongs in worker threads.",
      explanation: "Naming the weakness shows real understanding.",
      commonWrongAnswers: ["Node creates a thread for every request."],
    },
    {
      id: "cs-concurrency-async-q03", tags: ["promises"], difficulty: "core", kind: "concept",
      prompt: "Compare Promise.all, Promise.allSettled, Promise.race and Promise.any.",
      expectedElements: ["all: all fulfil or first rejection", "allSettled: every outcome", "race: first to settle", "any: first to fulfil", "use cases"],
      modelAnswer: "Promise.all fulfils with every result in order, or rejects as soon as one rejects: good when you need everything. allSettled waits for all and gives each status and value or reason: good for batches where partial failure is fine. race settles with whichever settles first, fulfil or reject: good for timeouts. any fulfils with the first success and only rejects if all fail: good for trying redundant sources.",
      explanation: "One use case per method is ideal.",
      commonWrongAnswers: ["They all wait for every promise."],
    },
    {
      id: "cs-concurrency-async-q04", tags: ["async", "debugging"], difficulty: "core", kind: "debugging",
      prompt: "Why does this log 'done' before the files are saved?",
      code: `files.forEach(async (f) => { await save(f); });
console.log("done");`,
      expectedElements: ["forEach ignores returned promises", "callbacks start, nothing awaited", "use for...of with await or Promise.all(map)"],
      modelAnswer: "forEach calls the async callback for each file but ignores the promises they return, so nothing waits for them and 'done' logs immediately; rejections also go unhandled. For one at a time use a for...of loop with await inside; for all at once use await Promise.all(files.map((f) => save(f))).",
      explanation: "Extremely common real-world bug.",
      commonWrongAnswers: ["save is too slow."],
    },
    {
      id: "cs-concurrency-async-q05", tags: ["race-conditions"], difficulty: "advanced", kind: "scenario",
      prompt: "Two requests try to buy the last ticket at the same time. Both succeed. Explain and fix.",
      expectedElements: ["check-then-act race", "both read stock=1 before either writes", "atomic update / transaction / row lock", "unique constraint"],
      modelAnswer: "It is a check-then-act race: both requests read 'one ticket left', both pass the check, and both write a sale. The fix is to make check and update one atomic step in the database, for example UPDATE tickets SET sold = sold + 1 WHERE id = ? AND sold < capacity and check that one row changed, or a transaction with a row lock (SELECT ... FOR UPDATE). A unique constraint on seat assignments is a good safety net.",
      explanation: "This is a favourite system-design-flavoured question.",
      commonWrongAnswers: ["Node is single-threaded so this cannot happen."],
    },
    {
      id: "cs-concurrency-async-q06", tags: ["cancellation"], difficulty: "core", kind: "implementation",
      prompt: "How would you cancel an in-flight fetch when the user types a new search query?",
      expectedElements: ["AbortController per request", "abort previous on new input", "handle AbortError", "or ignore stale by id", "debounce"],
      modelAnswer: "Keep the AbortController of the current request. When a new query arrives, call abort() on the previous controller, create a new one and pass its signal to fetch. The aborted fetch rejects with an AbortError, which I ignore rather than show. Combined with a short debounce, this avoids both wasted requests and stale results overwriting new ones.",
      explanation: "Abort plus debounce is the complete answer.",
      commonWrongAnswers: ["You cannot cancel a fetch."],
    },
    {
      id: "cs-concurrency-async-q07", tags: ["concurrency", "limits"], difficulty: "core", kind: "design",
      prompt: "You need to call an API for 10,000 records. Why not Promise.all on all of them, and what would you do instead?",
      expectedElements: ["overloads the API/rate limits", "memory and sockets", "bounded concurrency pool", "retries with backoff", "progress/partial failure handling"],
      modelAnswer: "Starting 10,000 requests at once would hit rate limits, exhaust sockets and memory, and one failure would reject the whole Promise.all. I would use a bounded pool that keeps, say, 10 requests in flight, retry transient failures with backoff, collect per-record results so partial failures can be reported and retried, and ideally run it as a background job with progress tracking.",
      explanation: "Bounded concurrency is the key phrase.",
      commonWrongAnswers: ["Promise.all is the fastest, so use it."],
    },
    {
      id: "cs-concurrency-async-q08", tags: ["event-loop"], difficulty: "core", kind: "code-reading",
      prompt: "What is the output order, and why?",
      code: `async function f() {
  console.log(1);
  await null;
  console.log(2);
}
f();
console.log(3);`,
      expectedElements: ["1 3 2", "code before first await runs synchronously", "rest continues as a microtask"],
      modelAnswer: "1, 3, 2. Calling f runs it synchronously up to the first await, so 1 prints. The await suspends f and schedules the rest as a microtask, so control returns to the caller and 3 prints. When the synchronous code finishes, the microtask runs and 2 prints.",
      explanation: "Knowing that async functions start synchronously is the trick.",
      commonWrongAnswers: ["1 2 3"],
    },
  ],
  references: [
    { title: "MDN: Using promises", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises", kind: "official-docs" },
    { title: "Node.js docs: Don't block the event loop", url: "https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop", kind: "official-docs" },
    { title: "MDN: AbortController", url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortController", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Concurrency versus parallelism, race conditions and bounded concurrency apply in every language."],
  versionSpecific: ["Promise combinators, async/await and AbortController are JavaScript and Web platform APIs."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
