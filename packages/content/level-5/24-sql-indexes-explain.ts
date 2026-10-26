import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s24",
  level: 5,
  order: 24,
  title: "SQL: indexes and EXPLAIN",
  runner: "worker",

  look: `An INDEX is a separate structure Postgres keeps alongside a table, built for one job: finding matching rows fast, without reading every single row.

  CREATE INDEX idx_orders_customer ON orders (customer_id);

Without that index, WHERE customer_id = 7 means checking EVERY row in the table (a "sequential scan"). With it, Postgres can jump almost straight to the matching rows (an "index scan"). This is not free, though: every INSERT/UPDATE now also has to update the index, and the index itself takes real disk space. An index only earns its cost on a column you actually search or join on often.

EXPLAIN shows you the REAL PLAN Postgres picked for a query, instead of leaving you to guess:

  EXPLAIN SELECT * FROM orders WHERE customer_id = 7;
  -- Seq Scan on orders  (cost=0.00..1.09 rows=1 width=32)   <- no index used
  -- Index Scan using idx_orders_customer on orders ...       <- the index WAS used

This one small practice database (pg-mem) does not implement EXPLAIN at all, so this strike is guided-local. The Break step below points you at the REAL thing instead.`,

  type: `Fill in the answers object:
  indexTradeoff   pick a, b or c: what does an index cost you, in exchange for faster reads?
  explainShows    pick a, b or c: what does EXPLAIN actually show you?
  whenToIndex     write one word: an index is worth adding on a column you frequently do WHAT on? (one word: search, filter or join on)`,

  break: `Try it for real, for free: this app's own real Postgres is already running (see the Setup section in the README). Connect with psql or a GUI tool and run EXPLAIN SELECT * FROM "Strike" WHERE id = 'l1-s01';. You will see a real query plan for a real table, from the same database this whole app uses.`,

  say: `In one sentence: why isn't it a good idea to just add an index to every column, "just in case"?`,

  starterCode: `// Strike 24: indexes and EXPLAIN.

// indexTradeoff: what does an index cost you, in exchange for faster reads?
//   a) nothing at all, indexes are always free
//   b) slower writes (INSERT/UPDATE/DELETE) and extra disk space, since the index has to be kept up to date too
//   c) it makes the table itself smaller

// explainShows: what does EXPLAIN actually show you?
//   a) the exact rows a query would return
//   b) the real PLAN Postgres picked for running a query (a sequential scan, an index scan, ...)
//   c) how many users have run this query before

const answers = {
  indexTradeoff: "",
  explainShows: "",
  whenToIndex: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("indexTradeoff", () => {
  if (said(answers.indexTradeoff) !== "b") {
    throw new Error("What does an index cost you, in exchange for faster reads? (a, b or c)");
  }
});

test("explainShows", () => {
  if (said(answers.explainShows) !== "b") {
    throw new Error("What does EXPLAIN actually show you? (a, b or c)");
  }
});

test("whenToIndex", () => {
  const value = said(answers.whenToIndex);
  if (value !== "search" && value !== "filter" && value !== "join") {
    throw new Error('Write one word: an index is worth adding on a column you frequently... (search, filter or join)');
  }
});
`,

  hints: [
    "indexTradeoff: think about what ELSE has to happen every time you INSERT a row, if that row's columns are indexed.",
    "explainShows: EXPLAIN never runs the query for real data, it explains the PLAN.",
    'whenToIndex: any one of these three words is correct here: search, filter, or join.',
  ],

  solution: `=== CODE ===
const answers = {
  indexTradeoff: "b",
  explainShows: "b",
  whenToIndex: "search",
};
=== LINE BY LINE ===
indexTradeoff is b: an index speeds up READS by keeping data pre-sorted for fast lookup, but every WRITE now has to update that extra structure too, and the index itself takes real storage. There is no such thing as a free index.
explainShows is b: EXPLAIN never actually runs your query for real rows; it shows the PLAN the query planner picked, which is exactly how you can verify an index is actually being used, instead of guessing.
whenToIndex: columns you frequently search, filter (WHERE) or join on are the ones worth indexing — a column you never query by gains nothing from an index, only cost.`,
};
