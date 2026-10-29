// Topic: Values, references, mutability and copying. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csReferencesMutability: Topic = {
  id: "cs-references-mutability",
  domainId: "",
  moduleId: "",
  title: "Values, references, mutability and copying",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Predict when changing one variable also changes another (shared references).",
    "Copy arrays and objects shallowly and deeply, and say which one a situation needs.",
    "Update data without mutating it, using spread and non-mutating array methods.",
    "Explain why === on two objects compares identity, not contents.",
  ],
  prerequisites: ["cs-values-types"],
  subtopics: ["Primitives are copied, objects are shared", "Mutating vs non-mutating methods", "Shallow copy with spread", "Deep copy with structuredClone", "Immutable updates", "Object identity and ==="],
  strikeIds: ["l2-s01", "l2-s02", "l2-s04"],

  story:
    "An admin edits a draft of a user's profile in a form and presses Cancel, but the live profile has already changed. A React list refuses to re-render after an item is added. A test passes alone and fails when run with the others. Three different symptoms, one cause: two parts of the program were holding the same object, and one of them changed it.",
  mentalModel: {
    plain:
      "Primitive values (numbers, strings, booleans) are copied when you assign them. Objects and arrays are not: the variable holds a reference, an arrow pointing at one box in memory. `b = a` copies the arrow, so both names point at the same box, and a change made through one is seen through the other.",
    analogy:
      "A primitive is a note you photocopy and hand over: scribbling on your copy does not change mine. An object is a shared Google Doc: `b = a` sends you the link, not a copy. Edits through either link change the one document. To get your own document, you must 'make a copy' on purpose.",
    analogyLimit:
      "'Make a copy' in JavaScript is usually shallow: the top level is new, but documents linked from inside it (nested arrays and objects) are still shared links. Deep copies need structuredClone.",
  },
  lessonSections: [
    {
      heading: "1. Copied or shared?",
      body:
        "`let x = 5; let y = x; y = 6;` leaves x at 5: numbers are copied.\n\n`const a = [1, 2]; const b = a; b.push(3);` makes a equal [1, 2, 3] too: there is only one array, and both names point at it.\n\nThis also happens when you pass an object into a function: the function receives the reference, so `function add(list) { list.push(9); }` changes the caller's array.",
    },
    {
      heading: "2. Mutating and non-mutating methods",
      body:
        "Some array methods change the array in place (mutate): push, pop, shift, unshift, splice, sort, reverse, and assigning `arr[i] = x`.\n\nOthers return a NEW array and leave the original alone: map, filter, slice, concat, and the newer toSorted, toReversed and with.\n\nKnow which kind you are calling. `const sorted = list.sort()` also sorts `list` itself, because sort mutates and returns the same array.",
    },
    {
      heading: "3. Shallow copies with spread",
      body:
        "`const copy = [...arr]` and `const copy = { ...obj }` make a NEW outer array or object. Changing `copy.name` does not touch `obj.name`.\n\nBut it is shallow: values inside that are themselves objects are still shared. After `const c = { ...user }`, `c.address` and `user.address` are the same object, so `c.address.city = \"Paris\"` changes the user's city too.",
    },
    {
      heading: "4. Deep copies with structuredClone",
      body:
        "`structuredClone(value)` copies every level: nested objects, arrays, Maps, Sets and Dates. It is built into browsers and Node.\n\nIt cannot copy functions or class behaviour, and it costs time for big data, so use it when you truly need a fully independent copy (an editable draft, a snapshot for undo).\n\nThe old trick JSON.parse(JSON.stringify(x)) loses Dates, undefined, Maps and Sets: prefer structuredClone.",
    },
    {
      heading: "5. Immutable updates",
      body:
        "Instead of changing data in place, build a new version with the change: `const next = { ...user, name: \"Ana\" }`, `const more = [...items, newItem]`, `const fewer = items.filter((i) => i.id !== id)`.\n\nNested changes copy each level on the way down: `{ ...user, address: { ...user.address, city: \"Paris\" } }`.\n\nUI libraries like React detect changes by checking if the reference is new, so immutable updates are what make re-rendering work.",
    },
    {
      heading: "6. === on objects compares identity",
      body:
        "`[1] === [1]` is false: two separate boxes, even with the same contents. `a === b` is true only when both names point at the SAME box.\n\nTo compare contents you must compare the parts yourself (or with a helper). This is also why a brand-new object in a dependency list makes React think something changed every render.",
    },
  ],
  visualizationType: "references",
  codeExamples: [
    {
      title: "The Cancel button that did not cancel",
      language: "js",
      code: `const user = { name: "Sam", address: { city: "Leeds" } };

const draft = user;                 // not a copy!
draft.name = "Samira";
console.log(user.name);

const shallow = { ...user };
shallow.name = "Sami";
shallow.address.city = "York";
console.log(user.name, user.address.city);

const deep = structuredClone(user);
deep.address.city = "Bath";
console.log(user.address.city, deep.address.city);
console.log([1] === [1], user === draft);`,
      expectedOutput: `Samira
Samira York
York Bath
false true`,
      steps: [
        "`draft = user` copies the reference, so draft and user are the same object. Renaming through draft renames the user: Samira.",
        "The spread makes a new outer object, so shallow.name = \"Sami\" leaves user.name as Samira.",
        "But shallow.address is the SAME address object as user.address, so changing the city through shallow changes the user's city to York.",
        "structuredClone copies every level, so the deep copy's city can change to Bath while the user stays in York.",
        "Two separate arrays are never ===, even with the same contents; user and draft point at one object, so they are ===.",
      ],
    },
  ],
  practicalApplication:
    "Edit forms should work on a copy (structuredClone for nested data) so Cancel can throw it away. Redux reducers and React state updates must return new objects, never mutate, or the UI will not update. Functions that receive arrays should not sort or splice them in place unless that is their documented job; use toSorted or copy first. In code reviews, a `.sort()` or `.push()` on something passed in from outside is worth a question.",
  commonMistakes: [
    {
      mistake: "Assuming `const b = a` copies an object or array.",
      symptom: "Changing b also changes a, in places that seem unrelated.",
      fix: "Copy on purpose: [...a] or { ...a } for one level, structuredClone(a) for nested data.",
    },
    {
      mistake: "Sorting an array that someone else owns.",
      symptom: "Another part of the page suddenly shows items in a different order.",
      fix: "Use list.toSorted(...) or [...list].sort(...), which leave the original alone.",
    },
    {
      mistake: "Trusting a spread copy for nested data.",
      symptom: "Editing a nested field in the 'copy' changes the original.",
      fix: "Copy every level you change, or use structuredClone for a fully independent copy.",
    },
    {
      mistake: "Mutating React state, then setting it.",
      symptom: "state.push(x); setState(state) does nothing: the component does not re-render.",
      fix: "setState([...state, x]): a new array is a new reference, which React notices.",
    },
  ],
  misconceptions: [
    { myth: "JavaScript passes objects 'by reference'.", truth: "It passes the reference BY VALUE: the function gets a copy of the arrow. Mutating through it changes the shared object, but reassigning the parameter (`list = []`) does not affect the caller." },
    { myth: "Spread makes a full copy.", truth: "Spread copies one level. Nested objects and arrays are still shared." },
    { myth: "const prevents changes to an object.", truth: "const fixes which object the name points to. The object's contents can still be changed; Object.freeze (shallow) stops that." },
  ],
  exercises: [
    { kind: "lab", lab: "references", task: "Run statements on two names and watch which boxes in memory change.", goal: "See b.push change a through a shared box, then make b its own box with [...a] and change b alone." },
    { kind: "strike", strikeId: "l2-s01", why: "Practise map, filter and reduce: the non-mutating way to transform arrays." },
    { kind: "strike", strikeId: "l2-s04", why: "Type destructuring and spread by hand to build new objects instead of changing old ones." },
    {
      kind: "predict",
      question: {
        id: "cs-references-mutability-p1",
        prompt: "What does this print?",
        code: `function addTax(prices) {
  prices.push(0);
  prices = [99];
  return prices;
}
const mine = [10, 20];
const result = addTax(mine);
console.log(mine, result);`,
        choices: ["[ 10, 20 ] [ 99 ]", "[ 10, 20, 0 ] [ 99 ]", "[ 99 ] [ 99 ]", "[ 10, 20, 0 ] [ 10, 20, 0 ]"],
        answerIndex: 1,
        explanation: "push mutates the shared array, so mine becomes [10, 20, 0]. Then `prices = [99]` points the PARAMETER at a new array; that does not change the caller's mine. The function returns the new [99].",
        objective: 0,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-references-mutability-k1",
      prompt: "Which method returns a new array and leaves the original unchanged?",
      choices: ["sort", "splice", "filter", "reverse"],
      answerIndex: 2,
      explanation: "filter builds a new array. sort, splice and reverse all change the array they are called on.",
      objective: 2,
    },
    {
      id: "cs-references-mutability-k2",
      prompt: "What is `{ a: 1 } === { a: 1 }`?",
      choices: ["true", "false", "undefined", "TypeError"],
      answerIndex: 1,
      explanation: "Two object literals create two separate objects. === on objects is true only when both sides are the very same object.",
      objective: 3,
    },
  ],
  project: {
    title: "Undo Stack: an editor with undo, redo and a Cancel that really cancels",
    summary: "Build a small settings editor whose every change creates a new immutable state, so undo, redo and cancel are just moving between saved versions.",
    type: "implementation",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "A settings object with at least one nested object (e.g. { theme, notifications: { email, sms } }).",
      "An update(path, value) function that returns a NEW settings object and never mutates the old one.",
      "A history with undo() and redo(); cancel() returns to the last saved version.",
      "Freeze states in development (Object.freeze, recursively) so an accidental mutation throws.",
    ],
    acceptanceCriteria: [
      "A test proves update returns a new object and the previous version is unchanged (deep-equal to before).",
      "A test shows unchanged nested objects are reused (same reference) while changed ones are new.",
      "A test does three updates, two undos and one redo, and checks every intermediate state.",
      "A test shows cancel() discards unsaved changes even after nested edits.",
    ],
    technologies: ["TypeScript", "Vitest", "structuredClone", "Object.freeze"],
    milestones: [
      { title: "Immutable update", done_when: "update() works for top-level and nested fields with no mutation (tests prove it)." },
      { title: "History", done_when: "undo and redo move through versions; redo history is cleared by a new edit." },
      { title: "Cancel", done_when: "cancel() restores the last saved version." },
      { title: "Guard rails", done_when: "Frozen states make an accidental mutation throw in tests." },
    ],
    testIdeas: ["Undo with empty history", "Redo after a new edit", "Updating a value to the same value", "Reference reuse for untouched branches"],
    stretchGoals: ["A tiny UI showing the history as a timeline", "Limit history to the last 50 versions"],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      {
        id: "cs-references-mutability-a1",
        prompt: "What is `a` at the end?",
        code: `const a = [1, 2, 3];
const b = a;
b.pop();`,
        choices: ["[1, 2, 3]", "[1, 2]", "[3]", "undefined"],
        answerIndex: 1,
        explanation: "b and a point at the same array. pop removes the last item from that one array, so a is [1, 2] too.",
        objective: 0,
      },
      {
        id: "cs-references-mutability-a2",
        prompt: "After `const copy = { ...order }`, which change ALSO changes `order`?",
        code: `const order = { id: 7, items: ["tea"] };
const copy = { ...order };`,
        choices: ["copy.id = 8", "copy.items = [\"coffee\"]", "copy.items.push(\"cake\")", "None of them"],
        answerIndex: 2,
        explanation: "Spread copies one level. copy.id and reassigning copy.items only change the copy. But copy.items and order.items are the same array, so push changes both.",
        objective: 1,
      },
      {
        id: "cs-references-mutability-a3",
        prompt: "Which line adds an item WITHOUT mutating `cart`?",
        choices: ["cart.push(item)", "cart[cart.length] = item", "const next = [...cart, item]", "cart.splice(0, 0, item)"],
        answerIndex: 2,
        explanation: "Spreading into a new array creates a new value and leaves cart alone. The other three change cart in place.",
        objective: 2,
      },
      {
        id: "cs-references-mutability-a4",
        prompt: "You need a fully independent copy of a nested settings object to use as an editable draft. What do you use?",
        choices: ["const draft = settings", "const draft = { ...settings }", "const draft = structuredClone(settings)", "const draft = Object.freeze(settings)"],
        answerIndex: 2,
        explanation: "structuredClone copies every level, so editing nested fields of the draft cannot touch the original. Spread is only one level deep; assignment shares; freeze copies nothing.",
        objective: 1,
      },
      {
        id: "cs-references-mutability-a5",
        prompt: "Why does `[] === []` give false?",
        choices: ["Empty arrays are falsy", "=== converts arrays to strings first", "They are two different arrays, and === on objects compares identity", "It is a known engine bug"],
        answerIndex: 2,
        explanation: "Each [] creates a new array. === asks 'is this the same object?', and two separate arrays never are, whatever they contain.",
        objective: 3,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-references-mutability-q01", tags: ["references"], difficulty: "foundation", kind: "concept",
      prompt: "Explain the difference between how primitives and objects are assigned in JavaScript.",
      expectedElements: ["primitives copied by value", "objects: variable holds a reference", "b = a shares the object", "mutation visible through both names"],
      modelAnswer: "Assigning a primitive copies the value, so changing the copy never affects the original. Assigning an object or array copies only the reference, so both variables point at the same object in memory, and a change made through one is visible through the other. To get an independent object you copy it on purpose with spread or structuredClone.",
      explanation: "A tiny example (b = a; b.push) makes this answer land.",
      commonWrongAnswers: ["Everything is copied on assignment."],
    },
    {
      id: "cs-references-mutability-q02", tags: ["copying"], difficulty: "foundation", kind: "concept",
      prompt: "What is the difference between a shallow copy and a deep copy? How do you make each?",
      expectedElements: ["shallow: new top level, nested shared", "deep: every level new", "spread / Object.assign / slice for shallow", "structuredClone for deep", "JSON trick limits"],
      modelAnswer: "A shallow copy creates a new top-level object or array, but nested objects inside are still shared with the original; [...arr], { ...obj } and Object.assign do this. A deep copy duplicates every level, so nothing is shared; structuredClone does this and handles Dates, Maps and Sets. The old JSON.parse(JSON.stringify()) trick drops functions, undefined and Dates, so I avoid it.",
      explanation: "Naming structuredClone (modern) and the JSON trick's limits shows current knowledge.",
      commonWrongAnswers: ["Spread makes a deep copy."],
    },
    {
      id: "cs-references-mutability-q03", tags: ["functions", "references"], difficulty: "core", kind: "code-reading",
      prompt: "Is JavaScript pass-by-value or pass-by-reference? Explain with this code.",
      code: `function f(obj) {
  obj.count = 1;
  obj = { count: 2 };
}
const o = { count: 0 };
f(o);
console.log(o.count);`,
      expectedElements: ["prints 1", "pass-by-value of the reference (call by sharing)", "mutation is visible", "reassignment is not"],
      modelAnswer: "It prints 1. JavaScript passes everything by value, but for objects the value is a reference, sometimes called call-by-sharing. The function's obj starts pointing at the same object, so obj.count = 1 changes the caller's object. Then obj = { count: 2 } only points the local parameter at a new object; the caller's o is unaffected.",
      explanation: "The reassign-vs-mutate distinction is the whole point of the question.",
      commonWrongAnswers: ["It prints 2 because objects are passed by reference.", "It prints 0."],
    },
    {
      id: "cs-references-mutability-q04", tags: ["react", "immutability"], difficulty: "core", kind: "debugging",
      prompt: "A React component does `items.push(newItem); setItems(items);` and the list does not update. Why, and what is the fix?",
      expectedElements: ["mutated the existing array", "same reference: React sees no change", "create a new array", "setItems([...items, newItem]) or functional update"],
      modelAnswer: "push mutates the existing array, and setItems receives the same reference it already had. React compares references to decide whether state changed, sees the same array and skips the re-render. The fix is an immutable update: setItems(prev => [...prev, newItem]), which creates a new array, a new reference React notices.",
      explanation: "Using the functional update form (prev => ...) is a bonus point.",
      commonWrongAnswers: ["React is broken; call forceUpdate."],
    },
    {
      id: "cs-references-mutability-q05", tags: ["arrays", "mutation"], difficulty: "foundation", kind: "concept",
      prompt: "Name array methods that mutate and ones that do not.",
      expectedElements: ["mutating: push, pop, shift, unshift, splice, sort, reverse, fill", "non-mutating: map, filter, slice, concat, reduce", "toSorted / toReversed / with"],
      modelAnswer: "Mutating: push, pop, shift, unshift, splice, sort, reverse and fill all change the array in place. Non-mutating: map, filter, slice, concat, reduce, find and the newer toSorted, toReversed, toSpliced and with return new values and leave the original alone.",
      explanation: "Knowing the ES2023 'to' methods signals up-to-date knowledge.",
      commonWrongAnswers: ["sort returns a sorted copy."],
    },
    {
      id: "cs-references-mutability-q06", tags: ["equality"], difficulty: "foundation", kind: "concept",
      prompt: "Why is `{ a: 1 } === { a: 1 }` false, and how would you compare two objects' contents?",
      expectedElements: ["=== on objects checks identity", "two separate objects", "compare fields / deep-equal helper", "JSON.stringify caveat: key order"],
      modelAnswer: "=== on objects asks whether both sides are the same object in memory, and two literals are two different objects, so it is false. To compare contents I compare the relevant fields, or use a deep-equal helper from a test library or a utility package. JSON.stringify comparison is fragile because key order and undefined values affect the result.",
      explanation: "Mentioning the JSON.stringify trap separates good answers from great ones.",
      commonWrongAnswers: ["Use == instead."],
    },
    {
      id: "cs-references-mutability-q07", tags: ["immutability", "design"], difficulty: "core", kind: "design",
      prompt: "What are the benefits and costs of immutable data?",
      expectedElements: ["benefits: predictable, cheap change detection, undo/history, safe sharing", "costs: extra allocation, verbose nested updates", "structural sharing", "helpers like Immer"],
      modelAnswer: "Benefits: nothing changes behind your back, change detection is a cheap reference check (which UI frameworks rely on), history and undo come almost for free, and data is safe to share between parts of a program. Costs: more objects are created, and nested updates are verbose. Structural sharing keeps the cost low by reusing untouched branches, and libraries like Immer let you write mutation-style code that produces immutable results.",
      explanation: "Balanced answers that name the cost are rated higher than pure advocacy.",
      commonWrongAnswers: ["Immutable data is always slower so avoid it."],
    },
    {
      id: "cs-references-mutability-q08", tags: ["testing", "mutation"], difficulty: "core", kind: "scenario",
      prompt: "A test passes when run alone but fails when the whole suite runs. You suspect shared mutable state. How do you investigate and fix it?",
      expectedElements: ["shared fixture object mutated by another test", "run in different order / isolate", "create fresh data per test (factory/beforeEach)", "freeze fixtures"],
      modelAnswer: "The likely cause is a fixture object shared between tests, mutated by an earlier test. I would run the failing test together with the tests before it, or in a different order, to find which one changes the data. The fix is to create fresh data for every test with a factory function or in beforeEach, and to freeze shared fixtures so any mutation throws immediately.",
      explanation: "Order-dependent tests are one of the most common real-world consequences of shared references.",
      commonWrongAnswers: ["Re-run the suite until it passes."],
    },
  ],
  references: [
    { title: "MDN: structuredClone()", url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone", kind: "official-docs" },
    { title: "MDN: Spread syntax", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax", kind: "official-docs" },
    { title: "MDN: Array (copying methods and mutating methods)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#copying_methods_and_mutating_methods", kind: "official-docs" },
    { title: "React docs: Updating arrays in state", url: "https://react.dev/learn/updating-arrays-in-state", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Value versus reference semantics and the cost/benefit of immutability apply in Python, Java, C# and most languages."],
  versionSpecific: ["toSorted, toReversed and with arrived in ES2023; structuredClone is available in modern browsers and Node 17+."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
