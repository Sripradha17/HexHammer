// Checks every Level 5 SERVER-runner lesson is fair: the starter code must fail its own tests,
// and the solution must make them all pass. This is the server-side twin of the "Lesson content"
// fairness checks in apps/web/src/runner/runner.test.ts, which explicitly skips these lessons
// because it has no way to run real Node/Express code — only this file, with a real
// runServerCode(), actually can.
import { describe, expect, it } from "vitest";
import { level5Lessons } from "@hexhammer/content";
import { runServerCode } from "./runServerCode";

const serverLessons = level5Lessons.filter((lesson) => lesson.runner === "server");

describe("Level 5 server-runner lesson content is fair", () => {
  it("actually found some server-runner lessons to check (not silently checking zero)", () => {
    expect(serverLessons.length).toBeGreaterThan(0);
  });

  for (const lesson of serverLessons) {
    it(
      `${lesson.id} (${lesson.title}): starter code fails its own tests, solution passes them`,
      async () => {
        const starterRun = await runServerCode(lesson.starterCode, lesson.tests);
        const starterPassed =
          starterRun.results.length > 0 &&
          starterRun.results.every((r) => r.passed) &&
          !starterRun.error;
        expect(starterPassed, `${lesson.id} starter code should not pass`).toBe(false);

        const solutionCode = lesson.solution
          .split("=== LINE BY LINE ===")[0]
          .replace("=== CODE ===", "");
        const solutionRun = await runServerCode(solutionCode, lesson.tests);
        const failed = solutionRun.results.filter((r) => !r.passed).map((r) => r.name);
        expect(solutionRun.error, lesson.id).toBeNull();
        expect(solutionRun.results.length, `${lesson.id} has no tests at all`).toBeGreaterThan(0);
        expect(failed, `${lesson.id} failing: ${failed.join(", ")}`).toEqual([]);
      },
      15_000, // a real Express app + a fresh Node process, twice per lesson, needs real time
    );
  }
});
