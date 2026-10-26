import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s28",
  level: 5,
  order: 28,
  title: "Prisma ORM",
  runner: "worker",

  look: `An ORM (Object-Relational Mapper) lets you describe your schema once and call typed JS/TS methods instead of writing raw SQL strings by hand. Prisma is the ORM this real app already uses, everywhere. You do not have to imagine an example: open apps/api/prisma/schema.prisma (the schema) and apps/api/src/routes.ts (real calls like db.strike.findUnique(...) and db.progress.upsert(...)) right now.

  // Prisma call (typed, checked at compile time)
  const strike = await db.strike.findUnique({ where: { id: "l1-s01" } });

  // roughly what Prisma actually runs, underneath
  SELECT * FROM "Strike" WHERE id = 'l1-s01';

upsert (used throughout this app's own routes.ts) means "update if a row already exists, otherwise create it" — one call instead of hand-writing an if/else around two separate queries yourself. migrate deploy (which you have already run, back in Setup) is Prisma applying every migration file, in order, to bring a database's schema up to date — the exact migrations mechanism from the last strike, with Prisma driving it.`,

  type: `Fill in the answers object:
  ormDoes        pick a, b or c: what does an ORM actually let you avoid writing by hand?
  upsertMeans    pick a, b or c: what does upsert do?
  realProof      write one word: the real file, right in this project, that defines every model (Strike, Level, Progress, ...) Prisma knows about? (one word, no extension)`,

  break: `Try it for real, for free: open apps/api/src/routes.ts and search for ".findUnique(" or ".upsert(". Every one of those calls is real Prisma, already running, right now, every time you load a strike or save your code in this very app.`,

  say: `In one sentence: what does Prisma actually generate FROM schema.prisma, that makes db.strike.findUnique(...) possible at all?`,

  starterCode: `// Strike 28: Prisma ORM.

// ormDoes: what does an ORM actually let you avoid writing by hand?
//   a) HTML and CSS
//   b) raw SQL strings for common operations, in favor of typed method calls
//   c) tests

// upsertMeans: what does upsert do?
//   a) always creates a brand new row, even if one already exists
//   b) updates a row if it already exists, otherwise creates it — one call instead of two
//   c) deletes a row if it exists

const answers = {
  ormDoes: "",
  upsertMeans: "",
  realProof: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("ormDoes", () => {
  if (said(answers.ormDoes) !== "b") {
    throw new Error("What does an ORM actually let you avoid writing by hand? (a, b or c)");
  }
});

test("upsertMeans", () => {
  if (said(answers.upsertMeans) !== "b") {
    throw new Error("What does upsert do? (a, b or c)");
  }
});

test("realProof", () => {
  if (said(answers.realProof) !== "schema") {
    throw new Error('Write one word, no extension: the file in apps/api/prisma/ that defines every model. Answer: schema');
  }
});
`,

  hints: [
    "ormDoes: it is the SQL itself an ORM saves you from writing for the common cases, not markup or tests.",
    "upsertMeans: read the word as UP(date) + (in)SERT: whichever one actually applies right now.",
    'realProof: the file is apps/api/prisma/schema.prisma — write just its name, without ".prisma".',
  ],

  solution: `=== CODE ===
const answers = {
  ormDoes: "b",
  upsertMeans: "b",
  realProof: "schema",
};
=== LINE BY LINE ===
ormDoes is b: an ORM's whole job is turning typed method calls like db.strike.findUnique(...) into the equivalent SQL for you, for the common, everyday operations — you can still drop down to raw SQL (as you did in the SQL strikes) for anything an ORM does not cover well.
upsertMeans is b: upsert = update-if-it-exists, insert-if-it-does-not, as ONE call. Look at apps/api/src/routes.ts's PUT /strikes/:id/code route: it upserts your Progress row exactly this way, every time you type.
realProof is "schema": apps/api/prisma/schema.prisma is the single source of truth Prisma reads to generate the typed client you have been calling (db.strike, db.level, db.progress, ...) this entire session.`,
};
