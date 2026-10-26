// Tests for the code runner, the shared test helper, and the Level 1 lesson content.
import { describe, expect, it } from "vitest";
import {
  allLessons,
  interviewPacks,
  level1InterviewPack,
  level1Lessons,
  level2Lessons,
  level3Lessons,
  dsaLessons,
  level4Lessons,
  level5Lessons,
  level6Lessons,
  professionalLessons,
} from "@hexhammer/content";
import { Window } from "happy-dom";
import { executeLesson, type RunResult } from "./execute";
import { runCode, type WorkerLike } from "./runCode";
import { buildPreviewDoc, buildTestDoc } from "./buildIframeDoc";
import { runIframeTests, type IframeLike } from "./runIframeTests";
import { runServerCode } from "./runServerCode";
import type { Lesson } from "@hexhammer/content";
import type { TestResult } from "./testHelper";

describe("executeLesson (the code that runs inside the worker)", () => {
  it("passes when my code satisfies the tests and captures console.log", async () => {
    const code = 'console.log("hi", 2); function two() { return 2; }';
    const tests =
      'test("two", () => { expect(two()).toBe(2); }); test("log", () => { expect(consoleLines[0]).toBe("hi 2"); });';
    const run = await executeLesson(code, tests);
    expect(run.error).toBeNull();
    expect(run.results.map((r) => r.passed)).toEqual([true, true]);
    expect(run.consoleLines).toEqual(["hi 2"]);
  });

  it("gives a plain-English message when toBe fails", async () => {
    const run = await executeLesson("", 'test("x", () => { expect(1 + 1).toBe(3); });');
    expect(run.results[0].passed).toBe(false);
    expect(run.results[0].message).toBe("I expected 3 but got 2");
  });

  it("supports toEqual for arrays and objects", async () => {
    const tests = `
      test("same", () => { expect({ a: [1, 2] }).toEqual({ a: [1, 2] }); });
      test("different", () => { expect([1, 2]).toEqual([1, 3]); });`;
    const run = await executeLesson("", tests);
    expect(run.results.map((r) => r.passed)).toEqual([true, false]);
  });

  it("turns a missing name into a friendly failure instead of crashing", async () => {
    const run = await executeLesson("", 'test("x", () => { expect(missing).toBe(1); });');
    expect(run.results[0].passed).toBe(false);
    expect(run.results[0].message).toContain("missing is not defined");
  });

  it("waits for an async test that returns a promise", async () => {
    const tests =
      'test("later", () => new Promise((resolve) => setTimeout(resolve, 20)));';
    const run = await executeLesson("", tests);
    expect(run.results.map((r) => r.passed)).toEqual([true]);
  });

  it("fails an async test when the promise rejects, keeping the test order", async () => {
    const tests = [
      'test("first", () => {});',
      'test("second", () => Promise.reject(new Error("nope")));',
      'test("third", () => {});',
    ].join("\n");
    const run = await executeLesson("", tests);
    expect(run.results.map((r) => r.passed)).toEqual([true, false, true]);
    expect(run.results[1].message).toBe("nope");
  });

  it("gives up on an async test that never finishes", async () => {
    const run = await executeLesson("", 'test("stuck", () => new Promise(() => {}));');
    expect(run.results[0].passed).toBe(false);
    expect(run.results[0].message).toContain("nothing happened");
  });

  it("lets a lesson run a learner's own tests with newTestRun", async () => {
    const code =
      "function myTests(test, expect) { test('one', () => { expect(1).toBe(1); }); }";
    const tests = [
      'test("the learner tests ran and passed", () => {',
      "  const run = newTestRun();",
      "  myTests(run.test, run.expect);",
      "  expect(run.results.length).toBe(1);",
      "  expect(run.results[0].passed).toBe(true);",
      "});",
    ].join("\n");
    const run = await executeLesson(code, tests);
    expect(run.results.map((r) => r.passed)).toEqual([true]);
  });

  it("reports a syntax error in my code", async () => {
    const run = await executeLesson("function (", 'test("x", () => {});');
    expect(run.error).toContain("typo");
  });
});

// A pretend worker. It never answers, like code stuck in an endless loop.
function makeHungWorker() {
  const state = { terminated: false };
  const worker: WorkerLike = {
    postMessage() {},
    terminate() {
      state.terminated = true;
    },
    onmessage: null,
    onerror: null,
  };
  return { worker, state };
}

