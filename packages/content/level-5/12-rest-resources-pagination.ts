import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s12",
  level: 5,
  order: 12,
  title: "REST design: resources and pagination",
  runner: "server",

  look: `REST is mostly a naming convention. A URL should name a RESOURCE (a noun, usually plural), and the HTTP METHOD says what to do with it — not the URL itself.

  GET  /items          good: a resource, and GET says "read it"
  GET  /getItems        avoid: the verb is already in the URL, duplicating what GET already means

Real lists are usually too big to send all at once, so an API PAGINATES: it sends one page at a time, using query parameters.

  GET /items?page=2&limit=3

Everything after the ? in a URL is a QUERY STRING. Express parses it into req.query for you, but every value arrives as a STRING, even page=2 — you have to convert it yourself with Number(...) before doing any math with it.`,

  type: `Finish GET /items to support pagination:
1. Read page and limit from req.query, converting each with Number(...).
2. Work out where this page starts: start = (page - 1) * limit.
3. Respond 200 with JSON { items: allItems.slice(start, start + limit), total: allItems.length }.`,

  break: `Break it on purpose: compute the start index as page * limit instead of (page - 1) * limit. Now page=1 skips the first "limit" items entirely (it starts at index limit, not 0), quietly dropping the very first page of real results. Put the - 1 back.`,

  say: `In one sentence: why does every value in req.query arrive as a string, even one that looks like a number?`,

  starterCode: `import express from "express";

const allItems = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]; // 10 fake items, for pagination

export function buildApp() {
  const app = express();

  app.get("/items", (req, res) => {
    // your code here
  });

  return app;
}
`,

  tests: `test("GET /items?page=1&limit=3 returns the first 3 items", async () => {
  const res = await request(buildApp()).get("/items?page=1&limit=3");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ items: ["a", "b", "c"], total: 10 });
});

test("GET /items?page=2&limit=3 returns the NEXT 3 items", async () => {
  const res = await request(buildApp()).get("/items?page=2&limit=3");
  expect(res.body).toEqual({ items: ["d", "e", "f"], total: 10 });
});
`,

  hints: [
    "const page = Number(req.query.page); const limit = Number(req.query.limit);",
    "const start = (page - 1) * limit;",
    "res.json({ items: allItems.slice(start, start + limit), total: allItems.length });",
  ],

  solution: `=== CODE ===
import express from "express";

const allItems = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

export function buildApp() {
  const app = express();

  app.get("/items", (req, res) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const start = (page - 1) * limit;
    res.json({ items: allItems.slice(start, start + limit), total: allItems.length });
  });

  return app;
}
=== LINE BY LINE ===
Number(req.query.page) converts the STRING "2" into the real number 2. Every query string value is text, no matter how it looks; skipping this conversion is a common source of "my math just does not work" bugs.
start = (page - 1) * limit turns a human-friendly "page 2" into the zero-based index slice() actually needs: page 1 starts at index 0, page 2 starts at index limit, and so on.
total: allItems.length is included separately from items on purpose: it lets whoever is calling this API work out how many pages exist in total, without having to fetch every single one first.`,
};
