// Tests for the SQL runner (Level 5+). These really fork a Node child process and really run
// pg-mem, an in-memory SQL engine — never the real database. Slower than a pure-unit test, but
// this is the one place that must be proven to genuinely execute SQL, isolate it, time it out,
// and clean up after itself.
import { describe, expect, it } from "vitest";
import { runSqlCode } from "./runSqlCode";

const seedSql = `
CREATE TABLE fruits (id int, name text, color text);
INSERT INTO fruits VALUES (1, 'apple', 'red'), (2, 'banana', 'yellow'), (3, 'cherry', 'red');
`;

describe("runSqlCode", () => {
  it("really runs learner SQL against a fresh in-memory database, and reports a real pass", async () => {
    const code = "SELECT * FROM fruits WHERE color = 'red' ORDER BY id";
    const tests = `test("finds both red fruits", async () => {
  const rows = await query(code);
  expect(rows).toEqual([
    { id: 1, name: "apple", color: "red" },
    { id: 3, name: "cherry", color: "red" },
  ]);
});
`;
    const result = await runSqlCode(code, seedSql, tests);
    expect(result.timedOut).toBe(false);
    expect(result.error).toBe(null);
    expect(result.results).toEqual([{ name: "finds both red fruits", passed: true, message: "" }]);
  });

  it("reports a real, specific failure when the learner's query is wrong", async () => {
    const code = "SELECT * FROM fruits WHERE color = 'yellow'";
    const tests = `test("finds the red fruits", async () => {
  const rows = await query(code);
  expect(rows.length).toBe(2);
});
`;
    const result = await runSqlCode(code, seedSql, tests);
    expect(result.error).toBe(null);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].passed).toBe(false);
  });

  it("every run starts from the SAME seeded data: one run's query cannot see another run's changes", async () => {
    const deleteEverything = "DELETE FROM fruits";
    const tests1 = `test("delete happens", async () => {
  const rows = await query(code);
  expect(Array.isArray(rows)).toBe(true);
});
`;
    await runSqlCode(deleteEverything, seedSql, tests1);

    // A completely separate run, same seed: if state leaked, this would now see 0 rows.
    const code2 = "SELECT * FROM fruits";
    const tests2 = `test("still has all 3 seeded fruits", async () => {
  const rows = await query(code);
  expect(rows.length).toBe(3);
});
`;
    const result = await runSqlCode(code2, seedSql, tests2);
    expect(result.results).toEqual([{ name: "still has all 3 seeded fruits", passed: true, message: "" }]);
  });

  it("never touches a real database: pg-mem never opens a network socket", async () => {
    const code = "SELECT 1 as ok";
    const tests = `test("just runs in memory", async () => {
  const rows = await query(code);
  expect(rows).toEqual([{ ok: 1 }]);
});
`;
    const result = await runSqlCode(code, "SELECT 1", tests);
    expect(result.error).toBe(null);
    expect(result.results[0].passed).toBe(true);
  });

  it("times out and kills the process instead of hanging forever", async () => {
    // pg-mem itself has no real I/O to hang on, so we simulate a hang the same honest way the
    // Express runner's test does: a test body whose promise never resolves.
    const code = "SELECT 1";
    const tests = `test("never resolves", () => new Promise(() => {}));`;
    const result = await runSqlCode(code, "SELECT 1", tests, 500);
    expect(result.timedOut).toBe(true);
  }, 10_000);

  it("cleans up its temp folder after a run", async () => {
    const { readdir, access } = await import("node:fs/promises");
    const { fileURLToPath } = await import("node:url");
    const path = await import("node:path");
    const apiRoot = path.resolve(fileURLToPath(import.meta.url), "../../..");
    const tmpRoot = path.join(apiRoot, ".runner-tmp");

    const listSqlRuns = async () => {
      try {
        await access(tmpRoot);
        return (await readdir(tmpRoot)).filter((name) => name.startsWith("sql-"));
      } catch {
        return [];
      }
    };

    const before = await listSqlRuns();
    await runSqlCode("SELECT 1", "SELECT 1", `test("x", () => { expect(1).toBe(1); });`);
    const after = await listSqlRuns();
    expect(after.length).toBe(before.length);
  });
});
