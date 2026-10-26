// The page side of the SERVER runner (Level 5 and later): POSTs my code and the lesson's tests
// to the API, which runs them for real in a throwaway local Node process (see
// apps/api/src/serverRunner) and only ever answers when the request came from this same
// computer, in development. Same RunResult shape as the other two runners (runCode.ts,
// runIframeTests.ts), and the same "give up after a while" safety net, just over a fetch instead
// of Worker messages or postMessage.
import type { RunResult } from "./execute";

// A real Express app plus a fresh Node process are slower to start than a Worker or an iframe,
// so this gets a bit more time than the other two runners' 3 seconds.
export const SERVER_RUNNER_TIMEOUT_MS = 8000;

export async function runServerCode(
  code: string,
  tests: string,
  timeoutMs: number = SERVER_RUNNER_TIMEOUT_MS,
  doFetch: typeof fetch = fetch,
): Promise<RunResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await doFetch("/api/run-server-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, tests }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        results: [],
        consoleLines: [],
        error: (data as { error?: string }).error ?? `The runner had a problem (${response.status}).`,
        timedOut: false,
      };
    }
    const data = (await response.json()) as RunResult;
    return { ...data, timedOut: false };
  } catch (error) {
    clearTimeout(timer);
    if (error instanceof DOMException && error.name === "AbortError") {
      return { results: [], consoleLines: [], error: null, timedOut: true };
    }
    return {
      results: [],
      consoleLines: [],
      error: "Could not reach the server runner: " + String(error),
      timedOut: false,
    };
  }
}
