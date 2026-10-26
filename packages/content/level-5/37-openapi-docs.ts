import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s37",
  level: 5,
  order: 37,
  title: "OpenAPI docs",
  runner: "server",

  look: `OpenAPI is a standard, machine-readable way to describe an API's shape: which paths exist, which methods they answer to, and what each one returns. Real tooling reads this SAME document to generate interactive docs, generate a typed client, and even validate real requests automatically — it is not just a comment, it is DATA other software actually consumes.

  {
    "/fruits": {
      "get": {
        "summary": "List all fruits",
        "responses": { "200": { "description": "A list of fruits" } }
      }
    }
  }

This is the exact same kind of API you have been building all level, just described in a standard shape instead of only living in your route handlers. A route serving this JSON at /openapi.json (as this strike does) is a real, common pattern: the documentation is served BY the API it describes.`,

  type: `Finish the get object describing GET /fruits:
1. summary: "List all fruits"
2. responses: { "200": { description: "A list of fruits" } }`,

  break: `Break it on purpose: misspell the field name "summary" as "sumary". The test catches it immediately — exactly the value of checking your API's DESCRIPTION for real, the same way you have been checking its actual behavior all level. Real OpenAPI tooling would reject this exact typo too, refusing to generate docs from a field it does not recognize.`,

  say: `In one sentence: why is it useful for an OpenAPI document to be DATA (JSON), instead of just a paragraph of comments?`,

  starterCode: `import express from "express";

const openApiSpec = {
  openapi: "3.0.0",
  info: { title: "Fruit API", version: "1.0.0" },
  paths: {
    "/fruits": {
      get: {
        // your code here
      },
    },
  },
};

export function buildApp() {
  const app = express();
  app.get("/openapi.json", (req, res) => res.json(openApiSpec));
  return app;
}
`,

  tests: `test("GET /openapi.json describes the /fruits endpoint correctly", async () => {
  const res = await request(buildApp()).get("/openapi.json");
  expect(res.body.paths["/fruits"].get).toEqual({
    summary: "List all fruits",
    responses: { "200": { description: "A list of fruits" } },
  });
});
`,

  hints: [
    'summary: "List all fruits",',
    'responses: { "200": { description: "A list of fruits" } },',
    "Both fields go directly inside the get object, as siblings.",
  ],

  solution: `=== CODE ===
import express from "express";

const openApiSpec = {
  openapi: "3.0.0",
  info: { title: "Fruit API", version: "1.0.0" },
  paths: {
    "/fruits": {
      get: {
        summary: "List all fruits",
        responses: { "200": { description: "A list of fruits" } },
      },
    },
  },
};

export function buildApp() {
  const app = express();
  app.get("/openapi.json", (req, res) => res.json(openApiSpec));
  return app;
}
=== LINE BY LINE ===
summary is the short, human-readable label real tooling shows for this endpoint in generated documentation — the same kind of description you have been writing in every strike's own "look" and "type" text.
responses describes what a CALLER can expect back, keyed by status code (as a string, since it is a real key in a real object): here, just the shape for a successful 200.
Because this whole document is plain, structured DATA (not free-text comments), other real software can read it and act on it: generate docs, generate a client SDK, or validate that your ACTUAL responses match what you claimed they would be.`,
};
