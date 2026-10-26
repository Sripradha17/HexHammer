// Runs a web page strike's tests: builds the HTML, loads it into a sandboxed iframe, and waits
// for the page to post its results back (or kills it after 3 seconds, like the Worker runner does
// for JavaScript strikes). SAFETY: the real iframe is always created with
// sandbox="allow-scripts" and NOTHING else, so the learner's page can never read cookies, reach
// the parent page, submit a form anywhere, or open a popup. See runInFrame.ts for the actual
// load/wait/timeout/cleanup plumbing, shared with runReactTests.ts (Level 6).
import type { RunResult } from "./execute";
import { buildTestDoc } from "./buildIframeDoc";
import { runInFrame, type IframeLike } from "./runInFrame";

export const IFRAME_TIMEOUT_MS = 3000;

export type { IframeLike };

export function runIframeTests(
  learnerHtml: string,
  tests: string,
  makeFrame: () => IframeLike,
  timeoutMs: number = IFRAME_TIMEOUT_MS,
): Promise<RunResult> {
  return runInFrame(buildTestDoc(learnerHtml, tests), makeFrame, timeoutMs);
}
