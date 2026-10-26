// Builds the HTML text that goes inside the sandboxed iframe for a Level 6 (React) strike.
// Same idea as buildIframeDoc.ts (Level 4), with one addition: a <script src="/react-env.js">
// tag that loads React, ReactDOM (the react-dom/client API) and Babel standalone — a vendor
// bundle built once by apps/web/scripts/build-react-env.mjs (see that file for why React 19
// needed this instead of just dropping in a ready-made UMD build). The learner's code is real
// JSX, so it has to live inside a <script type="text/babel"> tag: Babel scans the page for these
// once DOMContentLoaded fires, transforms them, and runs them in document order.
import { REACT_HARNESS_REPORT_SCRIPT, REACT_HARNESS_SETUP_SCRIPT } from "./reactIframeHarness";

function shell(bodyScripts: string): string {
  return (
    "<!doctype html>\n" +
    '<html><head><meta charset="utf-8" /><script src="/react-env.js"></script></head><body>\n' +
    '<div id="root"></div>\n' +
    bodyScripts +
    "\n</body></html>"
  );
}

// Just the learner's component: for the live preview, while they are typing. No test harness.
export function buildReactPreviewDoc(learnerCode: string): string {
  return shell(`<script type="text/babel">\n${learnerCode}\n</script>`);
}

// Four text/babel scripts, in document order: harness setup, the learner's component, the
// lesson's tests, then a small script that reports the results. See reactIframeHarness.ts for
// why this has to be four ordered scripts instead of "wait for DOMContentLoaded" like Level 4.
export function buildReactTestDoc(learnerCode: string, tests: string): string {
  const setup = `<script type="text/babel">${REACT_HARNESS_SETUP_SCRIPT}</script>`;
  const learner = `<script type="text/babel">\n${learnerCode}\n</script>`;
  const testScript = `<script type="text/babel">\n${tests}\n</script>`;
  const report = `<script type="text/babel">${REACT_HARNESS_REPORT_SCRIPT}</script>`;
  return shell([setup, learner, testScript, report].join("\n"));
}
