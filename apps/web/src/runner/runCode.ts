// The page side of the runner: starts a worker, waits, and kills it if it takes too long.
import type { RunResult } from "./execute";

export const TIMEOUT_MS = 3000;

// Just enough of a Worker for us to use. Tests can hand in a pretend one.
export interface WorkerLike {
  postMessage(message: unknown): void;
  terminate(): void;
  onmessage: ((event: { data: RunResult }) => void) | null;
  onerror: ((event: { message?: string }) => void) | null;
}

export function runCode(
  code: string,
  tests: string,
  makeWorker: () => WorkerLike,
  timeoutMs: number = TIMEOUT_MS,
): Promise<RunResult> {
  return new Promise((resolve) => {
    const worker = makeWorker();

    // If the worker is still busy after 3 seconds (an endless loop?), kill it.
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({
        results: [],
        consoleLines: [],
        error: null,
        timedOut: true,
      });
    }, timeoutMs);

    worker.onmessage = (event) => {
      clearTimeout(timer);
      worker.terminate(); // a fresh worker for every run keeps runs from affecting each other
      resolve(event.data);
    };

    worker.onerror = (event) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({
        results: [],
        consoleLines: [],
        error: "The runner had a problem: " + (event.message ?? "unknown error"),
        timedOut: false,
      });
    };

    worker.postMessage({ code, tests });
  });
}
