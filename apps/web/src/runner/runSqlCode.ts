// The page side of the SQL runner (Level 5's SQL strikes): POSTs my query, the lesson's fixed
// seed data, and its tests to the API, which runs them for real against a throwaway IN-MEMORY
// database (never the app's real one) and only ever answers when the request came from this same
// computer, in development. Same RunResult shape as the other three runners, same "give up after
// a while" safety net, just over a fetch instead of Worker messages or postMessage. Structurally
// identical to runServerCode.ts; kept as its own file because it POSTs a different body shape
// (code + seedSql + tests, not just code + tests) to a different route.
import type { RunResult } from "./execute";

export const SQL_RUNNER_TIMEOUT_MS = 8000;

export async function runSqlCode(
  code: string,
  seedSql: string,
  tests: string,
  timeoutMs: number = SQL_RUNNER_TIMEOUT_MS,
  doFetch: typeof fetch = fetch,
): Promise<RunResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await doFetch("/api/run-sql-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, seedSql, tests }),
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
      error: "Could not reach the SQL runner: " + String(error),
      timedOut: false,
    };
  }
}
