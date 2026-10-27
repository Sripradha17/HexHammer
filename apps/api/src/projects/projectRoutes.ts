// Project Workshop + Portfolio API: create, read, update, delete projects and their milestones.
import { Router } from "express";
import type { PrismaClient, Prisma } from "@prisma/client";
import { domains, getTopic, topics } from "@hexhammer/content";
import { HttpError } from "../httpError";
import { validate } from "../middleware/validate";
import { validateProject } from "./validateProject";
import { afterProgress, awardXp, logActivity } from "../atlas/service";
import { XP } from "../atlas/rules";

export function createProjectRouter(db: PrismaClient) {
  const router = Router();

  async function findOr404(id: number) {
    const project = await db.project.findUnique({ where: { id }, include: { milestones: { orderBy: { order: "asc" } } } });
    if (!project) throw new HttpError(404, `No project with id ${id}`);
    return project;
  }

  // Throws a 400 with every field problem, so the form can show them all at once.
  function validOr400(body: Record<string, unknown>, partial: boolean) {
    const result = validateProject(body ?? {}, partial);
    if ("errors" in result) throw new HttpError(400, "Some fields need fixing.", result.errors);
    if (result.value.topicId && !getTopic(result.value.topicId)) throw new HttpError(400, "That topic does not exist.");
    if (result.value.domainId && !domains.some((d) => d.id === result.value.domainId)) throw new HttpError(400, "That domain does not exist.");
    return result.value;
  }

  // When a project is completed (first time only): pay XP once, log it, check achievements.
  async function onComplete(project: { id: number; title: string; topicId: string | null }) {
    const xp = await awardXp(db, `project-complete:${project.id}`, XP.projectComplete, `Completed project ${project.title}`, project.topicId ?? undefined);
    await logActivity(db, "project", String(project.id), project.topicId, { status: "complete" });
    return { xp, achievements: await afterProgress(db, project.topicId) };
  }

  // GET /projects -> every project, for the Workshop and the Portfolio (the page filters).
  router.get("/projects", async (_req, res) => {
    const projects = await db.project.findMany({ orderBy: { updatedAt: "desc" }, include: { milestones: { orderBy: { order: "asc" } } } });
    res.json({ projects });
  });

  // GET /projects/templates -> every project a written topic suggests, for the Workshop's
  // "builds you can start" list. Registered BEFORE /projects/:id, or "templates" would be read as an id.
  // Ordered from small guided builds (foundation) to bigger ones (advanced).
  router.get("/projects/templates", (_req, res) => {
    const rank = { foundation: 0, core: 1, advanced: 2 } as const;
    const templates = topics
      .filter((t) => t.project)
      .sort((a, b) => rank[a.difficulty] - rank[b.difficulty])
      .map((topic) => {
        const domain = domains.find((d) => d.id === topic.domainId)!;
        return {
          ...templateFor(topic.id)!,
          topicTitle: topic.title,
          region: { id: domain.id, short: domain.short, hue: domain.hue },
          prerequisiteTopics: topic.prerequisites.map((id) => ({ id, title: getTopic(id)?.title ?? id })),
        };
      });
    res.json({ templates });
  });

  router.get("/projects/:id", validate({ params: { id: "numeric" } }), async (req, res) => {
    res.json(await findOr404(Number(req.params.id)));
  });

  // GET /projects/templates/:topicId -> the topic's suggested project, to pre-fill the form.
  router.get("/projects/templates/:topicId", (req, res) => {
    const template = templateFor(String(req.params.topicId));
    if (!template) throw new HttpError(404, "This topic has no project template yet.");
    res.json(template);
  });

  // A topic's project template in the shape the project form uses (or null if it has none).
  function templateFor(topicId: string) {
    const topic = getTopic(topicId);
    if (!topic?.project) return null;
    const p = topic.project;
    return {
      title: p.title,
      description: p.summary,
      topicId: topic.id,
      domainId: topic.domainId,
      type: p.type,
      difficulty: topic.difficulty,
      objectives: p.objectivesCovered.map((i) => topic.learningObjectives[i]),
      prerequisites: topic.prerequisites.map((id) => getTopic(id)?.title ?? id),
      requirements: p.requirements,
      acceptanceCriteria: p.acceptanceCriteria,
      technologies: p.technologies,
      tests: p.testIdeas.map((title) => ({ title, done: false })),
      tasks: [],
      stretchGoals: p.stretchGoals,
      milestones: p.milestones.map((m) => ({ title: m.title, doneWhen: m.done_when })),
    };
  }

  // POST /projects -> create.
  router.post("/projects", async (req, res) => {
    const { milestones = [], ...data } = validOr400(req.body, false);
    const project = await db.project.create({
      data: {
        ...(data as Prisma.ProjectCreateInput),
        completedAt: data.status === "complete" ? new Date() : null,
        milestones: { create: milestones.map((m, i) => ({ order: i + 1, title: m.title, doneWhen: m.doneWhen, doneAt: m.done ? new Date() : null })) },
      },
      include: { milestones: { orderBy: { order: "asc" } } },
    });
    await logActivity(db, "project", String(project.id), project.topicId, { created: true });
    const extra = project.status === "complete" ? await onComplete(project) : { xp: 0, achievements: await afterProgress(db, null) };
    res.status(201).json({ project, xpAwarded: extra.xp, achievements: extra.achievements });
  });

  // PUT /projects/:id -> update any fields (partial). Milestones are edited through their own routes.
  router.put("/projects/:id", validate({ params: { id: "numeric" } }), async (req, res) => {
    const before = await findOr404(Number(req.params.id));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { milestones, ...data } = validOr400(req.body, true);
    const becomingComplete = data.status === "complete" && before.status !== "complete";
    const evidence = data.evidence !== undefined ? data.evidence : before.evidence;
    if (becomingComplete && !evidence) {
      throw new HttpError(400, "Describe the evidence that it is done before marking it complete.");
    }
    const project = await db.project.update({
      where: { id: before.id },
      data: {
        ...(data as Prisma.ProjectUpdateInput),
        completedAt: becomingComplete ? new Date() : data.status && data.status !== "complete" ? null : undefined,
      },
      include: { milestones: { orderBy: { order: "asc" } } },
    });
    const extra = becomingComplete ? await onComplete(project) : { xp: 0, achievements: await afterProgress(db, null) };
    res.json({ project, xpAwarded: extra.xp, achievements: extra.achievements });
  });

  // DELETE /projects/:id -> the UI asks "are you sure?" first. XP already earned is kept (it was real work).
  router.delete("/projects/:id", validate({ params: { id: "numeric" } }), async (req, res) => {
    const project = await findOr404(Number(req.params.id));
    await db.project.delete({ where: { id: project.id } });
    await logActivity(db, "project", String(project.id), project.topicId, { deleted: true, title: project.title });
    res.status(204).end();
  });

  // POST /projects/:id/milestones -> add a milestone at the end.
  router.post("/projects/:id/milestones", validate({ params: { id: "numeric" }, body: { title: "string" } }), async (req, res) => {
    const project = await findOr404(Number(req.params.id));
    const title = String(req.body.title).trim();
    if (!title) throw new HttpError(400, "A milestone needs a title.");
    const milestone = await db.projectMilestone.create({
      data: { projectId: project.id, order: project.milestones.length + 1, title: title.slice(0, 200), doneWhen: String(req.body.doneWhen ?? "").slice(0, 300) },
    });
    res.status(201).json(milestone);
  });

  // PUT /projects/:id/milestones/:milestoneId -> mark done / not done, or rename.
  router.put("/projects/:id/milestones/:milestoneId", validate({ params: { id: "numeric", milestoneId: "numeric" } }), async (req, res) => {
    const project = await findOr404(Number(req.params.id));
    const milestone = project.milestones.find((m) => m.id === Number(req.params.milestoneId));
    if (!milestone) throw new HttpError(404, "No such milestone in this project.");
    const data: Prisma.ProjectMilestoneUpdateInput = {};
    if (typeof req.body?.title === "string" && req.body.title.trim()) data.title = req.body.title.trim().slice(0, 200);
    if (typeof req.body?.doneWhen === "string") data.doneWhen = req.body.doneWhen.slice(0, 300);
    if (typeof req.body?.done === "boolean") data.doneAt = req.body.done ? milestone.doneAt ?? new Date() : null;
    const updated = await db.projectMilestone.update({ where: { id: milestone.id }, data });

    let xpAwarded = 0;
    if (req.body?.done === true && !milestone.doneAt) {
      // The key includes the milestone id, so un-ticking and re-ticking never pays twice.
      xpAwarded = await awardXp(db, `milestone:${milestone.id}`, XP.milestone, `Milestone: ${milestone.title}`, project.topicId ?? undefined);
      await logActivity(db, "milestone", String(milestone.id), project.topicId, { project: project.title, milestone: milestone.title });
    }
    const achievements = await afterProgress(db, project.topicId);
    res.json({ milestone: updated, xpAwarded, achievements });
  });

  router.delete("/projects/:id/milestones/:milestoneId", validate({ params: { id: "numeric", milestoneId: "numeric" } }), async (req, res) => {
    const project = await findOr404(Number(req.params.id));
    const milestone = project.milestones.find((m) => m.id === Number(req.params.milestoneId));
    if (!milestone) throw new HttpError(404, "No such milestone in this project.");
    await db.projectMilestone.delete({ where: { id: milestone.id } });
    res.status(204).end();
  });

  // GET /projects/export/markdown -> my portfolio as a Markdown file I can paste into a README.
  router.get("/projects/export/markdown", async (_req, res) => {
    const projects = await db.project.findMany({ where: { status: { not: "archived" } }, orderBy: { updatedAt: "desc" }, include: { milestones: { orderBy: { order: "asc" } } } });
    const lines = ["# Engineering portfolio", "", `_Exported from Hexhammer on ${new Date().toISOString().slice(0, 10)}. Repository links are listed as I entered them; Hexhammer did not inspect or run them._`, ""];
    for (const p of projects) {
      lines.push(`## ${p.title}`, "", p.description, "");
      lines.push(`- **Status:** ${p.status.replace("_", " ")}`);
      if (p.topicId) lines.push(`- **Topic:** ${getTopic(p.topicId)?.title ?? p.topicId}`);
      const tech = p.technologies as string[];
      if (tech.length) lines.push(`- **Technologies:** ${tech.join(", ")}`);
      if (p.repoUrl) lines.push(`- **Repository:** ${p.repoUrl}`);
      if (p.demoUrl) lines.push(`- **Demo:** ${p.demoUrl}`);
      if (p.milestones.length) {
        lines.push("", "**Milestones**", "");
        for (const m of p.milestones) lines.push(`- [${m.doneAt ? "x" : " "}] ${m.title}`);
      }
      if (p.reflection) lines.push("", "**What I learned**", "", p.reflection);
      lines.push("");
    }
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="portfolio.md"');
    res.send(lines.join("\n"));
  });

  return router;
}
