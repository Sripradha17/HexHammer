// Runs a Level 6 (React) strike's tests: same sandboxed-iframe safety as runIframeTests.ts
// (sandbox="allow-scripts" and nothing else), just built with buildReactDoc.ts instead, which
// loads React/ReactDOM/Babel standalone first. A more generous timeout than the other two
// in-browser runners: a learner's very first run has to download a real (if cached-after-that)
// ~3MB vendor script before anything else can even start.
import type { RunResult } from "./execute";
import { buildReactTestDoc } from "./buildReactDoc";
import { runInFrame, type IframeLike } from "./runInFrame";

export const REACT_TIMEOUT_MS = 6000;

export function runReactTests(
  learnerCode: string,
  tests: string,
  makeFrame: () => IframeLike,
  timeoutMs: number = REACT_TIMEOUT_MS,
): Promise<RunResult> {
  return runInFrame(buildReactTestDoc(learnerCode, tests), makeFrame, timeoutMs);
}
