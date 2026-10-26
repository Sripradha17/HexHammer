import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s35",
  level: 5,
  order: 35,
  title: "GraphQL basics",
  runner: "server",

  look: `Every REST endpoint you have built this level returns a FIXED shape: whatever fields the route decides to send, every time. GraphQL flips that: there is usually just ONE endpoint (/graphql), and the CLIENT'S OWN QUERY decides exactly which fields come back — no more, no less.

  { fruit(id: 1) { name color } }        <- asks for only name and color
  { fruit(id: 1) { id name color } }     <- the SAME resolver, a DIFFERENT query, gets id too

Your server still needs a SCHEMA (the shape of what CAN be asked) and RESOLVERS (plain functions that fetch the real data for one field). This strike runs a real GraphQL engine (the graphql package): your resolver decides WHICH fruit to look up; the query itself decides WHICH FIELDS of it actually come back.`,

  type: `Finish the fruit resolver: return fruits[id], the matching fruit object for the id the query asked for.`,

  break: `Break it on purpose: ignore the id argument and always return fruits[1]. Every query, no matter which id it actually asks for, quietly returns the SAME apple — a subtle bug, since the response still looks perfectly reasonable, just wrong. Use the given id: return fruits[id].`,

  say: `In one sentence: what decides exactly which fields come back from a GraphQL query, if it is not the route itself?`,

  starterCode: `import express from "express";
import { graphql, buildSchema } from "graphql";

const schema = buildSchema(\`
  type Query {
    fruit(id: Int): Fruit
  }
  type Fruit {
    id: Int
    name: String
    color: String
  }
\`);

const fruits = {
  1: { id: 1, name: "apple", color: "red" },
  2: { id: 2, name: "banana", color: "yellow" },
};

const root = {
  fruit: ({ id }) => {
    // your code here
  },
};

export function buildApp() {
  const app = express();
  app.use(express.json());

  app.post("/graphql", async (req, res) => {
    const result = await graphql({ schema, source: req.body.query, rootValue: root });
    res.json(result);
  });

  return app;
}
`,

  tests: `test("a query asking for only name and color gets back exactly those two fields", async () => {
  const res = await request(buildApp())
    .post("/graphql")
    .send({ query: "{ fruit(id: 1) { name color } }" });
  expect(res.body).toEqual({ data: { fruit: { name: "apple", color: "red" } } });
});

test("a different query, on a different id, correctly gets back a different fruit", async () => {
  const res = await request(buildApp())
    .post("/graphql")
    .send({ query: "{ fruit(id: 2) { id } }" });
  expect(res.body).toEqual({ data: { fruit: { id: 2 } } });
});
`,

  hints: [
    "The resolver receives its arguments as its first parameter: ({ id }) => ...",
    "fruits is a plain object keyed by id, so this is a direct lookup, not a search.",
    "return fruits[id];",
  ],

  solution: `=== CODE ===
import express from "express";
import { graphql, buildSchema } from "graphql";

const schema = buildSchema(\`
  type Query {
    fruit(id: Int): Fruit
  }
  type Fruit {
    id: Int
    name: String
    color: String
  }
\`);

const fruits = {
  1: { id: 1, name: "apple", color: "red" },
  2: { id: 2, name: "banana", color: "yellow" },
};

const root = {
  fruit: ({ id }) => fruits[id],
};

export function buildApp() {
  const app = express();
  app.use(express.json());

  app.post("/graphql", async (req, res) => {
    const result = await graphql({ schema, source: req.body.query, rootValue: root });
    res.json(result);
  });

  return app;
}
=== LINE BY LINE ===
({ id }) => fruits[id] is the ENTIRE resolver: it only decides WHICH fruit to fetch. It has no idea whether the query asked for one field or all three — that part is handled by the GraphQL engine itself, automatically.
The SAME resolver serves both tests here. Only the QUERY STRING changed between them, and the shape of the response changed to match — proving the engine really does trim the result down to exactly what was asked for.
graphql({ schema, source, rootValue }) is the whole engine call: it parses the query against your schema, calls whichever resolvers it needs, and returns { data: ... } (or { errors: ... } if something in the query itself was invalid).`,
};
