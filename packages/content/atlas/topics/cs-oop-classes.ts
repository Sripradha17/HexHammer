// Topic: Objects, prototypes, classes and this. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csOopClasses: Topic = {
  id: "cs-oop-classes",
  domainId: "",
  moduleId: "",
  title: "Objects, prototypes, classes and this",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Explain how `this` is decided at call time, and predict it for the four calling styles.",
    "Build a class and explain the prototype chain underneath it.",
    "Choose composition over inheritance, and explain why.",
  ],
  prerequisites: ["cs-functions-scope", "cs-references-mutability"],
  subtopics: ["Objects and methods", "this: the four rules", "Arrow functions and this", "Prototypes and the chain", "class, constructor, extends, super", "Private fields", "Composition over inheritance"],
  strikeIds: ["l2-s07", "l2-s08"],

  story:
    "A button's click handler calls `this.save()` and crashes with 'Cannot read properties of undefined'. The same method worked when called directly. Nothing about the method changed; only HOW it was called. In JavaScript, `this` is not where a function lives, it is who called it. Classes, prototypes and `this` show up in every framework and in a surprising number of interview questions.",
  mentalModel: {
    plain:
      "An object holds data and functions (methods). Inside a method, `this` means 'the object before the dot when the method was called'. If there is no object before the dot, `this` is lost. A class is a blueprint for objects; underneath, shared methods live on a prototype object that every instance links to.",
    analogy:
      "`this` is the word 'me' in a phone call: it means whoever is speaking right now. A voicemail recorded by Sam and played on Alex's phone still says 'me', but now it is unclear who 'me' is. Prototypes are a family recipe book: each child does not copy every recipe; they look in the shared book when they need one.",
    analogyLimit:
      "Arrow functions break the analogy: they never get their own 'me'; they use the `this` of the place where they were written.",
  },
  lessonSections: [
    {
      heading: "1. Objects with methods",
      body:
        "`const counter = { count: 0, inc() { this.count++; } }`. Calling `counter.inc()` runs inc with `this` pointing at counter, so count goes up.\n\nMethods let data and the behaviour that changes it live together.",
    },
    {
      heading: "2. this is decided when the function is CALLED",
      body:
        "Four rules, in order:\n\n1. `new Thing()`: this is the brand-new object.\n2. `fn.call(obj)`, `fn.apply(obj)` or a function from `fn.bind(obj)`: this is obj.\n3. `obj.method()`: this is obj (the thing before the dot).\n4. A plain call `fn()`: this is undefined in strict mode (modules and classes are strict).\n\nSo `const f = counter.inc; f();` loses `this`, because there is no object before the dot.",
    },
    {
      heading: "3. Arrow functions borrow this",
      body:
        "Arrow functions do not have their own `this`. They use the `this` of the surrounding code, fixed where they are written.\n\nThat makes them perfect for callbacks inside methods (`setTimeout(() => this.tick(), 1000)`) and a poor choice for object methods themselves.",
    },
    {
      heading: "4. Prototypes: shared behaviour",
      body:
        "Every object has a hidden link to another object, its prototype. When you read a property that is not on the object, JavaScript follows the link and looks there, then that object's prototype, and so on: the prototype chain.\n\nThat is how `[1, 2].map` works: map is not on your array, it is on Array.prototype.",
    },
    {
      heading: "5. Classes are a cleaner way to write prototypes",
      body:
        "`class Account { #balance = 0; deposit(n) { this.#balance += n; } get balance() { return this.#balance; } }`\n\nMethods written in a class live on Account.prototype, shared by every instance. `#balance` is a truly private field. `extends` links one class's prototype to another's, and `super(...)` calls the parent's constructor.",
    },
    {
      heading: "6. Composition over inheritance",
      body:
        "Deep inheritance chains (Animal → Mammal → Dog → ServiceDog) become hard to change: every level depends on the ones above.\n\nComposition builds objects from small parts instead: a Dog HAS a walker, a barker, a tracker. You can mix them freely and test each alone. Use inheritance for true 'is-a' relationships that stay stable, and composition for everything else.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "`this` is learned by predicting it call by call: the worked example shows the same method called four ways, and the predict exercise asks for the result before you see it.",
  codeExamples: [
    {
      title: "Same method, four ways to call it",
      language: "js",
      code: `"use strict";
class Counter {
  count = 0;
  inc() {
    if (this === undefined) return "this is lost!";
    this.count++;
    return this.count;
  }
}

const c = new Counter();
console.log(c.inc());              // called with c before the dot

const loose = c.inc;
console.log(loose());              // plain call: no object

const bound = c.inc.bind(c);
console.log(bound());              // bind fixes this

setTimeout(() => console.log(c.inc()), 0);   // arrow keeps c
console.log(Object.getPrototypeOf(c) === Counter.prototype, c.hasOwnProperty("inc"));`,
      expectedOutput: `1
this is lost!
2
true false
3`,
      steps: [
        "c.inc() has c before the dot, so this is c and the count becomes 1.",
        "loose is the same function taken out of the object. Called plainly, there is no object, so this is undefined (strict mode).",
        "bind returns a function whose this is permanently c: the count becomes 2.",
        "The prototype check runs next: c links to Counter.prototype, and inc lives there, not on c itself (hasOwnProperty is false).",
        "Finally the timer fires. The arrow function calls c.inc() with c before the dot, so the count becomes 3.",
      ],
    },
  ],
  practicalApplication:
    "Lost `this` is the classic bug when passing methods as callbacks: event listeners, setTimeout, array.map(obj.method). Fix it with an arrow wrapper, bind in the constructor, or class field arrows. In modern React, function components avoid `this` entirely, but Node libraries, Angular and many SDKs are class-based. In design discussions, prefer small composed objects and pure functions; reach for inheritance only for stable is-a hierarchies.",
  commonMistakes: [
    {
      mistake: "Passing a method as a callback without its object.",
      symptom: "TypeError: Cannot read properties of undefined inside the method.",
      fix: "Pass `() => obj.method()` or `obj.method.bind(obj)` instead of `obj.method`.",
    },
    {
      mistake: "Writing object methods as arrow functions.",
      symptom: "`this` inside the method is not the object (it is the module's this, usually undefined).",
      fix: "Use method syntax (`save() {}`) for methods; use arrows for callbacks inside them.",
    },
    {
      mistake: "Building deep inheritance trees for code reuse.",
      symptom: "A change in a base class breaks unrelated subclasses (the fragile base class problem).",
      fix: "Extract the reusable behaviour into small helpers or objects and compose them.",
    },
  ],
  misconceptions: [
    { myth: "`this` refers to the object where the function was defined.", truth: "For normal functions it is decided at call time by HOW the function is called. Only arrow functions take this from where they are written." },
    { myth: "JavaScript classes work like Java classes.", truth: "They are syntax over prototypes. Methods are shared through the prototype chain, and objects can still be changed at runtime." },
    { myth: "Each instance gets its own copy of every method.", truth: "Methods live once on the prototype; instances share them. Only fields (and arrow-function class fields) are per instance." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l2-s07", why: "Write objects with methods and watch `this` change with the call style." },
    { kind: "strike", strikeId: "l2-s08", why: "Build a class with a constructor, methods and a getter, by hand." },
    {
      kind: "predict",
      question: {
        id: "cs-oop-classes-p1",
        prompt: "What does this print?",
        code: `"use strict";
const user = {
  name: "Ada",
  hello() { return "Hi " + this.name; },
  later() { return [1].map(() => this.name); },
};
const greet = user.hello;
console.log(user.later()[0]);
try { greet(); } catch (e) { console.log("error"); }`,
        choices: ["Ada then error", "undefined then Hi Ada", "Ada then Hi Ada", "error then error"],
        answerIndex: 0,
        explanation: "later is called as user.later(), and the arrow inside map borrows that this, so it returns ['Ada']. greet() is a plain call, so this is undefined and reading this.name throws.",
        objective: 0,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-oop-classes-k1",
      prompt: "Where does `[1, 2, 3].map` come from?",
      choices: ["It is copied into every array", "Array.prototype, found through the prototype chain", "The global object", "The module that created the array"],
      answerIndex: 1,
      explanation: "Arrays link to Array.prototype. Reading .map on the array follows that link.",
      objective: 1,
    },
    {
      id: "cs-oop-classes-k2",
      prompt: "In `new Car(\"red\")`, what is `this` inside the constructor?",
      choices: ["undefined", "The Car class", "The new object being created", "The global object"],
      answerIndex: 2,
      explanation: "new creates a fresh object, links it to Car.prototype and runs the constructor with this set to it.",
      objective: 0,
    },
  ],
  project: {
    title: "Bank Ledger: classes, private state and composition",
    summary: "Model bank accounts with classes and private fields, add behaviours (interest, overdraft, audit log) by composition instead of a deep inheritance tree, and prove the rules with tests.",
    type: "implementation",
    objectivesCovered: [0, 1, 2],
    requirements: [
      "An Account class with a private #balance, deposit, withdraw and a balance getter.",
      "Withdrawals that would go below zero throw unless an overdraft policy is attached.",
      "Policies (interest, overdraft, audit log) are separate objects passed into the account, not subclasses.",
      "A transfer function that moves money between two accounts atomically (both change or neither).",
    ],
    acceptanceCriteria: [
      "A test shows #balance cannot be read or set from outside the class.",
      "A test passes `account.deposit` as a callback (with bind or an arrow) and the balance updates correctly.",
      "A test shows a failed transfer leaves both balances unchanged.",
      "Adding a new policy requires no changes to the Account class.",
    ],
    technologies: ["TypeScript or JavaScript", "Vitest"],
    milestones: [
      { title: "Account", done_when: "Private balance, deposit, withdraw and getter are tested." },
      { title: "Policies", done_when: "Interest and overdraft are composed in and tested." },
      { title: "Transfer", done_when: "Transfers are atomic, with a failure test." },
      { title: "Explain", done_when: "README explains why policies are composed, not inherited." },
    ],
    testIdeas: ["Negative deposits rejected", "Overdraft exactly at the limit", "Audit log order"],
    stretchGoals: ["Currency with integer cents to avoid floating-point errors", "Undo the last transaction"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-oop-classes-a1",
        prompt: "Why does `button.addEventListener(\"click\", this.save)` lose `this` inside save?",
        choices: [
          "Event listeners cannot call methods",
          "The function is passed without its object, so when it is called later there is no object before the dot",
          "save must be static",
          "addEventListener only works with arrow functions",
        ],
        answerIndex: 1,
        explanation: "this is set by how the function is called. The browser calls the bare function, so the original object is gone. Pass an arrow or a bound function instead.",
        objective: 0,
      },
      {
        id: "cs-oop-classes-a2",
        prompt: "What does an arrow function use for `this`?",
        choices: ["The object it is called on", "A new empty object", "The this of the code around where it was written", "Always undefined"],
        answerIndex: 2,
        explanation: "Arrows capture this lexically, like any other variable from the surrounding scope.",
        objective: 0,
      },
      {
        id: "cs-oop-classes-a3",
        prompt: "Where do the methods written inside a class body live?",
        choices: ["Copied onto every instance", "On the class's prototype object, shared by all instances", "In a global registry", "Nowhere until called"],
        answerIndex: 1,
        explanation: "Class methods are placed on ClassName.prototype; instances find them through the prototype chain.",
        objective: 1,
      },
      {
        id: "cs-oop-classes-a4",
        prompt: "A game has Enemy → FlyingEnemy → FlyingShootingEnemy → BossFlyingShootingEnemy. A designer wants a swimming enemy that shoots. What is the better design?",
        choices: [
          "Add SwimmingShootingEnemy extends ShootingEnemy",
          "Compose enemies from movement and attack behaviours (fly, swim, shoot)",
          "Copy the shooting code into a new class",
          "Make every enemy able to do everything",
        ],
        answerIndex: 1,
        explanation: "Behaviours combine in many ways; inheritance chains force one fixed path. Composition lets any enemy pick any movement and any attack.",
        objective: 2,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-oop-classes-q01", tags: ["this"], difficulty: "core", kind: "concept",
      prompt: "How is `this` determined in JavaScript?",
      expectedElements: ["decided at call time", "new binding", "explicit call/apply/bind", "implicit obj.method()", "default undefined in strict mode", "arrows are lexical"],
      modelAnswer: "For normal functions, this is set when the function is called, not where it is defined. With new, it is the new object. With call, apply or bind, it is whatever you pass. Called as obj.method(), it is obj. A plain call gives undefined in strict mode, or the global object in sloppy mode. Arrow functions ignore all of these and use the this of the scope where they were written.",
      explanation: "Listing the rules in precedence order is the gold standard answer.",
      commonWrongAnswers: ["this always refers to the object the function is defined in."],
    },
    {
      id: "cs-oop-classes-q02", tags: ["prototypes"], difficulty: "core", kind: "concept",
      prompt: "Explain prototypal inheritance.",
      expectedElements: ["objects link to a prototype", "property lookup walks the chain", "shared methods", "classes are syntax over it", "Object.create"],
      modelAnswer: "Every object has an internal link to another object, its prototype. When you read a property that is not on the object itself, the engine looks on the prototype, then the prototype's prototype, until it finds it or reaches null. Methods are therefore shared rather than copied. Object.create(proto) makes an object with a given prototype, and class syntax with extends sets up the same chain in a familiar form.",
      explanation: "Interviewers often follow up with 'what does class actually do?'.",
      commonWrongAnswers: ["Objects copy all properties from their parent class."],
    },
    {
      id: "cs-oop-classes-q03", tags: ["this", "bind"], difficulty: "core", kind: "concept",
      prompt: "What is the difference between call, apply and bind?",
      expectedElements: ["call: invoke now, args listed", "apply: invoke now, args as array", "bind: returns new function with fixed this", "bind is permanent"],
      modelAnswer: "All three set this. call invokes the function immediately with arguments listed one by one; apply invokes immediately with arguments in an array; bind does not call the function, it returns a new function with this (and optionally some arguments) permanently fixed, which is useful for callbacks.",
      explanation: "A short, precise comparison is enough.",
      commonWrongAnswers: ["They are identical."],
    },
    {
      id: "cs-oop-classes-q04", tags: ["design", "composition"], difficulty: "core", kind: "design",
      prompt: "Why is composition often preferred over inheritance?",
      expectedElements: ["inheritance couples child to parent", "fragile base class", "rigid single hierarchy", "composition mixes small behaviours", "easier to test"],
      modelAnswer: "Inheritance ties a subclass to every detail of its parents, so a change high in the tree can break things far below it, and real-world features rarely fit one hierarchy. Composition builds behaviour from small independent parts that an object has, rather than is, so you can combine them freely, swap them out and test them alone. I keep inheritance for genuine, stable is-a relationships.",
      explanation: "Name a concrete failure mode of inheritance.",
      commonWrongAnswers: ["Inheritance is always bad."],
    },
    {
      id: "cs-oop-classes-q05", tags: ["classes", "private"], difficulty: "core", kind: "concept",
      prompt: "How do you make data private in a JavaScript class?",
      expectedElements: ["#private fields", "truly inaccessible from outside", "underscore convention is not private", "closures as alternative"],
      modelAnswer: "Use private fields with a hash: #balance. They can only be accessed inside the class body; outside code gets a syntax error, and they do not show up in Object.keys or JSON. The older underscore convention (_balance) is just a hint and fully accessible. Before private fields, closures were the way to hide state.",
      explanation: "Distinguishing real privacy from convention is the point.",
      commonWrongAnswers: ["Prefix with an underscore."],
    },
    {
      id: "cs-oop-classes-q06", tags: ["this", "code-reading"], difficulty: "core", kind: "code-reading",
      prompt: "What does this log, and how would you fix it?",
      code: `class Timer {
  seconds = 0;
  start() {
    setInterval(function () { this.seconds++; console.log(this.seconds); }, 1000);
  }
}
new Timer().start();`,
      expectedElements: ["regular function callback loses this", "TypeError or NaN", "use arrow function", "or bind"],
      modelAnswer: "The callback is a regular function called by the timer, not as a method of the Timer, so this is not the Timer. In Node it is the Timeout object, so this.seconds++ makes NaN; in a strict browser context it would throw. Changing the callback to an arrow function, () => { this.seconds++ }, makes it use start's this, the Timer.",
      explanation: "The fix (arrow) is what matters most.",
      commonWrongAnswers: ["It logs 1, 2, 3..."],
    },
    {
      id: "cs-oop-classes-q07", tags: ["new"], difficulty: "advanced", kind: "concept",
      prompt: "What does the `new` keyword do, step by step?",
      expectedElements: ["create empty object", "link its prototype to Constructor.prototype", "run constructor with this = object", "return the object unless constructor returns an object"],
      modelAnswer: "new creates a fresh empty object, sets its prototype link to the constructor's prototype property, runs the constructor with this pointing at the new object, and returns that object, unless the constructor explicitly returns a different object, in which case that object is returned instead.",
      explanation: "Four clear steps.",
      commonWrongAnswers: ["It copies the class into a new object."],
    },
    {
      id: "cs-oop-classes-q08", tags: ["oop", "principles"], difficulty: "foundation", kind: "concept",
      prompt: "What are encapsulation and polymorphism? Give a simple example of each.",
      expectedElements: ["encapsulation: hide internals behind an interface", "private fields example", "polymorphism: same call, different behaviour", "shape.area() example"],
      modelAnswer: "Encapsulation means hiding an object's internal state behind a small public interface, like an Account whose balance can only change through deposit and withdraw. Polymorphism means different objects respond to the same call in their own way: circle.area() and square.area() share a method name, so code can compute total area of any list of shapes without knowing each type.",
      explanation: "Examples make the abstract terms concrete.",
      commonWrongAnswers: ["Polymorphism means using many classes."],
    },
  ],
  references: [
    { title: "MDN: this", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this", kind: "official-docs" },
    { title: "MDN: Inheritance and the prototype chain", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain", kind: "official-docs" },
    { title: "MDN: Classes (including private properties)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Encapsulation, polymorphism and composition over inheritance apply across object-oriented languages."],
  versionSpecific: ["The four this-binding rules and prototype mechanics are JavaScript-specific; #private fields arrived in ES2022."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
