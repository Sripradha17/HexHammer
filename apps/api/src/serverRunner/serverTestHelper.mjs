// The test helper for SERVER lessons (Level 5 onward), as a plain Node ESM module.
// It runs inside a forked, throwaway Node child process (see runServerCode.ts / runHarness.mjs),
// so it has the same test()/expect().toBe()/expect().toEqual() shape as testHelper.ts (Worker
// lessons, apps/web/src/runner/testHelper.ts) and iframeHarness.ts (web page lessons), plus real
// HTTP calls against the Express app the learner's own code builds, via supertest's `request()`.
//
// Why a THIRD copy instead of importing testHelper.ts? testHelper.ts is TypeScript, bundled by
// Vite for the browser. This one runs as plain Node ESM with no bundler at all. If you change how
// test()/expect() behave, change all three copies (testHelper.ts, iframeHarness.ts, this file)
// the same way.

// A real HTTP round trip through Express, in a freshly started Node process, is slower than an
// in-memory Worker promise, so this async limit is more generous than the browser's 1 second.
const ASYNC_TEST_LIMIT_MS = 3000;

export const results = [];
export const consoleLines = [];
const unfinished = []; // async tests we are still waiting for

function show(value) {
  if (typeof value === "string") return JSON.stringify(value);
  if (value === undefined) return "undefined";
  if (typeof value === "function") return "a function";
  try {
    const text = JSON.stringify(value);
    return text === undefined ? String(value) : text;
  } catch {
    return String(value);
  }
}

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => deepEqual(a[key], b[key]));
}

export function explainError(error) {
  const text = error instanceof Error ? error.message : String(error);
  if (error instanceof ReferenceError) return `${text}. Did you spell the name right, and did you create it?`;
  if (error instanceof TypeError) return `${text}. Something is not the kind of thing your code expected.`;
  if (error instanceof SyntaxError) return `${text}. There is a typo in your code (check brackets, quotes and commas).`;
  return text;
}

function waitWithLimit(promise, limit) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`This test waited more than ${limit / 1000} seconds and nothing happened.`));
    }, limit);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

// Runs one test. A test passes if it finishes without throwing.
// If the body returns a promise (almost every server test does, since a real HTTP request takes
// time), the test passes when the promise resolves.
export function test(name, body) {
  const place = results.length;
  results.push({ name, passed: false, message: "This test did not finish." });

  const pass = () => {
    results[place] = { name, passed: true, message: "" };
  };
  const fail = (error) => {
    results[place] = { name, passed: false, message: explainError(error) };
  };

  try {
    const outcome = body();
    if (outcome && typeof outcome.then === "function") {
      unfinished.push(waitWithLimit(outcome, ASYNC_TEST_LIMIT_MS).then(pass, fail));
    } else {
      pass();
    }
  } catch (error) {
    fail(error);
  }
}

export function expect(actual) {
  return {
    toBe(expected) {
      if (!Object.is(actual, expected)) {
        throw new Error(`I expected ${show(expected)} but got ${show(actual)}`);
      }
    },
    toEqual(expected) {
      if (!deepEqual(actual, expected)) {
        throw new Error(`I expected ${show(expected)} but got ${show(actual)}`);
      }
    },
  };
}

// Resolves when every async test has finished (passed, failed or timed out).
export async function finished() {
  await Promise.all(unfinished);
}
