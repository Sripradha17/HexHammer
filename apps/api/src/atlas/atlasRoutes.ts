// The Atlas API: map, topics, exercises, assessments, reviews, interview arena, glossary,
// analytics, preferences and backup. Each route: read the request, use the rules, save, reply.
import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import {
  allChoiceQuestions,
  allInterviewQuestions,
  domains,
  getTopic,
  glossary,
  INTERVIEW_TARGET,
  topicCompleteness,
  topics,
} from "@hexhammer/content";
import { HttpError } from "../httpError";
import { validate } from "../middleware/validate";
import { calculateStreak, toDateString } from "../streak";
import {
  domainUnlocked,
  exerciseKey,
  firstReviewDate,
  levelFromXp,
  masteryChecklist,
  nextReview,
  prerequisiteMet,
  QUESTION_INTERVALS,
  ratingToResult,
  scoreAssessment,
  topicStatus,
  XP,
  type ReviewResult,
  type TopicEvidence,
} from "./rules";
import { ACHIEVEMENTS } from "./achievements";
import { publicChoice, publicInterview, publicTopic } from "./sanitize";
import {
  afterProgress,
  awardXp,
  endOfToday,
  ensureTopicProgress,
  getPreferences,
  loadEvidence,
  logActivity,
  topicOr404,
} from "./service";

const choiceById = new Map(allChoiceQuestions().map((q) => [q.id, q]));
const interviewById = new Map(allInterviewQuestions().map((q) => [q.id, q]));

