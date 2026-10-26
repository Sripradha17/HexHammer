import type { InterviewPack } from "../types";

// Level 3 Interview Pack: Say-It cards, one Solve-It problem (tests only, NO solution), one STAR prompt.
export const interviewPack: InterviewPack = {
  level: 3,

  sayIt: [
    {
      question: "What is a promise, and what are its three states?",
      answer:
        "A promise is an object standing in for a value that is not ready yet. It starts pending, then settles exactly once: either fulfilled (it got a value) or rejected (it got an error). Once settled, it never changes state again.",
    },
    {
      question: "Why does async/await make asynchronous code easier to read than .then() chains?",
      answer:
        "await lets you write asynchronous code that LOOKS like ordinary top-to-bottom code, with try/catch for errors, instead of nesting .then()/.catch() calls. Underneath, it is still promises: await just pauses that one function until the promise settles.",
    },
    {
      question:
        "What is the event loop, and why does a promise callback run after synchronous code, even if the promise already resolved?",
      answer:
        "JavaScript runs one thing at a time. The event loop keeps checking: is the main call stack empty? If so, it runs the next queued callback (a promise's .then, a setTimeout, ...). Synchronous code always finishes FIRST, because it is already running on the stack; promise callbacks are queued and only get a turn once the stack is empty.",
    },
    {
      question: "What is the difference between git merge and git rebase?",
      answer:
        "merge brings two histories together with a new merge commit, keeping both branches' real history intact. rebase replays your commits on top of another branch, rewriting your commits' history to look like it happened afterward. merge is safer for shared branches; rebase makes a cleaner, linear history for your own unpublished work.",
    },
    {
      question: "When git shows a merge conflict, what has it actually left in the file?",
      answer:
        'Conflict markers: <<<<<<<, =======, and >>>>>>>, with BOTH versions of the conflicting lines shown between them. Resolving it means editing the file to the version you actually want and removing the markers, then staging it as resolved.',
    },
    {
      question: "What is a mock, and why use one instead of calling the real thing in a test?",
      answer:
        "A mock is a fake stand-in for something slow, unreliable, or side-effecting (a network call, sending a real email) that lets a test control exactly what happens and check exactly how it was called, without any of the real cost or risk.",
    },
    {
      question: "What is TDD (red-green-refactor)?",
      answer:
        "Test-Driven Development: write a failing test first (red), write just enough code to make it pass (green), then clean the code up while the test keeps passing (refactor). The test defines what 'done' means before any implementation exists.",
    },
    {
      question: "What does TypeScript 'narrowing' mean? Give an example.",
      answer:
        'Narrowing is TypeScript figuring out a MORE SPECIFIC type than the one you declared, based on a check you already wrote. if (typeof value === "string") narrows value from string | number down to just string inside that block, with no extra work from you.',
    },
    {
      question: "What is a TypeScript generic, and why is it more reusable than writing multiple types by hand?",
      answer:
        "A generic is a type that takes another type as a parameter, like Array<T> or Box<T>. Instead of writing StringBox, NumberBox, UserBox by hand, one Box<T> definition works for any T, and TypeScript still checks it correctly for whichever type you actually use.",
    },
    {
      question: "What makes a code review comment actually useful, versus just noise?",
      answer:
        "A useful comment explains WHY something matters (a real bug, a real risk, a real readability cost), not just a style preference stated as fact. It is specific enough that the author knows exactly what to change, and it is kind: a code review is about the code, not the person.",
    },
  ],

  solveIt: {
    title: "Retry and timeout helpers",
    minutes: 30,
    prompt: `Write three small async utilities, the kind you would reach for in real production code that talks to an unreliable network.

1. retry(fn, times) calls the async function fn(). If it rejects, call it again, up to "times" total attempts. The moment it succeeds, return that value. If every attempt fails, throw the LAST error.

2. withTimeout(promise, ms) returns a new promise that settles exactly like "promise" does, UNLESS "ms" milliseconds pass first — in that case, reject with new Error("Timed out") instead.

3. firstSuccessful(fns) is given an array of async functions. Call them ONE AT A TIME, in order, and return the value of the FIRST one that succeeds. If every one fails, throw the LAST error.

Talk out loud as you work: say your plan before you type, then say what each part is doing. Start a 30-minute timer.`,
    starterCode: `// Solve-It: retry and timeout helpers.

async function retry(fn, times) {
  // your code here
}

async function withTimeout(promise, ms) {
  // your code here
}

async function firstSuccessful(fns) {
  // your code here
}
`,
    tests: `test("retry succeeds immediately if fn works the first time", async () => {
  let calls = 0;
  const fn = async () => { calls = calls + 1; return "ok"; };
  const result = await retry(fn, 3);
  expect(result).toBe("ok");
  expect(calls).toBe(1);
});

test("retry tries again after a failure, and succeeds within the limit", async () => {
  let calls = 0;
  const fn = async () => {
    calls = calls + 1;
    if (calls < 3) throw new Error("not yet");
    return "ok";
  };
  const result = await retry(fn, 5);
  expect(result).toBe("ok");
  expect(calls).toBe(3);
});

test("retry gives up after the limit and throws the LAST error", async () => {
  let calls = 0;
  const fn = async () => {
    calls = calls + 1;
    throw new Error("attempt " + calls);
  };
  let message = null;
  try {
    await retry(fn, 3);
  } catch (error) {
    message = error.message;
  }
  expect(message).toBe("attempt 3");
  expect(calls).toBe(3);
});

test("withTimeout resolves normally when the promise finishes first", async () => {
  const fast = new Promise((resolve) => setTimeout(() => resolve("done"), 10));
  const result = await withTimeout(fast, 500);
  expect(result).toBe("done");
});

test("withTimeout rejects with Timed out when the promise is too slow", async () => {
  const slow = new Promise((resolve) => setTimeout(() => resolve("done"), 500));
  let message = null;
  try {
    await withTimeout(slow, 20);
  } catch (error) {
    message = error.message;
  }
  expect(message).toBe("Timed out");
});

test("firstSuccessful returns the first one that works", async () => {
  const a = async () => { throw new Error("a failed"); };
  const b = async () => "b worked";
  const c = async () => "c worked";
  const result = await firstSuccessful([a, b, c]);
  expect(result).toBe("b worked");
});

test("firstSuccessful throws the LAST error if all fail", async () => {
  const a = async () => { throw new Error("a failed"); };
  const b = async () => { throw new Error("b failed"); };
  let message = null;
  try {
    await firstSuccessful([a, b]);
  } catch (error) {
    message = error.message;
  }
  expect(message).toBe("b failed");
});
`,
  },

  star: {
    prompt:
      "Tell me about a time you had to debug something tricky using real tools (breakpoints, stack traces, logs) instead of just guessing and re-reading the code.",
    tips: [
      "S (Situation): what was broken, and how did you first notice it?",
      "T (Task): what was YOUR part in tracking it down?",
      "A (Action): the actual steps. Where did you put your first breakpoint? What did a stack trace tell you that reading the code alone did not?",
      "R (Result): what was the real cause, how did you fix it, and what did you add so it would be caught sooner next time (a test, a log line, an assertion)?",
      "Interviewers want your METHOD, not just the punchline. Practice out loud for about two minutes, and write it in your notes file by hand.",
    ],
  },
};