describe("runCode (the page side, with the 3 second timeout)", () => {
  it("terminates the worker and reports a timeout when it never answers", async () => {
    const { worker, state } = makeHungWorker();
    const result = await runCode("while(true){}", "", () => worker, 50);
    expect(result.timedOut).toBe(true);
    expect(state.terminated).toBe(true);
  });

  it("returns the worker's answer when it replies in time", async () => {
    const answer: RunResult = {
      results: [],
      consoleLines: ["ok"],
      error: null,
      timedOut: false,
    };
    const worker: WorkerLike = {
      postMessage() {
        setTimeout(() => worker.onmessage?.({ data: answer }), 0);
      },
      terminate() {},
      onmessage: null,
      onerror: null,
    };
    expect(await runCode("", "", () => worker, 500)).toEqual(answer);
  });
});

// Runs a web page (iframe) lesson's HTML + tests in a plain Node DOM, entirely for our OWN
// automated "is this lesson fair?" check. The real app never uses this: it uses a real sandboxed
// iframe in the browser (see createTestFrame.ts). This reads the harness's own live result
// arrays directly (see the __hexhammer... globals at the end of iframeHarness.ts), so it does not
// depend on postMessage or on DOMContentLoaded timing inside the Node DOM library.
async function runIframeLessonInDom(
  learnerHtml: string,
  tests: string,
): Promise<TestResult[]> {
  const win = new Window({
    url: "http://localhost/",
    settings: {
      enableJavaScriptEvaluation: true,
      suppressInsecureJavaScriptEnvironmentWarning: true,
    },
  });
  const doc = win.document;
  doc.write(buildTestDoc(learnerHtml, tests));
  doc.close();
  const harness = win as unknown as {
    __hexhammerFinished?: () => Promise<unknown>;
    __hexhammerResults?: TestResult[];
  };
  if (typeof harness.__hexhammerFinished === "function") {
    await harness.__hexhammerFinished();
  }
  const results = harness.__hexhammerResults ?? [];
  await win.happyDOM.close();
  return results;
}

// A lesson's starter/solution code, run the right way for its runner (a worker-style JS lesson,
// or a web page lesson rendered in a Node DOM), returning a common shape for the fairness checks.
async function runLessonCode(
  lesson: Lesson,
  code: string,
): Promise<{ results: TestResult[]; error: string | null }> {
  if (lesson.runner === "iframe") {
    const results = await runIframeLessonInDom(code, lesson.tests);
    return { results, error: null };
  }
  const run = await executeLesson(code, lesson.tests);
  return { results: run.results, error: run.error };
}

describe("buildIframeDoc (the HTML built for a web page strike)", () => {
  it("the live preview has no test harness at all", () => {
    const doc = buildPreviewDoc("<p>hi</p>");
    expect(doc).toContain("<p>hi</p>");
    expect(doc).not.toContain("__hexhammerResults");
  });

  it("the test document has the learner's HTML, the harness, and the tests, in that order", () => {
    const doc = buildTestDoc("<p>hi</p>", 'test("x", () => {});');
    const pIndex = doc.indexOf("<p>hi</p>");
    const harnessIndex = doc.indexOf("__hexhammerResults");
    const testIndex = doc.indexOf('test("x"');
    expect(pIndex).toBeGreaterThan(-1);
    expect(harnessIndex).toBeGreaterThan(pIndex);
    expect(testIndex).toBeGreaterThan(harnessIndex);
  });
});

// A pretend iframe. It never answers, like a page stuck in an endless loop.
function makeHungFrame() {
  const state = { removed: false };
  const frame: IframeLike = {
    setSrcdoc() {},
    remove() {
      state.removed = true;
    },
    onResult: null,
    onError: null,
  };
  return { frame, state };
}

describe("runIframeTests (the page side, with the 3 second timeout)", () => {
  it("removes the iframe and reports a timeout when the page never answers", async () => {
    const { frame, state } = makeHungFrame();
    const result = await runIframeTests("<p>stuck</p>", "", () => frame, 50);
    expect(result.timedOut).toBe(true);
    expect(state.removed).toBe(true);
  });

  it("returns the page's answer when it replies in time", async () => {
    const answer: RunResult = {
      results: [{ name: "x", passed: true, message: "" }],
      consoleLines: ["hi"],
      error: null,
      timedOut: false,
    };
    const frame: IframeLike = {
      setSrcdoc() {
        setTimeout(() => frame.onResult?.(answer), 0);
      },
      remove() {},
      onResult: null,
      onError: null,
    };
    expect(await runIframeTests("", "", () => frame, 500)).toEqual(answer);
  });

  it("really runs a page's HTML and tests in a Node DOM (the same trick the fairness checks use)", async () => {
    const html = '<div id="box" style="display:flex"></div>';
    const tests =
      'test("is flex", () => { expect(getComputedStyle(document.getElementById("box")).display).toBe("flex"); });' +
      'test("is not grid", () => { expect(getComputedStyle(document.getElementById("box")).display).toBe("grid"); });';
    const results = await runIframeLessonInDom(html, tests);
    expect(results.map((r) => r.passed)).toEqual([true, false]);
  });
});

