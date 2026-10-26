// The test helper for REACT lessons (Level 6), as plain JS strings embedded into the sandboxed
// iframe exactly like iframeHarness.ts (Level 4). A FOURTH copy of the shared test()/expect()
// shape — see iframeHarness.ts's own note on why a copy instead of an import. If you change how
// test()/expect() behave, change testHelper.ts, iframeHarness.ts and this file the same way.
//
// Why this needs its OWN copy, not just iframeHarness.ts reused as-is: a React lesson's page
// loads React/ReactDOM/Babel standalone (see react-env.js, built by
// apps/web/scripts/build-react-env.mjs) and writes the learner's JSX inside a
// <script type="text/babel"> tag, which only Babel (not the browser) knows how to run. Babel
// transforms and runs every text/babel tag on the page in ONE pass, triggered by its own
// DOMContentLoaded listener — which means by the time ANY text/babel script's code is actually
// running, DOMContentLoaded has ALREADY fired. iframeHarness.ts's usual trick (wait for
// DOMContentLoaded, then report) would register a listener for an event that already happened,
// and never fire at all (confirmed empirically — this is not a theoretical concern).
//
// So this version splits into two pieces, each its own <script type="text/babel"> tag, with NO
// listener in between:
//   1. SETUP (first): defines test()/expect(), console capture, crash reporting — everything
//      iframeHarness.ts's setup does, MINUS the DOMContentLoaded listener.
//   2. REPORT (last, after the learner's component AND the lesson's tests have both already run,
//      in that document order): explicitly calls the same window.__hexhammerFinished() that
//      iframeHarness.ts already exposes for the Node-side fairness checker, and posts the
//      result. Nothing clever: it runs because it is literally next in line, in document order.
//
// One more real, empirically-confirmed gap this harness papers over: React's initial render does
// NOT commit synchronously inside a <script type="text/babel"> tag the way a plain DOM write
// would. A test checking the rendered output right away can run BEFORE React has actually
// committed. The fix is window.settle(), exposed here: every React lesson's test bodies should
// `await settle();` before reading the DOM, which is a short, generous, fixed wait — nothing
// fancier, because there is no reliable React-level "it's done" signal available to a page this
// sandboxed and this build-step-free.
export const REACT_HARNESS_SETUP_SCRIPT = `
(function () {
  var results = [];
  var unfinished = [];
  var consoleLines = [];

  function show(value) {
    if (typeof value === "string") return JSON.stringify(value);
    if (value === undefined) return "undefined";
    if (typeof value === "function") return "a function";
    try {
      var text = JSON.stringify(value);
      return text === undefined ? String(value) : text;
    } catch (e) {
      return String(value);
    }
  }

  function deepEqual(a, b) {
    if (Object.is(a, b)) return true;
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    var keysA = Object.keys(a);
    var keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (var i = 0; i < keysA.length; i++) {
      if (!deepEqual(a[keysA[i]], b[keysA[i]])) return false;
    }
    return true;
  }

  function explainError(error) {
    var text = error && error.message ? error.message : String(error);
    if (error instanceof ReferenceError) return text + ". Did you spell the name right, and does that element exist?";
    if (error instanceof TypeError) return text + ". Something is not the kind of thing your code expected. Did a querySelector find nothing (null)?";
    if (error instanceof SyntaxError) return text + ". There is a typo in your code (check brackets, quotes and commas, and every JSX tag is closed).";
    return text;
  }

  function waitWithLimit(promise, limit) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        reject(new Error("This test waited more than " + limit / 1000 + " second and nothing happened."));
      }, limit);
      promise.then(
        function () { clearTimeout(timer); resolve(); },
        function (error) { clearTimeout(timer); reject(error); },
      );
    });
  }

  function createTestHelper() {
    var myResults = [];
    var myUnfinished = [];

    function test(name, body) {
      var place = myResults.length;
      myResults.push({ name: name, passed: false, message: "This test did not finish." });
      function pass() { myResults[place] = { name: name, passed: true, message: "" }; }
      function fail(error) { myResults[place] = { name: name, passed: false, message: explainError(error) }; }
      try {
        var outcome = body();
        if (outcome && typeof outcome.then === "function") {
          myUnfinished.push(waitWithLimit(outcome, 1000).then(pass, fail));
        } else {
          pass();
        }
      } catch (error) {
        fail(error);
      }
    }

    function expect(actual) {
      return {
        toBe: function (expected) {
          if (!Object.is(actual, expected)) throw new Error("I expected " + show(expected) + " but got " + show(actual));
        },
        toEqual: function (expected) {
          if (!deepEqual(actual, expected)) throw new Error("I expected " + show(expected) + " but got " + show(actual));
        },
      };
    }

    function finished() { return Promise.all(myUnfinished); }
    return { test: test, expect: expect, results: myResults, finished: finished };
  }

  var main = createTestHelper();
  results = main.results;

  window.test = main.test;
  window.expect = main.expect;
  // A short, fixed wait for React to actually commit its render before a test reads the DOM.
  // See this file's top comment for why there is no better signal available here.
  window.settle = function () {
    return new Promise(function (resolve) { setTimeout(resolve, 50); });
  };
  window.newTestRun = function () {
    var fresh = createTestHelper();
    return { test: fresh.test, expect: fresh.expect, results: fresh.results };
  };
  // Live references, read directly by our own automated "is this lesson fair?" checker
  // (see runner.test.ts), AND by this file's own REPORT script, below.
  window.__hexhammerResults = results;
  window.__hexhammerConsoleLines = consoleLines;
  window.__hexhammerFinished = function () {
    return main.finished();
  };

  function formatArgs(args) {
    var parts = [];
    for (var i = 0; i < args.length; i++) {
      parts.push(typeof args[i] === "string" ? args[i] : show(args[i]));
    }
    return parts.join(" ");
  }
  console.log = function () { consoleLines.push(formatArgs(arguments)); };
  console.info = function () { consoleLines.push(formatArgs(arguments)); };
  console.warn = function () { consoleLines.push("Warning: " + formatArgs(arguments)); };
  console.error = function () { consoleLines.push("Error: " + formatArgs(arguments)); };

  window.addEventListener("error", function (event) {
    if (typeof parent !== "undefined" && parent.postMessage) {
      parent.postMessage({
        hexhammer: true,
        results: results,
        consoleLines: consoleLines,
        error: "Your page crashed before the tests could finish: " + explainError(event.error || event.message),
      }, "*");
    }
  });
})();
`;

// The LAST <script type="text/babel"> tag on the page: by the time this one actually runs, the
// learner's component (an earlier text/babel tag) and the lesson's own tests (the one right
// before this) have already run, in that document order — see this file's top comment.
export const REACT_HARNESS_REPORT_SCRIPT = `
window.__hexhammerFinished()
  .then(function () {
    parent.postMessage({ hexhammer: true, results: window.__hexhammerResults, consoleLines: window.__hexhammerConsoleLines, error: null }, "*");
  })
  .catch(function (error) {
    parent.postMessage({
      hexhammer: true,
      results: window.__hexhammerResults,
      consoleLines: window.__hexhammerConsoleLines,
      error: "Your tests crashed: " + (error && error.message ? error.message : String(error)),
    }, "*");
  });
`;
