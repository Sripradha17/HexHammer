// Topic: Injection (SQL, command, and friends) and parameterized queries. A COMPLETE topic.
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const secInjection: Topic = {
  id: "sec-injection",
  domainId: "",
  moduleId: "",
  title: "Injection: when data becomes code",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Explain injection as untrusted data being interpreted as code by another system (SQL, shell, HTML, LDAP, prompts).",
    "Show how string-built SQL can be exploited, and how parameterized queries prevent it.",
    "Choose the right defence for each sink: parameterization, safe APIs, allow-lists and output encoding.",
    "Explain why input validation and escaping alone are weaker than keeping code and data separate.",
  ],
  prerequisites: ["db-relational-basics", "sec-cia-threats"],
  subtopics: ["Sources and sinks", "SQL injection", "Parameterized queries / prepared statements", "Command injection", "Allow-lists for identifiers", "ORM raw-query traps", "Defence in depth and least privilege"],
  strikeIds: ["l5-s19", "l5-s18"],

  story:
    "A support tool lets staff search customers by email. A curious user types `x' OR '1'='1` into the public 'forgot password' form, which reuses the same query, and the response leaks every customer's email address. The fix was not a cleverer filter. It was refusing to let user input be part of the SQL text at all.",
  mentalModel: {
    plain:
      "Injection happens when you build an instruction for another system (a SQL query, a shell command, HTML) by gluing user input into the instruction text. If the input contains the system's special characters, it stops being data and starts being instructions. The fix is to send the instruction and the data separately, so the data can never change the instruction.",
    analogy:
      "A form letter: 'Pay ______ the sum of £10'. If someone writes 'Bob £10. Also pay Eve' in the blank and the clerk reads the whole thing aloud as one sentence, Eve gets paid. A parameterized query is a form where the blank is a sealed box: whatever is inside is only ever a name.",
    analogyLimit:
      "Parameters only protect VALUES. You cannot put a table name, column name or sort direction in a parameter slot, so those still need an allow-list. And parameters do nothing for other sinks like shell commands or HTML, which need their own safe APIs.",
  },
  lessonSections: [
    {
      heading: "1. Sources and sinks",
      body:
        "A source is anywhere untrusted data enters: request bodies, query strings, headers, cookies, files, webhooks, and even data from your own database that originally came from users. A sink is anywhere data is interpreted: a SQL engine, a shell, an HTML page, a template engine, a regex, an LLM prompt. Injection is a source reaching a sink without separation.",
    },
    {
      heading: "2. How SQL injection works",
      body:
        "`\"SELECT * FROM users WHERE email = '\" + email + \"'\"` looks harmless. With email = `x' OR '1'='1`, the text becomes `... WHERE email = 'x' OR '1'='1'`, and since '1'='1' is always true, every row comes back. Other payloads can read other tables (UNION), change data, or, with stacked statements, delete it.",
    },
    {
      heading: "3. Parameterized queries: the real fix",
      body:
        "With parameters, the query text has placeholders (`$1` in PostgreSQL) and the values travel separately: `client.query('SELECT * FROM users WHERE email = $1', [email])`. The database parses the SQL first and only then plugs in the value as data. No value can change the query's structure, whatever characters it contains.",
    },
    {
      heading: "4. Things parameters cannot do",
      body:
        "Identifiers (table and column names) and keywords (ASC/DESC) cannot be parameters. For a user-chosen sort column, map the input against an allow-list: `const columns = { name: 'name', date: 'created_at' }` and reject anything else. ORMs are safe by default but usually offer raw-query escape hatches; with string interpolation, those reintroduce injection.",
    },
    {
      heading: "5. Other injection sinks",
      body:
        "Shell: never build a command string from input; use APIs that take an argument array without a shell (Node's `execFile`/`spawn` with `shell: false`). HTML: render with textContent or a framework's escaping, not innerHTML (that is XSS, injection into the browser). LLM prompts: retrieved or user text can carry instructions too (prompt injection), with no perfect separation available, which is why AI systems need extra guardrails.",
    },
    {
      heading: "6. Defence in depth",
      body:
        "Separation (parameters, safe APIs) is the primary control. Add layers: validate input types and formats, run the app's database user with least privilege (no DROP, no access to unrelated tables), keep error messages generic so attackers learn little, and log and alert on suspicious patterns. No single layer is perfect.",
    },
  ],
  visualizationType: "injection",
  codeExamples: [
    {
      title: "The same input, glued vs parameterized",
      language: "js",
      code: `const email = "x' OR '1'='1";

// UNSAFE: the input becomes part of the SQL text.
const unsafe = \`SELECT * FROM users WHERE email = '\${email}'\`;
console.log(unsafe);

// SAFE: text and values travel separately (node-postgres style).
const safe = { text: "SELECT * FROM users WHERE email = $1", values: [email] };
console.log(safe.text, JSON.stringify(safe.values));`,
      expectedOutput: `SELECT * FROM users WHERE email = 'x' OR '1'='1'
SELECT * FROM users WHERE email = $1 ["x' OR '1'='1"]`,
      steps: [
        "The attacker's input contains a quote, which ends the string literal early in the unsafe version.",
        "The unsafe text now has a second condition, OR '1'='1', which is always true. Run against a 2-user table in pg-mem while writing this lesson, it returned both rows.",
        "In the safe version the SQL text never changes: it always has exactly one placeholder.",
        "The whole input, quotes included, is sent as a value and compared literally to the email column, so it simply matches no one.",
      ],
    },
  ],
  practicalApplication:
    "In code review, search for template literals or `+` near `query(`, `raw(`, `exec(`, `innerHTML` and prompt-building code. Every one of them is a potential source-to-sink path. Replace them with parameters or safe APIs, add allow-lists for identifiers, and add a test that sends a classic payload and asserts it is treated as plain data.",
  commonMistakes: [
    { mistake: "Escaping quotes by hand instead of using parameters.", symptom: "Bypasses through encodings, backslashes or other contexts.", fix: "Use the driver's parameterized queries; never hand-roll escaping." },
    { mistake: "Passing a user-chosen column name as a parameter.", symptom: "The query errors, so the developer falls back to string concatenation.", fix: "Map user choices through an allow-list of known identifiers." },
    { mistake: "Using an ORM's raw-SQL helper with string interpolation.", symptom: "Injection inside an otherwise 'safe' ORM codebase.", fix: "Use the raw helper's parameter form (tagged templates or placeholders)." },
  ],
  misconceptions: [
    { myth: "Input validation prevents injection.", truth: "Validation reduces attack surface, but many valid inputs (names like O'Brien) contain special characters. Separation of code and data is the actual defence." },
    { myth: "ORMs make injection impossible.", truth: "They are safe by default, but raw-query features and dynamic identifiers can still be injected." },
    { myth: "Only SQL can be injected.", truth: "Any interpreter is a sink: shells, HTML, templates, LDAP, XPath, regex engines and LLM prompts." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l5-s19", why: "Fix a real lookup route so input is compared as data, never glued into a command." },
    { kind: "strike", strikeId: "l5-s18", why: "Survey the OWASP Top 10 and place injection among the other risks." },
    {
      kind: "debug",
      question: {
        id: "sec-injection-d1",
        prompt: "This route lets users sort products. Which line is injectable even though the WHERE clause uses a parameter?",
        code: `const dir = req.query.dir;                                   // line 1
const sql = \`SELECT * FROM products WHERE category = $1
             ORDER BY price \${dir}\`;                          // line 2-3
const rows = await db.query(sql, [req.query.category]);     // line 4`,
        choices: ["Line 1", "Lines 2-3", "Line 4"],
        answerIndex: 1,
        explanation: "The sort direction is glued into the SQL text. Keywords cannot be parameters, so it must be validated against an allow-list: `const safeDir = dir === 'desc' ? 'DESC' : 'ASC'`. Line 4 correctly parameterizes the category.",
        objective: 2,
      },
    },
    {
      kind: "predict",
      question: {
        id: "sec-injection-p1",
        prompt: "With `db.query('SELECT * FROM users WHERE name = $1', [\"' OR 1=1 --\"])`, what is returned?",
        choices: ["All users", "Users whose name is literally ' OR 1=1 --", "A syntax error", "The users table is dropped"],
        answerIndex: 1,
        explanation: "The value is bound as data. The database compares the name column to that exact string, which almost certainly matches no one.",
        objective: 1,
      },
    },
  ],
  knowledgeChecks: [
    { id: "sec-injection-k1", prompt: "What is the root cause of every injection vulnerability?", choices: ["Weak passwords", "Untrusted data interpreted as code/instructions by some system", "Missing HTTPS", "Old libraries"], answerIndex: 1, explanation: "The data crosses from 'value' into 'instruction' because they were mixed in one string.", objective: 0 },
    { id: "sec-injection-k2", prompt: "Which part of a SQL query can safely be a bound parameter?", choices: ["A table name", "A column name", "A value in a WHERE comparison", "ASC/DESC"], answerIndex: 2, explanation: "Parameters bind values only; identifiers and keywords need allow-lists.", objective: 2 },
  ],
  project: {
    title: "Hardened API with security tests",
    summary: "Take a small CRUD API, find and fix its injection paths (SQL, shell, HTML), apply least privilege to its database user, and prove each fix with an automated attack test.",
    type: "debugging-lab",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "Start from a deliberately vulnerable version (write it yourself in a separate branch) with string-built SQL, a sort parameter, a shell call and an HTML export.",
      "Fix each sink: parameterized queries, an allow-list for sort fields, execFile without a shell, escaped HTML output.",
      "Create a database role for the app with only SELECT/INSERT/UPDATE on its own tables.",
      "Return generic error messages; log details server-side with a correlation id.",
    ],
    acceptanceCriteria: [
      "Attack tests send classic payloads (quote-based SQLi, UNION, `; rm`-style shell input, <script> tags) and all fail safely.",
      "A test proves an unknown sort field returns 400, not a SQL error.",
      "A test proves the app's database role cannot DROP a table.",
      "The README maps each fixed sink to its OWASP Top 10 category.",
    ],
    technologies: ["Node.js", "Express", "PostgreSQL (node-postgres)", "Vitest", "supertest"],
    milestones: [
      { title: "Vulnerable baseline", done_when: "Attack tests demonstrate each vulnerability (on the vulnerable branch only, locally)." },
      { title: "Fixes", done_when: "Every attack test passes safely." },
      { title: "Least privilege", done_when: "The app runs as a restricted database role." },
      { title: "Write-up", done_when: "README explains each source → sink path and its fix." },
    ],
    testIdeas: ["Names with apostrophes still work", "Unicode input", "Very long input", "Second-order injection (stored, then reused)"],
    stretchGoals: ["Add a static analysis rule that flags template literals passed to db.query."],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      { id: "sec-injection-a1", prompt: "Which of these is NOT an injection sink?", choices: ["A SQL engine", "A shell", "innerHTML", "A strict === comparison in JavaScript"], answerIndex: 3, explanation: "A strict equality comparison does not interpret its input as instructions.", objective: 0 },
      { id: "sec-injection-a2", prompt: "Why do parameterized queries prevent SQL injection?", choices: ["They escape quotes", "The query structure is parsed separately and values can only ever be data", "They encrypt input", "They validate email formats"], answerIndex: 1, explanation: "Separation, not escaping, is the mechanism.", objective: 1 },
      { id: "sec-injection-a3", prompt: "Safest way to run `convert <userFile> out.png` from Node?", choices: ["exec(`convert ${file} out.png`)", "execFile('convert', [file, 'out.png']) without a shell, after validating the path", "exec with input escaped by replacing spaces", "eval"], answerIndex: 1, explanation: "An argument array without a shell keeps the input as one argument; still validate the path.", objective: 2 },
      { id: "sec-injection-a4", prompt: "A user picks a report column to sort by. The right defence is…", choices: ["Bind it as a parameter", "Map it through an allow-list of known column names", "Escape it", "Trust it if logged in"], answerIndex: 1, explanation: "Identifiers cannot be parameters, so restrict them to known values.", objective: 2 },
      { id: "sec-injection-a5", prompt: "Why is input validation alone insufficient against injection?", choices: ["Validation is slow", "Many legitimate inputs contain special characters, and validation rules can be bypassed; only separation removes the root cause", "Validation is deprecated", "Browsers skip it"], answerIndex: 1, explanation: "O'Brien is a valid name. Validation is a layer, not the fix.", objective: 3 },
    ],
  },
  interviewQuestions: [
    { id: "sec-injection-q01", tags: ["security", "sql-injection"], difficulty: "foundation", kind: "concept", prompt: "What is SQL injection and how do you prevent it?", expectedElements: ["input concatenated into SQL", "changes query structure", "parameterized queries", "allow-lists for identifiers", "least privilege"], modelAnswer: "SQL injection happens when user input is concatenated into SQL text, so specially crafted input changes the query's structure, for example to return every row or to modify data. The primary prevention is parameterized queries, which send the query and the values separately. Identifiers like sort columns go through an allow-list, and the app's database user gets least privilege to limit the damage.", explanation: "Mention separation and least privilege.", commonWrongAnswers: ["Strip quotes from input."] },
    { id: "sec-injection-q02", tags: ["security", "code-review"], difficulty: "core", kind: "code-reading", prompt: "Is this safe? Why or why not?", code: "db.query(`SELECT * FROM orders WHERE id = ${Number(req.params.id)}`)", expectedElements: ["Number coerces so likely not injectable", "but NaN case", "still a bad pattern", "use parameters anyway"], modelAnswer: "It is probably not exploitable, because Number() can only produce a number or NaN, and NaN makes the query fail. But it is fragile: the next person may copy the pattern with a string, and the NaN case produces a confusing error. Use a parameter anyway and validate the id, returning 400 for non-numeric input.", explanation: "Nuanced: safe-ish today, bad pattern.", commonWrongAnswers: ["Yes, totally fine.", "Definitely injectable."] },
    { id: "sec-injection-q03", tags: ["security", "orm"], difficulty: "core", kind: "misconception", prompt: "'We use an ORM, so we're safe from SQL injection.' Respond.", expectedElements: ["safe by default for values", "raw queries", "dynamic identifiers/order by", "JSON operators/filters from user objects"], modelAnswer: "Mostly true for standard queries, since ORMs parameterize values. But raw-query helpers with interpolation, dynamic identifiers in order or select clauses, and passing user-controlled objects straight into query filters can all reintroduce injection or similar issues. Code review still needs to check those paths.", explanation: "Shows real-world awareness.", commonWrongAnswers: ["Agree completely."] },
    { id: "sec-injection-q04", tags: ["security", "command-injection"], difficulty: "core", kind: "implementation", prompt: "How do you safely call a command-line tool with a user-provided filename in Node?", expectedElements: ["execFile/spawn with args array", "no shell", "validate path against base dir", "avoid exec with strings"], modelAnswer: "Use execFile or spawn with the arguments as an array and no shell, so the filename is passed as a single argument and shell metacharacters mean nothing. Validate that the resolved path stays inside the allowed directory, which prevents path traversal, and that the file type is expected. Never build a string for exec().", explanation: "Two vulnerabilities in one: command injection and path traversal.", commonWrongAnswers: ["Wrap the filename in quotes."] },
    { id: "sec-injection-q05", tags: ["security", "second-order"], difficulty: "advanced", kind: "scenario", prompt: "What is second-order (stored) injection?", expectedElements: ["payload stored safely first", "later used unsafely in another query/sink", "trust boundary is the sink not the source"], modelAnswer: "The malicious value is first stored safely, for example a username saved with a parameterized INSERT, and is later read back and concatenated into another query or command that trusts it because it came from 'our database'. The lesson is that every sink must use separation regardless of where the data came from.", explanation: "Trust is decided at the sink.", commonWrongAnswers: ["Data from our own DB is safe."] },
    { id: "sec-injection-q06", tags: ["security", "defence-in-depth"], difficulty: "core", kind: "design", prompt: "Beyond parameterized queries, what layers reduce SQL injection impact?", expectedElements: ["least-privilege DB role", "input validation", "generic errors", "WAF as extra layer", "monitoring/alerting", "secrets not in DB user reach"], modelAnswer: "A least-privilege database role, so the app cannot drop tables or read unrelated schemas. Input validation to reject obviously wrong formats. Generic error messages so attackers learn nothing about the schema. Logging and alerting on SQL errors and suspicious patterns. Optionally a web application firewall as an extra filter, never as the main defence.", explanation: "Layers limit blast radius.", commonWrongAnswers: ["A WAF is enough."] },
    { id: "sec-injection-q07", tags: ["security", "ai"], difficulty: "advanced", kind: "concept", prompt: "How is prompt injection similar to SQL injection, and why is it harder to fix?", expectedElements: ["untrusted text mixed with instructions", "LLMs have no hard separation channel", "mitigations: isolation, least privilege tools, output validation, human approval"], modelAnswer: "Both mix untrusted data with instructions in one channel, so the data can act as instructions. SQL has a hard fix, parameters that structurally separate the two. LLMs currently have no equivalent hard boundary: retrieved or user text is all tokens in the same context. Mitigations are layered instead: clearly delimiting untrusted content, giving tools least privilege, validating outputs, requiring human approval for risky actions, and monitoring.", explanation: "Connects classic and AI security.", commonWrongAnswers: ["Just tell the model to ignore instructions in documents."] },
    { id: "sec-injection-q08", tags: ["security", "behavioral"], difficulty: "foundation", kind: "behavioral", prompt: "You find an injection vulnerability in a colleague's merged code. What do you do?", expectedElements: ["assess severity/exposure", "follow security process privately", "fix quickly with test", "blameless", "look for same pattern elsewhere"], modelAnswer: "Assess whether it is reachable and exposed, then follow the team's security process, reporting it privately rather than in a public channel. Help produce a fix with a regression attack test, check logs for signs of exploitation, and search the codebase for the same pattern. Discuss it blamelessly and add a lint rule or review checklist item so it does not recur.", explanation: "Process and empathy both matter.", commonWrongAnswers: ["Post it in the team chat to warn everyone."] },
  ],
  references: [
    { title: "OWASP Top 10:2021 A03 Injection", url: "https://owasp.org/Top10/A03_2021-Injection/", kind: "spec" },
    { title: "OWASP Cheat Sheet: SQL Injection Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html", kind: "article" },
    { title: "node-postgres: Queries (parameterized query)", url: "https://node-postgres.com/features/queries", kind: "official-docs" },
    { title: "Node.js docs: child_process.execFile", url: "https://nodejs.org/api/child_process.html#child_processexecfilefile-args-options-callback", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Separate code from data at every sink; validate identifiers with allow-lists; least privilege."],
  versionSpecific: ["OWASP Top 10 category numbering changes between editions (injection was A03 in 2021)."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
