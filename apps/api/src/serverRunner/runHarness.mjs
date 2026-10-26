// The entry point for a server-runner strike (Level 5 onward). THIS FILE ITSELF is what gets
// forked as the throwaway child process (see runServerCode.ts), so a crash, an endless loop, or
// even something silly like process.exit() inside the learner's own code can never take down the
// real API server: it only ever takes down this one disposable process.
//
// argv[2] is the temp folder runServerCode.ts prepared for this one run. It holds one file it
// wrote for us: test.mjs (the lesson's tests, with the right imports already added at the top —
// including one back to the learner's own learner.mjs in the same folder). We just import it and
// report whatever the shared test helper collected, exactly like the other two runners do.
import { consoleLines, explainError, finished, results } from "./serverTestHelper.mjs";
import { pathToFileURL } from "node:url";

const dir = process.argv[2];

// Capture console.* instead of letting it print into the real API server's own terminal.
function formatArgs(args) {
  return args.map((value) => (typeof value === "string" ? value : String(value))).join(" ");
}
console.log = (...args) => consoleLines.push(formatArgs(args));
console.info = (...args) => consoleLines.push(formatArgs(args));
console.warn = (...args) => consoleLines.push("Warning: " + formatArgs(args));
console.error = (...args) => consoleLines.push("Error: " + formatArgs(args));

let reported = false;

// Sends the result back to runServerCode.ts and waits for it to actually be flushed before we
// exit, so we never race process.exit() against a message still sitting in the IPC pipe.
function send(message) {
  return new Promise((resolve) => {
    if (process.send) {
      process.send(message, () => resolve());
    } else {
      resolve(); // only happens if this file is ever run outside fork(), e.g. by hand while debugging
    }
  });
}

async function reportAndExit(error) {
  if (reported) return; // only the first crash gets reported; later ones are just noise
  reported = true;
  await send({ results, consoleLines, error });
  process.exit(error ? 1 : 0);
}

// A learner's async code can throw AFTER their test() call already returned (a stray setTimeout,
// an unawaited promise). Catch those too, instead of leaving this process to hang until the
// parent's timeout kills it.
process.on("uncaughtException", (error) => {
  void reportAndExit("Your code crashed unexpectedly: " + explainError(error));
});
process.on("unhandledRejection", (reason) => {
  void reportAndExit("Your code crashed unexpectedly (an unhandled promise rejection): " + explainError(reason));
});

try {
  await import(pathToFileURL(`${dir}/test.mjs`).href);
  await finished();
  await reportAndExit(null);
} catch (error) {
  await reportAndExit("Your code crashed before the tests could finish: " + explainError(error));
}
