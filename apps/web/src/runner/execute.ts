// Runs my code plus the lesson tests, all in one go, and collects the results.
// SAFETY: this file must only ever be called from inside a Web Worker (see runner.worker.ts).
// A worker cannot touch the page, and the caller can kill it if it runs too long.
import { createTestHelper, explainError, show, type TestResult } from "./testHelper";

export interface RunResult {
  results: TestResult[];
  consoleLines: string[]; // everything my code printed with console.log
  error: string | null; // set when my code crashed BEFORE the tests could finish
  timedOut: boolean;
}

// Turn console.log(a, b, c) arguments into one line of text.
function formatArguments(args: unknown[]): string {
  return args.map((arg) => (typeof arg === "string" ? arg : show(arg))).join(" ");
}

// It is async because some tests wait for callbacks and promises.
export async function executeLesson(code: string, tests: string): Promise<RunResult> {
  const consoleLines: string[] = [];
  const helper = createTestHelper();

  // A fake console that saves lines instead of printing them.
  const fakeConsole = {
    log: (...args: unknown[]) => consoleLines.push(formatArguments(args)),
    info: (...args: unknown[]) => consoleLines.push(formatArguments(args)),
    warn: (...args: unknown[]) => consoleLines.push("Warning: " + formatArguments(args)),
    error: (...args: unknown[]) => consoleLines.push("Error: " + formatArguments(args)),
  };

  // Lessons that ask ME to write tests use this to make a fresh, separate test run.
  const newTestRun = () => {
    const fresh = createTestHelper();
    return { test: fresh.test, expect: fresh.expect, results: fresh.results };
  };

  let error: string | null = null;
  try {
    // My code comes first, then the tests, so the tests can see my functions and variables.
    // test, expect, consoleLines, console and newTestRun are handed in as ordinary named inputs.
    const run = new Function(
      "test",
      "expect",
      "consoleLines",
      "console",
      "newTestRun",
      code + "\n;\n" + tests,
    );
    run(helper.test, helper.expect, consoleLines, fakeConsole, newTestRun);
    await helper.finished(); // wait for any async tests
  } catch (caught) {
    error = "Your code crashed before the tests could finish: " + explainError(caught);
  }

  return { results: helper.results, consoleLines, error, timedOut: false };
}
