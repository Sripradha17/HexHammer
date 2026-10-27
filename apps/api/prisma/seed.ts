// Seed script: loads all content into the database. Safe to run again:
// it updates lesson text but NEVER touches my progress, notes, streak or card boxes.
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { allLessons, curriculum, interviewPacks } from "@hexhammer/content";
import { DEFAULT_SOURCES, FIXTURE_SOURCES } from "../src/radar/defaultSources";

config({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });

const db = new PrismaClient();

async function main() {
  // 1. The 8 levels. A level is open once it has full lessons (Levels 1 and 2 so far).
  for (const level of curriculum.levels) {
    const data = {
      name: level.name,
      color: level.color,
      title: level.title,
      description: level.description,
      runner: level.runner,
      isOpen: level.fullLessons,
      plannedStrikes: level.strikes,
    };
    await db.level.upsert({
      where: { number: level.number },
      update: data,
      create: { number: level.number, ...data },
    });
  }

  // 2. Every lesson (Level 1 and Level 2).
  for (const lesson of allLessons) {
    const data = {
      // A lesson belongs to a level OR to a track (like the DSA track), never both.
      levelNumber: lesson.track ? null : lesson.level,
      trackId: lesson.track ?? null,
      runner: lesson.runner ?? "worker",
      order: lesson.order,
      title: lesson.title,
      lookText: lesson.look,
      typeText: lesson.type,
      breakText: lesson.break,
      sayText: lesson.say,
      starterCode: lesson.starterCode,
      sqlSeed: lesson.sqlSeed ?? null,
      tests: lesson.tests,
      hints: lesson.hints,
      solution: lesson.solution,
    };
    await db.strike.upsert({
      where: { id: lesson.id },
      update: data,
      create: { id: lesson.id, ...data },
    });
  }

  // 3. The Say-It flashcards of every level. On re-seed we only refresh the text, so my box and schedule stay.
  let cardCount = 0;
  for (const pack of Object.values(interviewPacks)) {
    for (const card of pack.sayIt) {
      const data = { answer: card.answer, isPreview: card.isPreview ?? false };
      await db.interviewCard.upsert({
        where: { level_question: { level: pack.level, question: card.question } },
        update: data,
        create: { level: pack.level, question: card.question, ...data },
      });
      cardCount = cardCount + 1;
    }
  }

  // 4. Tech Radar sources. Created as "unverified" (or left alone if they already exist, so my
  // edits, enable/disable choices and health history are kept). `npm run radar:validate` then
  // fetches each one and records whether it really works. Fixture sources are local test files.
  for (const source of [...DEFAULT_SOURCES, ...FIXTURE_SOURCES]) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { briefUrl, ...data } = source;
    await db.techSource.upsert({
      where: { url: source.url },
      update: {},
      create: { ...data, validationStatus: source.kind === "fixture" ? "valid" : "unverified" },
    });
  }

  // 5. My preferences row (defaults), if it does not exist yet.
  await db.preference.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  console.log(
    `Seeded ${curriculum.levels.length} levels, ${allLessons.length} strikes, ${cardCount} flashcards and ${DEFAULT_SOURCES.length + FIXTURE_SOURCES.length} radar sources.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