// A pretend fetch. Tests can hand in whatever answer or delay they need, the same trick
// makeHungWorker/makeHungFrame use for the other two runners.
function makeFakeFetch(handler: (input: unknown, init: unknown) => Promise<Response>) {
  const calls: { input: unknown; init: unknown }[] = [];
  const fetchLike = ((input: unknown, init: unknown) => {
    calls.push({ input, init });
    return handler(input, init);
  }) as typeof fetch;
  return { fetchLike, calls };
}

describe("runServerCode (the page side, POSTs to the local API)", () => {
  it("returns the API's answer when it replies in time", async () => {
    const answer: RunResult = {
      results: [{ name: "x", passed: true, message: "" }],
      consoleLines: ["hi"],
      error: null,
      timedOut: false,
    };
    const { fetchLike, calls } = makeFakeFetch(async () => new Response(JSON.stringify(answer), { status: 200 }));
    const result = await runServerCode("code", "tests", 500, fetchLike);
    expect(result).toEqual(answer);
    expect(calls).toHaveLength(1);
    expect(calls[0].input).toBe("/api/run-server-code");
  });

  it("reports a timeout and gives up when the API never answers", async () => {
    // A real fetch rejects with an AbortError once its signal fires; a hung server never answers
    // any other way, so this fake has to honour the signal the same way to be a fair stand-in.
    const { fetchLike } = makeFakeFetch(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          const signal = (init as { signal?: AbortSignal }).signal;
          signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        }),
    );
    const result = await runServerCode("code", "tests", 50, fetchLike);
    expect(result.timedOut).toBe(true);
  });

  it("surfaces the gate's own error message when the API refuses (403)", async () => {
    const { fetchLike } = makeFakeFetch(
      async () => new Response(JSON.stringify({ error: "The server code runner only ever runs locally." }), { status: 403 }),
    );
    const result = await runServerCode("code", "tests", 500, fetchLike);
    expect(result.timedOut).toBe(false);
    expect(result.error).toBe("The server code runner only ever runs locally.");
  });

  it("reports a friendly error when the API cannot be reached at all", async () => {
    const { fetchLike } = makeFakeFetch(async () => {
      throw new Error("network down");
    });
    const result = await runServerCode("code", "tests", 500, fetchLike);
    expect(result.error).toContain("Could not reach the server runner");
  });
});

