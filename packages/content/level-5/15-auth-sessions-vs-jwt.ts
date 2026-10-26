import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s15",
  level: 5,
  order: 15,
  title: "Auth: sessions vs JWT",
  runner: "server",

  look: `Once a login succeeds, a server needs to remember "who is this?" on every LATER request too. Two common ways:

SESSIONS: the server picks a random ID, stores the real user info in its own memory/database keyed by that ID, and hands the CLIENT only the ID (usually in a cookie). Every request, the server looks the ID up. Simple, but the server has to keep that state somewhere.

JWT (JSON Web Token): instead of storing anything, the server puts the actual claims (like { userId: 7 }) INSIDE a token, and SIGNS it with a secret only the server knows. The client holds the whole token. On the next request, the server does not look anything up: it just re-checks the signature. If the signature is still valid, the claims inside must be exactly what the server itself put there, since nobody else could have produced a valid signature without the secret.

  const body = base64url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  const token = body + "." + signature;

That is genuinely most of what a real JWT is: a signed, base64-encoded payload. (Real JWTs add a header and a couple of standard fields; the shape and the trust model are exactly this.)`,

  type: `Finish verify(token, secret):
1. Split token on "." into [body, signature].
2. Recompute the expected signature the SAME way sign() did: crypto.createHmac("sha256", secret).update(body).digest("base64url").
3. If it does not match signature exactly, return null (tampered, or signed with a different secret).
4. Otherwise, return JSON.parse(Buffer.from(body, "base64url").toString()) — the original payload.`,

  break: `Break it on purpose: skip the signature check entirely, and just always decode and return the payload. Now verify() accepts ANY token, even one nobody ever signed — literally anyone could hand your server a made-up { "userId": 1 } with a made-up signature, and it would be trusted completely. Put the signature check back before ever trusting what is inside.`,

  say: `In one sentence: what does a JWT's signature actually prove, and what does it NOT prove?`,

  starterCode: `import express from "express";
import crypto from "node:crypto";

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

// Already given: building a signed token.
function sign(payload, secret) {
  const body = base64url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return body + "." + signature;
}

function verify(token, secret) {
  // your code here
}

const SECRET = "shh-a-real-app-uses-an-env-variable";

export function buildApp() {
  const app = express();
  app.use(express.json());

  app.post("/verify", (req, res) => {
    const payload = verify(req.body.token, SECRET);
    if (!payload) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    res.json(payload);
  });

  return app;
}
`,

  tests: `// A tiny copy of sign(), just for building test tokens: the real one is what you are testing,
// so it cannot also be what builds its own test input. Same secret as the starter file.
import crypto from "node:crypto";
function testBase64url(input) {
  return Buffer.from(input).toString("base64url");
}
function testSign(payload, secret) {
  const body = testBase64url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return body + "." + signature;
}
const TEST_SECRET = "shh-a-real-app-uses-an-env-variable";

test("a token signed with the right secret verifies and returns its payload", async () => {
  const token = testSign({ userId: 7 }, TEST_SECRET);
  const res = await request(buildApp()).post("/verify").send({ token });
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ userId: 7 });
});

test("a tampered token (wrong signature) is refused with 401", async () => {
  const token = testSign({ userId: 7 }, TEST_SECRET) + "x";
  const res = await request(buildApp()).post("/verify").send({ token });
  expect(res.status).toBe(401);
});
`,

  hints: [
    'const [body, signature] = token.split(".");',
    'const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");\nif (expected !== signature) return null;',
    'return JSON.parse(Buffer.from(body, "base64url").toString());',
  ],

  solution: `=== CODE ===
import express from "express";
import crypto from "node:crypto";

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload, secret) {
  const body = base64url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return body + "." + signature;
}

function verify(token, secret) {
  const [body, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  if (expected !== signature) {
    return null;
  }
  return JSON.parse(Buffer.from(body, "base64url").toString());
}

const SECRET = "shh-a-real-app-uses-an-env-variable";

export function buildApp() {
  const app = express();
  app.use(express.json());

  app.post("/verify", (req, res) => {
    const payload = verify(req.body.token, SECRET);
    if (!payload) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    res.json(payload);
  });

  return app;
}
=== LINE BY LINE ===
Recomputing the signature (instead of trying to "check" the one you were given some other way) is the whole trick: the ONLY way to produce a signature that matches is to already know secret, since HMAC is one-way, same as the hashing you used two strikes ago.
expected !== signature catches ANY change at all: change even one character of body or signature and the comparison fails, because a signature is only valid for the exact bytes it was computed over.
Once the signature checks out, decoding the body is safe: base64url is just an ENCODING (reversible, no secret needed), not encryption. Anyone can read a JWT's payload; what they cannot do is forge a NEW one that still verifies.`,
};
