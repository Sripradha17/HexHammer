// Topic: CPU, memory, storage and the operating system. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csHardwareOs: Topic = {
  id: "cs-hardware-os",
  domainId: "",
  moduleId: "",
  title: "CPU, memory, storage and the operating system",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Explain what the CPU, RAM and disk each do, with their rough speed differences.",
    "Describe what an operating system provides to a program: processes, files, memory and scheduling.",
    "Tell a process from a thread, and say what a system call is.",
  ],
  prerequisites: [],
  subtopics: ["CPU, cores and clock speed", "Cache, RAM and disk", "The memory hierarchy in numbers", "Processes and threads", "System calls", "Scheduling"],
  strikeIds: [],

  story:
    "A report page takes 9 seconds. The team buys a faster CPU and it still takes 9 seconds, because the code spends 8.9 of them waiting for the disk and the network, not computing. Knowing where time really goes (CPU, memory, disk, network) is the first step of every performance fix, and the first thing a system-design interviewer checks.",
  mentalModel: {
    plain:
      "The CPU is the worker that follows instructions. RAM is its desk: small, fast, wiped when the power goes off. The disk is the filing cabinet: big, slow, permanent. The operating system is the office manager who gives each program its own desk space, shares the worker's time between programs, and handles every trip to the cabinet or the network.",
    analogy:
      "A chef (CPU) in a kitchen. The cutting board is the CPU cache, the counter is RAM, the walk-in pantry is the SSD, and a supplier across town is the network. A good chef keeps what they need on the board; a slow kitchen is usually a chef walking to the pantry, not a chef chopping slowly.",
    analogyLimit:
      "A real CPU has several cores (several chefs), and the operating system can pause one program mid-step to let another run, many times per second. Kitchens rarely swap chefs mid-chop.",
  },
  lessonSections: [
    {
      heading: "1. The CPU: a very fast instruction follower",
      body:
        "The CPU fetches an instruction, does it (add, compare, jump, load from memory), and moves to the next, billions of times per second. A 3 GHz core ticks 3 billion times a second.\n\nModern CPUs have several cores, each able to run its own instruction stream at the same time. More cores help only if the work can be split.",
    },
    {
      heading: "2. The memory hierarchy: near is fast, far is slow",
      body:
        "Rough times to fetch data, worth memorising as orders of magnitude:\n\nCPU cache: about 1 nanosecond.\nRAM: about 100 nanoseconds.\nSSD read: about 100 microseconds (1,000 times slower than RAM).\nNetwork round trip in the same data centre: about 0.5 milliseconds.\nNetwork round trip across a continent: about 50 to 150 milliseconds.\n\nThis is why one database call can cost more than a million additions, and why caching works.",
    },
    {
      heading: "3. RAM versus storage",
      body:
        "RAM holds what running programs are using right now. It is fast but volatile: power off, and it is gone.\n\nStorage (SSD or hard disk) keeps files permanently, but is far slower. Programs load what they need from storage into RAM. When RAM runs out, the OS starts swapping pages to disk and everything becomes painfully slow.",
    },
    {
      heading: "4. Processes and threads",
      body:
        "A process is a running program with its own private memory. Two processes cannot read each other's memory: a crash in one does not corrupt the other.\n\nA thread is a line of execution inside a process. Threads in the same process share its memory, which makes them fast to communicate but easy to break with race conditions.\n\nEach browser tab is often its own process; Node.js runs your JavaScript on one main thread.",
    },
    {
      heading: "5. The operating system and system calls",
      body:
        "Programs are not allowed to touch hardware directly. To open a file, send network data, get memory or start another program, they ask the kernel (the core of the OS) through a system call.\n\nThe OS also schedules: it decides which thread runs on which core, and switches between them many times a second so every program feels like it is running at once.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "The latency numbers are made tangible by the worked example (scaling them to human time) and by the predict exercise; there is no faithful way to animate a CPU cache in the browser.",
  codeExamples: [
    {
      title: "Latency, scaled to human time",
      language: "js",
      code: `// Real latencies in nanoseconds (rough, typical values)
const latencyNs = { cache: 1, ram: 100, ssd: 100_000, sameRegionNetwork: 500_000, crossContinent: 100_000_000 };

// Pretend 1 nanosecond is 1 second, to feel the difference
for (const [where, ns] of Object.entries(latencyNs)) {
  const seconds = ns;
  const human = seconds < 120 ? seconds + " s" : seconds < 172_800 ? Math.round(seconds / 3600) + " h" : Math.round(seconds / 86_400) + " days";
  console.log(where.padEnd(18), human);
}`,
      expectedOutput: `cache              1 s
ram                100 s
ssd                28 h
sameRegionNetwork  6 days
crossContinent     1157 days`,
      steps: [
        "Each latency is stored in nanoseconds, then treated as if 1 nanosecond were 1 second.",
        "A cache hit is 1 second and RAM is 100 seconds: under two minutes.",
        "An SSD read becomes about 28 hours; a request inside the same data centre about 6 days.",
        "A request across a continent becomes over three years. That is why reducing network round trips matters more than micro-optimising loops.",
      ],
    },
  ],
  practicalApplication:
    "When something is slow, first ask WHERE the time goes: measure CPU time versus waiting time. Waiting (I/O-bound) work is fixed with caching, batching requests, fewer round trips and doing independent calls in parallel. Computing (CPU-bound) work is fixed with better algorithms or spreading across cores. In system design interviews, quoting the latency ladder (RAM is about 100 ns, a disk seek or SSD read is far slower, a cross-region call is about 100 ms) shows you can reason about cost.",
  commonMistakes: [
    {
      mistake: "Buying a faster CPU for an I/O-bound problem.",
      symptom: "No improvement: the program was waiting on disk, database or network, not computing.",
      fix: "Measure first. If the CPU is mostly idle during the slow part, the bottleneck is I/O.",
    },
    {
      mistake: "Making many small network or database calls in a loop.",
      symptom: "A page that makes 200 queries takes seconds, even though each query is fast.",
      fix: "Batch them into one query, or fetch the data once and look it up in memory.",
    },
    {
      mistake: "Assuming threads share nothing, or that processes share memory.",
      symptom: "Corrupted counters from threads, or surprise when one process cannot see another's variables.",
      fix: "Remember: threads share memory (need coordination); processes do not (need explicit messages).",
    },
  ],
  misconceptions: [
    { myth: "More RAM always makes a computer faster.", truth: "More RAM only helps if programs were running out of it. Unused RAM does nothing for speed." },
    { myth: "Multithreaded code is always faster.", truth: "Only if the work splits into independent parts. Coordination, locks and context switches can make it slower." },
    { myth: "SSDs made disk speed irrelevant.", truth: "SSDs are much faster than spinning disks but still about 1,000 times slower than RAM." },
  ],
  exercises: [
    {
      kind: "predict",
      question: {
        id: "cs-hardware-os-p1",
        prompt: "A page makes 50 database queries one after another. Each takes 2 ms of network round trip and 0.1 ms of database work. Roughly how long is spent waiting on the network?",
        choices: ["0.1 ms", "5 ms", "100 ms", "2 ms"],
        answerIndex: 2,
        explanation: "50 round trips × 2 ms = 100 ms of pure waiting, versus 5 ms of real work. One batched query would cut the waiting to about 2 ms.",
        objective: 0,
      },
    },
    {
      kind: "debug",
      question: {
        id: "cs-hardware-os-d1",
        prompt: "A team's image-resizing service is slow. Monitoring shows the CPU at 100% on one core and idle on the other seven. What is the most likely fix?",
        choices: ["Add more RAM", "Buy faster SSDs", "Spread the resizing work across several processes or worker threads", "Increase the network bandwidth"],
        answerIndex: 2,
        explanation: "One busy core and seven idle ones means CPU-bound work running on a single thread. Using several workers lets the other cores help.",
        objective: 2,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-hardware-os-k1",
      prompt: "Which is fastest to read from?",
      choices: ["SSD", "RAM", "CPU cache", "Network"],
      answerIndex: 2,
      explanation: "The CPU cache sits right next to the cores: around a nanosecond. RAM is about 100 times slower, SSDs about 100,000 times slower.",
      objective: 0,
    },
    {
      id: "cs-hardware-os-k2",
      prompt: "What do threads in the same process share?",
      choices: ["Nothing", "Memory", "Only files", "Only the screen"],
      answerIndex: 1,
      explanation: "Threads share their process's memory, which is fast but means they must coordinate to avoid race conditions.",
      objective: 2,
    },
  ],
  project: {
    title: "Where Did The Time Go?: a tiny profiler report",
    summary: "Write a script that times CPU work, file reads and HTTP calls, and prints a report that classifies each as CPU-bound or I/O-bound, proving the latency ladder with your own measurements.",
    type: "exercise",
    objectivesCovered: [0, 1],
    requirements: [
      "Measure a CPU-heavy loop, reading a 10 MB file, and an HTTP request to a local server, each 10 times.",
      "Report median and worst time for each, and process CPU time versus wall-clock time (process.cpuUsage).",
      "Label each task CPU-bound or I/O-bound from the numbers, not by hand.",
      "Write a short README comparing your numbers with the latency ladder.",
    ],
    acceptanceCriteria: [
      "The report shows CPU time close to wall time for the loop, and much lower than wall time for I/O tasks.",
      "A test checks the classification function with fake measurements for both kinds.",
      "The README explains one surprising result in your own words.",
    ],
    technologies: ["Node.js", "Vitest"],
    milestones: [
      { title: "Timer", done_when: "A helper returns wall time and CPU time for any async function." },
      { title: "Three tasks", done_when: "Loop, file read and HTTP call are each measured 10 times." },
      { title: "Classify", done_when: "A tested function labels tasks CPU-bound or I/O-bound." },
      { title: "Explain", done_when: "README compares the measurements to the latency ladder." },
    ],
    testIdeas: ["Classification at the boundary", "Median of an even number of samples"],
    stretchGoals: ["Run the CPU task in 4 worker threads and compare", "Chart the results"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-hardware-os-a1",
        prompt: "What happens to data in RAM when the computer loses power?",
        choices: ["It is saved to disk automatically", "It is lost", "It stays until the next restart", "It moves to the CPU cache"],
        answerIndex: 1,
        explanation: "RAM is volatile: it needs power to hold data. Anything that must survive goes to storage.",
        objective: 0,
      },
      {
        id: "cs-hardware-os-a2",
        prompt: "A program wants to open a file. What does it actually do?",
        choices: ["Reads the disk hardware directly", "Asks the operating system through a system call", "Asks the CPU cache", "Starts a new thread"],
        answerIndex: 1,
        explanation: "Programs request hardware access from the kernel with system calls; the OS checks permissions and does the work.",
        objective: 1,
      },
      {
        id: "cs-hardware-os-a3",
        prompt: "Why can one crashing browser tab not corrupt another tab's page?",
        choices: ["They share memory safely", "Each tab runs in its own process with private memory", "Browsers never crash", "Tabs use different CPUs"],
        answerIndex: 1,
        explanation: "Process isolation: the OS gives each process its own memory, so one cannot overwrite another.",
        objective: 2,
      },
      {
        id: "cs-hardware-os-a4",
        prompt: "Roughly how much slower is a cross-continent network round trip than a RAM read?",
        choices: ["About 10 times", "About 1,000 times", "About a million times", "They are similar"],
        answerIndex: 2,
        explanation: "RAM is about 100 ns; a cross-continent round trip is about 100 ms = 100,000,000 ns: around a million times slower.",
        objective: 0,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-hardware-os-q01", tags: ["hardware", "latency"], difficulty: "foundation", kind: "concept",
      prompt: "Walk me through the memory hierarchy and why it matters for software.",
      expectedElements: ["registers/cache, RAM, SSD/disk, network", "orders of magnitude", "locality and caching", "round trips dominate"],
      modelAnswer: "From fastest to slowest: CPU registers and caches (about a nanosecond), RAM (about 100 ns), SSD (about 100 µs), then the network (about 0.5 ms in a data centre, 100 ms across continents). Each step is roughly 100 to 1,000 times slower. For software it means data you touch often should stay close (caches, in-memory lookups), and that avoiding network or disk round trips usually beats optimising CPU work.",
      explanation: "Numbers in the right order of magnitude impress more than precise but wrong figures.",
      commonWrongAnswers: ["Disk is about as fast as RAM now."],
    },
    {
      id: "cs-hardware-os-q02", tags: ["os", "processes"], difficulty: "foundation", kind: "concept",
      prompt: "What is the difference between a process and a thread?",
      expectedElements: ["process: own memory space", "thread: unit of execution inside a process", "threads share memory", "isolation vs communication trade-off"],
      modelAnswer: "A process is a running program with its own isolated memory, file handles and resources. A thread is a path of execution inside a process; threads of one process share its memory. Processes are safer because they are isolated but cost more to create and must communicate by messages; threads are cheaper and communicate through shared memory but need locks to avoid race conditions.",
      explanation: "Naming the trade-off is what separates a definition from understanding.",
      commonWrongAnswers: ["They are the same thing."],
    },
    {
      id: "cs-hardware-os-q03", tags: ["performance"], difficulty: "core", kind: "scenario",
      prompt: "How do you tell if a slow service is CPU-bound or I/O-bound?",
      expectedElements: ["check CPU utilisation", "compare CPU time to wall time", "profile", "different fixes for each"],
      modelAnswer: "I look at CPU utilisation during the slow period and compare CPU time with wall-clock time for the request. If the CPU is busy the whole time, it is CPU-bound: fix it with better algorithms or more cores. If the CPU is mostly idle while the request waits, it is I/O-bound: fix it with caching, batching, fewer round trips or concurrency. A profiler or tracing shows exactly which call is waiting.",
      explanation: "This is the first question in almost every performance debugging conversation.",
      commonWrongAnswers: ["Add more servers."],
    },
    {
      id: "cs-hardware-os-q04", tags: ["os", "syscalls"], difficulty: "core", kind: "concept",
      prompt: "What is a system call? Give examples.",
      expectedElements: ["request to the kernel", "user mode vs kernel mode", "examples: open/read/write, socket, fork/exec, mmap", "relatively expensive"],
      modelAnswer: "A system call is how a program asks the kernel to do something it is not allowed to do itself, such as reading a file, opening a network socket, allocating memory or starting a process. The CPU switches from user mode to kernel mode, the kernel checks permissions and does the work, then returns. Examples are open, read, write, socket, fork and exec. Because the switch has a cost, programs buffer I/O to make fewer calls.",
      explanation: "Mentioning buffering shows you connect the idea to real performance.",
      commonWrongAnswers: ["A function call into a library."],
    },
    {
      id: "cs-hardware-os-q05", tags: ["concurrency", "cores"], difficulty: "core", kind: "concept",
      prompt: "Your Node.js server uses one CPU core at 100% while the machine has eight. Why, and what are your options?",
      expectedElements: ["JavaScript runs on one main thread", "cluster / multiple processes", "worker threads for CPU work", "move CPU work off the request path"],
      modelAnswer: "Node runs JavaScript on a single main thread, so CPU-heavy work occupies one core while the others idle. Options: run several Node processes (cluster mode or several containers behind a load balancer), move CPU-heavy tasks to worker threads, or move them out of the request path into a background job queue.",
      explanation: "Links OS concepts to the platform you actually use.",
      commonWrongAnswers: ["Node automatically uses all cores."],
    },
    {
      id: "cs-hardware-os-q06", tags: ["memory"], difficulty: "foundation", kind: "concept",
      prompt: "What happens when a machine runs out of RAM?",
      expectedElements: ["swapping/paging to disk", "huge slowdown", "OOM killer / crash", "monitor memory"],
      modelAnswer: "The operating system starts moving less-used memory pages to disk (swapping). Because disk is far slower than RAM, everything slows dramatically. If memory is still exhausted, the OS kills a process, on Linux via the out-of-memory killer, or the program crashes with an out-of-memory error. In production we watch memory usage and set limits so it is caught early.",
      explanation: "Swap and the OOM killer are the two keywords interviewers look for.",
      commonWrongAnswers: ["The program just gets a bit slower."],
    },
    {
      id: "cs-hardware-os-q07", tags: ["scheduling"], difficulty: "core", kind: "concept",
      prompt: "How can a laptop run 300 threads on 8 cores?",
      expectedElements: ["scheduler time-slices", "context switching", "most threads are waiting/blocked", "illusion of simultaneity"],
      modelAnswer: "The OS scheduler gives each runnable thread short time slices on a core and switches between them (context switching) many times a second, so they all appear to run at once. In practice most of those threads are blocked, waiting for input, a timer or the network, so only a handful actually need a core at any moment.",
      explanation: "Noting that most threads are idle is the insight.",
      commonWrongAnswers: ["Each core can run many threads at the same instant."],
    },
    {
      id: "cs-hardware-os-q08", tags: ["design", "latency"], difficulty: "core", kind: "design",
      prompt: "A product page makes 30 sequential calls to other services. How would you speed it up?",
      expectedElements: ["round trips dominate", "parallelise independent calls", "batch endpoints", "cache", "measure first"],
      modelAnswer: "First I would trace the request to see which calls take the time. Thirty sequential calls means latency adds up, so I would run independent calls in parallel (Promise.all), ask for batch endpoints so one call fetches many items, and cache data that rarely changes. If some calls are not needed for the first paint, I would load them later.",
      explanation: "Applies the latency ladder to a realistic design problem.",
      commonWrongAnswers: ["Get faster servers."],
    },
  ],
  references: [
    { title: "Operating Systems: Three Easy Pieces (free online book)", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/", kind: "book" },
    { title: "Latency numbers every programmer should know (interactive)", url: "https://colin-scott.github.io/personal_website/research/interactive_latency.html", kind: "article" },
    { title: "Node.js docs: Worker threads", url: "https://nodejs.org/api/worker_threads.html", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["The memory hierarchy and process/thread isolation have held for decades."],
  versionSpecific: ["Exact latency numbers change with hardware generations; the orders of magnitude are what matter."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
