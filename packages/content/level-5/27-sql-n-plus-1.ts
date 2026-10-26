import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s27",
  level: 5,
  order: 27,
  title: "SQL: the N+1 problem",
  runner: "server",

  look: `The N+1 problem: fetching a list with ONE query, then looping over it and running ONE MORE query PER item to fetch each item's related data. For 2 customers that is 3 queries; for 10,000 customers, it is 10,001 — the number of round trips to the database grows in direct proportion to how much data you have, which is exactly the kind of thing that works fine in a demo and falls over in production.

  // N+1: 1 query for customers, then 1 MORE query PER customer (bad)
  const customers = getAllCustomers();
  const withOrders = customers.map((c) => ({ ...c, orders: getOrdersFor(c.id) }));

  // Fixed: 1 query for customers, 1 query for ALL their orders, then group in memory (good)
  const customers = getAllCustomers();
  const everyOrder = getAllOrders();
  const withOrders = customers.map((c) => ({
    ...c,
    orders: everyOrder.filter((o) => o.customerId === c.id),
  }));

Both versions produce the exact same RESULT. Only the number of trips to the database is different. This strike tracks that number for you (queryCount), so you can prove the fix for real, not just by eyeballing the code.`,

  type: `Finish GET /customers-with-orders:
1. Call allOrders() exactly ONCE (not once per customer).
2. Group the orders under each customer in memory (each order's customerId matches a customer's id).
3. Respond 200 with { customers: [...], queriesUsed: queryCount }, where each customer object also has an orders array.`,

  break: `Break it on purpose: instead of calling allOrders() once, call it again inside a .map() over customers, once per customer (customers.map((c) => ({ ...c, orders: allOrders().filter((o) => o.customerId === c.id) }))). The final RESULT looks identical, so it is easy to miss — but queriesUsed jumps from 1 to 2 here (and would keep growing with every extra customer). Call allOrders() exactly once, outside any loop over customers.`,

  say: `In one sentence: why can two pieces of code that return the exact same result still have a real, measurable difference in cost?`,

  starterCode: `import express from "express";

const customers = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];
const orders = [
  { id: 100, customerId: 1, item: "Widget" },
  { id: 101, customerId: 1, item: "Gadget" },
  { id: 102, customerId: 2, item: "Widget" },
];

export function buildApp() {
  const app = express();
  let queryCount = 0;

  function allOrders() {
    queryCount = queryCount + 1; // pretend this is one real trip to the database
    return orders;
  }

  app.get("/customers-with-orders", (req, res) => {
    // your code here
  });

  return app;
}
`,

  tests: `test("every order is correctly grouped under its own customer", async () => {
  const res = await request(buildApp()).get("/customers-with-orders");
  expect(res.status).toBe(200);
  expect(res.body.customers).toEqual([
    {
      id: 1,
      name: "Alice",
      orders: [
        { id: 100, customerId: 1, item: "Widget" },
        { id: 101, customerId: 1, item: "Gadget" },
      ],
    },
    { id: 2, name: "Bob", orders: [{ id: 102, customerId: 2, item: "Widget" }] },
  ]);
});

test("it only ever calls allOrders() ONCE, no matter how many customers there are", async () => {
  const res = await request(buildApp()).get("/customers-with-orders");
  expect(res.body.queriesUsed).toBe(1);
});
`,

  hints: [
    "const everyOrder = allOrders(); — call it exactly once, before you touch customers at all.",
    "const result = customers.map((c) => ({ ...c, orders: everyOrder.filter((o) => o.customerId === c.id) }));",
    "res.json({ customers: result, queriesUsed: queryCount });",
  ],

  solution: `=== CODE ===
import express from "express";

const customers = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];
const orders = [
  { id: 100, customerId: 1, item: "Widget" },
  { id: 101, customerId: 1, item: "Gadget" },
  { id: 102, customerId: 2, item: "Widget" },
];

export function buildApp() {
  const app = express();
  let queryCount = 0;

  function allOrders() {
    queryCount = queryCount + 1;
    return orders;
  }

  app.get("/customers-with-orders", (req, res) => {
    const everyOrder = allOrders();
    const result = customers.map((customer) => ({
      ...customer,
      orders: everyOrder.filter((order) => order.customerId === customer.id),
    }));
    res.json({ customers: result, queriesUsed: queryCount });
  });

  return app;
}
=== LINE BY LINE ===
const everyOrder = allOrders(); runs ONCE, fetching every order that exists, regardless of how many customers there are.
customers.map(...) then does the grouping ENTIRELY in memory, using .filter() on data already sitting in a JS array — no more calls to allOrders() at all, no matter how many customers you loop over.
queriesUsed: queryCount reports the real count back in the response itself, which is exactly what makes this testable: the test does not have to trust the code by reading it, it can check the actual number.`,
};
