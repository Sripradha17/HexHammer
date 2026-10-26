import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s02",
  level: 5,
  order: 2,
  title: "Express basics",
  runner: "server",

  look: `Express is a small library that turns Node's raw HTTP handling into simple, readable routes: one function per (method, path) pair.

  const app = express();

  app.get("/users/:id", (req, res) => {
    res.json({ id: req.params.id });
  });

req.params holds pieces of the URL you marked with a colon (:id here). Visiting /users/7 makes req.params.id equal the STRING "7" (URL pieces always arrive as text, never a real number, even if they look like one).

Express also has to be told to actually read a JSON request body before your route can use it:

  app.use(express.json());   // now req.body works on POST/PUT routes

Without that line, req.body is undefined even when the caller sent a perfectly good JSON body.`,

  type: `Finish buildApp():
1. Turn on JSON body reading with app.use(express.json()).
2. GET /users/:id should answer status 200 with { id: req.params.id }.
3. POST /users should answer status 201 with { name: req.body.name }.`,

  break: `Break it on purpose: delete the app.use(express.json()) line. GET /users/:id still works fine (it never reads a body), but POST /users now answers with { name: undefined }, because req.body was never parsed in the first place. Put the line back.`,

  say: `In one sentence: what does app.use(express.json()) do, and what breaks without it?`,

  starterCode: `import express from "express";

export function buildApp() {
  const app = express();

  // your code here: turn on JSON body reading

  app.get("/users/:id", (req, res) => {
    // your code here
  });

  app.post("/users", (req, res) => {
    // your code here
  });

  return app;
}
`,

  tests: `test("GET /users/:id echoes the id from the URL", async () => {
  const res = await request(buildApp()).get("/users/7");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ id: "7" });
});

test("POST /users reads the JSON body and answers 201 with the name", async () => {
  const res = await request(buildApp()).post("/users").send({ name: "Sam" });
  expect(res.status).toBe(201);
  expect(res.body).toEqual({ name: "Sam" });
});
`,

  hints: [
    "First line inside buildApp(): app.use(express.json());",
    'GET /users/:id: res.json({ id: req.params.id });',
    'POST /users: res.status(201).json({ name: req.body.name });',
  ],

  solution: `=== CODE ===
import express from "express";

export function buildApp() {
  const app = express();

  app.use(express.json());

  app.get("/users/:id", (req, res) => {
    res.json({ id: req.params.id });
  });

  app.post("/users", (req, res) => {
    res.status(201).json({ name: req.body.name });
  });

  return app;
}
=== LINE BY LINE ===
app.use(express.json()) runs on EVERY request, before your own routes, and does one job: if the request has a JSON body, parse it and put the result on req.body. Skip this line and req.body is always undefined, no matter what the caller sent.
req.params.id comes straight from the URL's :id piece. It is always a string, even for "/users/7": there is no automatic number conversion.
req.body.name only exists because express.json() already ran and filled it in. The ORDER middleware runs in matters, and app.use(...) calls always run before the routes defined after them.`,
};
