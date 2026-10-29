// Talks to the Atlas, Projects and Radar APIs. Every call goes to /api/... (Vite forwards it).
// Types describe exactly what the server sends; curriculum TYPES come from @hexhammer/content,
// but curriculum VALUES (with answers) never ship in the browser bundle.
import type { Difficulty, Domain, InterviewKind, LessonSection, Topic, TopicStage } from "@hexhammer/content";

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      headers: init?.body ? { "Content-Type": "application/json", ...init.headers } : init?.headers,
    });
  } catch {
    throw new ApiError(0, "Could not reach the API. Is `npm run dev` running and the database started?");
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, data.error ?? `Request failed (${response.status})`, data.fields);
  return data as T;
}
const post = <T>(path: string, body?: unknown) => call<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
const put = <T>(path: string, body: unknown) => call<T>(path, { method: "PUT", body: JSON.stringify(body) });

// ------------------------------------------------------------------ Shared shapes

export type TopicStatus = "locked" | "new" | "learning" | "practiced" | "assessed" | "mastered";

export interface UnlockedAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface MapTopic {
  id: string;
  title: string;
  stage: TopicStage;
  difficulty: Difficulty;
  capstone: boolean;
  prerequisites: string[];
  status: TopicStatus;
  reviewDue: boolean;
  strikeCount: number;
  hasAssessment: boolean;
}

export interface Region extends Omit<Domain, "modules"> {
  unlocked: boolean;
  modules: { id: string; title: string; summary: string; topics: MapTopic[] }[];
  counts: { topics: number; written: number; started: number; assessed: number; mastered: number; reviewDue: number };
}

export interface PublicChoice {
  id: string;
  prompt: string;
  code?: string;
  choices: string[];
  objective: number;
}

export interface PublicInterview {
  id: string;
  tags: string[];
  difficulty: Difficulty;
  kind: InterviewKind;
  prompt: string;
  code?: string;
  expectedCount: number;
}

export type PublicExercise =
  | { kind: "strike"; strikeId: string; why: string }
  | { kind: "predict" | "debug"; question: PublicChoice }
  | { kind: "lab"; lab: Topic["visualizationType"]; task: string; goal: string };

export type PublicTopic = Omit<Topic, "knowledgeChecks" | "assessment" | "exercises" | "interviewQuestions"> & {
  knowledgeChecks: PublicChoice[];
  assessment: { passingScore: number; questions: PublicChoice[] } | null;
  exercises: PublicExercise[];
  interviewQuestions: PublicInterview[];
};

export interface TopicVersionView {
  version: number;
  previousVersion: number;
  changeReason: string;
  sources: { title: string; url: string }[];
  addendum: Record<string, unknown> & { title?: string; whatChanged?: string; whyChanged?: string; before?: string; now?: string; exercise?: string };
  migrationNotes: string;
  approvedAt: string;
}

export interface TopicView {
  topic: PublicTopic;
  domain: { id: string; title: string; short: string; hue: number };
  completeness: { passed: number; total: number; missing: string[] };
  progress: { lessonRead: boolean; exercisesDone: string[]; bestAssessmentScore: number | null; reviewsPassed: number; projectComplete: boolean; reviewDue: boolean; exerciseKeys: string[] };
  status: TopicStatus;
  mastery: { label: string; met: boolean; detail: string }[];
  prerequisites: { id: string; title: string; met: boolean }[];
  strikes: { id: string; title: string; runner: string; status: string }[];
  glossary: { id: string; term: string; simple: string }[];
  projects: { id: number; title: string; status: string }[];
  review: { dueAt: string; step: number; lastResult: string | null } | null;
  attempts: { score: number; passed: boolean; createdAt: string }[];
  contentVersion: number;
  versions: TopicVersionView[];
}

export interface Rewards {
  xpAwarded: number;
  achievements: UnlockedAchievement[];
}

export interface MissionControl {
  level: { level: number; xpIntoLevel: number; xpForNextLevel: number };
  xp: number;
  path: { id: string; title: string; short: string; hue: number; counts: Region["counts"] };
  nextMission: { id: string; title: string; regionId: string; status: TopicStatus; why: string; objective: string | null; visualization: Topic["visualizationType"] } | null;
  nextBuild: { topicId: string; title: string; milestones: number } | null;
  resume: { id: string; title: string; status: TopicStatus } | null;
  skills: ({ id: string; short: string; hue: number; unlocked: boolean } & Region["counts"])[];
  reviews: { dueTopics: number; dueQuestions: number; nextDueAt: string | null; enabled: boolean };
  activeProject: { id: number; title: string; status: string; milestonesDone: number; milestonesTotal: number; nextMilestone: string | null } | null;
  recentAchievement: (UnlockedAchievement & { unlockedAt: string }) | null;
  nextAchievement: UnlockedAchievement | null;
  achievements: { unlocked: number; total: number };
  streak: { current: number; totalDays: number };
  // Counts of unreviewed, relevant radar items by classification (the headlines stay on the Radar page).
  radar: { enabled: boolean; byClassification: Record<string, number> };
}

