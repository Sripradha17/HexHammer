// All REST routes. Each route is a small function: read the request, talk to the database, reply with JSON.
// Express 5 catches errors from async routes for us, so a thrown HttpError goes to the error handler.
import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import { curriculum } from "@hexhammer/content";
import { HttpError } from "./httpError";
import { validate } from "./middleware/validate";
import { calculateStreak, toDateString } from "./streak";
import { isDueToday, nextBox, nextReviewDate } from "./spacedRepetition";

// After this many FAILED runs, the "reveal" button unlocks.
const FAILED_RUNS_BEFORE_REVEAL = 2;

export function createRouter(db: PrismaClient) {
  const router = Router();

  // Remember that I practiced today (this feeds the streak counter).
  async function recordToday() {
    const date = toDateString();
    await db.streakDay.upsert({ where: { date }, update: {}, create: { date } });
  }

  // Find a strike or answer 404.
  async function findStrikeOr404(id: string) {
    const strike = await db.strike.findUnique({ where: { id }, select: { id: true } });
    if (!strike) {
      throw new HttpError(404, `No strike with id "${id}"`);
    }
    return strike;
  }

  // GET /levels -> the 8 levels with % complete, plus the 3 tracks.
  router.get("/levels", async (_req, res) => {
    const levels = await db.level.findMany({
      orderBy: { number: "asc" },
      include: {
        strikes: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            order: true,
            title: true,
            progress: { select: { status: true } },
          },
        },
      },
    });

    const result = levels.map((level) => {
      const total = level.strikes.length;
      const done = level.strikes.filter((s) => s.progress?.status === "complete").length;
      return {
        number: level.number,
        name: level.name,
        color: level.color,
        title: level.title,
        description: level.description,
        runner: level.runner,
        rebuild:
          curriculum.levels.find((meta) => meta.number === level.number)?.rebuild ?? "",
        isOpen: level.isOpen,
        plannedStrikes: level.plannedStrikes,
        totalStrikes: total,
        completedStrikes: done,
        percentComplete: total === 0 ? 0 : Math.round((done / total) * 100),
        strikes: level.strikes.map((s) => ({
          id: s.id,
          order: s.order,
          title: s.title,
          status: s.progress?.status ?? "not_started",
        })),
      };
    });

    // Tracks (like DSA) have their own strikes, so they get progress numbers too.
    const trackStrikes = await db.strike.findMany({
      where: { trackId: { not: null } },
      orderBy: { order: "asc" },
      select: {
        id: true,
        order: true,
        title: true,
        trackId: true,
        progress: { select: { status: true } },
      },
    });
    const tracks = curriculum.tracks.map((track) => {
      const own = trackStrikes.filter((s) => s.trackId === track.id);
      const done = own.filter((s) => s.progress?.status === "complete").length;
      return {
        ...track,
        isOpen: track.fullLessons,
        totalStrikes: own.length,
        completedStrikes: done,
        percentComplete: own.length === 0 ? 0 : Math.round((done / own.length) * 100),
        strikes: own.map((s) => ({
          id: s.id,
          order: s.order,
          title: s.title,
          status: s.progress?.status ?? "not_started",
        })),
      };
    });

    res.json({ levels: result, tracks });
  });

  // GET /strikes/:id -> one lesson WITHOUT the solution, plus my progress.
  router.get("/strikes/:id", async (req, res) => {
    const strike = await db.strike.findUnique({
      where: { id: String(req.params.id) },
      omit: { solution: true },
      include: { progress: true, sayNote: true },
    });
    if (!strike) {
      throw new HttpError(404, `No strike with id "${String(req.params.id)}"`);
    }

    const track = strike.trackId
      ? curriculum.tracks.find((t) => t.id === strike.trackId)
      : undefined;

    const next = await db.strike.findFirst({
      // The next strike is in the same level, or in the same track.
      where: strike.trackId
        ? { trackId: strike.trackId, order: { gt: strike.order } }
        : { levelNumber: strike.levelNumber, order: { gt: strike.order } },
      orderBy: { order: "asc" },
      select: { id: true },
    });

    res.json({
      id: strike.id,
      // For a track strike, `level` is the track's color number (1 to 8), so the page can be colored.
      level: strike.levelNumber ?? track?.accent ?? 1,
      trackId: strike.trackId,
      trackTitle: track?.title ?? null,
      order: strike.order,
      title: strike.title,
      look: strike.lookText,
      type: strike.typeText,
      break: strike.breakText,
      say: strike.sayText,
      starterCode: strike.starterCode,
      tests: strike.tests,
      hints: strike.hints,
      status: strike.progress?.status ?? "not_started",
      savedCode: strike.progress?.savedCode ?? null,
      attempts: strike.progress?.attempts ?? 0,
      sayNote: strike.sayNote?.text ?? "",
      nextStrikeId: next?.id ?? null,
    });
  });

  // PUT /strikes/:id/code -> auto-save my code.
  router.put(
    "/strikes/:id/code",
    validate({ body: { code: "string" } }),
    async (req, res) => {
      const strikeId = String(req.params.id);
      await findStrikeOr404(strikeId);

      const existing = await db.progress.findUnique({ where: { strikeId } });
      // Saving code never un-completes a strike.
      const status = existing?.status === "complete" ? "complete" : "in_progress";

      await db.progress.upsert({
        where: { strikeId },
        update: { savedCode: req.body.code, status },
        create: { strikeId, savedCode: req.body.code, status },
      });
      res.json({ ok: true, savedAt: new Date().toISOString() });
    },
  );

  // POST /strikes/:id/attempt -> record the result of one test run.
  // The tests run in MY browser (in a Web Worker); the browser only reports pass or fail.
  router.post(
    "/strikes/:id/attempt",
    validate({ body: { passed: "boolean", code: "string" } }),
    async (req, res) => {
      const strikeId = String(req.params.id);
      await findStrikeOr404(strikeId);

      const existing = await db.progress.findUnique({ where: { strikeId } });
      const alreadyComplete = existing?.status === "complete";
      const failedRuns = (existing?.attempts ?? 0) + (req.body.passed ? 0 : 1);

      const progress = await db.progress.upsert({
        where: { strikeId },
        update: {
          savedCode: req.body.code,
          attempts: failedRuns,
          status: req.body.passed || alreadyComplete ? "complete" : "in_progress",
          // Keep the FIRST time I passed.
          passedAt: req.body.passed && !alreadyComplete ? new Date() : undefined,
        },
        create: {
          strikeId,
          savedCode: req.body.code,
          attempts: failedRuns,
          status: req.body.passed ? "complete" : "in_progress",
          passedAt: req.body.passed ? new Date() : null,
        },
      });

      if (req.body.passed) {
        await recordToday();
      }

      res.json({
        status: progress.status,
        attempts: progress.attempts,
        canReveal:
          progress.status === "complete" ||
          progress.attempts >= FAILED_RUNS_BEFORE_REVEAL,
      });
    },
  );

  // GET /strikes/:id/solution -> the explained solution, ONLY after 2 failed runs (or after passing).
  // This is an extra route beyond the nine in the brief, so the solution never leaves the server early.
  router.get("/strikes/:id/solution", async (req, res) => {
    const strike = await db.strike.findUnique({
      where: { id: String(req.params.id) },
      select: { solution: true, progress: { select: { status: true, attempts: true } } },
    });
    if (!strike) {
      throw new HttpError(404, `No strike with id "${String(req.params.id)}"`);
    }

    const unlocked =
      strike.progress?.status === "complete" ||
      (strike.progress?.attempts ?? 0) >= FAILED_RUNS_BEFORE_REVEAL;
    if (!unlocked) {
      throw new HttpError(403, "Try the tests at least twice first. You can do this!");
    }
    res.json({ solution: strike.solution });
  });

  // PUT /strikes/:id/say -> save my one-sentence explanation.
  router.put(
    "/strikes/:id/say",
    validate({ body: { text: "string" } }),
    async (req, res) => {
      const strikeId = String(req.params.id);
      await findStrikeOr404(strikeId);

      await db.sayNote.upsert({
        where: { strikeId },
        update: { text: req.body.text },
        create: { strikeId, text: req.body.text },
      });
      await recordToday();
      res.json({ ok: true });
    },
  );

  // GET /progress -> my progress on every strike I have touched.
  router.get("/progress", async (_req, res) => {
    const rows = await db.progress.findMany({
      select: { strikeId: true, status: true, attempts: true, passedAt: true },
    });
    res.json({ progress: rows });
  });

  // GET /cards/due -> flashcards to review today.
  router.get("/cards/due", async (_req, res) => {
    const cards = await db.interviewCard.findMany({ orderBy: { id: "asc" } });
    const due = cards.filter((card) => isDueToday(card.nextReviewAt));
    res.json({ count: due.length, cards: due });
  });

  // POST /cards/:id/review -> "I knew it" (knew: true) or "Missed it" (knew: false).
  router.post(
    "/cards/:id/review",
    validate({ params: { id: "numeric" }, body: { knew: "boolean" } }),
    async (req, res) => {
      const id = Number(String(req.params.id));
      const card = await db.interviewCard.findUnique({ where: { id } });
      if (!card) {
        throw new HttpError(404, `No card with id ${id}`);
      }

      const box = nextBox(card.box, req.body.knew);
      const updated = await db.interviewCard.update({
        where: { id },
        data: { box, nextReviewAt: nextReviewDate(box) },
      });
      await recordToday();
      res.json({ id: updated.id, box: updated.box, nextReviewAt: updated.nextReviewAt });
    },
  );

  // GET /streak -> how many days in a row have I practiced?
  router.get("/streak", async (_req, res) => {
    const rows = await db.streakDay.findMany({ select: { date: true } });
    const days = rows.map((row) => row.date);
    const today = toDateString();
    res.json({
      current: calculateStreak(days, today),
      doneToday: days.includes(today),
      totalDays: days.length,
    });
  });

  return router;
}
