// THE RADAR SCHEDULER. Honest limits: it runs INSIDE the API process, so it only checks sources
// while `npm run dev` (or `npm start`) is running. When the app is stopped, nothing is monitored.
// See docs/TECH_RADAR.md for running it from a hosted scheduler instead.
import type { PrismaClient } from "@prisma/client";
import { topics, INTERVIEW_TARGET } from "@hexhammer/content";
import { checkSource, isDue } from "./ingest";
import type { FetchLike } from "./connectors";

const TICK_MINUTES = 15; // how often the scheduler wakes up to look for due sources
const MAX_SOURCES_PER_TICK = 5; // a simple rate limit: never hammer many sites at once

// Quarterly content-accuracy audit and monthly interview-question relevance review.
const CURRICULUM_AUDIT_DAYS = 91;
const QUESTION_REVIEW_DAYS = 30;

export const schedulerState = {
  running: false,
  startedAt: null as Date | null,
  lastTickAt: null as Date | null,
  tickMinutes: TICK_MINUTES,
};

let timer: NodeJS.Timeout | null = null;
let busy = false;

// Runs the due source checks, then the periodic curriculum jobs if they are due.
export async function tick(db: PrismaClient, fetchImpl: FetchLike, trigger = "schedule") {
  if (busy) return { skipped: true };
  busy = true;
  schedulerState.lastTickAt = new Date();
  try {
    const prefs = await db.preference.findUnique({ where: { id: 1 } });
    const categories = new Set((prefs?.radarCategories as string[] | undefined) ?? []);
    const sources = await db.techSource.findMany({ where: { enabled: true, validationStatus: { not: "invalid" } } });
    const due = sources
      .filter((s) => s.kind !== "fixture") // fixtures are for tests and demos: manual only
      .filter((s) => categories.size === 0 || categories.has(s.category))
      .filter((s) => isDue(s))
      .slice(0, MAX_SOURCES_PER_TICK);
    for (const source of due) await checkSource(db, source, trigger, fetchImpl);
    await runCurriculumJobs(db, trigger);
    return { checked: due.length };
  } finally {
    busy = false;
  }
}

// The curriculum audits do not change any lesson. They only RECORD which topics are overdue for a
// human accuracy review, and which question banks are thin, as runs I can read on the Radar page.
export async function runCurriculumJobs(db: PrismaClient, trigger: string, now = new Date()) {
  const jobs = [
    { kind: "curriculum-audit", everyDays: CURRICULUM_AUDIT_DAYS },
    { kind: "question-review", everyDays: QUESTION_REVIEW_DAYS },
  ];
  for (const job of jobs) {
    const last = await db.radarRun.findFirst({ where: { kind: job.kind }, orderBy: { startedAt: "desc" } });
    if (last && now.getTime() - last.startedAt.getTime() < job.everyDays * 24 * 3600 * 1000) continue;

    const detail =
      job.kind === "curriculum-audit"
        ? {
            overdue: topics
              .filter((t) => t.stage !== "outline")
              .filter((t) => now.getTime() - new Date(t.lastReviewedAt).getTime() > CURRICULUM_AUDIT_DAYS * 24 * 3600 * 1000 || t.reviewStatus !== "reviewed")
              .map((t) => ({ id: t.id, lastReviewedAt: t.lastReviewedAt, reviewStatus: t.reviewStatus })),
          }
        : {
            belowTarget: topics
              .filter((t) => t.stage !== "outline" && t.interviewQuestions.length < INTERVIEW_TARGET)
              .map((t) => ({ id: t.id, questions: t.interviewQuestions.length, target: INTERVIEW_TARGET })),
          };
    await db.radarRun.create({ data: { kind: job.kind, trigger, status: "ok", detail, finishedAt: new Date() } });
  }
}

export function startRadarScheduler(db: PrismaClient, fetchImpl: FetchLike) {
  if (timer) return;
  schedulerState.running = true;
  schedulerState.startedAt = new Date();
  const run = () => tick(db, fetchImpl).catch((error) => console.error("Radar tick failed:", error));
  // First tick shortly after start-up, then every TICK_MINUTES.
  setTimeout(run, 30_000).unref();
  timer = setInterval(run, TICK_MINUTES * 60_000);
  timer.unref(); // never keep the process alive just for the radar
}

export function stopRadarScheduler() {
  if (timer) clearInterval(timer);
  timer = null;
  schedulerState.running = false;
}