describe("Lesson content (every level)", () => {
  it("Level 1 has 10 lessons, Level 2 has 16, Level 3 has 22, the DSA track has 14, Level 4 has all 17 (of 20 planned topics; 3 pairs are combined into one strike each), Level 5 has all 37 (of 37 planned topics: every HTTP, Middleware, REST design, Auth, Security, SQL and back-half topic is now done), the Professional Skills track has all 9, and Level 6 has its first 5 (of 21 planned)", async () => {
    expect(level1Lessons).toHaveLength(10);
    expect(level2Lessons).toHaveLength(16);
    expect(level3Lessons).toHaveLength(22);
    expect(dsaLessons).toHaveLength(14);
    expect(level4Lessons).toHaveLength(17);
    expect(level5Lessons).toHaveLength(37);
    expect(professionalLessons).toHaveLength(9);
    expect(level6Lessons).toHaveLength(5);
  });

  it("every Level 6 strike uses the react runner (real React, in the sandboxed iframe)", async () => {
    for (const lesson of level6Lessons) {
      expect(lesson.runner, lesson.id).toBe("react");
    }
  });

  it("lessons are in order, each with 3 hints and a solution", async () => {
    for (const level of [
      level1Lessons,
      level2Lessons,
      level3Lessons,
      dsaLessons,
      level4Lessons,
      level5Lessons,
      level6Lessons,
      professionalLessons,
    ]) {
      level.forEach((lesson, index) => {
        expect(lesson.order).toBe(index + 1);
        expect(lesson.hints).toHaveLength(3);
        expect(lesson.solution).toContain("=== CODE ===");
        expect(lesson.solution).toContain("=== LINE BY LINE ===");
      });
    }
  });

  it("only Level 4 (and only its DOM/CSS strikes) use the iframe runner", async () => {
    for (const lesson of [
      ...level1Lessons,
      ...level2Lessons,
      ...level3Lessons,
      ...dsaLessons,
      ...professionalLessons,
    ]) {
      expect(lesson.runner ?? "worker", lesson.id).toBe("worker");
    }
    // A couple of Level 4 topics (CSP/CORS) cannot run in a sandboxed page at all, so they
    // stay guided-local on the plain worker runner, the same as Level 3's Git/npm strikes.
    const iframeCount = level4Lessons.filter((l) => l.runner === "iframe").length;
    const workerCount = level4Lessons.filter(
      (l) => (l.runner ?? "worker") === "worker",
    ).length;
    expect(iframeCount).toBe(16);
    expect(workerCount).toBe(1);
  });

  it("Level 5's server-runner strikes cover real server topics (including the N+1 and WebSocket strikes); ten concept/quiz exercises stay on the plain worker runner; and three real SQL topics get their own sql runner", async () => {
    const serverCount = level5Lessons.filter((l) => l.runner === "server").length;
    const workerCount = level5Lessons.filter((l) => (l.runner ?? "worker") === "worker").length;
    const sqlCount = level5Lessons.filter((l) => l.runner === "sql").length;
    expect(serverCount).toBe(24);
    expect(workerCount).toBe(10);
    expect(sqlCount).toBe(3);
  });

  // Server-runner and sql-runner lessons (Level 5+) execute real Node/Express code, or real SQL
  // against an in-memory database, in a forked child process (see apps/api/src/serverRunner),
  // which this browser-side test file has no way to do. Their own starter-fails/solution-passes
  // fairness is checked for real in apps/api instead (apps/api/src/serverRunner/level5Content.
  // test.ts and level5SqlContent.test.ts).
  //
  // react-runner lessons (Level 6) are skipped here for a different, honestly-documented
  // reason: happy-dom (the Node-side DOM this file's fairness checks run in for every other
  // in-browser runner) cannot actually run them. Confirmed empirically: happy-dom's own
  // script-element evaluator throws a SyntaxError on the dynamically-created <script> element
  // Babel standalone injects to run a transformed JSX block (something about how it handles the
  // injected sourcemap comment) — a real happy-dom limitation, not something fixable from this
  // app's side. Level 6 lessons are verified by hand, in a real browser, as each one is written;
  // there is no automated fairness check for them yet.
  it("starter code makes the tests FAIL for every lesson (all levels)", async () => {
    for (const lesson of allLessons) {
      if (lesson.runner === "server" || lesson.runner === "sql" || lesson.runner === "react") continue;
      const run = await runLessonCode(lesson, lesson.starterCode);
      const allPassed =
        run.results.length > 0 && run.results.every((r) => r.passed) && !run.error;
      expect(allPassed, `${lesson.id} starter code should not pass`).toBe(false);
    }
  });

  it("the solution in each lesson makes its own tests pass (checks the lesson is fair)", async () => {
    for (const lesson of allLessons) {
      if (lesson.runner === "server" || lesson.runner === "sql" || lesson.runner === "react") continue;
      const code = lesson.solution
        .split("=== LINE BY LINE ===")[0]
        .replace("=== CODE ===", "");
      const run = await runLessonCode(lesson, code);
      const failed = run.results.filter((r) => !r.passed).map((r) => r.name);
      expect(run.error, lesson.id).toBeNull();
      expect(run.results.length, `${lesson.id} has no tests at all`).toBeGreaterThan(0);
      expect(failed, `${lesson.id} failing: ${failed.join(", ")}`).toEqual([]);
    }
  });

  it("Level 1 pack has 10 cards plus 1 preview card", async () => {
    expect(level1InterviewPack.sayIt).toHaveLength(11);
    expect(level1InterviewPack.sayIt.filter((c) => c.isPreview)).toHaveLength(1);
  });
});

describe("Interview packs (every level)", () => {
  it("each pack has Say-It cards, a Solve-It, and a STAR prompt", async () => {
    expect(Object.keys(interviewPacks).map(Number)).toEqual([1, 2, 3, 4, 5]);
    for (const [level, pack] of Object.entries(interviewPacks)) {
      expect(pack.level).toBe(Number(level));
      expect(pack.sayIt.length).toBeGreaterThanOrEqual(10);
      expect(pack.solveIt.minutes).toBe(30);
      expect(pack.star.prompt.length).toBeGreaterThan(20);
    }
    expect(interviewPacks[2].sayIt).toHaveLength(10);
    expect(interviewPacks[3].sayIt).toHaveLength(10);
    expect(interviewPacks[4].sayIt).toHaveLength(10);
    expect(interviewPacks[5].sayIt).toHaveLength(10);
  });

  it("every Solve-It starter fails its tests (and no solution is stored)", async () => {
    for (const pack of Object.values(interviewPacks)) {
      const run = await executeLesson(pack.solveIt.starterCode, pack.solveIt.tests);
      expect(run.results.length).toBeGreaterThan(0);
      expect(run.results.every((r) => r.passed)).toBe(false);
      expect(Object.keys(pack.solveIt)).not.toContain("solution");
    }
  });
});
