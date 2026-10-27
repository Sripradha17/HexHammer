// Small database helpers shared by the Atlas routes. Each does ONE thing.
import type { Prisma, PrismaClient } from "@prisma/client";
import { getTopic, topics, type Topic } from "@hexhammer/content";
import { masteryChecklist, XP, type TopicEvidence } from "./rules";
import { HttpError } from "../httpError";
import { checkAchievements } from "./achievements";

// Read my preferences, creating the single row with defaults the first time.
export async function getPreferences(db: PrismaClient) {
  return db.preference.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
}

// Award XP for an action ONCE. The unique `key` makes a repeat a no-op instead of a second reward.
// Returns the amount actually awarded (0 if this action was already rewarded before).
export async function awardXp(db: PrismaClient, key: string, amount: number, reason: string, topicId?: string) {
  try {
    await db.xpEvent.create({ data: { key, amount, reason, topicId } });
    return amount;
  } catch (error) {
    // P2002 = unique constraint failed = this exact action already paid out. That's fine.
    if ((error as { code?: string }).code === "P2002") return 0;
    throw error;
  }
}

// Add one line to my learning history.
export async function logActivity(db: PrismaClient, type: string, refId: string, topicId: string | null, detail: Prisma.InputJsonValue = {}) {
  await db.activityLog.create({ data: { type, refId, topicId, detail } });
}

// Write to the audit trail (radar ingestion, proposals, approvals, publication).
export async function audit(db: PrismaClient, actor: string, action: string, entity: string, entityId: string | number, detail: Prisma.InputJsonValue = {}) {
  await db.auditLog.create({ data: { actor, action, entity, entityId: String(entityId), detail } });
}

// Find a topic or throw a 404-shaped error the error handler understands.
export function topicOr404(id: string): Topic {
  const topic = getTopic(id);
  if (!topic) throw new HttpError(404, `No topic with id "${id}"`);
  return topic;
}

// Everything the rules need to know about every topic, loaded in a few queries.
export async function loadEvidence(db: PrismaClient) {
  const [progressRows, projects, dueItems, strikeRows] = await Promise.all([
    db.topicProgress.findMany(),
    db.project.findMany({ where: { status: "complete", topicId: { not: null } }, select: { topicId: true } }),
    db.reviewItem.findMany({ where: { kind: "topic", dueAt: { lte: endOfToday() } }, select: { topicId: true } }),
    db.progress.findMany({ where: { status: "complete" }, select: { strikeId: true } }),
  ]);
  const completedStrikes = new Set(strikeRows.map((r) => r.strikeId));
  const projectDone = new Set(projects.map((p) => p.topicId));
  const due = new Set(dueItems.map((d) => d.topicId));

  const evidence = new Map<string, TopicEvidence>();
  for (const row of progressRows) {
    evidence.set(row.topicId, {
      lessonRead: row.lessonReadAt !== null,
      exercisesDone: row.exercisesDone as string[],
      bestAssessmentScore: row.bestAssessmentScore,
      reviewsPassed: row.reviewsPassed,
      projectComplete: projectDone.has(row.topicId),
      reviewDue: due.has(row.topicId),
    });
  }
  // A topic whose linked strikes I have completed counts those as done exercises, even if I never
  // opened the topic page: the work was real, it just happened in the older strike pages.
  for (const t of topics) {
    const strikeKeys = t.strikeIds.filter((s) => completedStrikes.has(s)).map((s) => `strike:${s}`);
    if (strikeKeys.length === 0) continue;
    const ev = evidence.get(t.id) ?? { lessonRead: false, exercisesDone: [], bestAssessmentScore: null, reviewsPassed: 0, projectComplete: projectDone.has(t.id), reviewDue: due.has(t.id) };
    ev.exercisesDone = [...new Set([...ev.exercisesDone, ...strikeKeys])];
    evidence.set(t.id, ev);
  }
  return { evidence, completedStrikes };
}

export function endOfToday(now: Date = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

// Make sure a progress row exists for a topic (used before updating it).
export async function ensureTopicProgress(db: PrismaClient, topicId: string) {
  return db.topicProgress.upsert({ where: { topicId }, update: {}, create: { topicId } });
}

// After anything that can change mastery: check it, stamp masteredAt once, pay mastery XP once,
// and re-check achievements. Returns any newly unlocked achievements for a celebration.
export async function afterProgress(db: PrismaClient, topicId: string | null) {
  if (topicId) {
    const topic = getTopic(topicId);
    const { evidence } = await loadEvidence(db);
    const ev = evidence.get(topicId);
    if (topic && ev && masteryChecklist(topic, ev).every((c) => c.met)) {
      const row = await ensureTopicProgress(db, topicId);
      if (!row.masteredAt) {
        await db.topicProgress.update({ where: { topicId }, data: { masteredAt: new Date() } });
        await awardXp(db, `mastery:${topicId}`, XP.mastery, `Mastered ${topic.title}`, topicId);
        await logActivity(db, "mastery", topicId, topicId);
      }
    }
  }
  return checkAchievements(db);
}
