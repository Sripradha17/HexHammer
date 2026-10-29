// Topic: Variables, values, types and coercion. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csValuesTypes: Topic = {
  id: "cs-values-types",
  domainId: "",
  moduleId: "",
  title: "Variables, values, types and coercion",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Declare names with const and let, and explain when to use each.",
    "Name JavaScript's primitive types and check a value's type with typeof.",
    "Predict common coercions: == versus ===, + with strings, and truthy/falsy values.",
    "Explain static versus dynamic typing, and what TypeScript adds.",
  ],
  prerequisites: [],
  subtopics: ["const and let", "Primitive types", "typeof", "== vs ===", "Coercion with + and -", "Truthy and falsy", "Static vs dynamic typing"],
  strikeIds: ["l1-s02", "l1-s03", "l1-s04", "l1-s06", "l1-s09"],

  story:
    "A checkout page shows a total of \"1020\" pounds for a 10 pound book and 20 pounds of shipping. Nobody wrote a bug on purpose: the price came from a form field as the text \"10\", and \"10\" + 20 glues text together instead of adding. Knowing what TYPE a value is, and when JavaScript quietly changes it, is the difference between finding that bug in a minute or in a day.",
  mentalModel: {
    plain:
      "A value is a piece of data: 42, \"hello\", true. Every value has a type that decides what you can do with it. A variable is a name tag you stick on a value so you can find it again. const means the tag can never be moved to another value; let means it can.",
    analogy:
      "Values are items in a warehouse, each in a box labelled with its kind (number, text, yes/no). Variables are sticky name tags. Coercion is a helpful but careless worker who, when you ask to add a number box to a text box, quietly repacks the number as text.",
    analogyLimit:
      "Objects and arrays do not sit 'inside' the tag the same way: the tag holds directions to where the object lives. That matters for copying, and is its own topic (values, references and mutability).",
  },
  lessonSections: [
    {
      heading: "1. Name tags: const and let",
      body:
        "`const price = 10;` sticks the name `price` on the value 10, for good. Trying `price = 12` later is an error.\n\n`let count = 0;` can be moved: `count = count + 1` is fine.\n\nRule of thumb: start with `const`. Switch to `let` only when the value really must change (a counter, a running total). Fewer names that change means fewer surprises. Avoid the old `var`: it ignores block scope.",
    },
    {
      heading: "2. The seven primitive types",
      body:
        "A primitive is a simple value that cannot be changed in place.\n\n`number` (42, 3.14, NaN), `string` (\"hi\"), `boolean` (true/false), `undefined` (no value given yet), `null` (deliberately empty), `bigint` (10n, huge whole numbers) and `symbol` (unique ids).\n\nEverything else (arrays, objects, functions, dates) is an `object`.",
    },
    {
      heading: "3. Asking a value its type: typeof",
      body:
        "`typeof 42` is \"number\", `typeof \"42\"` is \"string\", `typeof true` is \"boolean\", `typeof undefined` is \"undefined\".\n\nTwo famous oddities to memorise: `typeof null` is \"object\" (a 1995 bug kept for compatibility), and `typeof []` is also \"object\". Use `Array.isArray(x)` to check for arrays and `x === null` to check for null.",
    },
    {
      heading: "4. == versus ===",
      body:
        "`===` (strict equality) is true only if both type AND value match: `5 === \"5\"` is false.\n\n`==` (loose equality) first converts the values to a common type: `5 == \"5\"` is true, `0 == \"\"` is true, `null == undefined` is true.\n\nUse `===` everywhere. It never converts, so it never surprises you. The one idiom some teams allow is `x == null`, which catches both null and undefined.",
    },
    {
      heading: "5. Coercion: when JavaScript changes types for you",
      body:
        "`+` with any string glues: `\"10\" + 20` is \"1020\".\n\nThe other maths operators convert to numbers: `\"10\" - 2` is 8, `\"10\" * 2` is 20.\n\nWhen a value is used as a condition, it becomes true or false. The falsy values are: `false`, `0`, `-0`, `0n`, `\"\"`, `null`, `undefined` and `NaN`. Everything else is truthy, including `\"0\"`, `\"false\"`, `[]` and `{}`.\n\nConvert on purpose instead of hoping: `Number(\"10\")`, `String(42)`, `Boolean(value)`.",
    },
    {
      heading: "6. Static and dynamic typing",
      body:
        "JavaScript is dynamically typed: a variable can hold a number now and a string later, and type mistakes show up only when the code runs.\n\nStatically typed languages (Java, Go, Rust, and TypeScript on top of JavaScript) check types before the code runs. TypeScript would flag `\"10\" + 20` being stored in a variable declared as `number` while you type.\n\nType inference means the checker works the type out for you: `const n = 5` is known to be a number without writing `: number`.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "Types are best felt by predicting and running small expressions. The predict exercises and the hand-typed strikes (Variables, Numbers and strings, Booleans, Comparison operators) are the interactive part of this topic.",
  codeExamples: [
    {
      title: "The checkout bug, then the fix",
      language: "js",
      code: `const priceFromForm = "10";   // form fields always give text
const shipping = 20;

console.log(priceFromForm + shipping);
console.log(typeof (priceFromForm + shipping));

const price = Number(priceFromForm);  // convert on purpose
console.log(price + shipping);
console.log(5 == "5", 5 === "5");
console.log(Boolean(""), Boolean("0"), Boolean([]));`,
      expectedOutput: `1020
string
30
true false
false true true`,
      steps: [
        "`priceFromForm` is the string \"10\". `+` with a string glues text, so the result is the string \"1020\".",
        "`typeof` confirms the result is a string, not a number.",
        "`Number(\"10\")` converts the text to the number 10 on purpose, so `10 + 20` is 30.",
        "`==` converts \"5\" to 5 before comparing (true); `===` sees a number and a string and says false.",
        "The empty string is falsy. The text \"0\" is NOT empty, so it is truthy, and so is an empty array.",
      ],
    },
  ],
  practicalApplication:
    "Every value that crosses a boundary arrives as text: form fields, URL query strings, environment variables, CSV files and localStorage. Convert and validate at the boundary (Number(), parseInt with a radix, or a schema library), and use === inside your code. Interviewers love the coercion table, but at work the habit that matters is 'convert at the edge, compare strictly inside'.",
  commonMistakes: [
    {
      mistake: "Adding a number to a value that came from an input, a URL or an environment variable.",
      symptom: "Totals like \"1020\" instead of 30, or PORT + 1 becoming \"30001\".",
      fix: "Convert once at the boundary with Number(value) and check the result with Number.isNaN before using it.",
    },
    {
      mistake: "Checking `if (count)` when 0 is a valid value.",
      symptom: "A quantity of 0 is treated as 'missing' and the code takes the wrong branch.",
      fix: "Say what you mean: `if (count === undefined)` or `count ?? defaultValue` (?? only replaces null and undefined, not 0).",
    },
    {
      mistake: "Using typeof to check for arrays or null.",
      symptom: "`typeof []` and `typeof null` both say \"object\", so the check passes for the wrong thing.",
      fix: "Use Array.isArray(x) for arrays and x === null for null.",
    },
  ],
  misconceptions: [
    { myth: "const makes a value unchangeable.", truth: "const fixes the NAME to one value. If that value is an array or object, its contents can still change: `const list = []; list.push(1)` works." },
    { myth: "NaN means the value is not a number type.", truth: "typeof NaN is \"number\". NaN is a special number meaning 'the result of maths that failed', and it is not even equal to itself: use Number.isNaN(x)." },
    { myth: "\"0\" and \"false\" are falsy.", truth: "Any non-empty string is truthy, whatever it says. Only the empty string \"\" is falsy." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l1-s02", why: "Type const and let by hand and see which one can be moved." },
    { kind: "strike", strikeId: "l1-s03", why: "Mix numbers and strings and watch + glue text together." },
    { kind: "strike", strikeId: "l1-s06", why: "Compare with === and == and explain each result." },
    {
      kind: "predict",
      question: {
        id: "cs-values-types-p1",
        prompt: "What does this print?",
        code: `console.log("3" * "4", "3" + 4, 3 + 4 + "5");`,
        choices: ["12 34 75", "12 7 345", "\"34\" 34 12", "NaN 34 75"],
        answerIndex: 0,
        explanation: "`*` converts both strings to numbers: 12. `\"3\" + 4` has a string, so it glues: \"34\". `3 + 4 + \"5\"` runs left to right: 3 + 4 is 7 first, then 7 + \"5\" glues to \"75\".",
        objective: 2,
      },
    },
    {
      kind: "debug",
      question: {
        id: "cs-values-types-d1",
        prompt: "A cart shows 'Your cart is empty' even when the cart has 0 items deliberately set by a promo. Which line is the bug?",
        code: `function cartMessage(itemCount) {
  if (!itemCount) return "Loading your cart...";   // A
  if (itemCount === 1) return "1 item";              // B
  return itemCount + " items";                       // C
}
// itemCount is undefined while loading, and a number afterwards`,
        choices: ["Line A: 0 is falsy, so a real 0 is treated like 'not loaded yet'", "Line B: should use ==", "Line C: + should be a template string", "There is no bug"],
        answerIndex: 0,
        explanation: "`!itemCount` is true for undefined AND for 0, because 0 is falsy. Check exactly what you mean: `itemCount === undefined`. Line B is fine (=== is correct) and line C works (number + string glues as intended).",
        objective: 2,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-values-types-k1",
      prompt: "What is `typeof null`?",
      choices: ["\"null\"", "\"undefined\"", "\"object\"", "\"boolean\""],
      answerIndex: 2,
      explanation: "A historical quirk from the first version of JavaScript that can never be fixed without breaking the web. Check for null with `x === null`.",
      objective: 1,
    },
    {
      id: "cs-values-types-k2",
      prompt: "Which value is truthy?",
      choices: ["0", "\"\"", "\"0\"", "NaN"],
      answerIndex: 2,
      explanation: "\"0\" is a non-empty string, and every non-empty string is truthy. 0, the empty string and NaN are all on the falsy list.",
      objective: 2,
    },
  ],
  project: {
    title: "Form Cleaner: turn messy input into trustworthy values",
    summary: "Build a small module that takes raw form data (always strings) and returns clean, correctly typed values or clear errors, so the rest of an app can compare strictly and never be surprised by coercion.",
    type: "implementation",
    objectivesCovered: [1, 2, 3],
    requirements: [
      "A function `cleanOrder(raw)` that takes { quantity, price, giftWrap, coupon } as strings, exactly as a form sends them.",
      "Return { ok: true, value } with quantity and price as numbers, giftWrap as a boolean, coupon as a string or null.",
      "Return { ok: false, errors } with one readable message per bad field (\"quantity must be a whole number\").",
      "No use of == anywhere (add a lint rule or a test that reads the file).",
    ],
    acceptanceCriteria: [
      "A test shows quantity \"0\" is accepted as the number 0, not treated as missing.",
      "A test shows price \"abc\" returns an error, never NaN in the value.",
      "A test shows giftWrap \"false\" becomes the boolean false (not truthy).",
      "A test shows an empty coupon \"\" becomes null.",
    ],
    technologies: ["JavaScript or TypeScript", "Vitest"],
    milestones: [
      { title: "Numbers", done_when: "quantity and price convert, with tests for \"0\", \"12.5\", \"\" and \"abc\"." },
      { title: "Booleans and empties", done_when: "giftWrap and coupon convert, with tests for \"true\", \"false\" and \"\"." },
      { title: "Errors", done_when: "Every bad field gives its own message and the whole result says ok: false." },
      { title: "Typed", done_when: "The return type is written in TypeScript (or JSDoc) and the checker passes." },
    ],
    testIdeas: ["\"0\" quantity", "Negative price", "\" 12 \" with spaces", "\"1e3\" quantity", "Missing fields"],
    stretchGoals: ["Add a `max` rule per field", "Return the cleaned value with a TypeScript type that makes `ok` narrow the result"],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      {
        id: "cs-values-types-a1",
        prompt: "When should you choose let instead of const?",
        choices: ["Always, let is more flexible", "When the name must later point to a different value, like a counter", "When the value is an array", "Never, they are identical"],
        answerIndex: 1,
        explanation: "Default to const. Use let only when you reassign the name (count = count + 1). Arrays held by const can still change their contents, so they do not need let.",
        objective: 0,
      },
      {
        id: "cs-values-types-a2",
        prompt: "What does `typeof []` return?",
        choices: ["\"array\"", "\"object\"", "\"list\"", "\"undefined\""],
        answerIndex: 1,
        explanation: "Arrays are objects in JavaScript, so typeof says \"object\". Use Array.isArray to tell them apart.",
        objective: 1,
      },
      {
        id: "cs-values-types-a3",
        prompt: "What is the value of `\"5\" - 2`?",
        choices: ["\"52\"", "3", "\"3\"", "NaN"],
        answerIndex: 1,
        explanation: "Only + glues strings. Minus always means maths, so \"5\" is converted to 5 and the result is the number 3.",
        objective: 2,
      },
      {
        id: "cs-values-types-a4",
        prompt: "Which comparison is true?",
        choices: ["0 === \"0\"", "null === undefined", "null == undefined", "NaN === NaN"],
        answerIndex: 2,
        explanation: "Loose equality treats null and undefined as equal to each other (and to nothing else). === never converts, so the first two are false, and NaN is never equal to anything, even itself.",
        objective: 2,
      },
      {
        id: "cs-values-types-a5",
        prompt: "What does TypeScript add on top of JavaScript?",
        choices: ["A faster engine", "Type checking BEFORE the code runs", "Automatic conversion of strings to numbers", "Stricter rules for == at runtime"],
        answerIndex: 1,
        explanation: "TypeScript is a static checker: it reports type mistakes while you write, then compiles to plain JavaScript. It does not change runtime behaviour or speed.",
        objective: 3,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-values-types-q01", tags: ["javascript", "equality"], difficulty: "foundation", kind: "concept",
      prompt: "What is the difference between == and === in JavaScript, and which do you use?",
      expectedElements: ["=== compares type and value", "== converts types first", "a surprising == example", "use === by default"],
      modelAnswer: "=== is strict equality: it is true only if both the type and the value are the same, and it never converts. == is loose equality: it converts both sides to a common type first, which gives surprises like 0 == \"\" being true. I use === everywhere so comparisons do exactly what they say; the only exception some teams allow is x == null to catch both null and undefined.",
      explanation: "A strong answer gives one concrete surprise and a clear personal rule.",
      commonWrongAnswers: ["=== is faster.", "== compares values, === compares references."],
    },
    {
      id: "cs-values-types-q02", tags: ["javascript", "types"], difficulty: "foundation", kind: "concept",
      prompt: "List JavaScript's primitive types. What is everything else?",
      expectedElements: ["number, string, boolean, undefined, null, bigint, symbol", "everything else is an object", "arrays and functions are objects"],
      modelAnswer: "There are seven primitives: number, string, boolean, undefined, null, bigint and symbol. Everything else is an object, including arrays, functions, dates and maps. Primitives are immutable and compared by value; objects are compared by reference.",
      explanation: "Mentioning that primitives compare by value and objects by reference shows you see why the split matters.",
      commonWrongAnswers: ["Arrays are a primitive type."],
    },
    {
      id: "cs-values-types-q03", tags: ["javascript", "coercion"], difficulty: "foundation", kind: "code-reading",
      prompt: "What does this print, and why?",
      code: `console.log(1 + "2" + 3);
console.log(1 + 2 + "3");`,
      expectedElements: ["\"123\"", "\"33\"", "left to right evaluation", "+ with a string concatenates"],
      modelAnswer: "The first prints \"123\": 1 + \"2\" involves a string, so it concatenates to \"12\", then \"12\" + 3 gives \"123\". The second prints \"33\": evaluation is left to right, so 1 + 2 is the number 3 first, then 3 + \"3\" concatenates to \"33\".",
      explanation: "Interviewers are checking that you know both the + rule and left-to-right evaluation.",
      commonWrongAnswers: ["Both print 6.", "Both print \"123\"."],
    },
    {
      id: "cs-values-types-q04", tags: ["javascript", "truthiness"], difficulty: "foundation", kind: "concept",
      prompt: "What are the falsy values in JavaScript, and where has truthiness caused a bug for you?",
      expectedElements: ["false, 0, -0, 0n, \"\", null, undefined, NaN", "everything else truthy", "a 0-is-valid example", "?? vs ||"],
      modelAnswer: "The falsy values are false, 0, -0, 0n, the empty string, null, undefined and NaN. Everything else is truthy, including \"0\", empty arrays and empty objects. A classic bug is `const qty = input || 1`: a real quantity of 0 gets replaced by 1. The fix is the nullish operator, `input ?? 1`, which only replaces null and undefined.",
      explanation: "Linking truthiness to || versus ?? turns a memorised list into practical judgement.",
      commonWrongAnswers: ["Empty arrays are falsy.", "\"false\" is falsy."],
    },
    {
      id: "cs-values-types-q05", tags: ["javascript", "const"], difficulty: "foundation", kind: "misconception",
      prompt: "A colleague says 'const makes the array frozen'. Are they right?",
      code: `const list = [1, 2];
list.push(3);`,
      expectedElements: ["no", "const prevents reassignment of the name", "contents can change", "Object.freeze for shallow freezing"],
      modelAnswer: "No. const stops the name `list` from being pointed at a different value, so `list = []` would throw. The array it points to can still be changed, so push works and list becomes [1, 2, 3]. If you want the contents fixed you need Object.freeze, which is shallow, or an immutable-update style.",
      explanation: "This separates 'the binding' from 'the value', which is the heart of the next topic on references.",
      commonWrongAnswers: ["Yes, push throws an error."],
    },
    {
      id: "cs-values-types-q06", tags: ["javascript", "nan"], difficulty: "core", kind: "code-reading",
      prompt: "Why does `NaN === NaN` print false, and how do you check for NaN?",
      expectedElements: ["NaN is never equal to anything", "IEEE 754 floating point rule", "Number.isNaN", "global isNaN coerces"],
      modelAnswer: "NaN means 'not a valid number result', and the floating-point standard (IEEE 754) says NaN is not equal to anything, including itself. To check, use Number.isNaN(x). Avoid the old global isNaN, because it converts first: isNaN(\"hello\") is true even though \"hello\" is a string, not NaN.",
      explanation: "Knowing the difference between Number.isNaN and isNaN is a common follow-up.",
      commonWrongAnswers: ["Because NaN is a string.", "Use x === NaN."],
    },
    {
      id: "cs-values-types-q07", tags: ["typing", "typescript"], difficulty: "core", kind: "concept",
      prompt: "Explain static versus dynamic typing. What does TypeScript give a JavaScript team?",
      expectedElements: ["static: checked before running", "dynamic: checked while running", "TypeScript compiles away", "catches mistakes early, better editor help, documentation"],
      modelAnswer: "With static typing, types are checked before the program runs; with dynamic typing, a variable can hold any type and type errors appear only at runtime. JavaScript is dynamic. TypeScript adds a static checker on top: it catches things like passing a string where a number is expected while you type, gives better autocomplete and refactoring, and documents shapes of data. It compiles to plain JavaScript, so it does not change runtime behaviour and does not validate data coming from outside.",
      explanation: "The last point (types do not validate runtime input) is what separates senior answers.",
      commonWrongAnswers: ["TypeScript makes code run faster."],
      followUps: ["How would you validate an API response at runtime in a TypeScript app?"],
    },
    {
      id: "cs-values-types-q08", tags: ["javascript", "debugging"], difficulty: "foundation", kind: "debugging",
      prompt: "A server starts on port 30001 instead of 3001. The code is `app.listen(process.env.PORT + 1)` with PORT=3000. What happened?",
      expectedElements: ["environment variables are strings", "+ concatenates", "convert with Number", "validate at startup"],
      modelAnswer: "Environment variables are always strings, so process.env.PORT is \"3000\" and + glues: \"3000\" + 1 is \"30001\". Convert once at startup, `const port = Number(process.env.PORT)`, check it with Number.isInteger, and fail fast with a clear message if it is invalid.",
      explanation: "Real-world coercion bugs almost always come from a boundary: env vars, URLs, forms.",
      commonWrongAnswers: ["The server is buggy."],
    },
    {
      id: "cs-values-types-q09", tags: ["javascript", "null"], difficulty: "foundation", kind: "concept",
      prompt: "What is the difference between null and undefined?",
      expectedElements: ["undefined: no value assigned yet / missing", "null: deliberately empty", "typeof differs", "?? treats both the same"],
      modelAnswer: "undefined means a value was never given: an unassigned variable, a missing property, a function with no return. null is a value someone set on purpose to mean 'empty'. typeof undefined is \"undefined\" while typeof null is \"object\". In practice ?? and == null treat them the same, and many teams pick one convention, often null for 'deliberately empty' in data.",
      explanation: "Interviewers listen for 'not set yet' versus 'set to nothing on purpose'.",
      commonWrongAnswers: ["They are exactly the same."],
    },
  ],
  references: [
    { title: "MDN: JavaScript data types and data structures", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures", kind: "official-docs" },
    { title: "MDN: Equality comparisons and sameness", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness", kind: "official-docs" },
    { title: "MDN: Falsy", url: "https://developer.mozilla.org/en-US/docs/Glossary/Falsy", kind: "official-docs" },
    { title: "TypeScript Handbook: The Basics", url: "https://www.typescriptlang.org/docs/handbook/2/basic-types.html", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["The difference between a name and a value, and converting data at boundaries, apply in every language."],
  versionSpecific: ["The exact coercion rules and the list of primitive types are specific to JavaScript (ECMAScript)."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