export function createAtlasRouter(db: PrismaClient) {
  const router = Router();

  // Mark today as a practice day (feeds the gentle streak counter, which never resets progress).
  async function recordToday() {
    const date = toDateString();
    await db.streakDay.upsert({ where: { date }, update: {}, create: { date } });
  }

  // Work out the status of every topic and region from the evidence.
  async function buildMap() {
    const prefs = await getPreferences(db);
    const { evidence, completedStrikes } = await loadEvidence(db);
    const passed = new Set(
      [...evidence.entries()]
        .filter(([id, ev]) => ev.bestAssessmentScore !== null && ev.bestAssessmentScore >= (getTopic(id)?.masteryCriteria.assessmentScore ?? 1))
        .map(([id]) => id),
    );
    const topicView = (id: string) => {
      const t = getTopic(id)!;
      const ev = evidence.get(id) ?? null;
      const prereqsMet = t.prerequisites.every((p) => prerequisiteMet(getTopic(p)!, evidence.get(p) ?? null, completedStrikes));
      return {
        id: t.id,
        title: t.title,
        stage: t.stage,
        difficulty: t.difficulty,
        capstone: Boolean(t.capstone),
        prerequisites: t.prerequisites,
        status: topicStatus(t, ev, prereqsMet),
        reviewDue: ev?.reviewDue ?? false,
        strikeCount: t.strikeIds.length,
        hasAssessment: Boolean(t.assessment),
      };
    };
    const regionList = domains.map((d) => {
      const unlocked = domainUnlocked(d, topics, passed, completedStrikes);
      const modules = d.modules.map((m) => ({ id: m.id, title: m.title, summary: m.summary, topics: m.topicIds.map(topicView) }));
      const all = modules.flatMap((m) => m.topics);
      return {
        id: d.id,
        number: d.number,
        title: d.title,
        short: d.short,
        tagline: d.tagline,
        story: d.story,
        hue: d.hue,
        col: d.col,
        row: d.row,
        unlockedBy: d.unlockedBy,
        unlocked,
        modules,
        counts: {
          topics: all.length,
          written: all.filter((t) => t.stage === "complete").length,
          started: all.filter((t) => t.status !== "new" && t.status !== "locked").length,
          assessed: all.filter((t) => t.status === "assessed" || t.status === "mastered").length,
          mastered: all.filter((t) => t.status === "mastered").length,
          reviewDue: all.filter((t) => t.reviewDue).length,
        },
      };
    });
    return { regions: regionList, prefs, evidence, completedStrikes };
  }

  async function xpTotal() {
    const sum = await db.xpEvent.aggregate({ _sum: { amount: true } });
    return sum._sum.amount ?? 0;
  }

  // ------------------------------------------------------------------ Map and me

  // GET /atlas/map -> every region and topic with my real status.
  router.get("/atlas/map", async (_req, res) => {
    const { regions, prefs } = await buildMap();
    res.json({ regions, strictUnlocking: prefs.strictUnlocking });
  });

  // GET /atlas/me -> XP, level, achievements (all, with unlocked flags) and streak.
  router.get("/atlas/me", async (_req, res) => {
    const [xp, unlocked, days] = await Promise.all([
      xpTotal(),
      db.achievement.findMany(),
      db.streakDay.findMany({ select: { date: true } }),
    ]);
    const when = new Map(unlocked.map((a) => [a.id, a.unlockedAt]));
    res.json({
      xp,
      ...levelFromXp(xp),
      achievements: ACHIEVEMENTS.map(({ id, title, description, icon }) => ({ id, title, description, icon, unlockedAt: when.get(id) ?? null })),
      streak: { current: calculateStreak(days.map((d) => d.date), toDateString()), totalDays: days.length },
    });
  });

  // GET /atlas/mission-control -> the few things the home screen needs, chosen from real data.
  router.get("/atlas/mission-control", async (_req, res) => {
    const { regions, prefs, evidence } = await buildMap();
    const [xp, lastActivity, dueTopics, dueQuestions, nextDue, activeProject, unlockedAchievements, streakDays, radarCounts] = await Promise.all([
      xpTotal(),
      db.activityLog.findFirst({ where: { topicId: { not: null } }, orderBy: { createdAt: "desc" } }),
      db.reviewItem.count({ where: { kind: "topic", dueAt: { lte: endOfToday() } } }),
      db.reviewItem.count({ where: { kind: "question", dueAt: { lte: endOfToday() } } }),
      db.reviewItem.findFirst({ where: { dueAt: { gt: endOfToday() } }, orderBy: { dueAt: "asc" } }),
      db.project.findFirst({ where: { status: { in: ["in_progress", "planned", "blocked"] } }, orderBy: { updatedAt: "desc" }, include: { milestones: { orderBy: { order: "asc" } } } }),
      db.achievement.findMany({ orderBy: { unlockedAt: "desc" } }),
      db.streakDay.findMany({ select: { date: true } }),
      // The home screen shows only COUNTS of unreviewed radar items; the headlines live on the Radar page.
      prefs.notifyRadar
        ? db.techUpdate.groupBy({
            by: ["classification"],
            where: { reviewStatus: { in: ["new", "needs-verification"] }, classification: { notIn: ["irrelevant", "minor"] } },
            _count: true,
          })
        : Promise.resolve([]),
    ]);
    const recentAchievement = unlockedAchievements[0] ?? null;

    // The current path: my preferred region, or the region I last worked in, or Foundations.
    const lastDomain = lastActivity?.topicId ? getTopic(lastActivity.topicId)?.domainId : undefined;
    const pathId = prefs.preferredDomainId ?? lastDomain ?? "cs";
    const path = regions.find((r) => r.id === pathId) ?? regions[0];

    // Next mission: in the current path, the first written topic that is not yet assessed and whose
    // prerequisites are met; otherwise any written topic anywhere; otherwise a strike-backed outline.
    const flat = regions.flatMap((r) => r.modules.flatMap((m) => m.topics.map((t) => ({ ...t, regionId: r.id, regionUnlocked: r.unlocked }))));
    const candidates = (inPath: boolean) =>
      flat.filter((t) => (!inPath || t.regionId === path.id) && t.regionUnlocked && t.stage === "complete" && t.status !== "locked" && t.status !== "assessed" && t.status !== "mastered");
    const difficultyRank = { foundation: 0, core: 1, advanced: 2 } as const;
    const byDifficulty = (a: { difficulty: keyof typeof difficultyRank }, b: { difficulty: keyof typeof difficultyRank }) =>
      Math.abs(difficultyRank[a.difficulty] - difficultyRank[prefs.difficulty as keyof typeof difficultyRank]) -
      Math.abs(difficultyRank[b.difficulty] - difficultyRank[prefs.difficulty as keyof typeof difficultyRank]);
    const next = [...candidates(true)].sort(byDifficulty)[0] ?? [...candidates(false)].sort(byDifficulty)[0] ?? null;

    const resume = lastActivity?.topicId ? getTopic(lastActivity.topicId) : undefined;
    const resumeEv = resume ? evidence.get(resume.id) : undefined;

    res.json({
      level: levelFromXp(xp),
      xp,
      path: { id: path.id, title: path.title, short: path.short, hue: path.hue, counts: path.counts },
      nextMission: next && {
        id: next.id,
        title: next.title,
        regionId: next.regionId,
        status: next.status,
        why: next.status === "new" ? "Prerequisites met and not started yet." : "You have started this; finish it with the assessment.",
        // One sentence: what I will be able to do afterwards (the topic's first learning objective).
        objective: getTopic(next.id)?.learningObjectives[0] ?? null,
        // Which interactive scene explains it best (the home screen shows a live one).
        visualization: getTopic(next.id)?.visualizationType ?? "none",
      },
      // The build that goes with the next mission (every written topic suggests one).
      nextBuild: (() => {
        const project = next ? getTopic(next.id)?.project : undefined;
        return next && project ? { topicId: next.id, title: project.title, milestones: project.milestones.length } : null;
      })(),
      resume: resume && resumeEv && { id: resume.id, title: resume.title, status: topicStatus(resume, resumeEv, true) },
      skills: regions.map((r) => ({ id: r.id, short: r.short, hue: r.hue, unlocked: r.unlocked, ...r.counts })),
      reviews: { dueTopics, dueQuestions, nextDueAt: nextDue?.dueAt ?? null, enabled: prefs.notifyReviews },
      activeProject: activeProject && {
        id: activeProject.id,
        title: activeProject.title,
        status: activeProject.status,
        milestonesDone: activeProject.milestones.filter((m) => m.doneAt).length,
        milestonesTotal: activeProject.milestones.length,
        nextMilestone: activeProject.milestones.find((m) => !m.doneAt)?.title ?? null,
      },
      recentAchievement: (() => {
        const rule = recentAchievement && ACHIEVEMENTS.find((a) => a.id === recentAchievement.id);
        return rule ? { id: rule.id, title: rule.title, icon: rule.icon, description: rule.description, unlockedAt: recentAchievement!.unlockedAt } : null;
      })(),
      // The first achievement (in list order) I have not unlocked yet: the next thing to aim for.
      nextAchievement: (() => {
        const have = new Set(unlockedAchievements.map((a) => a.id));
        const rule = ACHIEVEMENTS.find((a) => !have.has(a.id));
        return rule ? { id: rule.id, title: rule.title, icon: rule.icon, description: rule.description } : null;
      })(),
      achievements: { unlocked: unlockedAchievements.length, total: ACHIEVEMENTS.length },
      streak: { current: calculateStreak(streakDays.map((d) => d.date), toDateString()), totalDays: streakDays.length },
      radar: {
        enabled: prefs.notifyRadar,
        byClassification: Object.fromEntries(radarCounts.map((c) => [c.classification, c._count])) as Record<string, number>,
      },
    });
  });

  // ------------------------------------------------------------------ Topics

  // GET /atlas/topics/:id -> the lesson (answers stripped), my progress, mastery checklist,
  // linked strikes, glossary terms, my projects for it, and the approved "what changed" versions.
  router.get("/atlas/topics/:id", async (req, res) => {
    const topic = topicOr404(String(req.params.id));
    const { evidence, completedStrikes } = await loadEvidence(db);
    const ev: TopicEvidence = evidence.get(topic.id) ?? { lessonRead: false, exercisesDone: [], bestAssessmentScore: null, reviewsPassed: 0, projectComplete: false, reviewDue: false };
    const [strikes, versions, projects, review, attempts] = await Promise.all([
      db.strike.findMany({ where: { id: { in: topic.strikeIds } }, select: { id: true, title: true, runner: true, progress: { select: { status: true } } } }),
      db.topicVersion.findMany({ where: { topicId: topic.id }, orderBy: { version: "asc" } }),
      db.project.findMany({ where: { topicId: topic.id }, select: { id: true, title: true, status: true } }),
      db.reviewItem.findUnique({ where: { kind_refId: { kind: "topic", refId: topic.id } } }),
      db.assessmentAttempt.findMany({ where: { topicId: topic.id }, orderBy: { createdAt: "desc" }, take: 5, select: { score: true, passed: true, createdAt: true } }),
    ]);
    const domain = domains.find((d) => d.id === topic.domainId)!;
    const prereqs = topic.prerequisites.map((p) => {
      const pre = getTopic(p)!;
      return { id: pre.id, title: pre.title, met: prerequisiteMet(pre, evidence.get(p) ?? null, completedStrikes) };
    });
    const strikeOrder = new Map(topic.strikeIds.map((s, i) => [s, i]));
    res.json({
      topic: publicTopic(topic),
      domain: { id: domain.id, title: domain.title, short: domain.short, hue: domain.hue },
      completeness: topicCompleteness(topic),
      progress: { ...ev, exerciseKeys: topic.exercises.map(exerciseKey) },
      status: topicStatus(topic, ev, prereqs.every((p) => p.met)),
      mastery: masteryChecklist(topic, ev),
      prerequisites: prereqs,
      strikes: strikes
        .sort((a, b) => (strikeOrder.get(a.id) ?? 0) - (strikeOrder.get(b.id) ?? 0))
        .map((s) => ({ id: s.id, title: s.title, runner: s.runner, status: s.progress?.status ?? "not_started" })),
      glossary: glossary.filter((g) => g.topicIds.includes(topic.id)).map((g) => ({ id: g.id, term: g.term, simple: g.simple })),
      projects,
      review: review && { dueAt: review.dueAt, step: review.step, lastResult: review.lastResult },
      attempts,
      contentVersion: topic.contentVersion + versions.length,
      versions: versions.map((v) => ({ version: v.version, previousVersion: v.previousVersion, changeReason: v.changeReason, sources: v.sources, addendum: v.addendum, migrationNotes: v.migrationNotes, approvedAt: v.approvedAt })),
    });
  });

  // POST /atlas/topics/:id/read -> I opened every lesson section. Pays XP once.
  router.post("/atlas/topics/:id/read", async (req, res) => {
    const topic = topicOr404(String(req.params.id));
    if (topic.lessonSections.length === 0) throw new HttpError(400, "This topic's lesson has not been written yet.");
    const row = await ensureTopicProgress(db, topic.id);
    if (!row.lessonReadAt) {
      await db.topicProgress.update({ where: { topicId: topic.id }, data: { lessonReadAt: new Date() } });
      await logActivity(db, "lesson-read", topic.id, topic.id);
    }
    const xp = await awardXp(db, `lesson:${topic.id}`, XP.lessonRead, `Read ${topic.title}`, topic.id);
    await recordToday();
    const achievements = await afterProgress(db, topic.id);
    res.json({ ok: true, xpAwarded: xp, achievements });
  });

  // Mark one exercise as done (once), pay XP once, and re-check mastery.
  async function completeExercise(topicId: string, key: string, label: string) {
    const row = await ensureTopicProgress(db, topicId);
    const done = row.exercisesDone as string[];
    if (!done.includes(key)) {
      await db.topicProgress.update({ where: { topicId }, data: { exercisesDone: [...done, key] } });
    }
    const xp = await awardXp(db, `exercise:${topicId}:${key}`, XP.exercise, label, topicId);
    return xp;
  }

  // POST /atlas/questions/:id/check -> check ONE choice question (knowledge check, prediction or
  // debugging). Only now are the answer and explanation revealed. A correct prediction/debug
  // completes that exercise; a wrong one just explains, with no penalty, and can be retried.
  router.post("/atlas/questions/:id/check", async (req, res) => {
    const q = choiceById.get(String(req.params.id));
    if (!q) throw new HttpError(404, `No question with id "${String(req.params.id)}"`);
    const topic = topicOr404(q.topicId);
    const choice = req.body?.choice;
    if (!Number.isInteger(choice) || choice < 0 || choice >= q.choices.length) throw new HttpError(400, '"choice" must be the index of one of the choices');
    const correct = choice === q.answerIndex;
    const exercise = topic.exercises.find((e) => (e.kind === "predict" || e.kind === "debug") && e.question.id === q.id);

    let xpAwarded = 0;
    if (exercise && correct) xpAwarded = await completeExercise(topic.id, exerciseKey(exercise), `Exercise in ${topic.title}`);
    await logActivity(db, "exercise", q.id, topic.id, { correct, kind: exercise?.kind ?? "check" });
    await recordToday();
    const achievements = correct ? await afterProgress(db, topic.id) : [];
    res.json({ correct, answerIndex: q.answerIndex, explanation: q.explanation, xpAwarded, achievements });
  });

  // POST /atlas/topics/:id/labs/:lab/complete -> the lab itself measured that its goal was met.
  router.post("/atlas/topics/:id/labs/:lab/complete", async (req, res) => {
    const topic = topicOr404(String(req.params.id));
    const lab = String(req.params.lab);
    const exercise = topic.exercises.find((e) => e.kind === "lab" && e.lab === lab);
    if (!exercise) throw new HttpError(404, `Topic "${topic.id}" has no "${lab}" lab exercise.`);
    const xpAwarded = await completeExercise(topic.id, exerciseKey(exercise), `Lab goal reached in ${topic.title}`);
    await logActivity(db, "exercise", `lab:${lab}`, topic.id, { detail: String(req.body?.detail ?? "").slice(0, 500) });
    await recordToday();
    const achievements = await afterProgress(db, topic.id);
    res.json({ ok: true, xpAwarded, achievements });
  });

  // POST /atlas/topics/:id/assessment -> score my answers, keep the attempt, reveal explanations.
  router.post("/atlas/topics/:id/assessment", async (req, res) => {
    const topic = topicOr404(String(req.params.id));
    if (!topic.assessment) throw new HttpError(400, "This topic has no assessment yet.");
    const answers = req.body?.answers;
    if (typeof answers !== "object" || answers === null || Array.isArray(answers)) {
      throw new HttpError(400, '"answers" must be an object of { questionId: choiceIndex }');
    }
    const clean: Record<string, number> = {};
    for (const [k, v] of Object.entries(answers)) if (Number.isInteger(v)) clean[k] = v as number;

    const result = scoreAssessment(topic, clean);
    const versions = await db.topicVersion.count({ where: { topicId: topic.id } });
    await db.assessmentAttempt.create({
      data: { topicId: topic.id, contentVersion: topic.contentVersion + versions, score: result.score, passed: result.passed, answers: clean },
    });
    const row = await ensureTopicProgress(db, topic.id);
    const best = Math.max(row.bestAssessmentScore ?? 0, result.score);
    const firstPass = result.passed && !row.assessmentPassedAt;
    await db.topicProgress.update({
      where: { topicId: topic.id },
      data: { bestAssessmentScore: best, assessmentPassedAt: firstPass ? new Date() : undefined },
    });

    let xpAwarded = 0;
    if (result.passed) {
      xpAwarded = await awardXp(db, `assessment-pass:${topic.id}`, XP.assessmentPassed, `Passed the ${topic.title} assessment`, topic.id);
      // Start spaced reviews the first time I pass.
      const prefs = await getPreferences(db);
      await db.reviewItem.upsert({
        where: { kind_refId: { kind: "topic", refId: topic.id } },
        update: {},
        create: { kind: "topic", refId: topic.id, topicId: topic.id, step: 0, dueAt: firstReviewDate(topic.reviewRules.intervalsDays, prefs.reviewIntensity) },
      });
    }
    await logActivity(db, "assessment", topic.id, topic.id, { score: result.score, passed: result.passed });
    await recordToday();
    const achievements = await afterProgress(db, topic.id);

    const weakObjectives = result.weakObjectives.map((i) => ({ index: i, text: topic.learningObjectives[i] }));
    res.json({ ...result, weakObjectives, bestScore: best, firstPass, xpAwarded, achievements });
  });

  // ------------------------------------------------------------------ Reviews

  // GET /atlas/reviews/due -> today's personalised review mission.
  router.get("/atlas/reviews/due", async (_req, res) => {
    const items = await db.reviewItem.findMany({ where: { dueAt: { lte: endOfToday() } }, orderBy: { dueAt: "asc" }, take: 20 });
    const missions = items.map((item) => {
      if (item.kind === "topic") {
        const topic = getTopic(item.topicId);
        if (!topic) return null;
        // Rotate through questions so each review asks different ones.
        const pool = [...topic.knowledgeChecks, ...(topic.assessment?.questions ?? [])];
        const n = topic.reviewRules.questionsPerReview;
        const offset = (item.step * n) % Math.max(1, pool.length);
        const questions = Array.from({ length: Math.min(n, pool.length) }, (_, i) => pool[(offset + i) % pool.length]);
        return { id: item.id, kind: "topic", topicId: topic.id, title: topic.title, dueAt: item.dueAt, step: item.step, questions: questions.map(publicChoice) };
      }
      const q = interviewById.get(item.refId);
      if (!q) return null;
      return { id: item.id, kind: "question", topicId: q.topicId, title: getTopic(q.topicId)?.title ?? "", dueAt: item.dueAt, step: item.step, question: publicInterview(q) };
    });
    res.json({ missions: missions.filter(Boolean) });
  });

  // POST /atlas/reviews/:id -> finish one review. For topics I send my answers; for single
  // interview questions I send my self-rating. Both send my confidence (1-5).
  router.post("/atlas/reviews/:id", validate({ params: { id: "numeric" } }), async (req, res) => {
    const item = await db.reviewItem.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) throw new HttpError(404, "No such review.");
    const confidence = Math.min(5, Math.max(1, Number(req.body?.confidence ?? 3)));
    const prefs = await getPreferences(db);

    let result: ReviewResult;
    let feedback: unknown[] = [];
    let intervals = QUESTION_INTERVALS;
    if (item.kind === "topic") {
      const topic = topicOr404(item.topicId);
      intervals = topic.reviewRules.intervalsDays;
      const answers = (req.body?.answers ?? {}) as Record<string, number>;
      const asked = Object.keys(answers).map((id) => choiceById.get(id)).filter((q) => q && q.topicId === topic.id);
      if (asked.length === 0) throw new HttpError(400, "Answer the review questions first.");
      const right = asked.filter((q) => answers[q!.id] === q!.answerIndex).length;
      result = right === asked.length ? "good" : right / asked.length >= 0.5 ? "hard" : "missed";
      feedback = asked.map((q) => ({ id: q!.id, correct: answers[q!.id] === q!.answerIndex, answerIndex: q!.answerIndex, explanation: q!.explanation }));
    } else {
      const rating = String(req.body?.selfRating ?? "");
      if (!["missed", "partial", "nailed"].includes(rating)) throw new HttpError(400, '"selfRating" must be missed, partial or nailed');
      result = ratingToResult(rating);
    }

    const next = nextReview(item.step, result, intervals, prefs.reviewIntensity);
    await db.reviewItem.update({ where: { id: item.id }, data: { step: next.step, dueAt: next.dueAt, lastResult: result, lastReviewedAt: new Date() } });
    await db.reviewLog.create({ data: { reviewItemId: item.id, result, confidence } });
    if (item.kind === "topic" && result === "good") {
      await db.topicProgress.update({ where: { topicId: item.topicId }, data: { reviewsPassed: { increment: 1 } } });
    }
    const xpAwarded = await awardXp(db, `review:${item.id}:${toDateString()}`, XP.reviewDone, "Finished a spaced review", item.topicId);
    await logActivity(db, "review", String(item.id), item.topicId, { result, confidence });
    await recordToday();
    const achievements = await afterProgress(db, item.kind === "topic" ? item.topicId : null);
    res.json({ result, nextDueAt: next.dueAt, days: next.days, feedback, xpAwarded, achievements });
  });

  // ------------------------------------------------------------------ Interview Arena

  // GET /atlas/interview/questions -> the whole searchable bank (answers stripped) with my stats.
  router.get("/atlas/interview/questions", async (_req, res) => {
    const [attempts, items] = await Promise.all([
      db.questionAttempt.findMany({ where: { selfRating: { not: "unrated" } }, select: { questionId: true, selfRating: true, confidence: true, createdAt: true }, orderBy: { createdAt: "asc" } }),
      db.reviewItem.findMany({ where: { kind: "question" }, select: { refId: true, dueAt: true } }),
    ]);
    const stats = new Map<string, { attempts: number; last: string; lastConfidence: number }>();
    for (const a of attempts) {
      const s = stats.get(a.questionId) ?? { attempts: 0, last: "", lastConfidence: 0 };
      stats.set(a.questionId, { attempts: s.attempts + 1, last: a.selfRating, lastConfidence: a.confidence });
    }
    const due = new Map(items.map((i) => [i.refId, i.dueAt]));
    const questions = allInterviewQuestions().map((q) => {
      const t = getTopic(q.topicId)!;
      return {
        ...publicInterview(q),
        topicId: q.topicId,
        topicTitle: t.title,
        domainId: t.domainId,
        stats: stats.get(q.id) ?? null,
        dueAt: due.get(q.id) ?? null,
      };
    });
    res.json({ questions, target: INTERVIEW_TARGET, topicsWithQuestions: new Set(questions.map((q) => q.topicId)).size });
  });

  // POST /atlas/interview/questions/:id/answer -> I commit my answer FIRST; only then is the model
  // answer revealed. Short non-answers are refused, so the reveal is always earned.
  router.post("/atlas/interview/questions/:id/answer", validate({ body: { answerText: "string" } }), async (req, res) => {
    const q = interviewById.get(String(req.params.id));
    if (!q) throw new HttpError(404, "No such interview question.");
    const answerText = String(req.body.answerText).trim();
    if (answerText.length < 20) throw new HttpError(400, "Write at least a sentence or two in your own words before revealing the model answer.");
    const confidence = Math.min(5, Math.max(1, Number(req.body.confidence ?? 3)));
    const attempt = await db.questionAttempt.create({
      data: { questionId: q.id, topicId: q.topicId, answerText: answerText.slice(0, 5000), selfRating: "unrated", confidence },
    });
    await recordToday();
    res.json({
      attemptId: attempt.id,
      expectedElements: q.expectedElements,
      modelAnswer: q.modelAnswer,
      explanation: q.explanation,
      commonWrongAnswers: q.commonWrongAnswers,
      followUps: q.followUps ?? [],
    });
  });

  // POST /atlas/interview/attempts/:id/rate -> I compare my answer with the model answer and rate
  // myself honestly. That rating schedules the question for spaced review.
  router.post("/atlas/interview/attempts/:id/rate", validate({ params: { id: "numeric" }, body: { selfRating: "string" } }), async (req, res) => {
    const attempt = await db.questionAttempt.findUnique({ where: { id: Number(req.params.id) } });
    if (!attempt) throw new HttpError(404, "No such attempt.");
    const rating = String(req.body.selfRating);
    if (!["missed", "partial", "nailed"].includes(rating)) throw new HttpError(400, '"selfRating" must be missed, partial or nailed');
    const elementsHit = Array.isArray(req.body.elementsHit) ? req.body.elementsHit.map(String).slice(0, 20) : [];
    await db.questionAttempt.update({ where: { id: attempt.id }, data: { selfRating: rating, elementsHit } });

    const prefs = await getPreferences(db);
    const existing = await db.reviewItem.findUnique({ where: { kind_refId: { kind: "question", refId: attempt.questionId } } });
    const next = nextReview(existing?.step ?? 0, ratingToResult(rating), QUESTION_INTERVALS, prefs.reviewIntensity);
    await db.reviewItem.upsert({
      where: { kind_refId: { kind: "question", refId: attempt.questionId } },
      update: { step: next.step, dueAt: next.dueAt, lastResult: ratingToResult(rating), lastReviewedAt: new Date() },
      create: { kind: "question", refId: attempt.questionId, topicId: attempt.topicId, step: next.step, dueAt: next.dueAt, lastResult: ratingToResult(rating), lastReviewedAt: new Date() },
    });
    const xpAwarded = await awardXp(db, `interview:${attempt.questionId}:${toDateString()}`, XP.interviewAnswer, "Answered an interview question", attempt.topicId);
    await logActivity(db, "interview", attempt.questionId, attempt.topicId, { rating, confidence: attempt.confidence });
    const achievements = await afterProgress(db, null);
    res.json({ nextDueAt: next.dueAt, days: next.days, xpAwarded, achievements });
  });

  // ------------------------------------------------------------------ Glossary

  router.get("/atlas/glossary", (_req, res) => {
    const titleOf = new Map(topics.map((t) => [t.id, t.title]));
    res.json({ terms: glossary.map((g) => ({ ...g, topics: g.topicIds.map((id) => ({ id, title: titleOf.get(id) ?? id })) })) });
  });

  // ------------------------------------------------------------------ Analytics and history

  // GET /atlas/analytics -> only numbers computed from real rows. Empty data gives empty charts.
  router.get("/atlas/analytics", async (_req, res) => {
    const [progress, attempts, reviewLogs, projects, xpEvents, qAttempts] = await Promise.all([
      db.topicProgress.findMany(),
      db.assessmentAttempt.findMany({ orderBy: { createdAt: "asc" } }),
      db.reviewLog.findMany(),
      db.project.findMany({ select: { status: true, domainId: true } }),
      db.xpEvent.findMany({ select: { amount: true, createdAt: true } }),
      db.questionAttempt.findMany({ where: { selfRating: { not: "unrated" } }, select: { topicId: true, selfRating: true } }),
    ]);

    // XP per week for the last 12 weeks (Monday-based), oldest first.
    const weeks: { weekStart: string; xp: number }[] = [];
    const now = new Date();
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
    for (let i = 11; i >= 0; i--) {
      const start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() - 7 * i);
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
      weeks.push({ weekStart: toDateString(start), xp: xpEvents.filter((e) => e.createdAt >= start && e.createdAt < end).reduce((n, e) => n + e.amount, 0) });
    }

    const byDomain = domains.map((d) => {
      const own = progress.filter((p) => getTopic(p.topicId)?.domainId === d.id);
      return { id: d.id, short: d.short, hue: d.hue, started: own.length, assessed: own.filter((p) => p.assessmentPassedAt).length, mastered: own.filter((p) => p.masteredAt).length, total: topics.filter((t) => t.domainId === d.id).length };
    });

    // Areas needing practice: topics whose latest assessment failed, and interview topics I often miss.
    const latestByTopic = new Map<string, (typeof attempts)[number]>();
    for (const a of attempts) latestByTopic.set(a.topicId, a);
    const failing = [...latestByTopic.values()].filter((a) => !a.passed).map((a) => ({ topicId: a.topicId, title: getTopic(a.topicId)?.title ?? a.topicId, reason: `Latest assessment ${Math.round(a.score * 100)}%` }));
    const missedByTopic = new Map<string, { missed: number; total: number }>();
    for (const q of qAttempts) {
      const s = missedByTopic.get(q.topicId) ?? { missed: 0, total: 0 };
      missedByTopic.set(q.topicId, { missed: s.missed + (q.selfRating === "missed" ? 1 : 0), total: s.total + 1 });
    }
    const interviewWeak = [...missedByTopic.entries()]
      .filter(([, s]) => s.total >= 2 && s.missed / s.total >= 0.5)
      .map(([topicId, s]) => ({ topicId, title: getTopic(topicId)?.title ?? topicId, reason: `Missed ${s.missed} of ${s.total} interview answers` }));

    res.json({
      lessonsRead: progress.filter((p) => p.lessonReadAt).length,
      exercisesDone: progress.reduce((n, p) => n + (p.exercisesDone as string[]).length, 0),
      assessments: {
        attempts: attempts.length,
        passed: attempts.filter((a) => a.passed).length,
        averageScore: attempts.length ? attempts.reduce((n, a) => n + a.score, 0) / attempts.length : null,
      },
      reviews: {
        done: reviewLogs.length,
        good: reviewLogs.filter((r) => r.result === "good").length,
        successRate: reviewLogs.length ? reviewLogs.filter((r) => r.result === "good").length / reviewLogs.length : null,
      },
      projects: { total: projects.length, complete: projects.filter((p) => p.status === "complete").length },
      mastered: progress.filter((p) => p.masteredAt).length,
      xpByWeek: weeks,
      byDomain,
      needsPractice: [...failing, ...interviewWeak],
    });
  });

  // GET /atlas/history -> my learning history, newest first.
  router.get("/atlas/history", async (req, res) => {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 50)));
    const rows = await db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
    res.json({ history: rows.map((r) => ({ ...r, topicTitle: r.topicId ? getTopic(r.topicId)?.title ?? null : null })) });
  });

  // ------------------------------------------------------------------ Preferences and backup

  router.get("/atlas/preferences", async (_req, res) => {
    res.json(await getPreferences(db));
  });

  // PUT /atlas/preferences -> validate every field by hand; unknown fields are ignored.
  router.put("/atlas/preferences", async (req, res) => {
    const b = req.body ?? {};
    const data: Record<string, unknown> = {};
    const oneOf = (field: string, allowed: string[]) => {
      if (b[field] === undefined) return;
      if (!allowed.includes(b[field])) throw new HttpError(400, `"${field}" must be one of: ${allowed.join(", ")}`);
      data[field] = b[field];
    };
    const intIn = (field: string, min: number, max: number) => {
      if (b[field] === undefined) return;
      if (!Number.isInteger(b[field]) || b[field] < min || b[field] > max) throw new HttpError(400, `"${field}" must be a whole number from ${min} to ${max}`);
      data[field] = b[field];
    };
    const bool = (field: string) => {
      if (b[field] === undefined) return;
      if (typeof b[field] !== "boolean") throw new HttpError(400, `"${field}" must be true or false`);
      data[field] = b[field];
    };
    intIn("dailyGoalMinutes", 5, 480);
    intIn("weeklyGoalTopics", 1, 20);
    oneOf("difficulty", ["foundation", "core", "advanced"]);
    oneOf("motion", ["system", "reduce", "full"]);
    oneOf("reviewIntensity", ["relaxed", "normal", "intense"]);
    bool("strictUnlocking");
    bool("notifyReviews");
    bool("notifyRadar");
    if (b.preferredDomainId !== undefined) {
      if (b.preferredDomainId !== null && !domains.some((d) => d.id === b.preferredDomainId)) throw new HttpError(400, '"preferredDomainId" is not a domain');
      data.preferredDomainId = b.preferredDomainId;
    }
    if (b.radarCategories !== undefined) {
      const allowed = ["security", "framework", "ai-platform", "cloud", "devops", "standards", "publication"];
      if (!Array.isArray(b.radarCategories) || b.radarCategories.some((c: unknown) => !allowed.includes(String(c)))) {
        throw new HttpError(400, `"radarCategories" must be a list from: ${allowed.join(", ")}`);
      }
      data.radarCategories = b.radarCategories;
    }
    await getPreferences(db);
    res.json(await db.preference.update({ where: { id: 1 }, data }));
  });

  // GET /atlas/export -> a full JSON backup of everything I have done (not the curriculum itself).
  router.get("/atlas/export", async (_req, res) => {
    const [preference, topicProgress, assessmentAttempts, questionAttempts, reviewItems, reviewLogs, xpEvents, achievements, activity, projects, strikeProgress, sayNotes, streakDays, proposals, versions] = await Promise.all([
      db.preference.findMany(),
      db.topicProgress.findMany(),
      db.assessmentAttempt.findMany(),
      db.questionAttempt.findMany(),
      db.reviewItem.findMany(),
      db.reviewLog.findMany(),
      db.xpEvent.findMany(),
      db.achievement.findMany(),
      db.activityLog.findMany(),
      db.project.findMany({ include: { milestones: true } }),
      db.progress.findMany(),
      db.sayNote.findMany(),
      db.streakDay.findMany(),
      db.curriculumProposal.findMany(),
      db.topicVersion.findMany(),
    ]);
    res.setHeader("Content-Disposition", `attachment; filename="hexhammer-backup-${toDateString()}.json"`);
    res.json({
      format: "hexhammer-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: { preference, topicProgress, assessmentAttempts, questionAttempts, reviewItems, reviewLogs, xpEvents, achievements, activity, projects, strikeProgress, sayNotes, streakDays, proposals, versions },
    });
  });

  return router;
}
