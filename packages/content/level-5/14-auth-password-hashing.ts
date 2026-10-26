import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s14",
  level: 5,
  order: 14,
  title: "Auth: password hashing",
  runner: "server",

  look: `Never store a password as plain text. If your database ever leaks, plain passwords leak straight out with it. Instead, store a HASH: the one-way output of a function nobody can reverse back to the original password.

A hash alone is not enough, though: the same password always produces the same hash, so two users with the same password would have identical rows — a real weakness. The fix is a SALT: a random string mixed in before hashing, different for every user, so the same password hashes differently every single time.

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

crypto.scryptSync is built right into Node (no extra install needed) and is DELIBERATELY slow. That is a feature, not a bug: a fast hash (like plain SHA-256) lets an attacker try billions of guesses a second; a slow one like scrypt makes large-scale guessing impractically expensive.`,

  type: `Finish verifyPassword(password, stored). stored looks like "saltHex:hashHex" (hashPassword already builds it that way for you):
1. Split stored on ":" into [salt, originalHash].
2. Hash password with that SAME salt: crypto.scryptSync(password, salt, 64).toString("hex").
3. Return true only if that new hash matches originalHash exactly, false otherwise.`,

  break: `Break it on purpose: hard-code some fixed string as the salt inside verifyPassword, instead of reading it from stored. hashPassword() picks a brand-new RANDOM salt every single time it runs, so your guessed salt will essentially never match the real one — even the genuinely correct password now gets rejected. Read the salt out of stored instead of guessing it.`,

  say: `In one sentence: why does adding a random salt matter, even though the hash function itself is already one-way?`,

  starterCode: `import express from "express";
import crypto from "node:crypto";

// Already given: hashing a NEW password, so you can see the shape of a stored hash.
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return salt + ":" + hash;
}

// A fake "database": one already-hashed user.
const storedHash = hashPassword("correct horse");

function verifyPassword(password, stored) {
  // your code here
}

export function buildApp() {
  const app = express();
  app.use(express.json());

  app.post("/login", (req, res) => {
    const ok = verifyPassword(req.body.password, storedHash);
    if (!ok) {
      res.status(401).json({ error: "Wrong password" });
      return;
    }
    res.json({ ok: true });
  });

  return app;
}
`,

  tests: `test("POST /login with the correct password succeeds", async () => {
  const res = await request(buildApp()).post("/login").send({ password: "correct horse" });
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ ok: true });
});

test("POST /login with the wrong password is refused with 401", async () => {
  const res = await request(buildApp()).post("/login").send({ password: "wrong guess" });
  expect(res.status).toBe(401);
  expect(res.body).toEqual({ error: "Wrong password" });
});
`,

  hints: [
    'const [salt, originalHash] = stored.split(":");',
    'const hash = crypto.scryptSync(password, salt, 64).toString("hex");',
    "return hash === originalHash;",
  ],

  solution: `=== CODE ===
import express from "express";
import crypto from "node:crypto";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return salt + ":" + hash;
}

const storedHash = hashPassword("correct horse");

function verifyPassword(password, stored) {
  const [salt, originalHash] = stored.split(":");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return hash === originalHash;
}

export function buildApp() {
  const app = express();
  app.use(express.json());

  app.post("/login", (req, res) => {
    const ok = verifyPassword(req.body.password, storedHash);
    if (!ok) {
      res.status(401).json({ error: "Wrong password" });
      return;
    }
    res.json({ ok: true });
  });

  return app;
}
=== LINE BY LINE ===
stored.split(":") recovers the exact salt that was used when this password was first hashed. That salt is not secret; it is stored right alongside the hash on purpose, since verifyPassword needs it every time.
crypto.scryptSync(password, salt, 64) run with the RIGHT salt reproduces the exact same hash, byte for byte, if and only if password was the same string originally used. Change one character and the whole hash comes out completely different.
hash === originalHash is a plain string comparison: no decrypting happens anywhere, because hashing is one-way. Verifying a password means re-doing the same one-way work and comparing outputs, never reversing anything.`,
};
