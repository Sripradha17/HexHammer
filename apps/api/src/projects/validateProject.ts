// Hand-written validation for project records. No library: each rule is a few readable lines.
// It returns either { value } (clean data ready to save) or { errors } (field -> message).

export const PROJECT_TYPES = ["exercise", "debugging-lab", "implementation", "architecture", "application"];
export const PROJECT_STATUSES = ["idea", "planned", "in_progress", "blocked", "complete", "archived"];
export const DIFFICULTIES = ["foundation", "core", "advanced"];

// A GitHub repository URL: https://github.com/<owner>/<repo>, optionally with a path after it.
// We only check the SHAPE. We never fetch it, and the UI never claims it was inspected.
const GITHUB_REPO = /^https:\/\/github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([A-Za-z0-9._-]{1,100})(?:\.git)?(?:\/[^\s]*)?$/;

export function checkGithubUrl(url: string): string | null {
  if (!GITHUB_REPO.test(url)) {
    return "Use a GitHub repository address like https://github.com/your-name/your-repo";
  }
  return null;
}

// A demo URL: any http(s) address. Plain http is only allowed for this computer (localhost).
export function checkDemoUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "That is not a valid web address.";
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
  if (parsed.protocol === "https:") return null;
  if (parsed.protocol === "http:" && local) return null;
  return "Use an https:// address (plain http:// is only allowed for localhost).";
}

type Item = { title: string; done: boolean };
type Milestone = { title: string; doneWhen: string; done?: boolean };

export interface ProjectInput {
  title: string;
  description: string;
  topicId: string | null;
  domainId: string | null;
  type: string;
  difficulty: string;
  status: string;
  objectives: string[];
  prerequisites: string[];
  requirements: string[];
  acceptanceCriteria: string[];
  technologies: string[];
  tasks: Item[];
  tests: Item[];
  stretchGoals: string[];
  repoUrl: string | null;
  demoUrl: string | null;
  evidence: string | null;
  reflection: string | null;
  milestones?: Milestone[];
}

// `partial` = true for an update (only the fields sent are checked and returned).
export function validateProject(body: Record<string, unknown>, partial = false) {
  const errors: Record<string, string> = {};
  const value: Partial<ProjectInput> = {};
  const has = (k: string) => body[k] !== undefined;

  function text(k: keyof ProjectInput, { required = false, max = 200, nullable = false } = {}) {
    if (!has(k)) {
      if (required && !partial) errors[k] = "This is required.";
      return;
    }
    const v = body[k];
    if (v === null || v === "") {
      if (nullable) (value as Record<string, unknown>)[k] = null;
      else errors[k] = "This is required.";
      return;
    }
    if (typeof v !== "string") return void (errors[k] = "Must be text.");
    if (v.trim().length > max) return void (errors[k] = `Keep it under ${max} characters.`);
    (value as Record<string, unknown>)[k] = v.trim();
  }

  function oneOf(k: keyof ProjectInput, allowed: string[], fallback?: string) {
    if (!has(k)) {
      if (!partial && fallback) (value as Record<string, unknown>)[k] = fallback;
      return;
    }
    if (!allowed.includes(String(body[k]))) return void (errors[k] = `Must be one of: ${allowed.join(", ")}.`);
    (value as Record<string, unknown>)[k] = body[k];
  }

  function list(k: keyof ProjectInput, maxItems = 30) {
    if (!has(k)) {
      if (!partial) (value as Record<string, unknown>)[k] = [];
      return;
    }
    const v = body[k];
    if (!Array.isArray(v) || v.some((x) => typeof x !== "string")) return void (errors[k] = "Must be a list of text.");
    if (v.length > maxItems) return void (errors[k] = `At most ${maxItems} items.`);
    (value as Record<string, unknown>)[k] = v.map((x: string) => x.trim()).filter(Boolean).map((x: string) => x.slice(0, 300));
  }

  function checklist(k: "tasks" | "tests") {
    if (!has(k)) {
      if (!partial) value[k] = [];
      return;
    }
    const v = body[k];
    if (!Array.isArray(v) || v.some((x) => typeof x !== "object" || x === null || typeof (x as Item).title !== "string")) {
      return void (errors[k] = "Must be a list of { title, done }.");
    }
    value[k] = (v as Item[]).filter((x) => x.title.trim()).slice(0, 50).map((x) => ({ title: x.title.trim().slice(0, 300), done: Boolean(x.done) }));
  }

  text("title", { required: true, max: 120 });
  text("description", { required: true, max: 2000 });
  text("topicId", { nullable: true, max: 100 });
  text("domainId", { nullable: true, max: 100 });
  oneOf("type", PROJECT_TYPES, "implementation");
  oneOf("difficulty", DIFFICULTIES, "core");
  oneOf("status", PROJECT_STATUSES, "planned");
  list("objectives");
  list("prerequisites");
  list("requirements");
  list("acceptanceCriteria");
  list("technologies", 20);
  list("stretchGoals");
  checklist("tasks");
  checklist("tests");
  text("evidence", { nullable: true, max: 5000 });
  text("reflection", { nullable: true, max: 5000 });

  // URLs: optional, but when present they must have the right shape.
  for (const [k, check] of [["repoUrl", checkGithubUrl], ["demoUrl", checkDemoUrl]] as const) {
    if (!has(k)) {
      if (!partial) value[k] = null;
      continue;
    }
    const v = body[k];
    if (v === null || v === "") {
      value[k] = null;
      continue;
    }
    if (typeof v !== "string") {
      errors[k] = "Must be text.";
      continue;
    }
    const problem = check(v.trim());
    if (problem) errors[k] = problem;
    else value[k] = v.trim();
  }

  if (has("milestones")) {
    const v = body.milestones;
    if (!Array.isArray(v) || v.some((m) => typeof m !== "object" || m === null || typeof (m as Milestone).title !== "string")) {
      errors.milestones = "Must be a list of { title, doneWhen }.";
    } else {
      value.milestones = (v as Milestone[])
        .filter((m) => m.title.trim())
        .slice(0, 20)
        .map((m) => ({ title: m.title.trim().slice(0, 200), doneWhen: String(m.doneWhen ?? "").trim().slice(0, 300), done: Boolean(m.done) }));
    }
  }

  // Completing a project needs evidence: the app never marks work done without proof in my words.
  const finalStatus = value.status ?? body.status;
  if (finalStatus === "complete" && !partial && !value.evidence) {
    errors.evidence = "Describe the evidence that it is done (tests passing, demo, screenshots) before marking it complete.";
  }

  return Object.keys(errors).length ? { errors } : { value };
}
