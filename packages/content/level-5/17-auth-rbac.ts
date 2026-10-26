import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s17",
  level: 5,
  order: 17,
  title: "Auth: RBAC",
  runner: "server",

  look: `RBAC (Role-Based Access Control) means permission is checked by ROLE, not by treating every user individually: "admins can do this, viewers cannot", instead of a hand-maintained list of specific people.

You have already built this exact shape of middleware twice: a factory that returns a per-request check (request validation), and a short-circuit that answers instead of calling next() (the 401 strike). RBAC is those two ideas combined:

  function requireRole(role) {
    return function (req, res, next) {
      if (req.headers["x-role"] !== role) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      next();
    };
  }

  app.delete("/admin/users/:id", requireRole("admin"), deleteHandler);

403 Forbidden is the right code here, not 401: the server DOES know who is asking (a role was sent), it is simply refusing them specifically. 401 means "I don't know who you are"; 403 means "I know, and the answer is no."`,

  type: `Finish requireRole(role). It must return a middleware that:
1. Checks req.headers["x-role"] against role.
2. If it does not match, respond 403 with { error: "Forbidden" }, and stop.
3. Otherwise, call next().`,

  break: `Break it on purpose: delete the return; right after res.status(403).json(...). Depending how the rest of your code is shaped, an unauthorized request can now fall all the way through to next() too, reaching the real route right after being refused. Keep the return so a rejected request always stops right there, the same short-circuit rule from the 401 strike.`,

  say: `In one sentence: what is the difference between what a 401 means and what a 403 means?`,

  starterCode: `import express from "express";

function requireRole(role) {
  // your code here: return a middleware function
}

export function buildApp() {
  const app = express();

  app.delete("/admin/users/:id", requireRole("admin"), (req, res) => {
    res.json({ deleted: true });
  });

  return app;
}
`,

  tests: `test("a request with the admin role succeeds", async () => {
  const res = await request(buildApp()).delete("/admin/users/1").set("X-Role", "admin");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ deleted: true });
});

test("a request with a different role is refused with 403", async () => {
  const res = await request(buildApp()).delete("/admin/users/1").set("X-Role", "viewer");
  expect(res.status).toBe(403);
  expect(res.body).toEqual({ error: "Forbidden" });
});

test("a request with no role at all is also refused with 403", async () => {
  const res = await request(buildApp()).delete("/admin/users/1");
  expect(res.status).toBe(403);
});
`,

  hints: [
    'Inside requireRole, return a function (req, res, next) { ... }.',
    'Inside that function: if (req.headers["x-role"] !== role) { res.status(403).json({ error: "Forbidden" }); return; }',
    "After that if block: next();",
  ],

  solution: `=== CODE ===
import express from "express";

function requireRole(role) {
  return function (req, res, next) {
    if (req.headers["x-role"] !== role) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}

export function buildApp() {
  const app = express();

  app.delete("/admin/users/:id", requireRole("admin"), (req, res) => {
    res.json({ deleted: true });
  });

  return app;
}
=== LINE BY LINE ===
requireRole("admin") runs once, at route-registration time, and returns the real middleware, remembering "admin" by closure — the same factory shape as the request-validation strike.
app.delete("/admin/users/:id", requireRole("admin"), handler) shows middleware can be scoped to just ONE route, not only whole-app with app.use(): pass it as an extra argument right before the route's own handler, and Express runs it first, only for this route.
A request with no X-Role header at all still gets refused correctly, because req.headers["x-role"] is simply undefined, which never equals "admin" — there is no special case to write for "missing" versus "wrong": both fail the exact same comparison.`,
};
