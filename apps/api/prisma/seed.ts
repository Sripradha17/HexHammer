// Seed script: loads all content into the database. Safe to run again:
// it updates lesson text but NEVER touches my progress, notes, streak or card boxes.
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { allLessons, curriculum, interviewPacks } from "@hexhammer/content";

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
      order: lesson.order,
      title: lesson.title,
      lookText: lesson.look,
      typeText: lesson.type,
      breakText: lesson.break,
      sayText: lesson.say,
      starterCode: lesson.starterCode,
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

  console.log(
    `Seeded ${curriculum.levels.length} levels, ${allLessons.length} strikes and ${cardCount} flashcards.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
