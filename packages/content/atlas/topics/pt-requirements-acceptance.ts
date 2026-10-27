// Topic: From business problem to user stories and testable acceptance criteria. A COMPLETE topic.
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const ptRequirementsAcceptance: Topic = {
  id: "pt-requirements-acceptance",
  domainId: "",
  moduleId: "",
  title: "Requirements: user stories, acceptance criteria and the questions to ask",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Turn a business problem into a user story that states who benefits and why.",
    "Write acceptance criteria that are specific and testable (Given / When / Then), including edge cases.",
    "Ask clarifying questions that expose hidden requirements, constraints and non-functional needs.",
    "Split a large story into small, independently shippable slices.",
  ],
  prerequisites: [],
  subtopics: ["Problem before solution", "User stories", "Acceptance criteria", "Given/When/Then", "Edge cases", "Non-functional requirements", "Clarifying questions", "Vertical slicing", "Definition of done"],
  strikeIds: ["prof-s06", "prof-s07"],

  story:
    "The ticket said 'Add export to CSV'. Two weeks later the feature shipped, and the customer was unhappy: they needed the export scheduled every Monday, emailed to finance, with amounts in their own currency, and the 200,000-row export timed out. None of that was in the ticket, and nobody asked. Most rework starts with a requirement nobody clarified.",
  mentalModel: {
    plain:
      "A requirement is a promise about behaviour that someone can check. A user story says who wants what and why. Acceptance criteria say exactly how everyone will know it is done. If two people could read a criterion and disagree about whether it passed, it is not finished yet.",
    analogy:
      "Ordering a custom cake. 'A birthday cake' is a wish. 'Chocolate, serves 20, nut-free, says Happy 40th Sam, ready Saturday 2 pm' is a specification the baker and customer can both check. The clarifying questions (allergies? how many people? when?) are where the value is.",
    analogyLimit:
      "A cake is specified once. Software requirements are discovered over time: you learn by shipping small slices and getting feedback, so the goal is shared understanding for the next slice, not a perfect upfront document.",
  },
  lessonSections: [
    {
      heading: "1. Start with the problem, not the feature",
      body:
        "'Add CSV export' is a solution. Ask what problem it solves: 'Finance spends three hours every Monday copying numbers into their spreadsheet.' The real need might be better served by a scheduled report, an API, or a shared dashboard. Understanding the problem lets you propose simpler or better solutions.",
    },
    {
      heading: "2. User stories: who, what, why",
      body:
        "Template: As a <role>, I want <capability>, so that <benefit>.\n\n'As a finance analyst, I want last week's orders as a spreadsheet every Monday morning, so that I can reconcile payments without manual copying.' The 'so that' is the most important part: it tells you what success means.",
    },
    {
      heading: "3. Acceptance criteria: testable promises",
      body:
        "Given/When/Then makes criteria concrete:\nGiven orders exist from last Monday to Sunday,\nWhen the weekly export runs on Monday at 07:00 UTC,\nThen finance receives a CSV containing every order in that range, with amounts in the account currency.\n\nEach criterion should be checkable, ideally by an automated test.",
    },
    {
      heading: "4. Edge cases and non-functional needs",
      body:
        "Ask about the edges: no data, huge data, duplicates, time zones, permissions, failures, partial success. And about quality attributes: how fast, how much data, how often, who may see it, how long it is kept, what happens if it fails. These become criteria too ('Exports of 200,000 rows complete within 2 minutes').",
    },
    {
      heading: "5. Clarifying questions are a skill",
      body:
        "Good questions are specific and reveal options: 'Should cancelled orders be included?', 'Which time zone defines a week?', 'What should happen if the email bounces?'. Ask early, write the answers into the criteria, and confirm them with the person who owns the decision. Asking is a sign of seniority, not ignorance.",
    },
    {
      heading: "6. Slice vertically",
      body:
        "Split big stories into thin slices that each deliver something usable end to end: first a manual 'download last week's orders' button, then the schedule, then email delivery, then currency conversion. Each slice can be shipped, tested and learned from. Avoid horizontal slices like 'build the database layer', which deliver nothing on their own.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "This topic is about writing and conversation. The practice happens in the exercises (critiquing real criteria) and the project, where criteria become automated tests; an animation would not teach it better.",
  codeExamples: [
    {
      title: "Acceptance criteria turned into executable checks",
      language: "js",
      code: `// Story: As a finance analyst, I want last week's orders exported every Monday,
// so that I can reconcile payments without manual copying.

function lastWeekRange(mondayUtc) {
  const end = new Date(mondayUtc);               // Monday 00:00 UTC (exclusive)
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 7);        // previous Monday 00:00 UTC
  return { start: start.toISOString(), end: end.toISOString() };
}

// Given the export runs on Monday 3 Nov 2025,
// Then it covers Monday 27 Oct 00:00 UTC up to (not including) Monday 3 Nov.
const range = lastWeekRange("2025-11-03T00:00:00Z");
console.log(range.start, "->", range.end);
console.log(range.start === "2025-10-27T00:00:00.000Z" ? "PASS" : "FAIL");`,
      expectedOutput: `2025-10-27T00:00:00.000Z -> 2025-11-03T00:00:00.000Z
PASS`,
      steps: [
        "The clarifying question 'which time zone defines a week?' was answered (UTC) and written into the criterion.",
        "The criterion names exact boundaries: start inclusive, end exclusive, so orders at midnight are not counted twice.",
        "The function computes the range from the run date, using UTC methods so local time zones cannot shift it.",
        "The check is the acceptance criterion in code: it prints PASS only if the boundary matches what was agreed.",
      ],
    },
  ],
  practicalApplication:
    "Before starting any ticket, write (or ask for) the 'so that', three to five Given/When/Then criteria including at least one edge case and one non-functional requirement, and the first thin slice you will ship. Share them with the requester and get a yes. This ten-minute habit prevents most rework.",
  commonMistakes: [
    { mistake: "Writing criteria that describe implementation ('use a cron job and S3').", symptom: "Criteria get in the way of better solutions and do not describe user value.", fix: "Describe observable behaviour; leave implementation to the team." },
    { mistake: "Vague words: 'fast', 'user-friendly', 'handle errors'.", symptom: "Endless debate at review about whether it is done.", fix: "Make them measurable: 'p95 under 500 ms', 'shows a retry button and keeps the user's input'." },
    { mistake: "Only the happy path.", symptom: "Bugs and surprised users at the edges (empty, huge, duplicate, failure).", fix: "Ask edge-case questions explicitly and add a criterion for each answer." },
  ],
  misconceptions: [
    { myth: "Requirements are the product manager's job, not the engineer's.", truth: "Engineers are often best placed to spot edge cases, constraints and cheaper alternatives. Shaping requirements is part of senior engineering." },
    { myth: "Asking many questions looks inexperienced.", truth: "Precise clarifying questions signal experience. Silent assumptions are what cause rework." },
    { myth: "A complete specification upfront avoids all problems.", truth: "Needs are discovered by shipping; thin slices and feedback beat a big upfront document." },
  ],
  exercises: [
    { kind: "strike", strikeId: "prof-s06", why: "Break real work into estimable pieces." },
    { kind: "strike", strikeId: "prof-s07", why: "Practise the agile rhythm where stories and criteria are used." },
    {
      kind: "debug",
      question: {
        id: "pt-requirements-acceptance-d1",
        prompt: "Which acceptance criterion is NOT testable as written?",
        code: `A. Given a logged-in user, when they click "Export", then a CSV downloads within 10 seconds for up to 10,000 rows.
B. Given no orders last week, when the export runs, then the CSV contains only the header row.
C. The export should be fast and easy to use.
D. Given a user without the finance role, when they open /exports, then they see a 403 page.`,
        choices: ["A", "B", "C", "D"],
        answerIndex: 2,
        explanation: "'Fast' and 'easy to use' have no measurable threshold or observable outcome, so two people could disagree about whether it passed. A, B and D state a condition, an action and a checkable result.",
        objective: 1,
      },
    },
  ],
  knowledgeChecks: [
    { id: "pt-requirements-acceptance-k1", prompt: "Which part of a user story says what success means?", choices: ["As a <role>", "I want <capability>", "so that <benefit>", "The ticket number"], answerIndex: 2, explanation: "The benefit explains why it matters and how to judge alternatives.", objective: 0 },
    { id: "pt-requirements-acceptance-k2", prompt: "Which is a vertical slice?", choices: ["Build all database tables for the feature", "A download button that exports last week's orders end to end", "Write the API without a UI", "Design all screens first"], answerIndex: 1, explanation: "A vertical slice delivers usable value through every layer.", objective: 3 },
  ],
  project: {
    title: "Requirements pack for one of your own projects",
    summary: "Pick a feature in one of your portfolio projects. Write the problem statement, user stories, Given/When/Then criteria (with edge cases and non-functional requirements), the questions you asked and their answers, and a slicing plan. Then implement the first slice with each criterion as an automated test.",
    type: "architecture",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "A one-paragraph problem statement that does not mention the solution.",
      "Three or more user stories with the 'so that' filled in meaningfully.",
      "At least 8 acceptance criteria across the stories, including 3 edge cases and 2 non-functional requirements.",
      "A list of at least 6 clarifying questions with the answers you decided (and who decided).",
      "A slicing plan of 3+ vertical slices, and the first slice implemented.",
    ],
    acceptanceCriteria: [
      "Every acceptance criterion of the first slice has a matching automated test that passes.",
      "No criterion uses unmeasurable words (fast, easy, intuitive) without a threshold.",
      "A peer (or your future self a week later) can read the pack and explain what 'done' means without asking you.",
    ],
    technologies: ["Markdown", "your project's test framework"],
    milestones: [
      { title: "Problem and stories", done_when: "Problem statement and stories written." },
      { title: "Criteria and questions", done_when: "Criteria with edge cases and answered questions." },
      { title: "Slices", done_when: "Slicing plan agreed." },
      { title: "First slice", done_when: "Implemented with one passing test per criterion." },
    ],
    testIdeas: ["One test per Given/When/Then", "Edge cases: empty, huge, duplicate, unauthorised"],
    stretchGoals: ["Write an ADR for the biggest trade-off you hit during slicing."],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      { id: "pt-requirements-acceptance-a1", prompt: "A stakeholder asks for 'a CSV export button'. Best first response?", choices: ["Start coding immediately", "Ask what problem it solves and how the exported data will be used", "Refuse", "Estimate it as one day"], answerIndex: 1, explanation: "Understanding the problem may reveal a better or simpler solution and the real requirements.", objective: 0 },
      { id: "pt-requirements-acceptance-a2", prompt: "Which acceptance criterion is best?", choices: ["Search should be fast", "Search works well", "Given 1M products, when a user searches a term, then results appear in under 300 ms at p95", "Use Elasticsearch for search"], answerIndex: 2, explanation: "Specific, measurable and about behaviour, not implementation.", objective: 1 },
      { id: "pt-requirements-acceptance-a3", prompt: "Which question most likely uncovers a hidden requirement for a weekly report?", choices: ["What colour should the button be?", "Which time zone defines the start of the week, and should cancelled orders be included?", "Do you like reports?", "Which framework do you prefer?"], answerIndex: 1, explanation: "It exposes boundary rules that change the result.", objective: 2 },
      { id: "pt-requirements-acceptance-a4", prompt: "Which is a non-functional requirement?", choices: ["Users can export orders", "Exports of 200,000 rows complete within 2 minutes", "The export includes the order id", "Finance receives the file by email"], answerIndex: 1, explanation: "It describes a quality attribute (performance), not a function.", objective: 2 },
      { id: "pt-requirements-acceptance-a5", prompt: "Best first slice of 'scheduled, emailed, multi-currency export'?", choices: ["Currency conversion service", "Database schema for all features", "A manual download of last week's orders in one currency", "Email templates"], answerIndex: 2, explanation: "The thinnest end-to-end slice that gives real value and feedback.", objective: 3 },
    ],
  },
  interviewQuestions: [
    { id: "pt-requirements-acceptance-q01", tags: ["product", "requirements"], difficulty: "foundation", kind: "behavioral", prompt: "Tell me about a time requirements were unclear. What did you do?", expectedElements: ["STAR", "noticed ambiguity", "asked specific questions", "wrote down agreements", "sliced/validated early", "outcome"], modelAnswer: "Use STAR. Describe the ambiguous request, the specific questions you asked (edge cases, scale, who decides), how you wrote the answers down as acceptance criteria and confirmed them, how you shipped a small first slice to validate the understanding, and the outcome, such as rework avoided or a simpler solution found.", explanation: "Show initiative and written agreement.", commonWrongAnswers: ["I built what I thought they meant."] },
    { id: "pt-requirements-acceptance-q02", tags: ["product", "acceptance-criteria"], difficulty: "foundation", kind: "concept", prompt: "What makes a good acceptance criterion?", expectedElements: ["observable behaviour", "specific/measurable", "testable", "includes edge cases", "not implementation"], modelAnswer: "It describes observable behaviour, not implementation. It is specific and measurable, so two people would agree whether it passed, and it is ideally automatable as a test. Together, the criteria for a story cover the important edge cases and quality attributes, not only the happy path.", explanation: "Testability is the anchor.", commonWrongAnswers: ["It describes how to build the feature."] },
    { id: "pt-requirements-acceptance-q03", tags: ["product", "nfr"], difficulty: "core", kind: "concept", prompt: "Give examples of non-functional requirements and how you'd make them testable.", expectedElements: ["performance with percentile/threshold", "availability SLO", "security/permissions", "data retention", "accessibility level", "measurable form"], modelAnswer: "Performance: 'p95 latency under 300 ms at 200 requests per second'. Availability: '99.9% monthly for checkout'. Security: 'only finance role can access exports, verified by tests'. Accessibility: 'meets WCAG 2.2 AA, checked with automated scans plus a manual keyboard test'. Retention: 'exports deleted after 30 days'. Each has a threshold and a way to measure it.", explanation: "Measurability is everything.", commonWrongAnswers: ["The system should be fast and secure."] },
    { id: "pt-requirements-acceptance-q04", tags: ["product", "slicing"], difficulty: "core", kind: "design", prompt: "A feature is estimated at six weeks. How would you break it down?", expectedElements: ["vertical slices delivering value", "riskiest assumption first", "each shippable/testable", "feature flags", "feedback between slices"], modelAnswer: "Into thin vertical slices that each deliver something usable end to end, ordered to test the riskiest assumption first. Each slice has its own acceptance criteria and can ship behind a feature flag, so we get feedback after a week instead of after six, and can change direction cheaply.", explanation: "Risk-first ordering is a senior signal.", commonWrongAnswers: ["Backend first, then frontend, then testing."] },
    { id: "pt-requirements-acceptance-q05", tags: ["product", "communication"], difficulty: "core", kind: "scenario", prompt: "A product manager asks for a feature you believe is the wrong solution. How do you handle it?", expectedElements: ["understand the underlying problem", "ask questions not argue", "propose alternatives with trade-offs", "data/evidence", "respect decision owner", "disagree and commit"], modelAnswer: "First make sure I understand the problem they are solving and the evidence behind it, by asking rather than arguing. Then I propose alternatives with clear trade-offs (cost, risk, time to value), ideally with data or a quick prototype. The product manager owns the decision; if we still disagree, I record my concerns and commit to making their choice succeed, with a check to validate it after launch.", explanation: "Collaboration over winning.", commonWrongAnswers: ["Build it my way."] },
    { id: "pt-requirements-acceptance-q06", tags: ["product", "estimation"], difficulty: "core", kind: "concept", prompt: "How do acceptance criteria help with estimation and planning?", expectedElements: ["reveal hidden scope", "clarify done", "enable slicing", "reduce uncertainty", "support testing plan"], modelAnswer: "Writing criteria exposes hidden scope, such as edge cases, scale and permissions, before estimating, so estimates rest on the real work. They define 'done', which prevents scope creep, make slicing possible, and give testers and reviewers a shared checklist.", explanation: "Connects requirements to delivery.", commonWrongAnswers: ["They don't; estimation is separate."] },
    { id: "pt-requirements-acceptance-q07", tags: ["product", "bdd"], difficulty: "foundation", kind: "concept", prompt: "What is Given/When/Then and why is it useful?", expectedElements: ["context, action, outcome", "shared language", "maps directly to tests", "BDD"], modelAnswer: "A format for acceptance criteria: Given a starting context, When an action happens, Then an observable outcome follows. It gives product, design, QA and engineering a shared, precise language, and it maps directly onto test structure (arrange, act, assert), which is the core of behaviour-driven development.", explanation: "Simple and widely used.", commonWrongAnswers: ["It's a programming language."] },
    { id: "pt-requirements-acceptance-q08", tags: ["product", "edge-cases"], difficulty: "core", kind: "implementation", prompt: "List the clarifying questions you would ask before building 'users can upload a profile photo'.", expectedElements: ["file types and size limits", "dimensions/cropping", "moderation/inappropriate content", "privacy/who can see", "storage/retention/deletion", "accessibility (alt text)", "failure handling", "mobile/slow networks"], modelAnswer: "Which file types and maximum size? Do we resize or crop, and to which dimensions? Who can see the photo? Is moderation needed? What happens to old photos, and do we delete them when the account is deleted? What should the UI show if the upload fails or the network is slow? Is there a default avatar? Do we need alt text or a description for accessibility? Are there legal constraints, such as where images are stored?", explanation: "Breadth across function, quality, privacy and failure.", commonWrongAnswers: ["None; it's a simple feature."] },
  ],
  references: [
    { title: "Atlassian: User stories with examples and a template", url: "https://www.atlassian.com/agile/project-management/user-stories", kind: "article" },
    { title: "Cucumber: Gherkin reference (Given/When/Then)", url: "https://cucumber.io/docs/gherkin/reference/", kind: "official-docs" },
    { title: "Martin Fowler: GivenWhenThen", url: "https://martinfowler.com/bliki/GivenWhenThen.html", kind: "article" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Problem-first thinking, testable criteria, clarifying questions and vertical slicing."],
  versionSpecific: [],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
