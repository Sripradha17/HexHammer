// The one tiny test helper shared by ALL lessons.
// Lessons write:   test("name", () => { expect(value).toBe(expected); });
// This file provides test(), expect().toBe() and expect().toEqual(), and remembers the results.
// A test can also be ASYNC: if the test body returns a promise, we wait for it (up to 1 second).

export interface TestResult {
  name: string;
  passed: boolean;
  message: string; // plain English. Empty when the test passed.
}

// How long one async test may wait before we say "nothing happened".
export const ASYNC_TEST_LIMIT_MS = 1000;

// Show a value the way a human would read it: "hi" in quotes, undefined as the word undefined.
export function show(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (value === undefined) return "undefined";
  if (typeof value === "function") return "a function";
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

// Are two values the same all the way down? (Used by toEqual.)
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null)
    return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) =>
    deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
  );
}

// Turn a scary JavaScript error into a friendly sentence.
export function explainError(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);

  if (error instanceof ReferenceError) {
    return `${text}. Did you spell the name right, and did you create it?`;
  }
  if (error instanceof TypeError) {
    return `${text}. Something is not the kind of thing your code expected. Is a name still undefined?`;
  }
  if (error instanceof SyntaxError) {
    return `${text}. There is a typo in your code (check brackets, quotes and commas).`;
  }
  return text;
}

// Wait for a promise, but give up after `limit` milliseconds.
function waitWithLimit(promise: Promise<unknown>, limit: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          `This test waited more than ${limit / 1000} second and nothing happened. ` +
            "Did your callback or promise ever finish?",
        ),
      );
    }, limit);

    promise.then(
      () => {
        clearTimeout(timer);
        resolve();
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function createTestHelper() {
  const results: TestResult[] = [];
  const unfinished: Promise<void>[] = []; // async tests we are still waiting for

  // Runs one test. A test passes if it finishes without throwing.
  // If the body returns a promise, the test passes when the promise resolves.
  function test(name: string, body: () => void | Promise<unknown>) {
    // Reserve this test's place in the list now, so the order never changes.
    const place = results.length;
    results.push({ name, passed: false, message: "This test did not finish." });

    const pass = () => {
      results[place] = { name, passed: true, message: "" };
    };
    const fail = (error: unknown) => {
      results[place] = { name, passed: false, message: explainError(error) };
    };

    try {
      const outcome = body();
      if (outcome && typeof (outcome as Promise<unknown>).then === "function") {
        unfinished.push(
          waitWithLimit(outcome as Promise<unknown>, ASYNC_TEST_LIMIT_MS).then(
            pass,
            fail,
          ),
        );
      } else {
        pass();
      }
    } catch (error) {
      fail(error);
    }
  }

  function expect(actual: unknown) {
    return {
      toBe(expected: unknown) {
        if (!Object.is(actual, expected)) {
          throw new Error(`I expected ${show(expected)} but got ${show(actual)}`);
        }
      },
      toEqual(expected: unknown) {
        if (!deepEqual(actual, expected)) {
          throw new Error(`I expected ${show(expected)} but got ${show(actual)}`);
        }
      },
    };
  }

  // Resolves when every async test has finished (passed, failed or timed out).
  async function finished() {
    await Promise.all(unfinished);
  }

  return { test, expect, results, finished };
}
