import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s30",
  level: 5,
  order: 30,
  title: "Background jobs and queues",
  runner: "server",

  look: `Some work is genuinely slow: sending an email, resizing an image, generating a report. Making the caller WAIT for that inside a request handler is a bad trade: instead, push a JOB onto a QUEUE and answer immediately. A separate step processes the queue later, on its own time.

  app.post("/send-email", (req, res) => {
    queue.push(req.body.email);   // fast: just remembering the job
    res.status(202).json({ queued: true });   // answer NOW, before any real work happens
  });

202 Accepted is the honest status code here: not 200 ("done"), but "I have this, it is not finished yet". The caller does not have to sit there while the slow work happens; something else picks the job up separately.`,

  type: `Finish POST /send-email:
1. Push req.body.email onto the queue with queue.push(...).
2. Respond immediately with status 202 and JSON { queued: true } — WITHOUT waiting for it to be processed.`,

  break: `Break it on purpose: process the job immediately inside POST /send-email itself (call queue.processAll() right there, before responding), instead of just pushing it. The response still "works", but now the caller has to wait for the exact slow work you were trying to move out of their way — the whole point of a queue is answering fast and doing the real work later, separately.`,

  say: `In one sentence: what does status 202 promise that status 200 does not?`,

  starterCode: `import express from "express";

function createQueue() {
  const jobs = [];
  function push(job) {
    jobs.push(job);
  }
  function processAll() {
    const done = [];
    while (jobs.length > 0) {
      const job = jobs.shift();
      done.push(job.toUpperCase()); // pretend this is the slow work (e.g. actually sending an email)
    }
    return done;
  }
  return { push, processAll };
}

export function buildApp() {
  const app = express();
  app.use(express.json());
  const queue = createQueue();

  app.post("/send-email", (req, res) => {
    // your code here
  });

  app.post("/process-queue", (req, res) => {
    const processed = queue.processAll();
    res.json({ processed });
  });

  return app;
}
`,

  tests: `test("POST /send-email answers 202 immediately", async () => {
  const res = await request(buildApp()).post("/send-email").send({ email: "hi@example.com" });
  expect(res.status).toBe(202);
  expect(res.body).toEqual({ queued: true });
});

test("the job only actually runs later, when something processes the queue", async () => {
  const app = buildApp();
  await request(app).post("/send-email").send({ email: "hi@example.com" });
  const res = await request(app).post("/process-queue");
  expect(res.body).toEqual({ processed: ["HI@EXAMPLE.COM"] });
});
`,

  hints: [
    "queue.push(req.body.email);",
    "res.status(202).json({ queued: true });",
    "Both lines belong inside the /send-email route, in that order: push first, then answer.",
  ],

  solution: `=== CODE ===
import express from "express";

function createQueue() {
  const jobs = [];
  function push(job) {
    jobs.push(job);
  }
  function processAll() {
    const done = [];
    while (jobs.length > 0) {
      const job = jobs.shift();
      done.push(job.toUpperCase());
    }
    return done;
  }
  return { push, processAll };
}

export function buildApp() {
  const app = express();
  app.use(express.json());
  const queue = createQueue();

  app.post("/send-email", (req, res) => {
    queue.push(req.body.email);
    res.status(202).json({ queued: true });
  });

  app.post("/process-queue", (req, res) => {
    const processed = queue.processAll();
    res.json({ processed });
  });

  return app;
}
=== LINE BY LINE ===
queue.push(req.body.email) is the ONLY work the request itself does: remembering the job. That is genuinely fast, no matter how slow the real job eventually turns out to be.
res.status(202).json({ queued: true }) answers right away. The caller gets a response in milliseconds, regardless of how long sending a real email would actually take.
/process-queue is a stand-in for whatever REALLY processes jobs in production: a separate worker process, a scheduled task, a queue library. The key idea is the SEPARATION: accepting work and doing work happen at different times, on purpose.`,
};