export interface Me {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  achievements: (UnlockedAchievement & { unlockedAt: string | null })[];
  streak: { current: number; totalDays: number };
}

export interface ReviewMission {
  id: number;
  kind: "topic" | "question";
  topicId: string;
  title: string;
  dueAt: string;
  step: number;
  questions?: PublicChoice[];
  question?: PublicInterview;
}

// A quick multiple-choice challenge (a topic's riddle or quick check). Answer hidden until checked.
export interface QuickfireQuestion extends PublicChoice {
  kind: "predict" | "debug" | "check";
  topicId: string;
  topicTitle: string;
  domainId: string;
}

export interface BankQuestion extends PublicInterview {
  topicId: string;
  topicTitle: string;
  domainId: string;
  stats: { attempts: number; last: string; lastConfidence: number } | null;
  dueAt: string | null;
}

export interface Reveal {
  attemptId: number;
  expectedElements: string[];
  modelAnswer: string;
  explanation: string;
  commonWrongAnswers: string[];
  followUps: string[];
}

export interface GlossaryEntry {
  id: string;
  term: string;
  aka?: string[];
  simple: string;
  whyItMatters: string;
  example: string;
  whereInApp: string;
  related: string[];
  meetingLine: string;
  category: string;
  topics: { id: string; title: string }[];
}

export interface Preferences {
  dailyGoalMinutes: number;
  weeklyGoalTopics: number;
  difficulty: Difficulty;
  motion: "system" | "reduce" | "full";
  reviewIntensity: "relaxed" | "normal" | "intense";
  preferredDomainId: string | null;
  strictUnlocking: boolean;
  notifyReviews: boolean;
  notifyRadar: boolean;
  radarCategories: string[];
}

export interface Analytics {
  lessonsRead: number;
  exercisesDone: number;
  assessments: { attempts: number; passed: number; averageScore: number | null };
  reviews: { done: number; good: number; successRate: number | null };
  projects: { total: number; complete: number };
  mastered: number;
  xpByWeek: { weekStart: string; xp: number }[];
  byDomain: { id: string; short: string; hue: number; started: number; assessed: number; mastered: number; total: number }[];
  needsPractice: { topicId: string; title: string; reason: string }[];
}

export interface HistoryEntry {
  id: number;
  type: string;
  refId: string;
  topicId: string | null;
  topicTitle: string | null;
  detail: Record<string, unknown>;
  createdAt: string;
}

// ------------------------------------------------------------------ Projects

export interface Milestone {
  id: number;
  order: number;
  title: string;
  doneWhen: string;
  doneAt: string | null;
}

export interface CheckItem {
  title: string;
  done: boolean;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  topicId: string | null;
  domainId: string | null;
  type: string;
  difficulty: Difficulty;
  status: string;
  objectives: string[];
  prerequisites: string[];
  requirements: string[];
  acceptanceCriteria: string[];
  technologies: string[];
  tasks: CheckItem[];
  tests: CheckItem[];
  stretchGoals: string[];
  repoUrl: string | null;
  demoUrl: string | null;
  evidence: string | null;
  reflection: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  milestones: Milestone[];
}

// A project a written topic suggests (from GET /projects/templates), with where it sits on the map.
export type ProjectTemplate = ProjectDraft & {
  key: string; // what to start it by: a fun build id ("build-...") or a topic id
  kind: "game" | "creative" | "app" | "ai" | "lesson";
  quest: string | null; // one sentence of story (fun builds only)
  topicTitle: string;
  region: { id: string; short: string; hue: number };
  prerequisiteTopics: { id: string; title: string }[];
};

export type ProjectDraft = Omit<Project, "id" | "createdAt" | "updatedAt" | "completedAt" | "milestones"> & {
  milestones?: { title: string; doneWhen: string }[];
};

// ------------------------------------------------------------------ Radar

