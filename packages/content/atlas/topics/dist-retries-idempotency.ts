// Topic: Retries, timeouts, backoff and idempotency. A COMPLETE topic.
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const distRetriesIdempotency: Topic = {
  id: "dist-retries-idempotency",
  domainId: "",
  moduleId: "",
  title: "Retries, timeouts, backoff and idempotency",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Explain why a timeout does not tell you whether the remote work happened.",
    "Design retries with timeouts, exponential backoff, jitter and a retry limit, and say which errors are safe to retry.",
    "Make an operation idempotent with idempotency keys so retries cannot duplicate side effects.",
    "Explain at-most-once, at-least-once and effectively-once delivery, and why 'exactly-once' needs idempotent consumers.",
  ],
  prerequisites: ["web-http-lifecycle", "be-background-jobs"],
  subtopics: ["Timeouts", "Retryable vs non-retryable errors", "Exponential backoff and jitter", "Retry storms", "Idempotency keys", "Delivery guarantees", "Dead-letter queues"],
  strikeIds: ["l5-s13", "l5-s30"],

  story:
    "At 09:00 the payment provider slows down. Your service times out and retries every failed call immediately, three times. Traffic to the provider quadruples, it slows down even more, and 212 customers are charged twice, because some of the 'failed' calls had actually succeeded. Two missing ideas caused all of it: backoff and idempotency.",
  mentalModel: {
    plain:
      "On a network, 'no answer' does not mean 'nothing happened'. The request may have been lost, or the work may have finished and only the reply was lost. So you will retry, and the receiver must be built so that doing the same request twice has the same effect as doing it once.",
    analogy:
      "You post a cheque and hear nothing back. Did it arrive? If you post a second cheque you might pay twice, unless both cheques carry the same unique invoice number and the shop refuses to cash the same invoice twice. The invoice number is an idempotency key.",
    analogyLimit:
      "The shop remembers invoice numbers forever. Real systems keep idempotency keys only for a window (hours or days) and must store the key and the effect atomically; if they do not, a crash between 'charged' and 'remembered' can still double-charge.",
  },
  lessonSections: [
    {
      heading: "1. A timeout is an unknown, not a failure",
      body:
        "There are three possibilities when a call times out: the request never arrived, the work is still running, or the work finished but the reply was lost. The caller cannot tell which. Every design below exists because of this uncertainty.",
    },
    {
      heading: "2. Always set a timeout",
      body:
        "A call without a timeout can wait forever, holding a connection, memory and a user. Set timeouts on every network call (HTTP, database, queue), shorter than the timeout of whoever is calling you, so failures surface where they can be handled.",
    },
    {
      heading: "3. Retry only what is safe to retry",
      body:
        "Retry transient errors: timeouts, connection resets, 503 Service Unavailable, 429 Too Many Requests (respecting Retry-After). Do not retry errors that will fail the same way again: 400 Bad Request, 401, 403, 404, validation errors.\n\nRetrying a non-idempotent operation (like POST /charges) is only safe if the receiver supports idempotency keys.",
    },
    {
      heading: "4. Back off, add jitter, and stop",
      body:
        "Immediate retries hammer a struggling service: a retry storm. Exponential backoff waits longer each time (100 ms, 200 ms, 400 ms...). Jitter randomises each wait so thousands of clients do not retry in lock-step. A maximum number of attempts (and a total time budget) stops endless retrying.",
    },
    {
      heading: "5. Idempotency keys make retries harmless",
      body:
        "The client creates a unique key per logical operation (not per attempt) and sends it with every retry, e.g. an `Idempotency-Key` header. The server stores key → result. If it sees the key again, it returns the stored result instead of doing the work again. Store the key and the side effect in the same database transaction so a crash cannot separate them.",
    },
    {
      heading: "6. Delivery guarantees in queues",
      body:
        "At-most-once: send once, never retry. Messages can be lost. At-least-once: retry until acknowledged. Nothing is lost, but duplicates happen. Most queues (SQS, RabbitMQ with acks, Kafka consumers) give at-least-once. 'Exactly-once' end-to-end behaviour is achieved by combining at-least-once delivery with idempotent consumers.\n\nMessages that keep failing go to a dead-letter queue for a human or a separate process to inspect.",
    },
  ],
  visualizationType: "queue",
  codeExamples: [
    {
      title: "Lost responses, retries and an idempotency store",
      language: "js",
      code: `const processed = new Map(); // idempotency key -> stored result
let charges = 0;

function chargeOnce(key, amount) {
  if (processed.has(key)) return processed.get(key); // seen before: replay
  charges++;
  const result = { ok: true, chargeId: \`ch_\${charges}\`, amount };
  processed.set(key, result);
  return result;
}

// The server DOES the work, but the first two responses are lost on the way back.
let calls = 0;
function unreliableCall(key, amount) {
  const result = chargeOnce(key, amount);
  calls++;
  if (calls <= 2) throw new Error("timeout (response lost)");
  return result;
}

function withRetries(fn, maxAttempts) {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      return fn();
    } catch (e) {
      console.log(\`attempt \${i} failed: \${e.message}; next wait \${100 * 2 ** (i - 1)}ms\`);
    }
  }
  throw new Error("gave up");
}

console.log(withRetries(() => unreliableCall("order-42", 999), 5));
console.log("charges made:", charges);`,
      expectedOutput: `attempt 1 failed: timeout (response lost); next wait 100ms
attempt 2 failed: timeout (response lost); next wait 200ms
{ ok: true, chargeId: 'ch_1', amount: 999 }
charges made: 1`,
      steps: [
        "Attempt 1: the server charges (charges = 1) and stores the result under 'order-42', but the response is 'lost', so the client sees a timeout.",
        "The client computes an exponential wait (100 ms, then 200 ms). This demo only prints the wait instead of sleeping, so it runs instantly; real code would actually wait, with jitter.",
        "Attempt 2: the server sees 'order-42' already processed and returns the stored result. No new charge. The response is lost again.",
        "Attempt 3: the stored result is returned and this time it arrives.",
        "Three attempts, one charge. Without the idempotency store, it would have charged 3 times.",
        "This output was verified by running the code with Node 22 while writing this lesson.",
      ],
    },
  ],
  practicalApplication:
    "When integrating with any external API (payments, email, webhooks), check its documentation for idempotency support and send a key per logical operation. For your own POST endpoints that create things or move money, accept an Idempotency-Key header. Configure HTTP clients with explicit timeouts and a capped, jittered retry policy, and only for retryable status codes.",
  commonMistakes: [
    { mistake: "Generating a new idempotency key on each retry.", symptom: "Duplicates still happen, because every attempt looks new.", fix: "Create the key once per logical operation and reuse it on every attempt." },
    { mistake: "Retrying immediately and indefinitely.", symptom: "A small outage becomes a big one (retry storm).", fix: "Exponential backoff, jitter, a max attempt count and a total deadline." },
    { mistake: "Retrying at every layer.", symptom: "3 retries × 3 layers = 27 calls to the bottom service per user action.", fix: "Retry at one layer (usually closest to the failure) and make others fail fast." },
  ],
  misconceptions: [
    { myth: "A timeout means the operation failed.", truth: "It means you do not know. The work may have completed." },
    { myth: "Kafka (or any queue) gives exactly-once processing for free.", truth: "Some systems offer exactly-once within their own boundaries, but side effects in other systems (emails, payments, other databases) still need idempotent consumers." },
    { myth: "GET requests are always safe to retry, so all reads are fine.", truth: "GET is meant to be safe, but a badly designed GET that changes data is not. And retrying even safe reads adds load during an outage." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l5-s13", why: "Implement idempotency in a real Express API, tested with real repeated requests." },
    { kind: "strike", strikeId: "l5-s30", why: "Build a job queue with retries and see failures move through it." },
    { kind: "lab", lab: "queue", task: "In the queue simulator, turn on 'lost acknowledgements' and process orders with and without idempotent consumers.", goal: "Reach 100 processed orders with zero duplicate side effects while acknowledgements are being lost." },
    {
      kind: "predict",
      question: {
        id: "dist-retries-idempotency-p1",
        prompt: "A client retries a timed-out POST /orders 3 times with a NEW idempotency key each time. The server did the work on every attempt. How many orders exist?",
        choices: ["1", "2", "3", "4"],
        answerIndex: 3,
        explanation: "The original attempt plus 3 retries = 4 attempts, each with a different key, so the server treats each as new: 4 orders. The key must be reused across retries.",
        objective: 2,
      },
    },
  ],
  knowledgeChecks: [
    { id: "dist-retries-idempotency-k1", prompt: "Which response is generally NOT worth retrying?", choices: ["503 Service Unavailable", "429 Too Many Requests (after Retry-After)", "Connection reset", "400 Bad Request"], answerIndex: 3, explanation: "400 means the request itself is wrong; sending it again fails the same way.", objective: 1 },
    { id: "dist-retries-idempotency-k2", prompt: "What does jitter add to exponential backoff?", choices: ["Longer timeouts", "Randomness, so many clients do not retry at the same moments", "Encryption", "A retry limit"], answerIndex: 1, explanation: "Without jitter, clients that failed together retry together, creating synchronized spikes.", objective: 1 },
  ],
  project: {
    title: "Event-driven order notifications",
    summary: "An order service publishes 'order placed' events to a queue; a notification worker sends (simulated) emails. Make the whole flow survive timeouts, crashes and duplicate deliveries without sending duplicate emails.",
    type: "application",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "POST /orders accepts an Idempotency-Key header and stores key + order in one transaction.",
      "Events are written to an outbox table in the same transaction and published by a separate relay (transactional outbox).",
      "The worker processes events at-least-once and records processed event ids so duplicates are skipped.",
      "Outgoing calls use timeouts and capped exponential backoff with jitter; failures after max attempts go to a dead-letter table.",
      "A chaos switch that randomly drops acknowledgements or crashes the worker mid-event.",
    ],
    acceptanceCriteria: [
      "A test sends the same POST with the same key 5 times and finds exactly 1 order and 1 event.",
      "A test delivers the same event twice to the worker and finds exactly 1 email recorded.",
      "With chaos enabled for 1,000 orders, the count of emails equals the count of orders.",
      "A test proves a permanently failing event lands in the dead-letter table after the configured attempts.",
    ],
    technologies: ["Node.js", "PostgreSQL", "a queue (in-database or RabbitMQ in Docker)", "Vitest"],
    milestones: [
      { title: "Idempotent API", done_when: "Duplicate POSTs return the same order." },
      { title: "Outbox", done_when: "Events are published reliably from the outbox." },
      { title: "Idempotent worker", done_when: "Duplicate deliveries send one email." },
      { title: "Chaos run", done_when: "1,000-order chaos test passes and is documented." },
    ],
    testIdeas: ["Same key, different body (should be rejected with 422 or 409)", "Key expiry", "Worker crash after email but before ack"],
    stretchGoals: ["Add a circuit breaker around the email provider and show it opening and recovering."],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      { id: "dist-retries-idempotency-a1", prompt: "A call to a payment API times out. What do you know?", choices: ["The payment failed", "The payment succeeded", "You do not know whether the payment happened", "The API is down"], answerIndex: 2, explanation: "The request may have been lost, still be in progress, or have completed with the reply lost.", objective: 0 },
      { id: "dist-retries-idempotency-a2", prompt: "Which retry policy is best for a flaky downstream service?", choices: ["Retry immediately forever", "Never retry", "Retry transient errors with exponential backoff, jitter and a max attempt count", "Retry every error 10 times with no delay"], answerIndex: 2, explanation: "Back off to give it room to recover, randomise to avoid synchronized spikes, and stop eventually.", objective: 1 },
      { id: "dist-retries-idempotency-a3", prompt: "Where must an idempotency key be stored relative to the side effect?", choices: ["In browser localStorage", "In the same transaction as the side effect", "In a log file afterwards", "Nowhere; it is only a header"], answerIndex: 1, explanation: "If the effect and the key record are not atomic, a crash between them can still produce duplicates.", objective: 2 },
      { id: "dist-retries-idempotency-a4", prompt: "Most message queues guarantee which delivery semantics by default?", choices: ["Exactly-once", "At-least-once", "At-most-once only", "None"], answerIndex: 1, explanation: "They redeliver until acknowledged, so duplicates are possible and consumers must be idempotent.", objective: 3 },
      { id: "dist-retries-idempotency-a5", prompt: "How do you get 'effectively exactly-once' processing?", choices: ["Use a faster queue", "At-least-once delivery plus idempotent consumers", "Turn off retries", "Use UDP"], answerIndex: 1, explanation: "Duplicates still arrive, but processing them again has no extra effect.", objective: 3 },
    ],
  },
  interviewQuestions: [
    { id: "dist-retries-idempotency-q01", tags: ["distributed-systems", "idempotency"], difficulty: "core", kind: "concept", prompt: "What is idempotency and why does it matter in distributed systems?", expectedElements: ["same effect once or many times", "networks force retries", "timeouts are ambiguous", "prevents duplicate side effects"], modelAnswer: "An idempotent operation has the same effect whether it is performed once or many times. It matters because networks are unreliable: a timeout does not tell you whether the work happened, so clients retry, and without idempotency those retries create duplicate orders, charges or emails.", explanation: "Link it to the ambiguity of timeouts.", commonWrongAnswers: ["It means the operation returns the same response."] },
    { id: "dist-retries-idempotency-q02", tags: ["api-design", "idempotency"], difficulty: "core", kind: "design", prompt: "Design idempotency for a POST /payments endpoint.", expectedElements: ["client-generated key per logical operation", "header", "store key+request hash+response atomically", "replay stored response", "reject same key different body", "expiry window", "handle in-flight duplicates"], modelAnswer: "The client sends an Idempotency-Key header that is unique per logical payment. The server, in one transaction, inserts the key with a hash of the request and creates the payment, then stores the response. A repeat with the same key and the same body returns the stored response. The same key with a different body is rejected. A concurrent duplicate that arrives while the first is in flight waits, or gets a 409, through a unique constraint or a lock. Keys expire after a documented window.", explanation: "Covers concurrency and mismatched bodies.", commonWrongAnswers: ["Check if a payment with the same amount exists in the last minute."] },
    { id: "dist-retries-idempotency-q03", tags: ["resilience", "retries"], difficulty: "core", kind: "concept", prompt: "Explain exponential backoff with jitter and why both parts are needed.", expectedElements: ["wait grows each attempt", "reduces load on struggling service", "jitter randomises", "avoids thundering herd/synchronized retries", "cap and max attempts"], modelAnswer: "Backoff increases the wait after each failure, for example doubling it, so a struggling service gets breathing room. Jitter randomises each wait, so clients that failed at the same moment do not all retry at the same moment, which would cause a thundering herd. Add a maximum delay and a maximum number of attempts.", explanation: "Both halves have distinct jobs.", commonWrongAnswers: ["Jitter is a kind of logging."] },
    { id: "dist-retries-idempotency-q04", tags: ["queues", "delivery"], difficulty: "core", kind: "concept", prompt: "Compare at-most-once, at-least-once and exactly-once delivery.", expectedElements: ["at-most-once may lose", "at-least-once may duplicate", "exactly-once hard; achieved via idempotency/transactions", "examples"], modelAnswer: "At-most-once sends without retrying, so messages can be lost; that is acceptable for metrics or other fire-and-forget data. At-least-once retries until acknowledged, so nothing is lost but duplicates happen; that is the common default. Exactly-once end to end is generally achieved by at-least-once delivery plus idempotent processing, or transactional systems within one platform.", explanation: "Avoid claiming any queue gives magic exactly-once.", commonWrongAnswers: ["Exactly-once is the default in Kafka, so duplicates are impossible."] },
    { id: "dist-retries-idempotency-q05", tags: ["incident", "retries"], difficulty: "advanced", kind: "scenario", prompt: "A downstream service had a 2-minute blip, but your system stayed degraded for 30 minutes. What might have happened?", expectedElements: ["retry storm", "queued retries flooding on recovery", "no backoff/jitter", "multiplied retries across layers", "circuit breaker/load shedding"], modelAnswer: "Probably a retry storm. During the blip, clients retried aggressively, possibly at several layers, multiplying load. When the service came back it was hit by all the accumulated retries plus normal traffic and fell over again, repeatedly. Fixes: capped backoff with jitter, retry at one layer only, a retry budget, circuit breakers to fail fast, and load shedding on the server.", explanation: "Classic incident pattern.", commonWrongAnswers: ["The downstream service was down for 30 minutes."] },
    { id: "dist-retries-idempotency-q06", tags: ["timeouts"], difficulty: "core", kind: "design", prompt: "How do you choose timeout values in a chain of services A → B → C?", expectedElements: ["based on latency percentiles", "inner timeouts shorter than outer", "deadline propagation", "account for retries within budget"], modelAnswer: "Base each timeout on the dependency's observed latency, for example a bit above its p99. Make inner calls time out sooner than outer ones (C's under B's, under A's), including any retries inside that budget. Better still, propagate a deadline so each service knows how much time is left and does not do work whose result will be thrown away.", explanation: "Deadline propagation is the senior insight.", commonWrongAnswers: ["Use 30 seconds everywhere."] },
    { id: "dist-retries-idempotency-q07", tags: ["queues", "debugging"], difficulty: "core", kind: "debugging", prompt: "Customers occasionally receive the same welcome email twice. The queue is at-least-once. Where is the bug?", expectedElements: ["consumer not idempotent", "crash/timeout after send before ack", "record processed message ids", "dedupe"], modelAnswer: "The consumer is not idempotent. With at-least-once delivery, a message is redelivered if the consumer crashes or times out after sending the email but before acknowledging. The fix is to record the event or message id as processed, ideally atomically with the send record, and skip ids already seen.", explanation: "The queue is working as designed; the consumer must cope.", commonWrongAnswers: ["The queue is broken; switch vendors."] },
    { id: "dist-retries-idempotency-q08", tags: ["patterns", "outbox"], difficulty: "advanced", kind: "design", prompt: "How do you save an order to the database AND publish an 'order placed' event without losing either?", expectedElements: ["dual write problem", "transactional outbox", "relay publishes", "at-least-once, idempotent consumers", "CDC alternative"], modelAnswer: "Writing to the database and then to the queue is a dual write: a crash between the two loses the event, and publishing first risks events for orders that do not exist. Use a transactional outbox: insert the order and an outbox row in the same transaction, then a relay process, or change data capture, publishes outbox rows and marks them sent. That is at-least-once, so consumers must be idempotent.", explanation: "A very common system design follow-up.", commonWrongAnswers: ["Publish the event first, then save."] },
    { id: "dist-retries-idempotency-q09", tags: ["behavioral", "incident"], difficulty: "core", kind: "behavioral", prompt: "Describe a time a retry, timeout or duplicate caused a production problem. What did you change?", expectedElements: ["STAR structure", "root cause (not just symptom)", "fix", "prevention (tests/alerts/design)"], modelAnswer: "Answer with STAR: the situation and its impact, your role, how you found the root cause (for example, logs showing duplicate request ids, or retry counts spiking), the fix (idempotency keys, backoff, a timeout change), and the prevention you added, such as a chaos test, an alert on retry rate, or a design review checklist item.", explanation: "Interviewers want ownership and prevention, not blame.", commonWrongAnswers: ["We increased the timeout and it went away."] },
  ],
  references: [
    { title: "AWS Builders' Library: Timeouts, retries, and backoff with jitter", url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/", kind: "article" },
    { title: "AWS Builders' Library: Making retries safe with idempotent APIs", url: "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/", kind: "article" },
    { title: "Stripe API reference: Idempotent requests", url: "https://docs.stripe.com/api/idempotent_requests", kind: "official-docs" },
    { title: "IETF draft: The Idempotency-Key HTTP Header Field", url: "https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/", kind: "spec" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Timeouts are ambiguous; retries need backoff; side effects need idempotency."],
  versionSpecific: ["The Idempotency-Key header is an IETF draft, not yet a final RFC.", "Each provider's idempotency key retention window differs."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
