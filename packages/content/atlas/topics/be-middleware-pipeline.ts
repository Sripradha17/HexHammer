// Topic: Middleware pipelines: order, short-circuits and the error path. A COMPLETE topic.
// NOTE (charter): the worked example below is deliberately NOT a solution to any Level 5 strike.
// It only TRACES an existing pipeline; the strikes ask you to write middleware yourself.
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const beMiddlewarePipeline: Topic = {
  id: "be-middleware-pipeline",
  domainId: "",
  moduleId: "",
  title: "Middleware pipelines: order, short-circuits and errors",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Explain middleware as a pipeline of functions that each either respond or pass control on.",
    "Predict the order middleware runs in (including the 'way back out') from how it is registered.",
    "Explain short-circuiting and why a middleware must respond OR call next(), never both and never neither.",
    "Trace how an error skips normal middleware and reaches the error handler.",
  ],
  prerequisites: ["web-http-lifecycle", "cs-functions-scope"],
  subtopics: ["The (req, res, next) contract", "Registration order", "The onion model", "Short-circuiting", "Error-handling middleware", "Async errors", "Typical stack order"],
  strikeIds: ["l5-s03", "l5-s04", "l5-s05", "l5-s06", "l5-s07", "l5-s08", "l5-s10"],

  story:
    "A new rate limiter was added to the API. Afterwards, logged-in users start getting rate limited as anonymous users, and the access logs no longer show the user id. Nothing in the limiter or the auth code is wrong. They were simply registered in the wrong order, so the limiter ran before anyone knew who the user was.",
  mentalModel: {
    plain:
      "A request travels down a line of small functions. Each one can look at the request, add something to it, and then either answer (which ends the trip) or call next() to hand it to the following function. The order you register them is the order they run.",
    analogy:
      "Airport security: check-in, ID check, bag scan, boarding gate. Each desk can stop you (short-circuit: 'no ID, you are not flying') or wave you on. Putting the bag scan before check-in would make no sense; the order is part of the design.",
    analogyLimit:
      "At an airport you never come back through the desks. In many frameworks (Express, Koa) code written AFTER next() runs again on the way back out, like an onion, which lets a middleware measure the whole request time. And errors take a separate corridor that skips ordinary desks.",
  },
  lessonSections: [
    {
      heading: "1. The contract: respond or pass on",
      body:
        "In Express a middleware is `(req, res, next) => { ... }`. It must do exactly one of two things: send a response (`res.json(...)`, `res.status(401).end()`), which ends the pipeline, or call `next()` to give the next function a turn.\n\nDo neither and the request hangs until it times out. Do both and the next handler tries to respond again, and Node throws 'Cannot set headers after they are sent'.",
    },
    {
      heading: "2. Order is registration order",
      body:
        "`app.use(a); app.use(b); app.get('/x', handler)` runs a, then b, then handler. A middleware can only use what earlier middleware prepared. Auth must come before anything that needs `req.user`; body parsing before anything that reads `req.body`.",
    },
    {
      heading: "3. The onion: code after next()",
      body:
        "If a middleware has code after `next()`, that code runs after the later functions have run (for synchronous handlers): the request goes in through each layer and comes back out in reverse. This is how timing middleware measures the whole request. With async handlers, use the response's 'finish' event rather than relying on code after next().",
    },
    {
      heading: "4. Short-circuiting is a feature",
      body:
        "Auth, validation, rate limiting and caching all work by stopping early: no token, respond 401; invalid body, respond 400; over the limit, respond 429; cache hit, respond with the cached value. Everything after them never runs, which saves work and enforces rules.",
    },
    {
      heading: "5. The error corridor",
      body:
        "Calling `next(err)`, or throwing inside a handler, skips all remaining ordinary middleware and jumps to the first error-handling middleware. In Express that is a function with FOUR parameters, `(err, req, res, next)`, registered after the routes. Express 5 also forwards rejected promises from async handlers automatically; Express 4 did not.",
    },
    {
      heading: "6. A sensible default order",
      body:
        "A common order for an API: request id / correlation → logging → security headers and CORS → body parsing → rate limiting → authentication → authorization → validation → route handler → 404 handler → error handler. Each choice has a reason, such as rate limiting before expensive auth, or a per-user limit placed after auth. Write that reason down next to the code.",
    },
  ],
  visualizationType: "middleware-pipeline",
  codeExamples: [
    {
      title: "Tracing the onion in a real Express 5 app",
      language: "js",
      code: `import express from "express";

const app = express();
const trace = [];

app.use((req, res, next) => { trace.push("A in"); next(); trace.push("A out"); });
app.use((req, res, next) => { trace.push("B in"); next(); trace.push("B out"); });
app.get("/hi", (req, res) => { trace.push("handler"); res.send("hi"); });

const server = app.listen(3001, async () => {
  const r = await fetch("http://localhost:3001/hi");
  console.log(r.status, await r.text());
  console.log(trace.join(" -> "));
  server.close();
});`,
      expectedOutput: `200 hi
A in -> B in -> handler -> B out -> A out`,
      steps: [
        "Two middlewares and one route are registered, in that order.",
        "The request enters A, which records 'A in' and calls next().",
        "next() runs B, which records 'B in' and calls next() again.",
        "The route handler records 'handler' and sends the response.",
        "Because everything here is synchronous, control returns to B after its next() call ('B out'), then to A ('A out'): the onion.",
        "This output was verified by running it against Express 5 while writing this lesson.",
      ],
    },
  ],
  practicalApplication:
    "When adding any cross-cutting behaviour (auth, logging, rate limits, CORS, caching), first write down where in the pipeline it must go and why, then add a test that proves the order (e.g. 'an unauthenticated request never reaches the validator'). Most production middleware bugs are ordering bugs, not logic bugs.",
  commonMistakes: [
    { mistake: "Forgetting to call next() in a middleware that does not respond.", symptom: "Requests hang until the client times out; no error is logged.", fix: "Every code path must either respond or call next(). Add a test for each path." },
    { mistake: "Calling next() after already sending a response.", symptom: "'Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent'.", fix: "Use `return res.status(401)...` so the function stops after responding." },
    { mistake: "Registering the error handler before the routes, or with three parameters.", symptom: "Errors produce Express's default HTML page or crash instead of your JSON error.", fix: "Register it last, with exactly (err, req, res, next)." },
  ],
  misconceptions: [
    { myth: "Middleware runs in parallel.", truth: "It runs one at a time, in registration order. Async middleware still waits for next() before the following one starts." },
    { myth: "app.use() applies only to routes added after it.", truth: "It applies to requests in pipeline order, so it affects routes registered later. Routes registered before it can respond first and then it never runs for them." },
    { myth: "An error handler catches errors from anywhere in the app.", truth: "It only sees errors raised in the pipeline before it (thrown, passed to next(err), or rejected async handlers in Express 5). Errors in unrelated timers or event emitters are not caught." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l5-s03", why: "Build your own use()/next() chain from scratch in plain JavaScript." },
    { kind: "strike", strikeId: "l5-s05", why: "Fix a real Express app whose middleware order is wrong." },
    { kind: "strike", strikeId: "l5-s06", why: "Write a short-circuiting auth middleware against real HTTP requests." },
    { kind: "strike", strikeId: "l5-s07", why: "Write an error-handling middleware and see the error corridor work." },
    { kind: "lab", lab: "middleware-pipeline", task: "Drag the pipeline stages into an order and send requests with and without a token.", goal: "Find an order where anonymous requests are rejected before validation runs, and logged requests always include the user id." },
  ],
  knowledgeChecks: [
    { id: "be-middleware-pipeline-k1", prompt: "A middleware neither responds nor calls next(). What does the client see?", choices: ["An immediate 500", "A 404", "The request hangs until a timeout", "The next middleware runs anyway"], answerIndex: 2, explanation: "Nothing ever responds and nothing passes control on, so the request waits forever (or until a timeout).", objective: 2 },
    { id: "be-middleware-pipeline-k2", prompt: "Where should the error-handling middleware be registered?", choices: ["First", "Before the routes", "After all routes and middleware", "Anywhere"], answerIndex: 2, explanation: "Errors flow forward in the pipeline, so the handler must come after everything that can raise one.", objective: 3 },
  ],
  project: {
    title: "Observable request pipeline",
    summary: "A small Express API with a deliberately designed middleware stack (correlation id, structured logging, rate limiting, auth, validation, errors) and tests that prove both the behaviour and the order.",
    type: "implementation",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "Middleware for: correlation id (reuse an incoming x-request-id or create one), JSON logging with duration, a simple in-memory rate limiter, bearer-token auth, body validation, 404 and JSON errors.",
      "A comment above each app.use() explaining why it sits where it does.",
      "Every log line includes the correlation id and, when known, the user id.",
      "A GET /debug/pipeline route (development only) that lists middleware names in order.",
    ],
    acceptanceCriteria: [
      "A supertest test proves an unauthenticated request returns 401 and the validator never ran.",
      "A test proves the 6th request in a minute from one client returns 429 with a Retry-After header.",
      "A test proves a thrown error in a route returns a JSON 500 with the correlation id and no stack trace.",
      "A test proves every response carries the x-request-id header.",
    ],
    technologies: ["Node.js", "Express 5", "Vitest", "supertest"],
    milestones: [
      { title: "Skeleton", done_when: "Routes, 404 and JSON error handler work with tests." },
      { title: "Identity", done_when: "Correlation id and auth middleware tested." },
      { title: "Protection", done_when: "Validation and rate limiting tested." },
      { title: "Observability", done_when: "Structured logs include id, user, status and duration." },
    ],
    testIdeas: ["Order tests using spies", "Missing body", "Malformed JSON", "Async handler rejection"],
    stretchGoals: ["Make the rate limit per user after auth and per IP before it, and justify the design."],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      { id: "be-middleware-pipeline-a1", prompt: "What two choices does every middleware have?", choices: ["Log or throw", "Respond, or call next() to pass control on", "Read or write the database", "Return true or false"], answerIndex: 1, explanation: "That is the whole contract: end the pipeline with a response, or hand it on.", objective: 0 },
      { id: "be-middleware-pipeline-a2", prompt: "Registered as: logger, auth, route. A request has no token. What runs?", choices: ["route only", "logger, then auth (which responds 401)", "auth, then logger", "all three"], answerIndex: 1, explanation: "Registration order: logger first, then auth, which short-circuits with 401, so the route never runs.", objective: 1 },
      { id: "be-middleware-pipeline-a3", prompt: "Synchronous middlewares A then B each log before and after next(). What is the order?", choices: ["A-before, B-before, B-after, A-after", "A-before, A-after, B-before, B-after", "B-before, A-before, A-after, B-after", "Unpredictable"], answerIndex: 0, explanation: "The onion: in through A and B, then back out through B and A.", objective: 1 },
      { id: "be-middleware-pipeline-a4", prompt: "Why does `res.status(401).json(...); next();` crash?", choices: ["401 is not allowed", "The next handler tries to send a second response after headers were already sent", "json() is async", "next() needs an argument"], answerIndex: 1, explanation: "Respond OR call next(), never both.", objective: 2 },
      { id: "be-middleware-pipeline-a5", prompt: "A route handler throws. Which middleware runs next in Express?", choices: ["The next ordinary middleware", "The first error-handling middleware (four parameters) after it", "None; the server crashes", "The 404 handler"], answerIndex: 1, explanation: "Errors skip ordinary middleware and go to the first (err, req, res, next) handler.", objective: 3 },
    ],
  },
  interviewQuestions: [
    { id: "be-middleware-pipeline-q01", tags: ["middleware", "express"], difficulty: "foundation", kind: "concept", prompt: "What is middleware in a web framework like Express?", expectedElements: ["function in the request pipeline", "access to req/res", "respond or call next", "cross-cutting concerns"], modelAnswer: "Middleware is a function that sits in the request pipeline with access to the request and response. It can do work, such as logging, parsing or checking auth, and then either send a response or call next() to pass control on. It is how cross-cutting concerns are kept out of every individual route.", explanation: "Name the respond-or-next contract.", commonWrongAnswers: ["Software between the database and the OS."] },
    { id: "be-middleware-pipeline-q02", tags: ["middleware", "ordering"], difficulty: "core", kind: "design", prompt: "In what order would you register middleware for a JSON API, and why?", expectedElements: ["correlation id/logging first", "security headers/CORS", "body parsing", "rate limit", "auth then authz", "validation", "routes", "404", "error handler last"], modelAnswer: "Correlation id and request logging first, so every later step can be traced. Then security headers and CORS, so preflights are answered early. Then body parsing, then rate limiting, so cheap rejections happen before expensive work. Then authentication and authorization, then validation, then the routes, then a 404 handler, and the error handler last so it sees every error.", explanation: "The reasons matter more than the exact list.", commonWrongAnswers: ["Order does not matter."], followUps: ["When would you put rate limiting after auth?"] },
    { id: "be-middleware-pipeline-q03", tags: ["middleware", "debugging"], difficulty: "foundation", kind: "debugging", prompt: "Requests to one endpoint hang forever without errors. What is your first suspicion?", expectedElements: ["a middleware path that neither responds nor calls next", "missing next() in a branch", "check each branch"], modelAnswer: "A middleware on that route's path has a branch that neither responds nor calls next(), such as an early return or an awaited promise that never settles. I would add logging at each middleware, or step through, to find the last one that ran.", explanation: "Hangs without errors are classic missing-next bugs.", commonWrongAnswers: ["The database is down."] },
    { id: "be-middleware-pipeline-q04", tags: ["middleware", "errors"], difficulty: "core", kind: "concept", prompt: "How does error handling flow through Express middleware?", expectedElements: ["throw or next(err)", "skip normal middleware", "4-arg error handler", "registered last", "Express 5 handles rejected promises"], modelAnswer: "When a handler throws or calls next(err), Express skips the remaining ordinary middleware and calls the first error-handling middleware, the one with four parameters (err, req, res, next). It must be registered after the routes. Express 5 also catches rejected promises from async handlers; in Express 4 you had to catch them and call next(err) yourself.", explanation: "Version-specific detail worth stating.", commonWrongAnswers: ["Wrap every route in try/catch and respond there."] },
    { id: "be-middleware-pipeline-q05", tags: ["middleware", "onion"], difficulty: "core", kind: "code-reading", prompt: "How would you measure total request duration in middleware, and why not just put code after next()?", expectedElements: ["record start time", "res.on('finish')", "async handlers return before response", "code after next() may run early"], modelAnswer: "Record the start time in an early middleware and log in a `res.on('finish', ...)` listener, which fires when the response has actually been sent. Code after next() only runs 'on the way out' for synchronous handlers; with async handlers, next() returns before the work completes, so the timing would be wrong.", explanation: "Shows the limit of the onion model in Express.", commonWrongAnswers: ["Put Date.now() after next()."] },
    { id: "be-middleware-pipeline-q06", tags: ["middleware", "security"], difficulty: "core", kind: "scenario", prompt: "A protected route is reachable without auth. The auth middleware is correct. What could cause this?", expectedElements: ["route registered before auth middleware", "auth mounted on a different path prefix", "router-level vs app-level mounting"], modelAnswer: "The route may be registered before the auth middleware, so it responds first, or the auth middleware is mounted on a different path or router than the route. I would check registration order and mount paths, and add a test that hits every protected route without a token.", explanation: "Ordering and mounting bugs are security bugs.", commonWrongAnswers: ["Express ignores middleware sometimes."] },
    { id: "be-middleware-pipeline-q07", tags: ["middleware", "design"], difficulty: "advanced", kind: "design", prompt: "Middleware vs a service-layer function: how do you decide where logic belongs?", expectedElements: ["middleware for cross-cutting, request-shaped concerns", "business rules in services", "testability", "avoid hidden coupling via req mutation"], modelAnswer: "Middleware suits cross-cutting, request-shaped concerns that apply to many routes: auth, parsing, logging, rate limits. Business rules belong in services that do not know about HTTP, so they are reusable from jobs or CLIs and easy to unit test. Too much middleware that mutates req creates hidden coupling, where routes depend on fields some earlier middleware happened to set.", explanation: "Architecture judgement question.", commonWrongAnswers: ["Put everything in middleware for reuse."] },
    { id: "be-middleware-pipeline-q08", tags: ["middleware", "implementation"], difficulty: "core", kind: "implementation", prompt: "Describe (do not code) how next() can be implemented in a minimal framework.", expectedElements: ["array of functions", "index pointer", "next calls the function at the next index", "stop when a function does not call next"], modelAnswer: "Keep the middleware in an array and an index pointer. next() increases the index and calls the function at that position, passing the same request and a next. If a function never calls next, the chain stops there. Error support adds a second path that skips ahead to functions marked as error handlers.", explanation: "You build exactly this by hand in strike l5-s03.", commonWrongAnswers: ["It uses events."] },
  ],
  references: [
    { title: "Express: Using middleware", url: "https://expressjs.com/en/guide/using-middleware.html", kind: "official-docs" },
    { title: "Express: Error handling", url: "https://expressjs.com/en/guide/error-handling.html", kind: "official-docs" },
    { title: "Express: Migrating to Express 5", url: "https://expressjs.com/en/guide/migrating-5.html", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 4, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Pipelines of handlers, ordering, short-circuiting and separate error paths appear in every web framework."],
  versionSpecific: ["Express 5 forwards rejected promises from async handlers; Express 4 did not."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
