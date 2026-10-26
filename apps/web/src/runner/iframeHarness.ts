// The test helper for WEB PAGE lessons (Level 4 and later Level 6), as a plain JS string.
// It runs INSIDE the sandboxed iframe, as a real <script> tag next to the learner's page, so it
// has the same test()/expect().toBe()/expect().toEqual() shape as apps/web/src/runner/testHelper.ts
// (the shared helper for every lesson), plus it can see the real, rendered `document`.
//
// Why is this a separate copy instead of importing testHelper.ts? testHelper.ts runs inside a
// Worker as compiled JS loaded by Vite. This one has to become plain TEXT we paste into an HTML
// string (see buildIframeDoc.ts), so it must not depend on TypeScript, imports or bundling.
// If you change how test()/expect() behave, change BOTH this file and testHelper.ts the same way.
export const IFRAME_HARNESS_SCRIPT = `
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
    if (error instanceof SyntaxError) return text + ". There is a typo in your code (check brackets, quotes and commas).";
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
  window.newTestRun = function () {
    var fresh = createTestHelper();
    return { test: fresh.test, expect: fresh.expect, results: fresh.results };
  };
  // Live references, read directly by our own automated "is this lesson fair?" checker
  // (see runner.test.ts). The real app never reads these: it waits for the postMessage below.
  window.__hexhammerResults = results;
  window.__hexhammerConsoleLines = consoleLines;
  window.__hexhammerFinished = function () {
    return main.finished();
  };

  var realLog = console.log, realInfo = console.info, realWarn = console.warn, realError = console.error;
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

  window.addEventListener("DOMContentLoaded", function () {
    // By the time this fires, the page's own HTML/script and the tests script (further down the
    // page) have already run once, in order, so every test() call has already been registered.
    // We only need to wait here for any ASYNC ones (a test whose body returned a promise).
    main.finished()
      .then(function () {
        parent.postMessage({ hexhammer: true, results: results, consoleLines: consoleLines, error: null }, "*");
      })
      .catch(function (error) {
        parent.postMessage({
          hexhammer: true,
          results: results,
          consoleLines: consoleLines,
          error: "Your tests crashed: " + explainError(error),
        }, "*");
      });
  });
})();
`;
