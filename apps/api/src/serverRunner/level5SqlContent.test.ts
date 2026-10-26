// Checks every Level 5 SQL-runner lesson is fair: the starter query must fail its own tests, and
// the solution must make them all pass, both run for real against the lesson's own seeded
// in-memory database. Server-side twin of the "Lesson content" fairness checks in
// apps/web/src/runner/runner.test.ts, which explicitly skips these lessons because it has no way
// to run real SQL — only this file, with a real runSqlCode(), actually can.
import { describe, expect, it } from "vitest";
import { level5Lessons } from "@hexhammer/content";
import { runSqlCode } from "./runSqlCode";

const sqlLessons = level5Lessons.filter((lesson) => lesson.runner === "sql");

describe("Level 5 sql-runner lesson content is fair", () => {
  it("actually found some sql-runner lessons to check (not silently checking zero)", () => {
    expect(sqlLessons.length).toBeGreaterThan(0);
  });

  for (const lesson of sqlLessons) {
    it(`${lesson.id} (${lesson.title}): starter query fails its own tests, solution passes them`, async () => {
      expect(lesson.sqlSeed, `${lesson.id} must have sqlSeed set`).toBeTruthy();
      const seedSql = lesson.sqlSeed ?? "";

      const starterRun = await runSqlCode(lesson.starterCode, seedSql, lesson.tests);
      const starterPassed =
        starterRun.results.length > 0 &&
        starterRun.results.every((r) => r.passed) &&
        !starterRun.error;
      expect(starterPassed, `${lesson.id} starter code should not pass`).toBe(false);

      const solutionCode = lesson.solution
        .split("=== LINE BY LINE ===")[0]
        .replace("=== CODE ===", "");
      const solutionRun = await runSqlCode(solutionCode, seedSql, lesson.tests);
      const failed = solutionRun.results.filter((r) => !r.passed).map((r) => r.name);
      expect(solutionRun.error, lesson.id).toBeNull();
      expect(solutionRun.results.length, `${lesson.id} has no tests at all`).toBeGreaterThan(0);
      expect(failed, `${lesson.id} failing: ${failed.join(", ")}`).toEqual([]);
    });
  }
});
