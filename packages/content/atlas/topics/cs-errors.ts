// Topic: Exceptions and error handling. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csErrors: Topic = {
  id: "cs-errors",
  domainId: "",
  moduleId: "",
  title: "Exceptions and error handling",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Throw errors deliberately and catch them with try / catch / finally.",
    "Read an error message and stack trace to find where and why code failed.",
    "Create custom error types that carry useful context.",
    "Decide when to fail fast and when to recover, and never swallow errors silently.",
  ],
  prerequisites: ["cs-functions-scope"],
  subtopics: ["throw and Error objects", "try / catch / finally", "Reading a stack trace", "Custom error classes and cause", "Errors in async code", "Fail fast vs recover", "Swallowed errors"],
  strikeIds: ["l2-s10"],

  story:
    "A payment page shows 'Order placed!' while the card was never charged. Somewhere, a `catch {}` with nothing inside caught the failure and threw it away. Weeks later, support finds hundreds of unpaid orders and no log line to explain them. Errors are not the enemy; HIDDEN errors are. Good error handling makes failures loud, specific and recoverable where it makes sense.",
  mentalModel: {
    plain:
      "When something goes wrong, code can `throw` an error. The error flies up through the functions that called each other, skipping their remaining lines, until a `try / catch` catches it. If nothing catches it, the program (or request) crashes with a message and a stack trace showing the path it took.",
    analogy:
      "A fire alarm in a tall building. Throwing is pulling the alarm on floor 7. Each floor above can either deal with it (catch) or let the alarm keep ringing upward. If no floor handles it, the whole building evacuates (the program crashes). Ripping the alarm off the wall (an empty catch) makes the building quiet, not safe.",
    analogyLimit:
      "Errors thrown inside asynchronous callbacks or rejected promises do not travel up the same way: they need await inside try, or .catch on the promise, or they become 'unhandled rejections'.",
  },
  lessonSections: [
    {
      heading: "1. Throwing on purpose",
      body:
        "`throw new Error(\"Quantity must be at least 1\")` stops the current function immediately and starts the error's journey upwards.\n\nThrow when a function cannot do its job with the input it got. A clear message says what was wrong and what was expected. Always throw Error objects (not plain strings): they carry a stack trace.",
    },
    {
      heading: "2. try, catch, finally",
      body:
        "Code inside `try { }` runs normally. If anything in it throws, JavaScript jumps straight to `catch (error) { }`.\n\n`finally { }` runs afterwards whether there was an error or not: the place to close a file, stop a loading spinner or release a lock.\n\nOnly wrap the code you have a plan for. A try around 200 lines hides which line failed.",
    },
    {
      heading: "3. Reading the stack trace",
      body:
        "An uncaught error prints a message and a stack trace: a list of the functions that were running, newest first, each with a file name and line number.\n\nRead the message first (what went wrong), then the TOP line that points into YOUR code (where). The lines below show who called it (how you got there).\n\n`TypeError: Cannot read properties of undefined (reading 'name')` means you did `something.name` while something was undefined.",
    },
    {
      heading: "4. Custom errors carry context",
      body:
        "`class ValidationError extends Error { constructor(field, message) { super(message); this.name = \"ValidationError\"; this.field = field; } }`\n\nNow callers can react to the KIND of failure: `if (err instanceof ValidationError)` show the message next to the field; anything else, show a generic 'something went wrong' and log the details.\n\nWhen you catch and rethrow, keep the original: `throw new Error(\"Could not load profile\", { cause: err })`.",
    },
    {
      heading: "5. Errors in async code",
      body:
        "A rejected promise is the async version of a throw. Inside an async function, `await` turns a rejection back into a throw, so normal try / catch works: `try { await fetchUser() } catch (e) { ... }`.\n\nWithout await, the error escapes the try block. Note too that fetch does NOT reject on HTTP 404 or 500: check `response.ok` yourself and throw.",
    },
    {
      heading: "6. Fail fast, recover wisely, never swallow",
      body:
        "Fail fast on programmer mistakes and bad configuration: crash early with a clear message (a missing DATABASE_URL at startup).\n\nRecover from expected, temporary problems: retry a timed-out request, show 'please try again', fall back to cached data.\n\nNever write `catch (e) {}`. If you truly decide to ignore an error, log it and write a comment saying why.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "Error flow is learned by tracing which lines run: the predict exercise follows try / catch / finally line by line, and the Error handling strike has you throw, catch and design a custom error with tests.",
  codeExamples: [
    {
      title: "Throw, catch, finally and a custom error",
      language: "js",
      code: `class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

function parseQuantity(text) {
  const n = Number(text);
  if (!Number.isInteger(n) || n < 1) {
    throw new ValidationError("quantity", "Quantity must be a whole number of at least 1");
  }
  return n;
}

for (const input of ["3", "zero"]) {
  try {
    console.log("ok:", parseQuantity(input));
  } catch (err) {
    if (err instanceof ValidationError) console.log("fix " + err.field + ": " + err.message);
    else throw err;
  } finally {
    console.log("checked", input);
  }
}`,
      expectedOutput: `ok: 3
checked 3
fix quantity: Quantity must be a whole number of at least 1
checked zero`,
      steps: [
        "\"3\" converts to 3, a whole number of at least 1, so parseQuantity returns 3 and the try block logs it. finally then logs 'checked 3'.",
        "\"zero\" converts to NaN, which is not an integer, so parseQuantity throws a ValidationError. The rest of the try block is skipped.",
        "catch receives the error. It is a ValidationError, so it shows a friendly message using the field name. Any other kind of error would be rethrown, not hidden.",
        "finally runs again, error or not, and logs 'checked zero'.",
      ],
    },
  ],
  practicalApplication:
    "In a web API, validation errors become 400 responses with a clear message, missing records become 404, and unexpected errors become a logged 500 with a generic message (never the stack trace sent to the user). Central error-handling middleware does this mapping in one place. In the UI, error boundaries catch rendering failures so one broken widget does not blank the whole page. In code reviews, empty catch blocks and catch-and-log-only around money or data changes are red flags.",
  commonMistakes: [
    {
      mistake: "An empty catch block.",
      symptom: "Something fails and nothing is logged; the app carries on with bad data.",
      fix: "Handle the error properly, or rethrow it. If ignoring it is truly right, log it and comment why.",
    },
    {
      mistake: "Wrapping an async call in try without await.",
      symptom: "The catch never runs and you see 'UnhandledPromiseRejection' instead.",
      fix: "await the promise inside the try, or attach .catch() to it.",
    },
    {
      mistake: "Throwing strings instead of Error objects.",
      symptom: "No stack trace, so you cannot see where the problem started.",
      fix: "Always throw new Error(...) or a subclass of Error.",
    },
    {
      mistake: "Assuming fetch throws on 404 or 500.",
      symptom: "Error pages are parsed as data and cause confusing failures later.",
      fix: "Check response.ok and throw an error that includes the status code.",
    },
  ],
  misconceptions: [
    { myth: "Catching every error makes code more robust.", truth: "Catching errors you cannot handle hides bugs. Catch only where you can do something useful; let the rest reach a top-level handler that logs them." },
    { myth: "finally only runs when there was an error.", truth: "finally runs every time: after success, after a caught error, and even when the try block returns." },
    { myth: "A try / catch around a callback catches errors thrown later inside it.", truth: "try only covers code that runs during the try. A setTimeout callback or a promise that rejects later is outside it unless you await it." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l2-s10", why: "Throw, catch and design a custom error type by hand, with tests for each path." },
    {
      kind: "predict",
      question: {
        id: "cs-errors-p1",
        prompt: "What does this print?",
        code: `function run() {
  try {
    console.log("A");
    throw new Error("boom");
    console.log("B");
  } catch (e) {
    console.log("C " + e.message);
    return "D";
  } finally {
    console.log("E");
  }
}
console.log(run());`,
        choices: ["A B C boom D E", "A C boom E D", "A C boom D E", "A C boom D"],
        answerIndex: 1,
        explanation: "A prints, the throw skips B, the catch prints \"C boom\" and prepares to return \"D\". finally still runs before the function actually returns, printing E. Only then does console.log(run()) print D.",
        objective: 0,
      },
    },
    {
      kind: "debug",
      question: {
        id: "cs-errors-d1",
        prompt: "Users say saving their profile 'works' but nothing is saved. What is the bug?",
        code: `async function saveProfile(profile) {
  try {
    api.post("/profile", profile);
    showToast("Saved!");
  } catch (err) {
    showToast("Could not save");
  }
}`,
        choices: [
          "showToast should be inside finally",
          "The post is not awaited, so the try finishes immediately and a later failure is never caught",
          "catch should rethrow",
          "async functions cannot use try / catch",
        ],
        answerIndex: 1,
        explanation: "Without await, api.post starts and the function moves straight on to 'Saved!'. If the request fails later, the rejection is outside the try. `await api.post(...)` makes the catch work (and the toast honest).",
        objective: 3,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-errors-k1",
      prompt: "In a stack trace, which line usually tells you where to start looking?",
      choices: ["The last line", "The first line that points into your own code", "Any line inside node_modules", "The line with the longest file path"],
      answerIndex: 1,
      explanation: "Stack traces list the newest call first. Library frames show where it surfaced; the first frame in YOUR code shows what you called and with what.",
      objective: 1,
    },
    {
      id: "cs-errors-k2",
      prompt: "When does a finally block run?",
      choices: ["Only after an error", "Only when there is no error", "Always, after the try (and catch, if any) finish", "Only if catch rethrows"],
      answerIndex: 2,
      explanation: "finally is for cleanup that must happen no matter what: closing files, stopping spinners, releasing locks.",
      objective: 0,
    },
  ],
  project: {
    title: "Safe Importer: a CSV importer that reports every bad row clearly",
    summary: "Build an importer for a customer CSV that validates every row, collects precise errors with row numbers, imports the good rows and never fails silently.",
    type: "implementation",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "Parse a CSV of customers (name, email, age) into objects.",
      "A ValidationError class with row and field properties, thrown by a validateRow function.",
      "Import valid rows, collect every invalid row's error, and return a report { imported, failed: [{ row, field, message }] }.",
      "Unexpected errors (a broken file) stop the import with a clear message that includes the original cause.",
    ],
    acceptanceCriteria: [
      "A test with 5 rows (2 bad) imports 3 and reports 2 errors with correct row numbers and fields.",
      "A test shows an unreadable file throws an Error whose cause is the original error.",
      "No empty catch blocks in the codebase (a test or lint rule checks this).",
      "The report message for each bad row says what was expected, e.g. 'age must be a whole number from 0 to 130'.",
    ],
    technologies: ["Node.js or TypeScript", "Vitest"],
    milestones: [
      { title: "Parse", done_when: "CSV text becomes an array of row objects; tested with quoted commas." },
      { title: "Validate", done_when: "validateRow throws ValidationError with row and field; tests per rule." },
      { title: "Report", done_when: "Good rows import, bad rows are reported, nothing is swallowed." },
      { title: "Unexpected failures", done_when: "File errors fail fast with { cause } preserved." },
    ],
    testIdeas: ["Empty file", "Header only", "Duplicate emails", "Age \"forty\"", "Extra columns"],
    stretchGoals: ["Stream large files row by row", "Write failed rows to an errors.csv the user can fix and re-import"],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      {
        id: "cs-errors-a1",
        prompt: "What does `throw` do?",
        choices: ["Logs a warning and continues", "Stops the current function and sends the error up to the nearest catch", "Restarts the program", "Returns undefined"],
        answerIndex: 1,
        explanation: "throw immediately stops normal execution. The error travels up through the calling functions until a catch handles it, or the program crashes.",
        objective: 0,
      },
      {
        id: "cs-errors-a2",
        prompt: "What does this error message mean?",
        code: `TypeError: Cannot read properties of undefined (reading 'email')
    at sendWelcome (mailer.js:12:24)
    at signUp (users.js:40:3)`,
        choices: [
          "The email address is invalid",
          "On line 12 of mailer.js, code did X.email while X was undefined; it was called from signUp",
          "users.js line 40 has a typo in 'email'",
          "The mail server is down",
        ],
        answerIndex: 1,
        explanation: "The message says what (reading .email of undefined), the top frame says where (mailer.js:12), and the next frame says how you got there (signUp called it).",
        objective: 1,
      },
      {
        id: "cs-errors-a3",
        prompt: "Why create a custom error class like ValidationError?",
        choices: [
          "Custom errors are faster",
          "So callers can tell kinds of failure apart and use extra context such as the field name",
          "Because the built-in Error cannot have a message",
          "To hide the stack trace",
        ],
        answerIndex: 1,
        explanation: "A specific class lets code react differently (show a form message for a ValidationError, a generic message for anything else) and carries useful data like the field.",
        objective: 2,
      },
      {
        id: "cs-errors-a4",
        prompt: "The app starts without its DATABASE_URL setting. What should it do?",
        choices: [
          "Start anyway and fail on the first request",
          "Catch the error and use an empty string",
          "Fail fast at startup with a clear message naming the missing setting",
          "Retry forever",
        ],
        answerIndex: 2,
        explanation: "Missing configuration is not a temporary problem. Crashing immediately with a clear message is far easier to diagnose than random failures later.",
        objective: 3,
      },
      {
        id: "cs-errors-a5",
        prompt: "What is wrong with `catch (e) {}`?",
        choices: [
          "Nothing, it keeps the app running",
          "It is a syntax error",
          "It hides the failure: nothing is logged and the program carries on as if it succeeded",
          "It catches too few errors",
        ],
        answerIndex: 2,
        explanation: "A swallowed error removes the evidence. Handle it, rethrow it, or at the very least log it with a comment explaining why ignoring it is safe.",
        objective: 3,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-errors-q01", tags: ["errors"], difficulty: "foundation", kind: "concept",
      prompt: "How does try / catch / finally work?",
      expectedElements: ["try runs normally", "a throw jumps to catch", "finally always runs", "use for cleanup"],
      modelAnswer: "Code in try runs normally. If anything in it throws, execution jumps straight to catch, which receives the error. finally runs afterwards in every case, success or failure, even if try or catch returned, so it is the place for cleanup like closing a connection or hiding a spinner.",
      explanation: "Mentioning that finally runs even after return is the common follow-up.",
      commonWrongAnswers: ["finally only runs after an error."],
    },
    {
      id: "cs-errors-q02", tags: ["errors", "async"], difficulty: "core", kind: "debugging",
      prompt: "Why does this catch block never run when the request fails?",
      code: `try {
  fetch("/api/orders").then((r) => r.json());
} catch (e) {
  showError(e);
}`,
      expectedElements: ["promise not awaited", "try finishes before the request fails", "await inside try or .catch", "fetch does not reject on HTTP errors"],
      modelAnswer: "The try only covers the moment fetch is called. The promise rejects later, after the try block has finished, so the catch never sees it. I would use an async function with await inside the try, or add .catch() to the chain. I would also check response.ok, because fetch only rejects on network failures, not on 404 or 500.",
      explanation: "Two bugs in one: async scope and fetch semantics.",
      commonWrongAnswers: ["fetch does not throw errors at all."],
    },
    {
      id: "cs-errors-q03", tags: ["errors", "design"], difficulty: "core", kind: "design",
      prompt: "When should code fail fast, and when should it try to recover?",
      expectedElements: ["fail fast on bugs and bad config", "recover from expected transient problems", "retries with limits", "user-facing fallback"],
      modelAnswer: "I fail fast when continuing would be wrong or misleading: programmer bugs, broken invariants and missing configuration at startup, because a loud early crash is easiest to diagnose. I recover from expected, often temporary, problems: a timeout I can retry with a limit and backoff, a missing optional feature I can hide, or a validation error I can show next to the field. The key is that recovery is a deliberate decision, not a reflex.",
      explanation: "A good answer gives one example of each side.",
      commonWrongAnswers: ["Always catch everything so users never see errors."],
    },
    {
      id: "cs-errors-q04", tags: ["errors", "debugging"], difficulty: "foundation", kind: "concept",
      prompt: "Walk me through how you read a stack trace.",
      expectedElements: ["read the message first", "frames are newest first", "find the first frame in your code", "look at the inputs at that point"],
      modelAnswer: "I read the message first, because it says what went wrong. Then I look at the frames, which are newest first, and find the top one that points into my own code rather than a library; that is where my code passed something bad or used a missing value. The frames below show how execution got there. Then I reproduce it and inspect the values at that line.",
      explanation: "Interviewers want a systematic method, not 'I google the error'.",
      commonWrongAnswers: ["I start from the bottom line."],
    },
    {
      id: "cs-errors-q05", tags: ["errors", "custom-errors"], difficulty: "core", kind: "implementation",
      prompt: "How would you design error types for a REST API?",
      expectedElements: ["base AppError with status and code", "subclasses: ValidationError 400, NotFoundError 404, etc.", "central error middleware maps to responses", "unexpected errors: log and return generic 500"],
      modelAnswer: "I would make a base AppError with a status code and a machine-readable code, and subclasses such as ValidationError (400, with field details), NotFoundError (404) and ConflictError (409). Route handlers throw these. One central error-handling middleware turns them into JSON responses. Anything that is not an AppError is unexpected: it gets logged with the stack trace and a request id, and the client receives a generic 500 without internal details.",
      explanation: "Central mapping and never leaking stack traces are the key points.",
      commonWrongAnswers: ["Return 200 with an error field for everything."],
    },
    {
      id: "cs-errors-q06", tags: ["errors", "code-review"], difficulty: "foundation", kind: "scenario",
      prompt: "In a code review you see `catch (e) { console.log(e) }` around a payment call. What do you say?",
      expectedElements: ["the caller thinks payment succeeded", "must not continue as success", "rethrow or return a failure", "user must be told", "monitoring/alerting"],
      modelAnswer: "Logging is not handling. After the catch, the code continues as if the payment worked, so an order could be created without money. I would ask for the error to be rethrown or turned into an explicit failure result the caller must check, for the user to see a clear message, and for payment failures to be reported to monitoring rather than only a console log.",
      explanation: "Reviewers are judged on spotting consequences, not syntax.",
      commonWrongAnswers: ["Looks fine, the error is logged."],
    },
    {
      id: "cs-errors-q07", tags: ["errors", "cause"], difficulty: "core", kind: "concept",
      prompt: "When you catch an error and throw a new, more meaningful one, how do you avoid losing information?",
      expectedElements: ["Error cause option", "keep original stack", "add context in the new message", "logs show the chain"],
      modelAnswer: "I pass the original error as the cause: throw new Error(\"Could not load profile 42\", { cause: err }). The new message adds context about what we were doing, while the cause keeps the original message and stack, and logging tools show the whole chain.",
      explanation: "Error cause (ES2022) is the modern, standard answer.",
      commonWrongAnswers: ["Copy err.message into the new error's message."],
    },
    {
      id: "cs-errors-q08", tags: ["errors", "ui"], difficulty: "core", kind: "concept",
      prompt: "What should a user see when something fails, versus what should be logged?",
      expectedElements: ["user: clear, kind, actionable message", "no stack traces or internals to users", "logs: details, stack, request id, context", "correlation id shared"],
      modelAnswer: "The user should see a short, honest message that says what happened and what they can do, such as 'We could not save your changes. Please try again.', plus a reference id. They should never see stack traces, SQL or internal paths, which are confusing and a security risk. The logs get the full details: the error, its stack and cause, the request id and relevant context, so support can match the user's reference id to the log.",
      explanation: "Linking the two with a reference id is what experienced engineers do.",
      commonWrongAnswers: ["Show the full error so users can report it."],
    },
  ],
  references: [
    { title: "MDN: try...catch", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch", kind: "official-docs" },
    { title: "MDN: Error (including cause)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error", kind: "official-docs" },
    { title: "Node.js docs: Errors", url: "https://nodejs.org/api/errors.html", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Fail fast versus recover, never swallowing errors, and reading stack traces apply in every language."],
  versionSpecific: ["The Error cause option arrived in ES2022; fetch's 'no reject on HTTP errors' behaviour is specific to the Fetch API."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
