// Technology Radar API: sources, checks, discovered updates, the review queue, curriculum
// proposals, approvals (which create lesson versions) and the audit trail.
import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import { getTopic } from "@hexhammer/content";
import { HttpError } from "../httpError";
import { validate } from "../middleware/validate";
import { afterProgress, audit, awardXp, logActivity } from "../atlas/service";
import { XP } from "../atlas/rules";
import { SOURCE_CATEGORIES, SOURCE_KINDS, type FetchLike } from "./connectors";
import { checkSource, isDue, isStale } from "./ingest";
import { CLASSIFICATION_LABELS } from "./classify";
import { draftMission, MISSION_KINDS, validateMission } from "./missions";
import { validateSource } from "./validateSource";
import { schedulerState, tick } from "./scheduler";
import { analyseWithOllama, ollamaConfig } from "./ollama";

const MANUAL_REFRESH_MINUTES = 10; // rate limit for the "check now" button, per source
const REVIEW_ACTIONS: Record<string, string> = {
  approve: "approved",
  reject: "rejected",
  defer: "deferred",
  "already-covered": "already-covered",
  "needs-verification": "needs-verification",
};

export function createRadarRouter(db: PrismaClient, fetchImpl: FetchLike) {
  const router = Router();

  async function sourceOr404(id: number) {
    const source = await db.techSource.findUnique({ where: { id } });
    if (!source) throw new HttpError(404, `No source with id ${id}`);
    return source;
  }
  async function updateOr404(id: number) {
    const update = await db.techUpdate.findUnique({ where: { id }, include: { source: true, proposals: { orderBy: { createdAt: "desc" } } } });
    if (!update) throw new HttpError(404, `No update with id ${id}`);
    return update;
  }

  // GET /radar/overview -> sources with health, counts, recent runs, scheduler status.
  router.get("/radar/overview", async (_req, res) => {
    const [sources, counts, runs, pendingProposals] = await Promise.all([
      db.techSource.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }], include: { _count: { select: { updates: true } } } }),
      db.techUpdate.groupBy({ by: ["classification", "reviewStatus"], _count: true }),
      db.radarRun.findMany({ orderBy: { startedAt: "desc" }, take: 25, include: { source: { select: { name: true } } } }),
      db.curriculumProposal.count({ where: { status: "proposed" } }),
    ]);
    res.json({
      scheduler: { ...schedulerState, note: "Checks run only while the API process is running." },
      ollama: ollamaConfig,
      labels: CLASSIFICATION_LABELS,
      sources: sources.map((s) => ({
        ...s,
        pageHash: undefined,
        updateCount: s._count.updates,
        _count: undefined,
        due: s.enabled && isDue(s),
        stale: isStale(s),
        health: !s.lastCheckedAt ? "never-checked" : s.consecutiveFailures > 0 ? "failing" : isStale(s) ? "stale" : "healthy",
      })),
      counts,
      runs,
      pendingProposals,
    });
  });

  // ------------------------------------------------------------------ Sources

  // POST /radar/sources -> register a source, but ONLY after checking it really works.
  router.post("/radar/sources", validate({ body: { name: "string", url: "string", kind: "string", category: "string", technology: "string" } }), async (req, res) => {
    const { name, url, kind, category, technology } = req.body as Record<string, string>;
    if (!SOURCE_KINDS.includes(kind)) throw new HttpError(400, `"kind" must be one of: ${SOURCE_KINDS.join(", ")}`);
    if (!SOURCE_CATEGORIES.includes(category)) throw new HttpError(400, `"category" must be one of: ${SOURCE_CATEGORIES.join(", ")}`);
    const topicIds = Array.isArray(req.body.topicIds) ? req.body.topicIds.map(String).filter((id: string) => getTopic(id)) : [];
    const checkIntervalHours = Number.isInteger(req.body.checkIntervalHours) ? Math.min(720, Math.max(1, req.body.checkIntervalHours)) : category === "security" ? 24 : 168;
    if (await db.techSource.findUnique({ where: { url } })) throw new HttpError(409, "That source is already registered.");

    const check = await validateSource(url.trim(), kind, fetchImpl);
    if (!check.ok) throw new HttpError(400, `Source not registered: ${check.detail}`);

    const source = await db.techSource.create({
      data: { name: name.trim().slice(0, 120), url: url.trim(), kind, category, technology: technology.trim().slice(0, 60), topicIds, checkIntervalHours, validationStatus: "valid", lastValidatedAt: new Date() },
    });
    await audit(db, "learner", "register-source", "TechSource", source.id, { url, detail: check.detail });
    res.status(201).json({ source, validation: check });
  });

  // PUT /radar/sources/:id -> edit name, category, topics, interval, or enable/disable.
  router.put("/radar/sources/:id", validate({ params: { id: "numeric" } }), async (req, res) => {
    const source = await sourceOr404(Number(req.params.id));
    const b = req.body ?? {};
    const data: Record<string, unknown> = {};
    if (typeof b.name === "string" && b.name.trim()) data.name = b.name.trim().slice(0, 120);
    if (typeof b.technology === "string" && b.technology.trim()) data.technology = b.technology.trim().slice(0, 60);
    if (b.category !== undefined) {
      if (!SOURCE_CATEGORIES.includes(b.category)) throw new HttpError(400, `"category" must be one of: ${SOURCE_CATEGORIES.join(", ")}`);
      data.category = b.category;
    }
    if (typeof b.enabled === "boolean") data.enabled = b.enabled;
    if (Number.isInteger(b.checkIntervalHours)) data.checkIntervalHours = Math.min(720, Math.max(1, b.checkIntervalHours));
    if (Array.isArray(b.topicIds)) data.topicIds = b.topicIds.map(String).filter((id: string) => getTopic(id));
    const updated = await db.techSource.update({ where: { id: source.id }, data });
    await audit(db, "learner", "edit-source", "TechSource", source.id, data as object);
    res.json(updated);
  });

  // POST /radar/sources/:id/validate -> re-check that the source works, and record the result.
  router.post("/radar/sources/:id/validate", validate({ params: { id: "numeric" } }), async (req, res) => {
    const source = await sourceOr404(Number(req.params.id));
    const check = await validateSource(source.url, source.kind, fetchImpl);
    const updated = await db.techSource.update({
      where: { id: source.id },
      data: { validationStatus: check.ok ? "valid" : "invalid", lastValidatedAt: new Date(), lastError: check.ok ? null : check.detail },
    });
    await audit(db, "learner", "validate-source", "TechSource", source.id, { ok: check.ok, detail: check.detail });
    res.json({ source: updated, validation: check });
  });

  // POST /radar/sources/:id/check -> "check now" (rate limited per source).
  router.post("/radar/sources/:id/check", validate({ params: { id: "numeric" } }), async (req, res) => {
    const source = await sourceOr404(Number(req.params.id));
    const waitMs = source.lastCheckedAt ? MANUAL_REFRESH_MINUTES * 60_000 - (Date.now() - source.lastCheckedAt.getTime()) : 0;
    if (waitMs > 0 && source.kind !== "fixture") {
      res.setHeader("Retry-After", String(Math.ceil(waitMs / 1000)));
      throw new HttpError(429, `This source was checked recently. Try again in ${Math.ceil(waitMs / 60_000)} minute(s).`);
    }
    const run = await checkSource(db, source, source.kind === "fixture" ? "fixture" : "manual", fetchImpl);
    await logActivity(db, "radar", `source:${source.id}`, null, { itemsNew: run.itemsNew, status: run.status });
    res.json({ run });
  });

  // POST /radar/check-due -> run the scheduler's work right now (manual refresh of everything due).
  router.post("/radar/check-due", async (_req, res) => {
    res.json(await tick(db, fetchImpl, "manual"));
  });

  // ------------------------------------------------------------------ Updates and review queue

  // GET /radar/updates?status=&classification=&q= -> discovered updates, newest first.
  router.get("/radar/updates", async (req, res) => {
    const where: Record<string, unknown> = {};
    if (typeof req.query.status === "string" && req.query.status) where.reviewStatus = req.query.status;
    if (typeof req.query.classification === "string" && req.query.classification) where.classification = req.query.classification;
    if (typeof req.query.q === "string" && req.query.q.trim()) where.title = { contains: req.query.q.trim(), mode: "insensitive" };
    const updates = await db.techUpdate.findMany({ where, orderBy: { discoveredAt: "desc" }, take: 200, include: { source: { select: { name: true, category: true } } } });
    res.json({ updates });
  });

  router.get("/radar/updates/:id", validate({ params: { id: "numeric" } }), async (req, res) => {
    const update = await updateOr404(Number(req.params.id));
    res.json({ ...update, topics: (update.topicIds as string[]).map((id) => ({ id, title: getTopic(id)?.title ?? id })) });
  });

  // POST /radar/updates/:id/review -> approve / reject / defer / already covered / needs verification.
  router.post("/radar/updates/:id/review", validate({ params: { id: "numeric" }, body: { action: "string" } }), async (req, res) => {
    const update = await updateOr404(Number(req.params.id));
    const status = REVIEW_ACTIONS[req.body.action];
    if (!status) throw new HttpError(400, `"action" must be one of: ${Object.keys(REVIEW_ACTIONS).join(", ")}`);
    const updated = await db.techUpdate.update({ where: { id: update.id }, data: { reviewStatus: status } });
    await audit(db, "learner", `review:${req.body.action}`, "TechUpdate", update.id, { note: String(req.body.note ?? "").slice(0, 500) });
    res.json(updated);
  });

  // POST /radar/updates/:id/verify -> I read the original source and confirm (or dispute) the facts.
  router.post("/radar/updates/:id/verify", validate({ params: { id: "numeric" }, body: { status: "string" } }), async (req, res) => {
    const update = await updateOr404(Number(req.params.id));
    if (!["verified", "disputed", "unverified"].includes(req.body.status)) throw new HttpError(400, '"status" must be verified, disputed or unverified');
    const updated = await db.techUpdate.update({ where: { id: update.id }, data: { verificationStatus: req.body.status } });
    await audit(db, "learner", `verify:${req.body.status}`, "TechUpdate", update.id, { note: String(req.body.note ?? "").slice(0, 500) });
    res.json(updated);
  });

  // POST /radar/updates/:id/analyze -> OPTIONAL local-model analysis (Ollama). Labelled as AI output.
  router.post("/radar/updates/:id/analyze", validate({ params: { id: "numeric" } }), async (req, res) => {
    const update = await updateOr404(Number(req.params.id));
    let text: string;
    try {
      text = await analyseWithOllama(fetchImpl, update, (update.topicIds as string[]).map((id) => getTopic(id)?.title ?? id));
    } catch (error) {
      throw new HttpError(503, `Local model unavailable (${(error as Error).message}). Start Ollama (${ollamaConfig.url}) with "${ollamaConfig.model}" to use this. The radar works without it.`);
    }
    const updated = await db.techUpdate.update({ where: { id: update.id }, data: { aiAnalysis: text, analysisBy: "ollama" } });
    await audit(db, "learner", "ai-analysis", "TechUpdate", update.id, { model: ollamaConfig.model });
    res.json(updated);
  });

  // ------------------------------------------------------------------ Proposals and versions

  // POST /radar/updates/:id/proposals -> start a curriculum proposal from an update (a draft only).
  router.post("/radar/updates/:id/proposals", validate({ params: { id: "numeric" }, body: { topicId: "string", kind: "string" } }), async (req, res) => {
    const update = await updateOr404(Number(req.params.id));
    const topic = getTopic(req.body.topicId);
    if (!topic) throw new HttpError(400, "That topic does not exist.");
    if (!MISSION_KINDS.includes(req.body.kind)) throw new HttpError(400, `"kind" must be one of: ${MISSION_KINDS.join(", ")}`);
    const content = draftMission(update, topic);
    const proposal = await db.curriculumProposal.create({
      data: {
        updateId: update.id,
        topicId: topic.id,
        kind: req.body.kind,
        title: `${topic.title}: ${update.title}`.slice(0, 200),
        changeReason: `${CLASSIFICATION_LABELS[update.classification as keyof typeof CLASSIFICATION_LABELS] ?? update.classification}. ${update.classificationReason}`.slice(0, 1000),
        sources: content.references,
        content: content as object,
      },
    });
    await audit(db, "learner", "propose", "CurriculumProposal", proposal.id, { topicId: topic.id, updateId: update.id });
    res.status(201).json(proposal);
  });

  router.get("/radar/proposals", async (req, res) => {
    const where = typeof req.query.status === "string" && req.query.status ? { status: req.query.status } : {};
    const proposals = await db.curriculumProposal.findMany({ where, orderBy: { createdAt: "desc" }, include: { update: { select: { title: true, canonicalUrl: true } } } });
    res.json({ proposals: proposals.map((p) => ({ ...p, topicTitle: getTopic(p.topicId)?.title ?? p.topicId })) });
  });

  router.get("/radar/proposals/:id", validate({ params: { id: "numeric" } }), async (req, res) => {
    const proposal = await db.curriculumProposal.findUnique({ where: { id: Number(req.params.id) }, include: { update: true, version: true } });
    if (!proposal) throw new HttpError(404, "No such proposal.");
    const topic = getTopic(proposal.topicId);
    res.json({
      ...proposal,
      topicTitle: topic?.title ?? proposal.topicId,
      topicExercises: topic?.exercises.map((e, i) => ({ index: i, label: e.kind === "strike" ? `Strike ${e.strikeId}` : e.kind === "lab" ? `Lab: ${e.lab}` : `${e.kind}: ${e.question.prompt.slice(0, 80)}` })) ?? [],
      topicQuestions: topic?.interviewQuestions.map((q) => ({ id: q.id, prompt: q.prompt.slice(0, 100) })) ?? [],
      problems: validateMission(proposal.content, true).problems,
    });
  });

  // PUT /radar/proposals/:id -> edit a proposal while it is still proposed.
  router.put("/radar/proposals/:id", validate({ params: { id: "numeric" } }), async (req, res) => {
    const proposal = await db.curriculumProposal.findUnique({ where: { id: Number(req.params.id) } });
    if (!proposal) throw new HttpError(404, "No such proposal.");
    if (proposal.status === "approved" || proposal.status === "rejected") throw new HttpError(409, "Decided proposals cannot be edited.");
    const { content, problems } = validateMission(req.body?.content ?? proposal.content, false);
    if (problems.length) throw new HttpError(400, problems.join(" "));
    const updated = await db.curriculumProposal.update({
      where: { id: proposal.id },
      data: {
        content: content as object,
        sources: content.references,
        title: typeof req.body?.title === "string" && req.body.title.trim() ? req.body.title.trim().slice(0, 200) : undefined,
        changeReason: typeof req.body?.changeReason === "string" ? req.body.changeReason.slice(0, 1000) : undefined,
        migrationNotes: typeof req.body?.migrationNotes === "string" ? req.body.migrationNotes.slice(0, 2000) : undefined,
        affectedExercises: Array.isArray(req.body?.affectedExercises) ? req.body.affectedExercises.map(String).slice(0, 20) : undefined,
        affectedQuestions: Array.isArray(req.body?.affectedQuestions) ? req.body.affectedQuestions.map(String).slice(0, 30) : undefined,
      },
    });
    await audit(db, "learner", "edit-proposal", "CurriculumProposal", proposal.id);
    res.json({ ...updated, problems: validateMission(updated.content, true).problems });
  });

  // POST /radar/proposals/:id/decide -> approve, reject or defer. Approval validates the content,
  // then PUBLISHES it as a new lesson version (old versions and my progress are untouched).
  router.post("/radar/proposals/:id/decide", validate({ params: { id: "numeric" }, body: { decision: "string" } }), async (req, res) => {
    const proposal = await db.curriculumProposal.findUnique({ where: { id: Number(req.params.id) } });
    if (!proposal) throw new HttpError(404, "No such proposal.");
    if (proposal.status === "approved" || proposal.status === "rejected") throw new HttpError(409, `Already ${proposal.status}.`);
    const decision = String(req.body.decision);
    if (!["approve", "reject", "defer"].includes(decision)) throw new HttpError(400, '"decision" must be approve, reject or defer');
    const note = String(req.body.note ?? "").slice(0, 1000);

    if (decision !== "approve") {
      const status = decision === "reject" ? "rejected" : "deferred";
      const updated = await db.curriculumProposal.update({ where: { id: proposal.id }, data: { status, decisionNote: note, decidedAt: new Date() } });
      await audit(db, "learner", decision, "CurriculumProposal", proposal.id, { note });
      res.json({ proposal: updated, version: null });
      return;
    }

    const { content, problems } = validateMission(proposal.content, true);
    if (problems.length) throw new HttpError(400, `Not ready to approve: ${problems.join(" ")}`);
    const topic = getTopic(proposal.topicId);
    if (!topic) throw new HttpError(400, "The proposal's topic no longer exists.");

    // Version numbers: the code content is version topic.contentVersion; each approval adds one.
    const result = await db.$transaction(async (tx) => {
      const existing = await tx.topicVersion.count({ where: { topicId: topic.id } });
      const previousVersion = topic.contentVersion + existing;
      const version = await tx.topicVersion.create({
        data: {
          topicId: topic.id,
          version: previousVersion + 1,
          previousVersion,
          proposalId: proposal.id,
          changeReason: proposal.changeReason,
          sources: content.references,
          addendum: { kind: proposal.kind, title: proposal.title, ...content } as object,
          migrationNotes: proposal.migrationNotes,
        },
      });
      const updated = await tx.curriculumProposal.update({ where: { id: proposal.id }, data: { status: "approved", decisionNote: note, decidedAt: new Date() } });
      if (proposal.updateId) await tx.techUpdate.update({ where: { id: proposal.updateId }, data: { reviewStatus: "approved" } });
      return { version, proposal: updated };
    });

    await audit(db, "learner", "approve", "CurriculumProposal", proposal.id, { note });
    await audit(db, "learner", "publish", "TopicVersion", result.version.id, { topicId: topic.id, version: result.version.version });
    await awardXp(db, `proposal:${proposal.id}`, XP.proposalDecided, "Reviewed a curriculum change", topic.id);
    await logActivity(db, "radar", `proposal:${proposal.id}`, topic.id, { approved: true, version: result.version.version });
    const achievements = await afterProgress(db, null);
    res.json({ ...result, achievements });
  });

  // GET /radar/audit -> the audit trail, newest first.
  router.get("/radar/audit", async (req, res) => {
    const limit = Math.min(500, Math.max(1, Number(req.query.limit ?? 100)));
    res.json({ entries: await db.auditLog.findMany({ orderBy: { at: "desc" }, take: limit }) });
  });

  return router;
}
