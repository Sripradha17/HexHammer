import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s25",
  level: 5,
  order: 25,
  title: "SQL: transactions",
  runner: "sql",

  look: `A TRANSACTION groups several statements into one all-or-nothing unit: either every statement in it takes effect, or none of them do. This matters most when one change is meaningless without another — moving money is the classic example: taking $50 from one account only makes sense if it also arrives in the other.

  BEGIN;
  UPDATE accounts SET balance = balance - 50 WHERE id = 1;
  UPDATE accounts SET balance = balance + 50 WHERE id = 2;
  COMMIT;

BEGIN starts the transaction. COMMIT makes every change inside it permanent, together, as one unit. ROLLBACK does the opposite: it throws away every change since BEGIN, as if none of them ever happened — you will see exactly that in the Break step below.

Without BEGIN/COMMIT wrapping both updates, a real crash between the two UPDATE statements could leave $50 permanently gone from account 1 and never delivered to account 2. That specific danger is hard to demonstrate safely in this tiny practice sandbox, but the syntax and the guarantee it gives you are real, and this strike checks both: the final numbers, AND that you actually used BEGIN/COMMIT to get there.`,

  type: `Wrap the two UPDATE statements in a real transaction: add BEGIN; before them, and COMMIT; after them (before the final SELECT).`,

  break: `Break it on purpose: change COMMIT; to ROLLBACK;. Rerun the tests and watch the balance check fail too: ROLLBACK discards every change made since BEGIN, so both accounts end up exactly where they started (100 and 50), as if the transaction never happened at all. Put COMMIT back.`,

  say: `In one sentence: what does COMMIT guarantee that running the two UPDATEs separately, one after another, does not?`,

  starterCode: `UPDATE accounts SET balance = balance - 50 WHERE id = 1;
UPDATE accounts SET balance = balance + 50 WHERE id = 2;
SELECT * FROM accounts ORDER BY id;
`,

  sqlSeed: `CREATE TABLE accounts (id int primary key, balance int);
INSERT INTO accounts VALUES (1, 100), (2, 50);
`,

  tests: `test("both balances end up correctly updated", async () => {
  const rows = await query(code);
  expect(rows).toEqual([
    { id: 1, balance: 50 },
    { id: 2, balance: 100 },
  ]);
});

test("the two updates are wrapped in a real transaction (BEGIN ... COMMIT)", () => {
  expect(code.includes("BEGIN")).toBe(true);
  expect(code.includes("COMMIT")).toBe(true);
});
`,

  hints: [
    "Add a new first line: BEGIN;",
    "Add a new line right after the two UPDATEs, before the SELECT: COMMIT;",
    "The order is: BEGIN; then both UPDATEs; then COMMIT; then the SELECT (reading the result AFTER the transaction is done).",
  ],

  solution: `=== CODE ===
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 1;
UPDATE accounts SET balance = balance + 50 WHERE id = 2;
COMMIT;
SELECT * FROM accounts ORDER BY id;
=== LINE BY LINE ===
BEGIN marks the start of a transaction: nothing after it is permanent yet, it is all still "pending".
The two UPDATE statements run exactly as they did before, but now they run INSIDE that pending transaction, not as two independent, already-final changes.
COMMIT is what actually makes them permanent, together, as a single unit. If anything had gone wrong between BEGIN and COMMIT (a crash, an error, an explicit ROLLBACK), NEITHER update would have taken effect — that all-or-nothing guarantee is the entire point of a transaction.`,
};
