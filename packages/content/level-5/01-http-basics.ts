import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s01",
  level: 5,
  order: 1,
  title: "HTTP: methods, status codes, headers",
  runner: "server",

  look: `HTTP is the language a browser and a server speak to each other. Every request has a METHOD (what kind of thing you want to do) and every response has a STATUS CODE (how it went) and HEADERS (small facts about the response, sent alongside the body).

Two methods you will use constantly:
  GET    "give me something" (reading). Never changes anything on the server.
  POST   "here, take this" (usually creating something new).

Status codes are grouped by their first digit:
  2xx   it worked.       200 OK (the everyday success), 201 Created (a NEW thing now exists)
  4xx   YOU made a mistake.   404 Not Found, 400 Bad Request
  5xx   the SERVER made a mistake.   500 Internal Server Error

  app.get("/items", (req, res) => {
    res.status(200).json(["pencil", "eraser"]);
  });

res.json(...) sends the body as JSON AND sets the Content-Type header to application/json for you automatically, which is why you rarely have to set headers by hand.

This strike runs for real: your code becomes an actual Express app, and the tests make actual HTTP requests against it (through a library called supertest), exactly like Level 5's own strikes will keep doing from here on.`,

  type: `Finish buildApp():
1. GET /items should answer status 200 with the JSON array ["pencil", "eraser"].
2. POST /items should answer status 201 (Created) with the JSON object { created: true }.`,

  break: `Break it on purpose: change the POST route's status to 200 instead of 201. The request still "succeeds" from a browser's point of view (200 always looks fine at a glance), but 201 specifically means "a new thing now exists", and plenty of real client code checks for exactly that. Put 201 back.`,

  say: `In one sentence: what is the difference between a 2xx status code and a 4xx one?`,

  starterCode: `import express from "express";

export function buildApp() {
  const app = express();

  app.get("/items", (req, res) => {
    // your code here
  });

  app.post("/items", (req, res) => {
    // your code here
  });

  return app;
}
`,

  tests: `test("GET /items answers 200 with the two starting items", async () => {
  const res = await request(buildApp()).get("/items");
  expect(res.status).toBe(200);
  expect(res.body).toEqual(["pencil", "eraser"]);
});

test("POST /items answers 201 (Created)", async () => {
  const res = await request(buildApp()).post("/items");
  expect(res.status).toBe(201);
  expect(res.body).toEqual({ created: true });
});
`,

  hints: [
    'In GET /items: res.status(200).json(["pencil", "eraser"]);',
    "In POST /items: res.status(201).json({ created: true });",
    "res.status(code) always comes BEFORE .json(body) in the same chained call.",
  ],

  solution: `=== CODE ===
import express from "express";

export function buildApp() {
  const app = express();

  app.get("/items", (req, res) => {
    res.status(200).json(["pencil", "eraser"]);
  });

  app.post("/items", (req, res) => {
    res.status(201).json({ created: true });
  });

  return app;
}
=== LINE BY LINE ===
res.status(200) sets the status code explicitly. It is actually Express's default for res.json() too, but writing it out makes the intent obvious: this route succeeded, plainly.
res.status(201).json({ created: true }) is the POST route's whole job: 201 specifically means "a new resource now exists because of this request", the standard signal a REST API sends back after creating something.
Notice buildApp() never calls app.listen(). A test never needs a real, listening port: supertest builds and tears down its own temporary connection to the app object directly, for each request.`,
};
