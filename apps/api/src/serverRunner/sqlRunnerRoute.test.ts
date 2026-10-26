// Tests for the local-only GATE on POST /run-sql-code, and one real end-to-end run through the
// actual Express app. Mirrors serverRunnerRoute.test.ts; see that file for why the gate matters.
import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";

function app() {
  return createApp({} as never); // this route never touches the database
}

const originalNodeEnv = process.env.NODE_ENV;
afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

describe("POST /run-sql-code (the local-only gate)", () => {
  it("runs real SQL when the request comes from this same machine outside production", async () => {
    process.env.NODE_ENV = "test";
    const res = await request(app())
      .post("/run-sql-code")
      .send({
        code: "SELECT * FROM t",
        seedSql: "CREATE TABLE t (id int); INSERT INTO t VALUES (1);",
        tests: `test("finds the row", async () => {\n  const rows = await query(code);\n  expect(rows).toEqual([{ id: 1 }]);\n});\n`,
      });
    expect(res.status).toBe(200);
    expect(res.body.results).toEqual([{ name: "finds the row", passed: true, message: "" }]);
  });

  it("refuses with 403 when NODE_ENV is production, even though the request is local", async () => {
    process.env.NODE_ENV = "production";
    const res = await request(app())
      .post("/run-sql-code")
      .send({ code: "SELECT 1", seedSql: "SELECT 1", tests: "" });
    expect(res.status).toBe(403);
    expect(res.body.error).toContain("local");
  });

  it("still validates the body (400) before ever reaching the gate or a child process", async () => {
    process.env.NODE_ENV = "test";
    const res = await request(app()).post("/run-sql-code").send({ code: "SELECT 1" });
    expect(res.status).toBe(400);
  });
});
