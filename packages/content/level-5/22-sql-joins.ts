import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s22",
  level: 5,
  order: 22,
  title: "SQL: joins",
  runner: "sql",

  look: `Real data lives in more than one table. A JOIN combines rows from two tables based on a matching condition, so one query can answer a question that needs BOTH.

  SELECT orders.id, customers.name
  FROM orders
  JOIN customers ON customers.id = orders.customer_id;

Read ON customers.id = orders.customer_id as "match up a customer row with an order row wherever these two columns are equal". For each matching pair, the JOIN produces ONE combined row with columns from both tables. This strike runs your SQL for real, against a fresh, throwaway in-memory database seeded with two small tables: customers (id, name) and orders (id, customer_id, item).`,

  type: `Rewrite the query so it JOINs orders to customers (matching customers.id to orders.customer_id), selecting orders.id AS order_id, customers.name AS customer_name, and orders.item, ordered by orders.id.`,

  break: `Break it on purpose: change the join condition to ON customers.id = orders.id (matching the wrong columns entirely). Since orders' ids (100, 101, 102) never equal any customer's id (1, 2), nothing matches — an INNER JOIN like this one quietly returns ZERO rows, no error at all, just a confidently empty, wrong answer. Match customers.id to orders.customer_id instead.`,

  say: `In one sentence: what does a JOIN's ON condition actually decide?`,

  starterCode: `SELECT orders.id, orders.item
FROM orders;
-- your query here: JOIN customers so you can also select their name
`,

  sqlSeed: `CREATE TABLE customers (id int, name text);
CREATE TABLE orders (id int, customer_id int, item text);
INSERT INTO customers VALUES (1, 'Alice'), (2, 'Bob');
INSERT INTO orders VALUES (100, 1, 'Widget'), (101, 1, 'Gadget'), (102, 2, 'Widget');
`,

  tests: `test("the join includes each order's id, the customer's name, and the item, in order-id order", async () => {
  const rows = await query(code);
  expect(rows).toEqual([
    { order_id: 100, customer_name: "Alice", item: "Widget" },
    { order_id: 101, customer_name: "Alice", item: "Gadget" },
    { order_id: 102, customer_name: "Bob", item: "Widget" },
  ]);
});
`,

  hints: [
    "SELECT orders.id AS order_id, customers.name AS customer_name, orders.item",
    "FROM orders JOIN customers ON customers.id = orders.customer_id",
    "ORDER BY orders.id",
  ],

  solution: `=== CODE ===
SELECT orders.id AS order_id, customers.name AS customer_name, orders.item
FROM orders
JOIN customers ON customers.id = orders.customer_id
ORDER BY orders.id;
=== LINE BY LINE ===
FROM orders JOIN customers ON ... starts from every order, and for each one, finds the ONE customer row whose id matches that order's customer_id.
AS order_id and AS customer_name rename the result columns: without them, both tables' id columns would collide under the plain name "id" in the output.
ORDER BY orders.id makes the result predictable: a JOIN does not promise any particular row order by itself, so anything you actually depend on the order for needs its own explicit ORDER BY, the same rule as everywhere else in SQL.`,
};
