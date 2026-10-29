// Topic: Strings, regular expressions, JSON and dates. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csStringsDataFormats: Topic = {
  id: "cs-strings-data-formats",
  domainId: "",
  moduleId: "",
  title: "Strings, regular expressions, JSON and dates",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Use the everyday string methods to clean, search, split and build text.",
    "Parse and validate text with simple regular expressions.",
    "Serialise data to JSON and back, and know what JSON cannot hold.",
    "Store and show dates safely: UTC inside, local time only for display.",
  ],
  prerequisites: ["cs-values-types"],
  subtopics: ["Strings are immutable", "trim, split, join, includes, slice, replaceAll", "Template literals", "Regex basics: classes, quantifiers, anchors, groups", "JSON.stringify and JSON.parse", "Date, UTC and ISO 8601", "Time zones and Intl"],
  strikeIds: ["l2-s11", "l2-s12"],

  story:
    "A newsletter goes out at 3 a.m. for half the customers because the server stored '9:00' without a time zone. A sign-up form rejects real emails with a plus sign. An order export silently drops every delivery date because Dates do not survive JSON round trips as Dates. Text, formats and time are where 'it worked on my machine' lives.",
  mentalModel: {
    plain:
      "A string is an unchangeable sequence of characters: every method returns a NEW string. A regular expression is a tiny pattern language for describing text shapes. JSON is a text format for sending data between programs: it only knows strings, numbers, booleans, null, arrays and plain objects. A Date is a single instant in time, stored as milliseconds since 1 January 1970 UTC; time zones only matter when a human reads it.",
    analogy:
      "A Date is like a moment marked on a universal stopwatch that the whole world shares. Time zones are just the different wall clocks people read it on. Store the stopwatch reading; convert to a wall clock only when you show it to someone.",
    analogyLimit:
      "Calendar maths (adding 'one month', daylight-saving jumps) is about wall clocks, not the stopwatch, which is why date arithmetic is harder than it looks and libraries or the Temporal API exist.",
  },
  lessonSections: [
    {
      heading: "1. Strings never change",
      body:
        "`name.toUpperCase()` returns a new string; `name` itself is untouched. So you must use the result: `const clean = input.trim()`.\n\nEveryday tools: `trim`, `toLowerCase`, `includes`, `startsWith`, `slice(start, end)`, `split(\",\")`, `join(\", \")`, `replaceAll(\"a\", \"b\")`, `padStart`. Template literals build text: `` `Hello ${name}` ``.",
    },
    {
      heading: "2. Regular expressions: patterns for text",
      body:
        "`/^\\d{5}$/` means: start (^), exactly five digits (\\d{5}), end ($). Anchors matter: without them, any text CONTAINING five digits matches.\n\nBuilding blocks: `\\d` digit, `\\w` word character, `\\s` whitespace, `[a-z]` a range, `.` any character, `+` one or more, `*` zero or more, `?` optional, `{2,4}` between two and four, `( )` a group you can capture, `|` or.\n\nUse `regex.test(text)` for yes/no and `text.match(regex)` or `matchAll` to extract.",
    },
    {
      heading: "3. Regex judgement",
      body:
        "Keep patterns small and test them with real examples, including the weird ones. For emails, a simple `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/` plus a confirmation email beats a giant pattern that rejects valid addresses.\n\nNever build a regex from user input without escaping it, and beware of patterns with nested quantifiers like `(a+)+`, which can take forever on some inputs.",
    },
    {
      heading: "4. JSON: data as text",
      body:
        "`JSON.stringify(value)` turns data into text; `JSON.parse(text)` turns it back.\n\nJSON has no undefined, functions, Dates, Maps, Sets or BigInt. undefined properties disappear, Dates become ISO strings and do NOT come back as Dates, Maps become {}. JSON.parse throws on invalid text, so wrap untrusted input in try / catch, and validate the shape after parsing.",
    },
    {
      heading: "5. Dates: store UTC, show local",
      body:
        "`new Date()` is an instant. `date.toISOString()` gives `2026-03-14T09:30:00.000Z`: ISO 8601, in UTC (the Z). That is the format to store and send.\n\nShow it to people with `Intl.DateTimeFormat` or `toLocaleString`, which convert to their time zone and language.\n\nTraps: months in `new Date(2026, 0, 31)` start at 0 (January), and a date-only string like \"2026-03-14\" is parsed as UTC midnight, which is still the 13th in New York.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "Text and date handling is learned by running real inputs through real functions: the worked example and exercises use JavaScript's actual string, regex, JSON and Date behaviour.",
  codeExamples: [
    {
      title: "Clean, validate, serialise and round-trip",
      language: "js",
      code: `const raw = "  Ada.Lovelace+news@Example.com ";
const email = raw.trim().toLowerCase();
const looksLikeEmail = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
console.log(email, looksLikeEmail);

const zip = /^\\d{5}$/;
console.log(zip.test("90210"), zip.test("90210-1234"), /\\d{5}/.test("abc12345"));

const order = { id: 7, note: undefined, placedAt: new Date(Date.UTC(2026, 2, 14, 9, 30)) };
const text = JSON.stringify(order);
console.log(text);
const back = JSON.parse(text);
console.log(typeof back.placedAt, "note" in back);`,
      expectedOutput: `ada.lovelace+news@example.com true
true false true
{"id":7,"placedAt":"2026-03-14T09:30:00.000Z"}
string false`,
      steps: [
        "trim removes the spaces and toLowerCase normalises the case; both return new strings. The simple email pattern accepts the plus sign.",
        "With ^ and $ anchors, the zip pattern needs exactly five digits and nothing else, so the ZIP+4 form fails. Without anchors, any text containing five digits matches.",
        "JSON.stringify drops the undefined note and turns the Date into an ISO string in UTC. Date.UTC(2026, 2, ...) is March, because months count from 0.",
        "After JSON.parse, placedAt is just a string, not a Date, and note is gone. Convert it back with new Date(back.placedAt) if you need a Date.",
      ],
    },
  ],
  practicalApplication:
    "Normalise text at the boundary (trim, lower-case emails), validate with small anchored patterns or a schema library, store timestamps as UTC ISO strings or database timestamp-with-time-zone columns, and format for people only in the UI with Intl. When an API returns dates, convert them deliberately after JSON.parse. In logs, always use ISO 8601 UTC timestamps so events from different servers line up.",
  commonMistakes: [
    {
      mistake: "Forgetting regex anchors.",
      symptom: "Validation accepts \"abc12345xyz\" as a 5-digit code.",
      fix: "Wrap whole-value checks in ^ and $.",
    },
    {
      mistake: "Storing local times without a zone.",
      symptom: "Scheduled jobs fire hours early or late for users in other zones, or jump at daylight-saving changes.",
      fix: "Store UTC instants (ISO with Z); keep the user's time zone separately if you need their wall-clock time.",
    },
    {
      mistake: "Assuming Dates survive JSON.",
      symptom: "date.getTime is not a function after loading saved data.",
      fix: "Convert ISO strings back with new Date(...) at the boundary, or use a reviver in JSON.parse.",
    },
    {
      mistake: "Calling a string method and ignoring the result.",
      symptom: "input.trim(); has no effect and the spaces are still there.",
      fix: "Strings are immutable: assign the result, const clean = input.trim().",
    },
  ],
  misconceptions: [
    { myth: "A regex can perfectly validate any email address.", truth: "The real rules are too complex; a simple pattern plus sending a confirmation email is the practical answer." },
    { myth: "new Date(\"2026-03-14\") is midnight in my time zone.", truth: "Date-only ISO strings are parsed as UTC midnight; date-time strings without a Z are parsed as local time." },
    { myth: "JSON is just JavaScript objects.", truth: "JSON is a stricter text format: double-quoted keys, no functions, undefined, Dates, comments or trailing commas." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l2-s11", why: "Clean and reshape real strings with the everyday methods, by hand." },
    { kind: "strike", strikeId: "l2-s12", why: "Serialise and parse JSON, and handle the cases that break." },
    {
      kind: "predict",
      question: {
        id: "cs-strings-data-formats-p1",
        prompt: "What does this print?",
        code: `console.log(JSON.stringify({ a: 1, b: undefined, c: [undefined, 2], d: () => 3 }));`,
        choices: ['{"a":1,"b":null,"c":[null,2],"d":null}', '{"a":1,"c":[null,2]}', '{"a":1,"c":[2]}', "TypeError"],
        answerIndex: 1,
        explanation: "Object properties that are undefined or functions are left out. Inside arrays they cannot be left out (positions matter), so they become null.",
        objective: 2,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-strings-data-formats-k1",
      prompt: "Which pattern matches ONLY a full string of 3 to 5 lowercase letters?",
      choices: ["/[a-z]{3,5}/", "/^[a-z]{3,5}$/", "/^[a-z]+$/", "/[a-z]*/"],
      answerIndex: 1,
      explanation: "The anchors force the whole string to match, and {3,5} limits the length.",
      objective: 1,
    },
    {
      id: "cs-strings-data-formats-k2",
      prompt: "What does the Z at the end of 2026-03-14T09:30:00Z mean?",
      choices: ["Zero seconds", "UTC (no time-zone offset)", "Zulu is a time zone in Africa", "The date is approximate"],
      answerIndex: 1,
      explanation: "Z means UTC, offset +00:00. It is the unambiguous way to store and send instants.",
      objective: 3,
    },
  ],
  project: {
    title: "Event Importer: messy CSV text to clean, time-zone-correct events",
    summary: "Import event listings typed by humans (messy names, mixed date formats, various time zones), normalise them, validate them with small regexes, and export clean JSON with UTC instants.",
    type: "implementation",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "Normalise titles (trim, collapse double spaces) and emails (trim, lower-case).",
      "Validate a booking code with an anchored regex like ABC-1234 and report bad rows.",
      "Parse local date-times plus an IANA time zone (e.g. Europe/London) into UTC ISO strings.",
      "Export JSON and import it back, converting dates to Date objects with a reviver.",
    ],
    acceptanceCriteria: [
      "A test shows an event at 09:00 Europe/London in summer becomes 08:00Z, and in winter 09:00Z.",
      "A test shows a booking code embedded in other text is rejected (anchors work).",
      "A round-trip test shows dates come back as real Date objects equal to the originals.",
    ],
    technologies: ["TypeScript", "Vitest", "Intl API"],
    milestones: [
      { title: "Clean text", done_when: "Normalisers are tested with ugly inputs." },
      { title: "Validate", done_when: "Booking codes and emails are validated with tests for edge cases." },
      { title: "Time zones", done_when: "Local plus zone converts to UTC, with daylight-saving tests." },
      { title: "Round trip", done_when: "Export and re-import preserve every field and type." },
    ],
    testIdeas: ["Emoji in titles", "The daylight-saving switch hour", "Invalid JSON input"],
    stretchGoals: ["Show each event in the viewer's own time zone with Intl.DateTimeFormat", "Use the Temporal API polyfill"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-strings-data-formats-a1",
        prompt: "After `let s = \"hi\"; s.toUpperCase();`, what is s?",
        choices: ["\"HI\"", "\"hi\"", "undefined", "TypeError"],
        answerIndex: 1,
        explanation: "Strings are immutable. toUpperCase returns a new string, which was thrown away.",
        objective: 0,
      },
      {
        id: "cs-strings-data-formats-a2",
        prompt: "What does `\"a,b,,c\".split(\",\")` return?",
        choices: ["[\"a\", \"b\", \"c\"]", "[\"a\", \"b\", \"\", \"c\"]", "[\"a,b,,c\"]", "[\"a\", \"b\", null, \"c\"]"],
        answerIndex: 1,
        explanation: "split keeps empty pieces between two separators, so you get an empty string in the middle.",
        objective: 0,
      },
      {
        id: "cs-strings-data-formats-a3",
        prompt: "Which value comes back unchanged from JSON.parse(JSON.stringify(value))?",
        choices: ["new Date()", "new Map([[1, 2]])", "{ list: [1, \"two\", true, null] }", "{ f: () => 1 }"],
        answerIndex: 2,
        explanation: "Plain objects, arrays, strings, numbers, booleans and null are exactly what JSON supports. Dates become strings, Maps become {}, functions disappear.",
        objective: 2,
      },
      {
        id: "cs-strings-data-formats-a4",
        prompt: "What is the safest way to store when an order was placed?",
        choices: ["\"14/03/2026 9:30\"", "The user's local time without a zone", "A UTC instant, e.g. \"2026-03-14T09:30:00Z\"", "The number of days since the shop opened"],
        answerIndex: 2,
        explanation: "A UTC instant is unambiguous everywhere. Formats like 14/03 vs 03/14 and missing zones cause real bugs.",
        objective: 3,
      },
      {
        id: "cs-strings-data-formats-a5",
        prompt: "Which text does /^\d{3}-\d{4}$/ accept?",
        choices: ["555-12345", "phone: 555-1234", "555-1234", "5551234"],
        answerIndex: 2,
        explanation: "The anchors require the whole text to be exactly three digits, a dash and four digits. Extra digits, extra words or a missing dash all fail.",
        objective: 1,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-strings-data-formats-q01", tags: ["dates", "time-zones"], difficulty: "core", kind: "design",
      prompt: "How would you store and display timestamps in an app used worldwide?",
      expectedElements: ["store UTC instants", "ISO 8601 / timestamptz", "convert at display with Intl", "keep user's zone for scheduling", "DST awareness"],
      modelAnswer: "Store instants in UTC, as ISO 8601 strings with a Z or as timestamp-with-time-zone columns, and send them that way in APIs. Convert to the viewer's time zone only when displaying, with Intl.DateTimeFormat. For things defined in local time, like 'every day at 9 a.m. for this user', store the user's IANA time zone too and compute each occurrence, so daylight-saving changes are handled.",
      explanation: "The scheduling nuance separates good answers from great ones.",
      commonWrongAnswers: ["Store the server's local time."],
    },
    {
      id: "cs-strings-data-formats-q02", tags: ["json"], difficulty: "foundation", kind: "concept",
      prompt: "What can't JSON represent, and how do you handle it?",
      expectedElements: ["undefined, functions dropped", "Dates become strings", "Map/Set/BigInt unsupported", "NaN/Infinity become null", "reviver/replacer or schema"],
      modelAnswer: "JSON only has strings, numbers, booleans, null, arrays and plain objects. undefined and functions are dropped from objects, Dates turn into ISO strings, Maps and Sets become empty objects, NaN and Infinity become null, and BigInt throws. I convert those explicitly: a replacer or toJSON when sending, a reviver or schema validation when receiving, for example turning ISO strings back into Dates.",
      explanation: "Listing the conversions shows real experience.",
      commonWrongAnswers: ["JSON can store any JavaScript object."],
    },
    {
      id: "cs-strings-data-formats-q03", tags: ["regex"], difficulty: "foundation", kind: "code-reading",
      prompt: "Explain what /^([A-Z]{3})-(\\d{4})$/ matches, and what the groups are for.",
      expectedElements: ["three capital letters, dash, four digits", "anchored whole string", "groups capture parts", "match()[1], [2]"],
      modelAnswer: "It matches a whole string made of exactly three capital letters, a dash, and exactly four digits, like ABC-1234, and nothing more because of the ^ and $ anchors. The two parentheses are capture groups: text.match(pattern) returns the full match plus the letters in [1] and the digits in [2], so you can validate and extract in one step.",
      explanation: "Reading a regex aloud is a common interview task.",
      commonWrongAnswers: ["It matches any text containing letters and digits."],
    },
    {
      id: "cs-strings-data-formats-q04", tags: ["regex", "security"], difficulty: "advanced", kind: "concept",
      prompt: "What is ReDoS?",
      expectedElements: ["catastrophic backtracking", "nested quantifiers like (a+)+", "crafted input hangs the server", "simplify patterns, limit input length, safe engines"],
      modelAnswer: "Regular expression denial of service: some patterns with nested or overlapping quantifiers, like (a+)+$, backtrack exponentially on certain inputs. An attacker sends a crafted string and the server's single thread spins for seconds or minutes. Prevent it by writing simple patterns without nested quantifiers, limiting input length before matching, and using linting tools or engines that guarantee linear time.",
      explanation: "Node's single thread makes this especially relevant.",
      commonWrongAnswers: ["Regexes are always fast."],
    },
    {
      id: "cs-strings-data-formats-q05", tags: ["strings"], difficulty: "foundation", kind: "implementation",
      prompt: "How would you check if a string is a palindrome, ignoring case and punctuation?",
      expectedElements: ["normalise: lowercase, remove non-alphanumerics", "compare with reverse or two pointers", "O(n)", "unicode caveat"],
      modelAnswer: "First normalise: lower-case it and remove everything that is not a letter or digit, for example with replace(/[^a-z0-9]/g, \"\"). Then compare characters from both ends moving inwards with two pointers, or compare with the reversed string. It is O(n) time; two pointers use O(1) extra space. For full Unicode I would split by code points rather than UTF-16 units.",
      explanation: "A classic warm-up; normalisation is the part people forget.",
      commonWrongAnswers: ["Just compare s with s.split('').reverse().join('') without normalising."],
    },
    {
      id: "cs-strings-data-formats-q06", tags: ["dates"], difficulty: "core", kind: "debugging",
      prompt: "Users in New York see their birthday one day early. The code is new Date(\"1990-05-20\").toLocaleDateString(). Why?",
      expectedElements: ["date-only string parsed as UTC midnight", "New York is behind UTC", "shown as previous day", "treat birthdays as plain dates, not instants"],
      modelAnswer: "A date-only ISO string is parsed as midnight UTC. In New York that instant is the evening of 19 May, so the local date shows a day early. A birthday is a calendar date, not an instant, so it should be stored and displayed as a plain date (year, month, day), for example formatting with timeZone: 'UTC' or using Temporal.PlainDate.",
      explanation: "Distinguishing calendar dates from instants is the key insight.",
      commonWrongAnswers: ["The user's computer clock is wrong."],
    },
    {
      id: "cs-strings-data-formats-q07", tags: ["json", "security"], difficulty: "core", kind: "scenario",
      prompt: "You receive JSON from a third-party webhook. What do you do before using it?",
      expectedElements: ["verify signature/source", "parse in try/catch", "validate shape with schema", "limit size", "never eval"],
      modelAnswer: "Verify it really came from the provider, usually by checking a signature header. Limit the body size, parse it inside a try/catch, then validate the shape and types with a schema before any business logic touches it, rejecting or logging anything unexpected. Never use eval, and never trust IDs or amounts in it without checking them against our own data.",
      explanation: "Defence in depth for untrusted input.",
      commonWrongAnswers: ["JSON.parse it and use it directly."],
    },
    {
      id: "cs-strings-data-formats-q08", tags: ["strings", "performance"], difficulty: "core", kind: "concept",
      prompt: "Strings are immutable. What does that mean for building a large string in a loop?",
      expectedElements: ["each += creates a new string", "engines optimise with ropes", "push parts to array then join", "measure"],
      modelAnswer: "Every concatenation conceptually creates a new string instead of changing the old one. Modern engines optimise += with internal rope structures, so for most code it is fine, but for very large outputs collecting pieces in an array and calling join once is predictable and clear. As always, measure before optimising.",
      explanation: "Balanced: knows the theory and modern reality.",
      commonWrongAnswers: ["+= changes the string in place."],
    },
  ],
  references: [
    { title: "MDN: Regular expressions guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions", kind: "official-docs" },
    { title: "MDN: JSON.stringify", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify", kind: "official-docs" },
    { title: "MDN: Date", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date", kind: "official-docs" },
    { title: "RFC 8259: The JSON data interchange format", url: "https://www.rfc-editor.org/rfc/rfc8259", kind: "spec" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Store UTC, display local; validate text at the boundary; JSON's type limits are fixed by its spec."],
  versionSpecific: ["The Temporal API is replacing Date in modern JavaScript runtimes; check support before relying on it."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