export interface RadarSource {
  id: number;
  name: string;
  url: string;
  kind: string;
  category: string;
  technology: string;
  topicIds: string[];
  enabled: boolean;
  checkIntervalHours: number;
  validationStatus: string;
  lastValidatedAt: string | null;
  lastCheckedAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  consecutiveFailures: number;
  updateCount: number;
  due: boolean;
  stale: boolean;
  health: "never-checked" | "failing" | "stale" | "healthy";
}

export interface RadarRun {
  id: number;
  kind: string;
  trigger: string;
  status: string;
  itemsFound: number;
  itemsNew: number;
  itemsDuplicate: number;
  error: string | null;
  detail: Record<string, unknown>;
  startedAt: string;
  source: { name: string } | null;
}

export interface RadarOverview {
  scheduler: { running: boolean; startedAt: string | null; lastTickAt: string | null; tickMinutes: number; note: string };
  ollama: { url: string; model: string };
  labels: Record<string, string>;
  sources: RadarSource[];
  counts: { classification: string; reviewStatus: string; _count: number }[];
  runs: RadarRun[];
  pendingProposals: number;
}

export interface TechUpdate {
  id: number;
  canonicalUrl: string;
  title: string;
  summary: string;
  publishedAt: string | null;
  discoveredAt: string;
  technology: string;
  topicIds: string[];
  classification: string;
  classificationReason: string;
  analysisBy: string;
  aiAnalysis: string | null;
  verificationStatus: string;
  reviewStatus: string;
  seenCount: number;
  alsoSeenIn: number[];
  source: { name: string; category: string };
  topics?: { id: string; title: string }[];
  proposals?: Proposal[];
}

export interface MissionContent {
  whatChanged: string;
  whyChanged: string;
  before: string;
  now: string;
  foundations: string[];
  example: string;
  demo: string;
  exercise: string;
  interviewQuestions: { prompt: string; modelAnswer: string }[];
  projectEnhancement: string;
  assessment: { prompt: string; modelAnswer: string }[];
  references: { title: string; url: string }[];
}

export interface Proposal {
  id: number;
  updateId: number | null;
  topicId: string;
  topicTitle?: string;
  kind: string;
  title: string;
  changeReason: string;
  sources: { title: string; url: string }[];
  content: MissionContent;
  affectedExercises: string[];
  affectedQuestions: string[];
  migrationNotes: string;
  status: string;
  decisionNote: string | null;
  createdAt: string;
  decidedAt: string | null;
  problems?: string[];
  topicExercises?: { index: number; label: string }[];
  topicQuestions?: { id: string; prompt: string }[];
  update?: { title: string; canonicalUrl: string } | null;
  version?: { version: number } | null;
}

export interface AuditEntry {
  id: number;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  detail: Record<string, unknown>;
  at: string;
}

// ------------------------------------------------------------------ The calls

export const atlas = {
  map: () => call<{ regions: Region[]; strictUnlocking: boolean }>("/atlas/map"),
  me: () => call<Me>("/atlas/me"),
  missionControl: () => call<MissionControl>("/atlas/mission-control"),
  topic: (id: string) => call<TopicView>(`/atlas/topics/${encodeURIComponent(id)}`),
  markRead: (id: string) => post<Rewards>(`/atlas/topics/${encodeURIComponent(id)}/read`),
  checkQuestion: (questionId: string, choice: number) =>
    post<Rewards & { correct: boolean; answerIndex: number; explanation: string }>(`/atlas/questions/${encodeURIComponent(questionId)}/check`, { choice }),
  completeLab: (topicId: string, lab: string, detail: string) => post<Rewards>(`/atlas/topics/${encodeURIComponent(topicId)}/labs/${lab}/complete`, { detail }),
  submitAssessment: (topicId: string, answers: Record<string, number>) =>
    post<
      Rewards & {
        score: number;
        passed: boolean;
        correct: number;
        total: number;
        firstPass: boolean;
        bestScore: number;
        results: { questionId: string; chosen: number | null; correct: boolean; answerIndex: number; explanation: string; objective: number }[];
        weakObjectives: { index: number; text: string }[];
      }
    >(`/atlas/topics/${encodeURIComponent(topicId)}/assessment`, { answers }),
  reviewsDue: () => call<{ missions: ReviewMission[] }>("/atlas/reviews/due"),
  submitReview: (id: number, body: { answers?: Record<string, number>; selfRating?: string; confidence: number }) =>
    post<Rewards & { result: string; nextDueAt: string; days: number; feedback: { id: string; correct: boolean; answerIndex: number; explanation: string }[] }>(`/atlas/reviews/${id}`, body),
  quickfire: () => call<{ questions: QuickfireQuestion[] }>("/atlas/quickfire"),
  interviewBank: () => call<{ questions: BankQuestion[]; target: number; topicsWithQuestions: number }>("/atlas/interview/questions"),
  answerInterview: (id: string, answerText: string, confidence: number) => post<Reveal>(`/atlas/interview/questions/${encodeURIComponent(id)}/answer`, { answerText, confidence }),
  rateAttempt: (attemptId: number, selfRating: string, elementsHit: string[]) =>
    post<Rewards & { nextDueAt: string; days: number }>(`/atlas/interview/attempts/${attemptId}/rate`, { selfRating, elementsHit }),
  glossary: () => call<{ terms: GlossaryEntry[] }>("/atlas/glossary"),
  analytics: () => call<Analytics>("/atlas/analytics"),
  history: (limit = 50) => call<{ history: HistoryEntry[] }>(`/atlas/history?limit=${limit}`),
  preferences: () => call<Preferences>("/atlas/preferences"),
  savePreferences: (prefs: Partial<Preferences>) => put<Preferences>("/atlas/preferences", prefs),
};

