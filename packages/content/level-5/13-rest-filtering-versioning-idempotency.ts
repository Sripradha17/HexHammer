import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s13",
  level: 5,
  order: 13,
  title: "REST design: filtering, versioning, idempotency",
  runner: "server",

  look: `Three more small REST ideas, all things you will recognize the moment you see them again in a real API.

FILTERING reuses the same query-string idea from pagination: ?status=done narrows a list down, on the server, before it is ever sent.

VERSIONING is a URL prefix like /v1/, so an API can change its shape later (a real /v2/) without instantly breaking everyone still calling /v1/. You will see /v1/ on every route below.

IDEMPOTENT means "doing it once has the exact same end result as doing it five times." PUT and DELETE are supposed to be idempotent; POST usually is not (posting the same "create a new item" request twice normally creates TWO items). The /v1/tasks/:id/complete route below is written to be idempotent on purpose: it always SETS status to "done", it never toggles it.

  task.status = "done";                                       // idempotent: same result every time
  task.status = task.status === "done" ? "open" : "done";      // NOT idempotent: a toggle changes each time`,

  type: `Finish GET /v1/tasks:
1. If req.query.status was given, respond 200 with only the tasks whose status matches it.
2. If it was NOT given, respond 200 with every task.
(The PUT /v1/tasks/:id/complete route is already written for you — read it, it is the idempotency example from Look.)`,

  break: `Break it on purpose: change task.status = "done"; (inside the already-written PUT route) to a toggle: task.status = task.status === "done" ? "open" : "done";. Rerun the tests and watch the idempotency test fail: calling the SAME endpoint twice now gives two DIFFERENT results. This is exactly the kind of bug a retried network request (very common in real life) can trigger silently. Put the fixed task.status = "done"; back.`,

  say: `In one sentence: what does it mean for an endpoint to be "idempotent", and why does that matter for something that might get retried?`,

  starterCode: `import express from "express";

const tasks = [
  { id: 1, title: "Buy milk", status: "done" },
  { id: 2, title: "Walk the dog", status: "open" },
  { id: 3, title: "Write tests", status: "done" },
];

export function buildApp() {
  const app = express();

  app.get("/v1/tasks", (req, res) => {
    // your code here
  });

  app.put("/v1/tasks/:id/complete", (req, res) => {
    const task = tasks.find((t) => t.id === Number(req.params.id));
    if (!task) {
      res.status(404).json({ error: "not found" });
      return;
    }
    task.status = "done";
    res.json(task);
  });

  return app;
}
`,

  tests: `test("GET /v1/tasks with no filter returns everything", async () => {
  const res = await request(buildApp()).get("/v1/tasks");
  expect(res.status).toBe(200);
  expect(res.body.length).toBe(3);
});

test("GET /v1/tasks?status=done returns only the matching ones", async () => {
  const res = await request(buildApp()).get("/v1/tasks?status=done");
  expect(res.body).toEqual([
    { id: 1, title: "Buy milk", status: "done" },
    { id: 3, title: "Write tests", status: "done" },
  ]);
});

test("PUT /v1/tasks/2/complete is idempotent: calling it twice ends up exactly the same as calling it once", async () => {
  const app = buildApp();
  const once = await request(app).put("/v1/tasks/2/complete");
  const twice = await request(app).put("/v1/tasks/2/complete");
  expect(once.body).toEqual(twice.body);
  expect(twice.body).toEqual({ id: 2, title: "Walk the dog", status: "done" });
});
`,

  hints: [
    "if (req.query.status) { ... } else { ... } is the whole shape you need.",
    "Inside the if: tasks.filter((t) => t.status === req.query.status)",
    "res.json(tasks.filter((t) => t.status === req.query.status)); in the if branch, res.json(tasks); in the else branch.",
  ],

  solution: `=== CODE ===
import express from "express";

const tasks = [
  { id: 1, title: "Buy milk", status: "done" },
  { id: 2, title: "Walk the dog", status: "open" },
  { id: 3, title: "Write tests", status: "done" },
];

export function buildApp() {
  const app = express();

  app.get("/v1/tasks", (req, res) => {
    if (req.query.status) {
      res.json(tasks.filter((t) => t.status === req.query.status));
    } else {
      res.json(tasks);
    }
  });

  app.put("/v1/tasks/:id/complete", (req, res) => {
    const task = tasks.find((t) => t.id === Number(req.params.id));
    if (!task) {
      res.status(404).json({ error: "not found" });
      return;
    }
    task.status = "done";
    res.json(task);
  });

  return app;
}
=== LINE BY LINE ===
req.query.status is undefined when no ?status=... was given at all, which is falsy, so the else branch correctly returns everything.
tasks.filter((t) => t.status === req.query.status) keeps only the tasks whose status matches EXACTLY, the same array method you have used since Level 2.
The PUT route earns "idempotent" by always assigning task.status = "done" outright, never by reading and flipping the current value. Whatever state the task was already in, calling this endpoint any number of times lands on the exact same result: done.`,
};
