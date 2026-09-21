import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s03",
  level: 3,
  order: 3,
  title: "Async: async/await",

  look: `async/await lets you write promise code that READS like normal top-to-bottom code. It is the same IOU notes, just with friendlier clothes.

  async function makeLunch() {
    const bread = await getBread();        // "wait here until the promise answers"
    const cheese = await getCheese();
    return bread + " + " + cheese;          // an async function always returns a promise
  }

Two rules:
  1. await only works inside a function marked async.
  2. await pauses THAT function only. The rest of the program keeps running.

Errors: a failed promise makes await THROW, so you can use the try/catch you already know.

  try {
    const food = await getFood();
  } catch (error) {
    // the promise failed
  }

Careful with speed! Awaiting one thing after another runs them ONE AT A TIME (slow). To run them at the same time, start them all first and await Promise.all.`,

  type: `Finish four async functions:
1. getGreeting(fetchName) awaits fetchName() (it returns a promise of a name) and returns "Hello, " + name.
2. safeRun(task) awaits task(). If it works return { ok: true, value }. If it throws, return { ok: false, error: the error's message }. Use try/catch.
3. runInOrder(tasks) runs the tasks ONE AFTER ANOTHER (each task is a function returning a promise) and returns the array of results.
4. runTogether(tasks) starts ALL the tasks at the same time and returns the array of results, in order.`,

  break: `Break it on purpose: in runTogether, use the same await-in-a-loop code as runInOrder.
The answers are still right, but the tasks run one at a time, and the "at the same time" test fails. await in a loop is a classic slow-down!`,

  say: `In one sentence: what do async and await do, and how do you make several jobs run at the same time?`,

  starterCode: `// Strike 3: async / await.

async function getGreeting(fetchName) {
  // await fetchName(), then return "Hello, " + name
}

async function safeRun(task) {
  // { ok: true, value } or { ok: false, error: message }
}

async function runInOrder(tasks) {
  // one after another, return the array of results
}

async function runTogether(tasks) {
  // all at once, return the array of results
}
`,

  tests: `function makeTasks() {
  let running = 0;
  let mostAtOnce = 0;
  const tasks = [1, 2, 3].map((n) => async () => {
    running = running + 1;
    mostAtOnce = Math.max(mostAtOnce, running);
    await new Promise((resolve) => setTimeout(resolve, 15));
    running = running - 1;
    return n;
  });
  return { tasks, mostAtOnce: () => mostAtOnce };
}

test("getGreeting awaits the name", async () => {
  const greeting = await getGreeting(() => Promise.resolve("Sam"));
  expect(greeting).toBe("Hello, Sam");
});

test("safeRun returns the value when the task works", async () => {
  const result = await safeRun(() => Promise.resolve(42));
  expect(result).toEqual({ ok: true, value: 42 });
});

test("safeRun catches a failure instead of crashing", async () => {
  const result = await safeRun(() => Promise.reject(new Error("boom")));
  expect(result).toEqual({ ok: false, error: "boom" });
});

test("runInOrder gives the results and runs one at a time", async () => {
  const { tasks, mostAtOnce } = makeTasks();
  const results = await runInOrder(tasks);
  expect(results).toEqual([1, 2, 3]);
  expect(mostAtOnce()).toBe(1);
});

test("runTogether gives the results and runs all at the same time", async () => {
  const { tasks, mostAtOnce } = makeTasks();
  const results = await runTogether(tasks);
  expect(results).toEqual([1, 2, 3]);
  expect(mostAtOnce()).toBe(3);
});
`,

  hints: [
    "getGreeting: const name = await fetchName(); then return the sentence. The function is already marked async for you.",
    "safeRun: try { const value = await task(); return { ok: true, value: value }; } catch (error) { return { ok: false, error: error.message }; }",
    "runInOrder: for (const task of tasks) { results.push(await task()); }. runTogether: call every task FIRST (tasks.map((task) => task())), then await Promise.all(...) on that array.",
  ],

  solution: `=== CODE ===
async function getGreeting(fetchName) {
  const name = await fetchName();
  return "Hello, " + name;
}

async function safeRun(task) {
  try {
    const value = await task();
    return { ok: true, value: value };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function runInOrder(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}

async function runTogether(tasks) {
  return Promise.all(tasks.map((task) => task()));
}
=== LINE BY LINE ===
getGreeting: await pauses this function until the promise answers, then gives us the plain value, so the next line can use it like normal.
safeRun: a rejected promise makes await throw, so a normal try/catch catches it. Instead of crashing we return a small object that says what happened.
runInOrder: the await INSIDE the loop means task two does not even start until task one is finished. Safe when steps depend on each other, but slow.
runTogether: tasks.map((task) => task()) starts every task right away (that gives an array of promises). Promise.all then waits for all of them. Three 15 ms tasks take about 15 ms in total, not 45.`,
};
