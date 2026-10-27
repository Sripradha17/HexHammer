// Topic: Bits, bytes, binary, hexadecimal and character encoding. A COMPLETE topic.
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csBinaryEncoding: Topic = {
  id: "cs-binary-encoding",
  domainId: "",
  moduleId: "",
  title: "Bits, bytes, hex and text encoding",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Convert small numbers between decimal, binary and hexadecimal.",
    "Explain what a bit and a byte are, and why one byte holds 256 different values.",
    "Explain the difference between a Unicode code point and its UTF-8 bytes, and predict string length surprises in JavaScript.",
  ],
  prerequisites: [],
  subtopics: ["Place value in base 2 and base 16", "Bytes and ranges", "Hex in colors, hashes and memory dumps", "ASCII, Unicode, UTF-8, UTF-16", "Bitwise AND/OR for flags"],
  strikeIds: [],

  story:
    "A customer named 'José' signs up, but the welcome email says 'JosÃ©'. The database column limit says 10 characters, yet a 7-letter name with an emoji is rejected. Both bugs come from the same gap: confusing characters with the bytes used to store them.",
  mentalModel: {
    plain:
      "A computer only stores switches that are off or on: 0 or 1, called bits. Eight bits make a byte. Everything else (numbers, letters, colors, emoji) is an agreement about what a pattern of bits MEANS. Encoding is the agreement for text.",
    analogy:
      "Bits are like a row of light switches. With 8 switches you can make 256 different on/off patterns, so one byte can stand for any whole number from 0 to 255, or for a letter, if everyone agrees which pattern means which letter.",
    analogyLimit:
      "Light switches suggest every pattern means the same thing everywhere. In reality the same bytes mean different things under different encodings, which is exactly how 'é' turns into 'Ã©' when UTF-8 bytes are read as Latin-1.",
  },
  lessonSections: [
    {
      heading: "1. Counting with only two digits",
      body:
        "Decimal has ten digits, so each place is worth 10 times the place to its right: 1, 10, 100. Binary has two digits, so each place is worth 2 times more: 1, 2, 4, 8, 16, 32, 64, 128.\n\n`1011` in binary = 8 + 0 + 2 + 1 = 11 in decimal.",
    },
    {
      heading: "2. Bytes and their range",
      body:
        "One byte = 8 bits. Each bit doubles the number of patterns, so 8 bits give 2⁸ = 256 patterns: the numbers 0 to 255. That is why a color channel in `rgb(255, 0, 0)` stops at 255: it is one byte.",
    },
    {
      heading: "3. Hexadecimal: binary for humans",
      body:
        "Hex uses 16 digits: 0-9 then a-f (a = 10 ... f = 15). One hex digit stands for exactly 4 bits, so one byte is always exactly two hex digits: `ff` = 1111 1111 = 255.\n\nThat is why you see hex in CSS colors (`#ff8800`), in hashes (`sha256: 9f86d0...`) and in memory addresses.",
    },
    {
      heading: "4. Characters are numbers too: Unicode",
      body:
        "Unicode gives every character a number called a code point, written like `U+00E9` for 'é' or `U+1F600` for 😀. A code point is just a number; it is not yet bytes.",
    },
    {
      heading: "5. Encodings turn code points into bytes",
      body:
        "UTF-8 stores each code point in 1 to 4 bytes. Plain English letters take 1 byte (the same as old ASCII), 'é' takes 2, most emoji take 4. UTF-8 is the default for the web, JSON and most databases.\n\nJavaScript strings are UTF-16 internally: most characters are one 16-bit unit, but emoji outside the 'Basic Multilingual Plane' take two units (a surrogate pair). So `\"😀\".length` is 2.",
    },
    {
      heading: "6. Mojibake: when the agreement breaks",
      body:
        "If bytes written as UTF-8 are read back as Latin-1 (Windows-1252), each multi-byte character turns into several wrong characters: 'é' (bytes C3 A9) shows as 'Ã©'. The fix is never to 'repair' strings by hand; it is to make every layer (HTTP headers, HTML meta, database, files) agree on UTF-8.",
    },
  ],
  visualizationType: "binary",
  codeExamples: [
    {
      title: "Converting numbers and measuring text",
      language: "js",
      code: `console.log((255).toString(2));   // decimal -> binary text
console.log((255).toString(16));  // decimal -> hex text
console.log(parseInt("ff", 16));  // hex text -> number
console.log(0b1010, 0xff);        // binary and hex literals

const bytes = new TextEncoder().encode("café"); // UTF-8 bytes
console.log(bytes.length);
console.log("café".length);
console.log("😀".length);
console.log([..."😀"].length);`,
      expectedOutput: `11111111
ff
255
10 255
5
4
2
1`,
      steps: [
        "255 is 128+64+32+16+8+4+2+1, so all eight bits are on: 11111111.",
        "In hex, 255 is 15×16 + 15 = 'ff'. parseInt reverses it.",
        "0b1010 is 8+2 = 10. 0xff is 255.",
        "TextEncoder always produces UTF-8. 'c', 'a', 'f' take one byte each; 'é' (U+00E9) takes two: 5 bytes.",
        "String length counts UTF-16 units, not bytes: 'café' is 4 units.",
        "😀 (U+1F600) needs two UTF-16 units, so .length says 2. Spreading a string iterates by code point, so [...'😀'].length is 1.",
      ],
    },
  ],
  practicalApplication:
    "Validating a 'max 20 characters' field: decide whether you mean bytes (database storage), UTF-16 units (JavaScript .length) or user-perceived characters, and use the matching measure on both client and server. Debugging garbled text: check the Content-Type charset, the HTML <meta charset>, and the database/table encoding before touching the string.",
  commonMistakes: [
    { mistake: "Using `str.length` to enforce a byte limit.", symptom: "Database rejects or truncates text with accents or emoji.", fix: "Measure bytes with `new TextEncoder().encode(str).length` when the limit is in bytes." },
    { mistake: "Slicing strings with emoji by index.", symptom: "Broken '�' characters at the cut.", fix: "Split with `[...str]` (code points) or Intl.Segmenter (user-perceived characters)." },
    { mistake: "Reading a file without stating its encoding.", symptom: "Mojibake like 'JosÃ©'.", fix: "Read and write explicitly as UTF-8 everywhere (e.g. `readFile(path, 'utf8')`)." },
  ],
  misconceptions: [
    { myth: "One character is always one byte.", truth: "Only for ASCII in UTF-8. Other characters take 2 to 4 bytes." },
    { myth: "Unicode and UTF-8 are the same thing.", truth: "Unicode assigns numbers (code points) to characters; UTF-8 is one way to store those numbers as bytes. UTF-16 is another." },
    { myth: "Hex is a different kind of data.", truth: "Hex is just a shorter way to WRITE the same bits. 0xff and 255 are the same number." },
  ],
  exercises: [
    { kind: "lab", lab: "binary", task: "Flip bits in the byte visualiser and watch decimal and hex update.", goal: "Make the byte equal 0xA5 using only the bit switches, then type a word and find the first character that needs more than one UTF-8 byte." },
    {
      kind: "predict",
      question: {
        id: "cs-binary-encoding-p1",
        prompt: "What does this print?",
        code: `console.log(new TextEncoder().encode("hi👋").length);`,
        choices: ["3", "4", "6", "8"],
        answerIndex: 2,
        explanation: "'h' and 'i' are 1 byte each in UTF-8. 👋 (U+1F44B) is outside the BMP and takes 4 bytes in UTF-8. 1 + 1 + 4 = 6. (Its JavaScript .length would be 4: 2 + a surrogate pair.)",
        objective: 2,
      },
    },
    {
      kind: "debug",
      question: {
        id: "cs-binary-encoding-d1",
        prompt: "This truncation helper sometimes produces a broken character at the end. Which line is the bug?",
        code: `function preview(text) {            // line 1
  if (text.length <= 10) return text; // line 2
  return text.slice(0, 10) + "…";    // line 3
}`,
        choices: ["Line 1", "Line 2", "Line 3"],
        answerIndex: 2,
        explanation: "`slice` cuts by UTF-16 units, so it can cut an emoji's surrogate pair in half, leaving a lone surrogate that renders as �. Cutting by code points (spread into an array) avoids that. Line 2 also counts units, but it only decides whether to cut, so it does not break characters.",
        objective: 2,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-binary-encoding-k1",
      prompt: "What is binary 1101 in decimal?",
      choices: ["11", "13", "15", "1101"],
      answerIndex: 1,
      explanation: "Read the places from the right as 1, 2, 4, 8. The 8s, 4s and 1s places are on: 8 + 4 + 0 + 1 = 13.",
      objective: 0,
    },
    {
      id: "cs-binary-encoding-k2",
      prompt: "How many hex digits does one byte always take?",
      choices: ["1", "2", "4", "8"],
      answerIndex: 1,
      explanation: "One hex digit is 4 bits, and a byte is 8 bits, so a byte is exactly two hex digits (00 to ff).",
      objective: 1,
    },
  ],
  project: {
    title: "Byte Inspector CLI",
    summary: "A small command-line tool that shows any text as code points, UTF-8 bytes in hex, and UTF-16 units, and flags characters that will surprise a length check.",
    type: "implementation",
    objectivesCovered: [0, 1, 2],
    requirements: [
      "Accept text as an argument or from stdin.",
      "Print each code point (U+XXXX), its UTF-8 bytes in hex, and its UTF-16 unit count.",
      "Print totals: code points, UTF-8 bytes, UTF-16 length.",
      "Implement decimal/binary/hex conversion yourself for one byte (no toString(2) in that function).",
    ],
    acceptanceCriteria: [
      "`inspect 'café'` reports 4 code points, 5 UTF-8 bytes and lists é as C3 A9.",
      "`inspect '😀'` reports 1 code point, 4 UTF-8 bytes (F0 9F 98 80) and UTF-16 length 2.",
      "Your hand-written byte converter has unit tests for 0, 1, 127, 128 and 255.",
      "Invalid input (no text) exits with a non-zero code and a helpful message.",
    ],
    technologies: ["Node.js", "TypeScript", "Vitest"],
    milestones: [
      { title: "Converter", done_when: "Hand-written byte to binary/hex conversion passes its tests." },
      { title: "Inspector", done_when: "The CLI prints the per-character table." },
      { title: "Totals and warnings", done_when: "Totals print and multi-unit characters are flagged." },
    ],
    testIdeas: ["Empty string", "ASCII only", "Accented letters", "Emoji", "Combining characters (e + U+0301)"],
    stretchGoals: ["Use Intl.Segmenter to also count user-perceived characters (grapheme clusters)."],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      { id: "cs-binary-encoding-a1", prompt: "What is decimal 10 in binary?", choices: ["1010", "1100", "0110", "1001"], answerIndex: 0, explanation: "8 + 2 = 10, so the 8s and 2s places are on: 1010.", objective: 0 },
      { id: "cs-binary-encoding-a2", prompt: "What is 0x1f in decimal?", choices: ["16", "31", "115", "255"], answerIndex: 1, explanation: "Hex places are worth 16 and 1. 'f' means 15, so 0x1f = 1 × 16 + 15 × 1 = 31.", objective: 0 },
      { id: "cs-binary-encoding-a3", prompt: "Why can one byte represent exactly 256 values?", choices: ["Because computers use 256 colors", "Because 8 bits give 2⁸ = 256 on/off patterns", "Because ASCII has 256 characters", "Because hex has 16 digits and 16 × 16 = 256 is a coincidence"], answerIndex: 1, explanation: "Each bit doubles the number of possible patterns: 2 × 2 × ... (8 times) = 256. (16 × 16 = 256 is not a coincidence: two hex digits are exactly 8 bits.)", objective: 1 },
      { id: "cs-binary-encoding-a4", prompt: "A user's display name is 'Zoë🙂'. Which statement is true?", choices: ["It is 4 bytes in UTF-8", "Its JavaScript .length is 5", "Its JavaScript .length is 4", "Every character is one UTF-8 byte"], answerIndex: 1, explanation: "Z, o, ë are 1 UTF-16 unit each, and 🙂 is 2 units (surrogate pair): 5. In UTF-8 it is 1 + 1 + 2 + 4 = 8 bytes.", objective: 2 },
      { id: "cs-binary-encoding-a5", prompt: "Unicode code point vs UTF-8: which is correct?", choices: ["They are two names for the same thing", "A code point is a number for a character; UTF-8 is a way to store it as bytes", "UTF-8 is only for English", "Code points are always 1 byte"], answerIndex: 1, explanation: "Unicode defines the numbers; UTF-8, UTF-16 and UTF-32 are encodings that store them as bytes.", objective: 2 },
    ],
  },
  interviewQuestions: [
    { id: "cs-binary-encoding-q01", tags: ["encoding"], difficulty: "foundation", kind: "concept", prompt: "What is the difference between Unicode and UTF-8?", expectedElements: ["Unicode = character set of code points", "UTF-8 = encoding to bytes", "variable length 1-4 bytes", "ASCII-compatible"], modelAnswer: "Unicode is the catalogue that assigns every character a number, its code point. UTF-8 is an encoding: a rule for storing those numbers as bytes, using 1 to 4 bytes per code point. It is backward compatible with ASCII, which is why it became the default on the web.", explanation: "The common confusion is treating them as synonyms.", commonWrongAnswers: ["UTF-8 is a newer version of Unicode."] },
    { id: "cs-binary-encoding-q02", tags: ["encoding", "javascript"], difficulty: "core", kind: "code-reading", prompt: "Why does `'😀'.length` return 2 in JavaScript?", expectedElements: ["strings are UTF-16 code units", "code point above U+FFFF", "surrogate pair"], modelAnswer: "JavaScript strings are sequences of UTF-16 code units, and .length counts units. 😀 is U+1F600, above U+FFFF, so UTF-16 stores it as a surrogate pair of two units.", explanation: "Use [...str] or Array.from(str) to iterate by code point.", commonWrongAnswers: ["Because emoji are two characters."] },
    { id: "cs-binary-encoding-q03", tags: ["encoding", "debugging"], difficulty: "core", kind: "debugging", prompt: "Users report names like 'JosÃ©' in emails. What is happening and how do you fix it?", expectedElements: ["UTF-8 bytes decoded as Latin-1/Windows-1252", "find the layer that disagrees", "set charset everywhere"], modelAnswer: "That is mojibake: the UTF-8 bytes for 'é' (C3 A9) are being decoded as Latin-1 or Windows-1252, producing two characters. I would trace the text through each layer (form submission, API, database column, email template and its Content-Type charset) to find where it is decoded with the wrong encoding, then make that layer explicitly UTF-8. I would not 'fix' strings manually.", explanation: "The fix belongs at the boundary that guesses the wrong encoding.", commonWrongAnswers: ["Strip accents from names."] },
    { id: "cs-binary-encoding-q04", tags: ["binary"], difficulty: "foundation", kind: "concept", prompt: "Why do developers use hexadecimal instead of binary or decimal for bytes?", expectedElements: ["one hex digit = 4 bits", "byte = exactly two hex digits", "compact and maps cleanly"], modelAnswer: "Because one hex digit maps exactly to 4 bits, a byte is always exactly two hex digits. That makes hex compact like decimal, but it still lines up perfectly with the underlying bits, which decimal does not.", explanation: "This is why colors, hashes and memory dumps are shown in hex.", commonWrongAnswers: ["Hex is faster for the computer."] },
    { id: "cs-binary-encoding-q05", tags: ["bitwise"], difficulty: "core", kind: "implementation", prompt: "How would you store 8 yes/no permissions in one number, and check one of them?", expectedElements: ["one bit per flag", "set with OR", "check with AND", "clear with AND NOT"], modelAnswer: "Give each permission its own bit: READ = 1, WRITE = 2, DELETE = 4, and so on. Grant with `perms |= WRITE`, check with `(perms & WRITE) !== 0`, and revoke with `perms &= ~WRITE`.", explanation: "Unix file modes and many feature-flag systems use this.", commonWrongAnswers: ["Store a comma-separated string and search it."] },
    { id: "cs-binary-encoding-q06", tags: ["encoding", "databases"], difficulty: "core", kind: "scenario", prompt: "A VARCHAR(10) column rejects a 7-character name containing emoji. Why might that happen?", expectedElements: ["limit may be in bytes or code units", "emoji need 4 bytes in UTF-8", "MySQL utf8 vs utf8mb4 example", "align client validation"], modelAnswer: "Depending on the database and column settings, the limit may count bytes or code units rather than visible characters, and an emoji needs 4 bytes in UTF-8. Some databases also have legacy encodings that cannot store 4-byte characters at all, such as MySQL's old 3-byte `utf8` versus `utf8mb4`. The client-side check should use the same measure as the column.", explanation: "Always confirm how a given database counts length.", commonWrongAnswers: ["The emoji counts as 10 characters."] },
    { id: "cs-binary-encoding-q07", tags: ["binary"], difficulty: "foundation", kind: "concept", prompt: "What is the largest number a single unsigned byte can hold, and why?", expectedElements: ["255", "2^8 - 1", "zero takes one pattern"], modelAnswer: "255. Eight bits give 256 patterns, and one of them is used for zero, so the range is 0 to 255 (2⁸ − 1).", explanation: "Off-by-one: 256 patterns, maximum value 255.", commonWrongAnswers: ["256"] },
    { id: "cs-binary-encoding-q08", tags: ["encoding", "misconception"], difficulty: "foundation", kind: "misconception", prompt: "True or false: 'UTF-8 uses more space than UTF-16 for every language.'", expectedElements: ["false", "ASCII-heavy text smaller in UTF-8", "some East Asian text smaller in UTF-16"], modelAnswer: "False. For text that is mostly ASCII, like English, code and JSON, UTF-8 uses 1 byte per character versus 2 in UTF-16. For many East Asian characters UTF-8 needs 3 bytes while UTF-16 needs 2, so there UTF-16 can be smaller.", explanation: "The 'best' encoding depends on the text; UTF-8 wins for the web overall.", commonWrongAnswers: ["True, UTF-8 is always bigger."] },
  ],
  references: [
    { title: "MDN: TextEncoder", url: "https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder", kind: "official-docs" },
    { title: "MDN: String length (UTF-16 code units)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length", kind: "official-docs" },
    { title: "RFC 3629: UTF-8, a transformation format of ISO 10646", url: "https://www.rfc-editor.org/rfc/rfc3629", kind: "spec" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Binary, hex and the code point vs encoding distinction are permanent."],
  versionSpecific: ["Which emoji exist (and so which code points appear in user input) grows with each Unicode version."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
