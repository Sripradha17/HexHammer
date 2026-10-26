// Shared plumbing behind BOTH iframe-based runners (the plain web-page one in
// runIframeTests.ts, Level 4, and the React one in runReactTests.ts, Level 6): load the given,
// already-built HTML into a frame, and wait for it to either post its results back or time out.
// The two runners differ only in HOW they build that HTML (buildIframeDoc.ts vs
// buildReactDoc.ts); this part — load, wait, time out, clean up — is identical either way, so it
// lives here once (the same split Level 5's forkAndCollect.ts uses for its two runners).
import type { RunResult } from "./execute";

// Just enough of an iframe for us to use. Tests can hand in a pretend one.
export interface IframeLike {
  setSrcdoc(html: string): void;
  remove(): void;
  onResult: ((data: RunResult) => void) | null;
  onError: ((message: string) => void) | null;
}

export function runInFrame(
  testDocHtml: string,
  makeFrame: () => IframeLike,
  timeoutMs: number,
): Promise<RunResult> {
  return new Promise((resolve) => {
    const frame = makeFrame();

    // If the page never answers (an endless loop in its own script?), give up and remove it.
    const timer = setTimeout(() => {
      frame.remove();
      resolve({ results: [], consoleLines: [], error: null, timedOut: true });
    }, timeoutMs);

    frame.onResult = (data) => {
      clearTimeout(timer);
      frame.remove(); // a fresh page for every run keeps runs from affecting each other
      resolve(data);
    };

    frame.onError = (message) => {
      clearTimeout(timer);
      frame.remove();
      resolve({
        results: [],
        consoleLines: [],
        error: "The runner had a problem: " + message,
        timedOut: false,
      });
    };

    frame.setSrcdoc(testDocHtml);
  });
}