export const projectsApi = {
  list: () => call<{ projects: Project[] }>("/projects"),
  templates: () => call<{ templates: ProjectTemplate[] }>("/projects/templates"),
  get: (id: number) => call<Project>(`/projects/${id}`),
  template: (topicId: string) => call<ProjectDraft>(`/projects/templates/${encodeURIComponent(topicId)}`),
  create: (draft: ProjectDraft) => post<Rewards & { project: Project }>("/projects", draft),
  update: (id: number, changes: Partial<ProjectDraft>) => put<Rewards & { project: Project }>(`/projects/${id}`, changes),
  remove: (id: number) => call<void>(`/projects/${id}`, { method: "DELETE" }),
  addMilestone: (id: number, title: string, doneWhen: string) => post<Milestone>(`/projects/${id}/milestones`, { title, doneWhen }),
  setMilestone: (id: number, milestoneId: number, changes: { done?: boolean; title?: string }) =>
    put<Rewards & { milestone: Milestone }>(`/projects/${id}/milestones/${milestoneId}`, changes),
  removeMilestone: (id: number, milestoneId: number) => call<void>(`/projects/${id}/milestones/${milestoneId}`, { method: "DELETE" }),
};

export const radar = {
  overview: () => call<RadarOverview>("/radar/overview"),
  updates: (params: { status?: string; classification?: string; q?: string } = {}) =>
    call<{ updates: TechUpdate[] }>(`/radar/updates?${new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][])}`),
  update: (id: number) => call<TechUpdate>(`/radar/updates/${id}`),
  review: (id: number, action: string, note = "") => post<TechUpdate>(`/radar/updates/${id}/review`, { action, note }),
  verify: (id: number, status: string) => post<TechUpdate>(`/radar/updates/${id}/verify`, { status }),
  analyze: (id: number) => post<TechUpdate>(`/radar/updates/${id}/analyze`),
  propose: (id: number, topicId: string, kind: string) => post<Proposal>(`/radar/updates/${id}/proposals`, { topicId, kind }),
  proposals: (status = "") => call<{ proposals: Proposal[] }>(`/radar/proposals${status ? `?status=${status}` : ""}`),
  proposal: (id: number) => call<Proposal>(`/radar/proposals/${id}`),
  saveProposal: (id: number, changes: Partial<Proposal>) => put<Proposal>(`/radar/proposals/${id}`, changes),
  decide: (id: number, decision: string, note: string) => post<Rewards & { proposal: Proposal; version: { version: number } | null }>(`/radar/proposals/${id}/decide`, { decision, note }),
  addSource: (source: { name: string; url: string; kind: string; category: string; technology: string; topicIds: string[] }) =>
    post<{ source: RadarSource; validation: { ok: boolean; detail: string } }>("/radar/sources", source),
  editSource: (id: number, changes: Partial<RadarSource>) => put<RadarSource>(`/radar/sources/${id}`, changes),
  validateSource: (id: number) => post<{ source: RadarSource; validation: { ok: boolean; detail: string } }>(`/radar/sources/${id}/validate`),
  checkSource: (id: number) => post<{ run: RadarRun }>(`/radar/sources/${id}/check`),
  checkDue: () => post<{ checked?: number; skipped?: boolean }>("/radar/check-due"),
  audit: () => call<{ entries: AuditEntry[] }>("/radar/audit"),
};

export type { LessonSection };
