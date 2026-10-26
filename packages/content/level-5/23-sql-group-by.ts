import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s23",
  level: 5,
  order: 23,
  title: "SQL: group by",
  runner: "sql",

  look: `GROUP BY collapses many rows into one row PER GROUP, so you can summarize instead of listing everything raw. Pair it with an AGGREGATE function (SUM, COUNT, AVG, ...) that says HOW to combine each group's rows into one value.

  SELECT customer_name, SUM(amount) AS total
  FROM orders
  GROUP BY customer_name;

Read this as "for every distinct customer_name, add up all their amount values into one total". A real rule worth knowing: every selected column must be either named in GROUP BY, or wrapped in an aggregate — real Postgres refuses to run a query that breaks this rule, since it would not know WHICH row's raw value to show for a column that is neither grouped nor summarized.`,

  type: `Rewrite the query to GROUP BY customer_name, selecting customer_name and SUM(amount) AS total, ordered by customer_name.`,

  break: `Break it on purpose: select amount directly alongside GROUP BY customer_name, without wrapping it in SUM(...). Real Postgres refuses to even run this: an error, column "orders.amount" must appear in the GROUP BY clause or be used in an aggregate function. Wrap it in SUM(amount) instead.`,

  say: `In one sentence: why must every selected column either be grouped by or wrapped in an aggregate function?`,

  starterCode: `SELECT customer_name, amount
FROM orders;
-- your query here: group by customer_name and SUM the amount
`,

  sqlSeed: `CREATE TABLE orders (id int, customer_name text, amount int);
INSERT INTO orders VALUES (1, 'Alice', 20), (2, 'Alice', 15), (3, 'Bob', 40);
`,

  tests: `test("totals are summed correctly per customer, alphabetically", async () => {
  const rows = await query(code);
  expect(rows).toEqual([
    { customer_name: "Alice", total: 35 },
    { customer_name: "Bob", total: 40 },
  ]);
});
`,

  hints: [
    "SELECT customer_name, SUM(amount) AS total",
    "FROM orders GROUP BY customer_name",
    "ORDER BY customer_name",
  ],

  solution: `=== CODE ===
SELECT customer_name, SUM(amount) AS total
FROM orders
GROUP BY customer_name
ORDER BY customer_name;
=== LINE BY LINE ===
GROUP BY customer_name collapses Alice's two separate order rows (20 and 15) into ONE group, and Bob's single row into its own group.
SUM(amount) AS total is the aggregate: for Alice's group it adds 20 + 15 = 35; for Bob's group, with only one row, it is just 40.
customer_name is safe to select plainly because it IS the thing being grouped by: every row inside one group shares the exact same customer_name, so there is no ambiguity about which value to show.`,
};
