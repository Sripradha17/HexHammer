// Builds the HTML text that goes inside the sandboxed iframe for a web page strike.
// Kept as plain string-building (no DOM needed), so it is easy to unit test.
import { IFRAME_HARNESS_SCRIPT } from "./iframeHarness";

// The learner's code is a fragment: whatever would sit inside <body>. It may freely include its
// own <style> and <script> tags. We wrap it in a minimal shell so nobody has to type
// <!doctype html> or <head> just to draw a box on the screen.
function shell(bodyContent: string, extraScript: string): string {
  return (
    "<!doctype html>\n" +
    '<html><head><meta charset="utf-8" /></head><body>\n' +
    bodyContent +
    "\n" +
    extraScript +
    "\n</body></html>"
  );
}

// Just the learner's page: for the live preview, while they are typing. No test harness at all.
export function buildPreviewDoc(learnerHtml: string): string {
  return shell(learnerHtml, "");
}

// The learner's page PLUS the test harness PLUS the lesson's tests, appended as one more
// <script> at the very end of <body>. Because browsers run inline scripts in document order,
// the learner's own script (if any) has already run by the time the tests do.
export function buildTestDoc(learnerHtml: string, tests: string): string {
  const harness = "<script>" + IFRAME_HARNESS_SCRIPT + "</script>";
  const testScript = "<script>\n" + tests + "\n</script>";
  return shell(learnerHtml, harness + "\n" + testScript);
}
