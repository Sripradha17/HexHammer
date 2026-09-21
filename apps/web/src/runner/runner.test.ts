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
} from "@hexhammer/content";
import { executeLesson, type RunResult } from "./execute";
import { runCode, type WorkerLike } from "./runCode";

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

describe("Lesson content (every level)", () => {
  it("Level 1 has 10 lessons, Level 2 has 16 and Level 3 has 22, and the DSA track has 14", async () => {
    expect(level1Lessons).toHaveLength(10);
    expect(level2Lessons).toHaveLength(16);
    expect(level3Lessons).toHaveLength(22);
    expect(dsaLessons).toHaveLength(14);
  });

  it("lessons are in order, each with 3 hints and a solution", async () => {
    for (const level of [level1Lessons, level2Lessons, level3Lessons, dsaLessons]) {
      level.forEach((lesson, index) => {
        expect(lesson.order).toBe(index + 1);
        expect(lesson.hints).toHaveLength(3);
        expect(lesson.solution).toContain("=== CODE ===");
        expect(lesson.solution).toContain("=== LINE BY LINE ===");
      });
    }
  });

  it("starter code makes the tests FAIL for every lesson (all levels)", async () => {
    for (const lesson of allLessons) {
      const run = await executeLesson(lesson.starterCode, lesson.tests);
      const allPassed =
        run.results.length > 0 && run.results.every((r) => r.passed) && !run.error;
      expect(allPassed, `${lesson.id} starter code should not pass`).toBe(false);
    }
  });

  it("the solution in each lesson makes its own tests pass (checks the lesson is fair)", async () => {
    for (const lesson of allLessons) {
      const code = lesson.solution
        .split("=== LINE BY LINE ===")[0]
        .replace("=== CODE ===", "");
      const run = await executeLesson(code, lesson.tests);
      const failed = run.results.filter((r) => !r.passed).map((r) => r.name);
      expect(run.error, lesson.id).toBeNull();
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
    expect(Object.keys(interviewPacks).map(Number)).toEqual([1, 2]);
    for (const [level, pack] of Object.entries(interviewPacks)) {
      expect(pack.level).toBe(Number(level));
      expect(pack.sayIt.length).toBeGreaterThanOrEqual(10);
      expect(pack.solveIt.minutes).toBe(30);
      expect(pack.star.prompt.length).toBeGreaterThan(20);
    }
    expect(interviewPacks[2].sayIt).toHaveLength(10);
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
