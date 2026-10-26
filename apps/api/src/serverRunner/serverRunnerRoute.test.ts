// Tests for the local-only GATE on POST /run-server-code, and one real end-to-end run through
// the actual Express app (not just runServerCode.ts directly). The gate is the one thing this
// whole feature exists to get right, per the charter's security rule, so it gets its own file.
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

describe("POST /run-server-code (the local-only gate)", () => {
  it("runs real code when the request comes from this same machine outside production", async () => {
    process.env.NODE_ENV = "test"; // supertest always connects over loopback, like a real dev run
    const res = await request(app())
      .post("/run-server-code")
      .send({
        code: `import express from "express";\nexport function buildApp() {\n  const app = express();\n  app.get("/ok", (req, res) => res.json({ ok: true }));\n  return app;\n}\n`,
        tests: `test("GET /ok", async () => {\n  const res = await request(buildApp()).get("/ok");\n  expect(res.body).toEqual({ ok: true });\n});\n`,
      });
    expect(res.status).toBe(200);
    expect(res.body.results).toEqual([{ name: "GET /ok", passed: true, message: "" }]);
  });

  it("refuses with 403 when NODE_ENV is production, even though the request is local", async () => {
    process.env.NODE_ENV = "production";
    const res = await request(app())
      .post("/run-server-code")
      .send({ code: "export function buildApp() {}", tests: "" });
    expect(res.status).toBe(403);
    expect(res.body.error).toContain("local");
  });

  it("still validates the body (400) before ever reaching the gate or a child process", async () => {
    process.env.NODE_ENV = "test";
    const res = await request(app()).post("/run-server-code").send({ code: "only code, no tests" });
    expect(res.status).toBe(400);
  });
});
