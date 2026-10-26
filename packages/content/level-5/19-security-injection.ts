import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s19",
  level: 5,
  order: 19,
  title: "Security: injection",
  runner: "server",

  look: `INJECTION happens when untrusted input is allowed to change the MEANING of a command, not just its data. The classic example is SQL built by gluing strings together:

  const query = "SELECT * FROM users WHERE username = '" + usernameInput + "'";

If usernameInput is the ordinary text "alice", that is a normal query. But if it is a crafted string like ' OR '1'='1, the query becomes:

  SELECT * FROM users WHERE username = '' OR '1'='1'

'1'='1' is always true, so this now matches EVERY row, not just one — the attacker changed what the query MEANS, using nothing but a text field. The fix is never building a query out of raw input at all: compare values directly, or use a real database's PARAMETERIZED queries (which Prisma, coming up soon, does for you automatically). This strike proves the idea with a tiny in-memory "database", so you can see the exact shape of the fix without needing a real one.`,

  type: `Finish findUser(usernameInput): return the first user in \`users\` whose username STRICTLY equals usernameInput, using .find() and ===. Never build a string out of usernameInput at all.`,

  break: `Break it on purpose: change === to .includes(), so a user matches if their username merely CONTAINS usernameInput anywhere. Now searching for "a" quietly matches "alice" too (and any other username with an "a" in it) — an attacker no longer needs to guess an exact username, just a short substring that happens to appear in one. Go back to a strict, exact === comparison.`,

  say: `In one sentence: what makes gluing untrusted input into a command string dangerous, that a plain equality check does not have the same problem with?`,

  starterCode: `import express from "express";

const users = [
  { id: 1, username: "alice", isAdmin: false },
  { id: 2, username: "bob", isAdmin: true },
];

function findUser(usernameInput) {
  // your code here
}

export function buildApp() {
  const app = express();

  app.get("/users", (req, res) => {
    const user = findUser(req.query.username);
    if (!user) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.json(user);
  });

  return app;
}
`,

  tests: `test("finds the right user for a normal, exact username", async () => {
  const res = await request(buildApp()).get("/users?username=alice");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ id: 1, username: "alice", isAdmin: false });
});

test("a classic SQL-injection-style string finds nothing at all, since it is just plain text now", async () => {
  const res = await request(buildApp()).get("/users?username=" + encodeURIComponent("' OR '1'='1"));
  expect(res.status).toBe(404);
});

test("a partial, substring-only match also finds nothing: usernames must match exactly", async () => {
  const res = await request(buildApp()).get("/users?username=a");
  expect(res.status).toBe(404);
});
`,

  hints: [
    "users.find((user) => user.username === usernameInput)",
    "That one line is the whole function body: return users.find(...);",
    'No string building anywhere: usernameInput is only ever compared, never glued into anything.',
  ],

  solution: `=== CODE ===
import express from "express";

const users = [
  { id: 1, username: "alice", isAdmin: false },
  { id: 2, username: "bob", isAdmin: true },
];

function findUser(usernameInput) {
  return users.find((user) => user.username === usernameInput);
}

export function buildApp() {
  const app = express();

  app.get("/users", (req, res) => {
    const user = findUser(req.query.username);
    if (!user) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.json(user);
  });

  return app;
}
=== LINE BY LINE ===
=== is a plain, honest comparison: two values are either exactly equal, or they are not. There is no way for usernameInput to change WHAT is being asked, only whether ITS OWN value happens to match.
That is the entire fix, and it generalizes: a real database's parameterized query works the same way underneath. The database is told "compare this column to THIS value" as two separate pieces, never as one glued-together instruction, so untrusted input can never reshape the instruction itself.
' OR '1'='1 is completely harmless here: with a plain === comparison, it is just an unusual-looking string that does not equal "alice" or "bob", so it correctly finds nothing.`,
};
