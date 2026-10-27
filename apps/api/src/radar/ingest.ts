// INGEST: check one source, store what is new, skip what we already know, and record the run.
import type { PrismaClient, TechSource } from "@prisma/client";
import { runConnector, type FetchLike } from "./connectors";
import { canonicalUrl, titleKey } from "./normalize";
import { classify } from "./classify";
import { audit } from "../atlas/service";

// Two sources reporting the same title within this many days count as ONE update.
const CROSS_SOURCE_WINDOW_DAYS = 14;

export async function checkSource(db: PrismaClient, source: TechSource, trigger: string, fetchImpl: FetchLike) {
  const run = await db.radarRun.create({ data: { sourceId: source.id, trigger, status: "ok" } });
  const now = new Date();
  try {
    const result = await runConnector(source, fetchImpl);
    let itemsNew = 0;
    let itemsDuplicate = 0;

    for (const item of result.items) {
      let url: string;
      try {
        url = canonicalUrl(item.url);
      } catch {
        continue; // an unusable link: skip it rather than guess
      }
      const key = titleKey(item.title);

      // 1) Exactly the same item seen before (from any source): just note that we saw it again.
      const sameUrl = await db.techUpdate.findUnique({ where: { canonicalUrl: url } });
      if (sameUrl) {
        await db.techUpdate.update({ where: { id: sameUrl.id }, data: { seenCount: { increment: 1 }, lastSeenAt: now } });
        itemsDuplicate++;
        continue;
      }
      // 2) Same news, different source and URL (e.g. a release on GitHub AND on a blog).
      const since = new Date(now.getTime() - CROSS_SOURCE_WINDOW_DAYS * 24 * 3600 * 1000);
      const sameTitle = await db.techUpdate.findFirst({ where: { titleKey: key, sourceId: { not: source.id }, discoveredAt: { gte: since } } });
      if (sameTitle) {
        const also = new Set([...(sameTitle.alsoSeenIn as number[]), source.id]);
        await db.techUpdate.update({ where: { id: sameTitle.id }, data: { seenCount: { increment: 1 }, lastSeenAt: now, alsoSeenIn: [...also] } });
        itemsDuplicate++;
        continue;
      }

      const verdict = classify({
        title: item.title,
        summary: item.summary,
        category: source.category,
        sourceTopicIds: source.topicIds as string[],
        severity: item.severity,
        pageChange: item.pageChange,
      });
      const created = await db.techUpdate.create({
        data: {
          canonicalUrl: url,
          titleKey: key,
          sourceId: source.id,
          title: item.title,
          summary: item.summary,
          publishedAt: item.publishedAt, // from the source; null when it did not say
          discoveredAt: now, // when WE saw it: never confused with publishedAt
          technology: source.technology,
          topicIds: verdict.topicIds,
          classification: verdict.classification,
          classificationReason: verdict.reason,
          reviewStatus: item.pageChange ? "needs-verification" : "new",
        },
      });
      await audit(db, trigger === "schedule" ? "scheduler" : "learner", "ingest", "TechUpdate", created.id, { source: source.name, url });
      itemsNew++;
    }

    await db.techSource.update({
      where: { id: source.id },
      data: { lastCheckedAt: now, lastSuccessAt: now, lastError: null, consecutiveFailures: 0, pageHash: result.pageHash ?? source.pageHash },
    });
    return db.radarRun.update({
      where: { id: run.id },
      data: { finishedAt: new Date(), itemsFound: result.items.length, itemsNew, itemsDuplicate, detail: { note: result.note ?? null } },
    });
  } catch (error) {
    const message = (error as Error).message.slice(0, 500);
    await db.techSource.update({
      where: { id: source.id },
      data: { lastCheckedAt: now, lastError: message, consecutiveFailures: { increment: 1 } },
    });
    return db.radarRun.update({ where: { id: run.id }, data: { status: "error", error: message, finishedAt: new Date() } });
  }
}

// A source is due when it has never been checked, or its interval has passed.
export function isDue(source: Pick<TechSource, "lastCheckedAt" | "checkIntervalHours">, now = new Date()) {
  if (!source.lastCheckedAt) return true;
  return now.getTime() - source.lastCheckedAt.getTime() >= source.checkIntervalHours * 3600 * 1000;
}

// Stale = no successful check for three intervals (or never succeeded although it was tried).
export function isStale(source: Pick<TechSource, "lastSuccessAt" | "lastCheckedAt" | "checkIntervalHours">, now = new Date()) {
  if (!source.lastCheckedAt) return false;
  if (!source.lastSuccessAt) return true;
  return now.getTime() - source.lastSuccessAt.getTime() > 3 * source.checkIntervalHours * 3600 * 1000;
}
