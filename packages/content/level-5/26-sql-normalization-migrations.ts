import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s26",
  level: 5,
  order: 26,
  title: "SQL: normalization and migrations",
  runner: "worker",

  look: `NORMALIZATION means splitting data so each real-world fact is stored exactly ONCE, instead of copied everywhere it is needed.

  -- Denormalized: the customer's name is repeated on every single order row
  orders(id, customer_name, item)

  -- Normalized: the name lives in ONE place; orders only reference it by id
  customers(id, name)
  orders(id, customer_id, item)

The denormalized version has a real bug waiting to happen: if a customer's name is ever corrected, you have to find and fix EVERY order row that copied it, or the same customer now has two different names sitting in your own database, disagreeing with each other.

A MIGRATION is a small, versioned script that changes the schema itself (CREATE TABLE, ADD COLUMN, ...), checked in and applied in order, so every environment (yours, a teammate's, production) ends up with the identical schema history. This app already does exactly this: look in apps/api/prisma/migrations/ — every folder in there is one real migration this project has actually run, in order, with a timestamped name.`,

  type: `Fill in the answers object:
  whyNormalize    pick a, b or c: what real bug does normalizing customer_name into its own table prevent?
  migrationIs     pick a, b or c: what is a migration?
  thisAppsProof   write one word: what folder, right in this project, holds real, already-applied migrations? (one word, no slashes)`,

  break: `Try it for real, for free: open apps/api/prisma/migrations/ in this very project and read through the .sql file inside the oldest folder. That is a real migration, written for this real app, applied to build the database you have been practicing against this whole level.`,

  say: `In one sentence: why must migrations be applied IN ORDER, never skipped or reordered?`,

  starterCode: `// Strike 26: normalization and migrations.

// whyNormalize: what real bug does normalizing customer_name into its own table prevent?
//   a) it makes queries run instantly, with zero cost
//   b) the same customer ending up with two different names stored in different rows, disagreeing with each other
//   c) it stops anyone from ever deleting a customer

// migrationIs: what is a migration?
//   a) moving a whole database to a different server
//   b) a small, versioned script that changes the schema, applied in order, so every environment ends up with the same schema history
//   c) a backup of all your data

const answers = {
  whyNormalize: "",
  migrationIs: "",
  thisAppsProof: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("whyNormalize", () => {
  if (said(answers.whyNormalize) !== "b") {
    throw new Error("What real bug does normalizing customer_name into its own table prevent? (a, b or c)");
  }
});

test("migrationIs", () => {
  if (said(answers.migrationIs) !== "b") {
    throw new Error("What is a migration? (a, b or c)");
  }
});

test("thisAppsProof", () => {
  if (said(answers.thisAppsProof) !== "migrations") {
    throw new Error('Write one word, no slashes: the folder in apps/api/prisma/ that holds real migrations. Answer: migrations');
  }
});
`,

  hints: [
    "whyNormalize: think about what happens if the SAME real-world fact (a customer's name) is copied into many rows instead of stored once.",
    "migrationIs: a migration is about the SCHEMA (the shape of your tables) changing over time, in a tracked, ordered way — not about your data or your server.",
    'thisAppsProof: look at the exact folder name inside apps/api/prisma/ — write just that one word.',
  ],

  solution: `=== CODE ===
const answers = {
  whyNormalize: "b",
  migrationIs: "b",
  thisAppsProof: "migrations",
};
=== LINE BY LINE ===
whyNormalize is b: when the same fact is copied into many rows, updating it in only SOME of them leaves your own database disagreeing with itself. Storing it once, referenced by id, makes that kind of inconsistency structurally impossible.
migrationIs is b: a migration is a small, ordered, versioned change to the SCHEMA itself. Applying the same sequence of migrations on any machine always produces the identical table structure.
thisAppsProof is "migrations": apps/api/prisma/migrations/ holds one real folder per migration this actual project has run, each with its own timestamped name and a migration.sql file — proof this whole idea is not theoretical, it is how this app's own database got built.`,
};
