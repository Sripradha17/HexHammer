import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s11",
  level: 5,
  order: 11,
  title: "HTTP: caching and cookies",
  runner: "server",

  look: `Two more response headers worth knowing well.

CACHE-CONTROL tells the browser (and anything in between) whether it may reuse this response later, instead of asking again:

  res.set("Cache-Control", "max-age=3600");   // reuse me for up to an hour: good for a logo, a CSS file
  res.set("Cache-Control", "no-store");        // never cache me at all: good for anything personal or changing

SET-COOKIE lets a server hand the browser a small piece of data to remember and automatically send back on every future request to this same site. Express's res.cookie(name, value) builds that header correctly for you:

  res.cookie("session", "abc123");

You will meet a real, secure use of this exact mechanism in the Auth strikes coming up (a session cookie is how a server remembers you are logged in).`,

  type: `Finish GET /dashboard:
1. Set a Cache-Control header of "no-store" (a dashboard is different for every visitor; it must never be cached).
2. Set a cookie named "session" with the value "abc123".
3. Respond with status 200 and JSON { ok: true }.`,

  break: `Break it on purpose: use Cache-Control: max-age=3600 instead of no-store. Now a browser (or any shared cache in between) may reuse an OLD copy of this dashboard for up to an hour, even for a different visitor entirely, since nothing told it this response is personal. Put no-store back for anything personal or changing.`,

  say: `In one sentence: what is the difference between what Cache-Control: max-age=3600 and Cache-Control: no-store each tell a browser to do?`,

  starterCode: `import express from "express";

export function buildApp() {
  const app = express();

  app.get("/dashboard", (req, res) => {
    // your code here
  });

  return app;
}
`,

  tests: `test("GET /dashboard sets Cache-Control: no-store", async () => {
  const res = await request(buildApp()).get("/dashboard");
  expect(res.headers["cache-control"]).toBe("no-store");
});

test("GET /dashboard sets a session cookie", async () => {
  const res = await request(buildApp()).get("/dashboard");
  const cookies = res.headers["set-cookie"] || [];
  const hasSessionCookie = cookies.some((c) => c.startsWith("session=abc123"));
  expect(hasSessionCookie).toBe(true);
});

test("GET /dashboard still answers 200 with the expected body", async () => {
  const res = await request(buildApp()).get("/dashboard");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ ok: true });
});
`,

  hints: [
    'res.set("Cache-Control", "no-store");',
    'res.cookie("session", "abc123");',
    "res.json({ ok: true }); at the end (status 200 is res.json's default, so you do not need res.status(200) as well, though writing it is never wrong).",
  ],

  solution: `=== CODE ===
import express from "express";

export function buildApp() {
  const app = express();

  app.get("/dashboard", (req, res) => {
    res.set("Cache-Control", "no-store");
    res.cookie("session", "abc123");
    res.json({ ok: true });
  });

  return app;
}
=== LINE BY LINE ===
res.set("Cache-Control", "no-store") is a plain response header, same mechanism as any other: a small fact travelling alongside the body, this time aimed at whatever caching sits between your server and the browser.
res.cookie("session", "abc123") builds a correctly-formatted Set-Cookie header for you. The browser stores "abc123" under the name "session" and will attach it back to every future request to this same site, automatically, without your code having to do anything more.
Order matters here only in one sense: both res.set(...) and res.cookie(...) must run BEFORE res.json(...), because once a response starts being sent, its headers are locked in.`,
};
