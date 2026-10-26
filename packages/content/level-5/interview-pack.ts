import type { InterviewPack } from "../types";

// Level 5 Interview Pack: Say-It cards, one Solve-It problem (tests only, NO solution), one STAR prompt.
export const interviewPack: InterviewPack = {
  level: 5,

  sayIt: [
    {
      question: "What is the real difference between a 401 and a 403 status code?",
      answer:
        "401 Unauthorized means the server does not know who you are (no valid credentials given at all). 403 Forbidden means the server DOES know who you are, and the answer is still no — you are not allowed to do this, no matter who you prove yourself to be.",
    },
    {
      question: "Why does middleware order matter? Give a concrete example.",
      answer:
        "Later middleware can depend on something an earlier one set up. app.use(addTimestamp) then app.use(requireTimestamp) works; swapped, requireTimestamp runs first, finds nothing set yet, and fails — even though neither function itself changed, only the order did.",
    },
    {
      question: 'What makes an HTTP operation "idempotent", and why does that matter for retries?',
      answer:
        "Idempotent means doing it once has the exact same end result as doing it many times. PUT and DELETE are supposed to be idempotent; POST usually is not. This matters because a retried network request (very common in real life) is safe to just resend on an idempotent endpoint, but could create duplicates on a non-idempotent one.",
    },
    {
      question: "What is the N+1 query problem, and how do you fix it?",
      answer:
        "Fetching a list with one query, then running ONE MORE query per item to get its related data: for 10,000 items, that is 10,001 round trips. The fix is fetching the related data in a SECOND, single query (or a join), then grouping it in memory, so the query count stops growing with the amount of data.",
    },
    {
      question: "Why do you add a random salt before hashing a password?",
      answer:
        "Without a salt, the same password always produces the same hash, so two users with the same password would have identical rows — a real weakness, and it also lets an attacker precompute hashes for common passwords ahead of time (a rainbow table). A per-user random salt makes the same password hash differently every time.",
    },
    {
      question: "What does a JWT's signature actually prove, and what does it NOT prove?",
      answer:
        "The signature proves the token was created (or at least approved) by whoever holds the signing secret, and that its contents have not been tampered with since. It does NOT encrypt anything: the payload is just base64-encoded, readable by anyone, and it says nothing about whether the token's claims were ever true in the first place.",
    },
    {
      question: 'What is SQL injection, and what is the REAL fix (not "just escape the input")?',
      answer:
        "SQL injection is untrusted input changing the MEANING of a query by being glued into the query string itself. The real fix is a parameterized query: the value is sent to the database SEPARATELY from the query's structure, so it can never be interpreted as part of the command, no matter what characters it contains.",
    },
    {
      question: "What does a database transaction actually guarantee?",
      answer:
        "All-or-nothing: every statement between BEGIN and COMMIT takes effect together, as one unit, or none of them do at all (ROLLBACK, or a crash in between). This matters whenever one change is meaningless without another, like moving money between two accounts.",
    },
    {
      question: "Why is keeping a rate limiter's counter as module-level state (instead of per-instance) a real bug?",
      answer:
        "A counter declared OUTSIDE the function that creates the limiter is shared across every app/instance built afterward, instead of each one starting fresh. In a real deployed service with more than one running instance, this either double-counts or under-counts requests, defeating the limit entirely.",
    },
    {
      question: "What is API versioning (like a /v1/ prefix) actually for?",
      answer:
        "It lets an API change its shape later (a real /v2/) without instantly breaking every existing caller still using /v1/. The old version keeps working exactly as it always did, while new work happens on the new version, giving callers real time to migrate instead of breaking overnight.",
    },
  ],

  solveIt: {
    title: "A tiny Express-style router",
    minutes: 30,
    prompt: `Write a small router that matches paths against registered patterns, the same core idea a real framework like Express builds on.

1. get(pattern, handler) registers a route. A pattern looks like "/items" or "/users/:id" (a segment starting with : matches ANYTHING in that position, and becomes a named param).

2. match(path) is given a real path, like "/users/42". Find the FIRST registered route whose pattern structurally matches it: the same NUMBER of segments, every literal segment equal, and every :param segment matching anything at all. Return { handler, params }, where params holds the extracted values (params.id would be "42"). Return null if nothing matches.

Talk out loud as you work: say your plan before you type, then say what each part is doing. Start a 30-minute timer.`,
    starterCode: `// Solve-It: a tiny Express-style router.

function createRouter() {
  const routes = [];

  function get(pattern, handler) {
    // your code here
  }

  function match(path) {
    // your code here
  }

  return { get, match };
}
`,
    tests: `test("matches an exact literal route", () => {
  const router = createRouter();
  const handler = () => {};
  router.get("/items", handler);
  const result = router.match("/items");
  expect(result.handler).toBe(handler);
  expect(result.params).toEqual({});
});

test("matches a route with one param and extracts it", () => {
  const router = createRouter();
  const handler = () => {};
  router.get("/users/:id", handler);
  const result = router.match("/users/42");
  expect(result.params).toEqual({ id: "42" });
});

test("matches a route with two params", () => {
  const router = createRouter();
  const handler = () => {};
  router.get("/users/:userId/orders/:orderId", handler);
  const result = router.match("/users/7/orders/99");
  expect(result.params).toEqual({ userId: "7", orderId: "99" });
});

test("returns null when nothing matches", () => {
  const router = createRouter();
  router.get("/items", () => {});
  expect(router.match("/nope")).toBe(null);
});

test("the FIRST matching route wins when more than one could match", () => {
  const router = createRouter();
  const first = () => "first";
  const second = () => "second";
  router.get("/users/:id", first);
  router.get("/users/:id", second);
  const result = router.match("/users/1");
  expect(result.handler).toBe(first);
});

test("segment counts must match: extra or missing segments never match", () => {
  const router = createRouter();
  router.get("/users/:id", () => {});
  expect(router.match("/users/1/extra")).toBe(null);
  expect(router.match("/users")).toBe(null);
});
`,
  },

  star: {
    prompt:
      "Tell me about a time you had to debug or fix a real production issue involving a database or an API. What made you confident you had actually found the root cause, not just a symptom?",
    tips: [
      "S (Situation): what broke, and how badly? Who noticed first?",
      "T (Task): what was YOUR responsibility here?",
      "A (Action): the real steps. What did you check first? A query plan? A log? Reproducing it locally?",
      "R (Result): the real fix, and the evidence it actually worked (not just 'it seemed fine after'). What did you add so this specific bug could not happen again silently?",
      "Interviewers are listening for a real METHOD of narrowing down cause versus symptom, not just the final one-line fix. Practice out loud for about two minutes.",
    ],
  },
};
