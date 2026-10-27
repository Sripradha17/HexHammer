// Domain 15: Product Thinking and Team Engineering.
import { defineDomain, outline } from "../outline";
import { ptRequirementsAcceptance } from "../topics/pt-requirements-acceptance";

export const d15 = defineDomain(
  {
    id: "pt",
    number: 15,
    title: "Product Thinking & Team Engineering",
    short: "Product & Team",
    tagline: "Understand the problem, work well with others, and explain your thinking clearly.",
    story:
      "Being able to follow a technical meeting, ask the right question and explain a trade-off to a non-engineer is what turns good code into good outcomes. This region is open from the start, because these skills compound.",
    hue: 36,
    col: 0,
    row: 1,
    unlockedBy: [],
  },
  [
    {
      id: "pt-product",
      title: "Product thinking",
      summary: "Problems, users, requirements, prioritisation and planning.",
      topics: [
        outline({
          id: "pt-problems-users",
          title: "Business problems and user needs",
          difficulty: "foundation",
          objectives: ["Describe the business problem behind a feature request.", "Identify who the users are and what they are trying to get done."],
          subtopics: ["Problem statements", "Jobs to be done", "Metrics that matter"],
        }),
        ptRequirementsAcceptance,
        outline({
          id: "pt-agile-prioritisation",
          title: "Agile, Scrum, Kanban, estimation and prioritisation",
          difficulty: "foundation",
          objectives: ["Explain how Scrum and Kanban organise work.", "Prioritise a backlog using value, effort and risk."],
          prerequisites: ["pt-requirements-acceptance"],
          subtopics: ["Scrum events", "Kanban flow", "Story points vs time", "Prioritisation frameworks"],
          strikeIds: ["prof-s07", "prof-s06"],
        }),
        outline({
          id: "pt-delivery-planning",
          title: "Task decomposition and delivery planning",
          difficulty: "core",
          objectives: ["Decompose a project into milestones and tasks with dependencies.", "Communicate a plan with risks and confidence levels."],
          prerequisites: ["pt-agile-prioritisation"],
          subtopics: ["Work breakdown", "Dependencies", "Risks", "Confidence ranges"],
          strikeIds: ["prof-s06"],
        }),
      ],
    },
    {
      id: "pt-collaboration",
      title: "Working with people",
      summary: "Collaboration across roles, Git workflows, reviews and written decisions.",
      topics: [
        outline({
          id: "pt-cross-functional",
          title: "Collaborating with product, design, QA, security and operations",
          difficulty: "foundation",
          objectives: ["Explain what each partner role needs from engineering and when.", "Bring the right people in early to avoid late surprises."],
          subtopics: ["Roles and incentives", "Kickoffs", "Design reviews", "Security reviews"],
        }),
        outline({
          id: "pt-git-reviews",
          title: "Git workflows, pull requests and code review in a team",
          difficulty: "foundation",
          objectives: ["Open small, well-described pull requests.", "Give and receive review feedback constructively."],
          prerequisites: ["cs-git"],
          subtopics: ["PR descriptions", "Review etiquette", "Turnaround time", "Resolving disagreement"],
          strikeIds: ["prof-s01", "prof-s02"],
        }),
        outline({
          id: "pt-specs-rfcs-adrs",
          title: "Technical specifications, RFCs and architecture decision records",
          difficulty: "core",
          objectives: ["Write a short technical spec that invites useful feedback.", "Record a decision and its alternatives in an ADR."],
          prerequisites: ["pt-requirements-acceptance"],
          subtopics: ["Spec templates", "RFC process", "ADRs", "Getting feedback"],
          strikeIds: ["prof-s05", "prof-s08"],
        }),
      ],
    },
    {
      id: "pt-communication",
      title: "Communication and growth",
      summary: "Explaining, meetings, incidents, releases, mentoring and careers.",
      topics: [
        outline({
          id: "pt-explaining",
          title: "Communicating technical concepts to technical and non-technical audiences",
          difficulty: "foundation",
          objectives: ["Explain a technical concept in one sentence, then in one paragraph, then in depth.", "Adapt vocabulary and detail to the audience."],
          subtopics: ["Audience first", "Layers of detail", "Analogies and their limits", "Diagrams"],
        }),
        outline({
          id: "pt-tradeoffs-questions",
          title: "Explaining trade-offs and asking clarifying questions",
          difficulty: "core",
          objectives: ["Present options with costs, risks and a recommendation.", "Ask questions that move a discussion forward in a meeting."],
          prerequisites: ["pt-explaining"],
          subtopics: ["Option tables", "Recommendations", "Question types", "Following a technical discussion"],
        }),
        outline({
          id: "pt-meetings-presentations",
          title: "Technical presentations, engineering meetings and incident communication",
          difficulty: "core",
          objectives: ["Run a focused technical meeting with a clear outcome.", "Write clear incident status updates for different audiences."],
          prerequisites: ["pt-explaining"],
          subtopics: ["Meeting goals", "Demos", "Status updates", "Stakeholder updates"],
        }),
        outline({
          id: "pt-release-readiness",
          title: "Production readiness and release management",
          difficulty: "core",
          objectives: ["Run a production readiness checklist before launch.", "Plan a release with rollback and communication."],
          prerequisites: ["pt-delivery-planning"],
          subtopics: ["Readiness checklists", "Launch plans", "Rollback plans", "Release notes"],
        }),
        outline({
          id: "pt-mentoring-career",
          title: "Mentoring and career growth",
          difficulty: "core",
          objectives: ["Mentor someone through a problem without solving it for them.", "Build evidence of your growth (projects, decisions, impact)."],
          prerequisites: ["pt-explaining"],
          subtopics: ["Mentoring techniques", "Feedback", "Brag documents", "Promotion evidence"],
          strikeIds: ["prof-s03", "prof-s09"],
          capstone: true,
        }),
      ],
    },
  ],
);
