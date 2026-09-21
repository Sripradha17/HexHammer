import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l2-s07",
  level: 2,
  order: 7,
  title: "this",

  look: `Inside a method, the word this means "the thing who is speaking right now". It is the object BEFORE THE DOT when the method is called.

  const dog = {
    name: "Rex",
    speak() { return this.name + " says woof"; },
  };
  dog.speak();     // "Rex says woof"    this is dog

But if you carry the method away from its object, it forgets who it belongs to:

  const lost = dog.speak;
  lost();          // this is NOT dog any more!

Two ways to keep it:
  bind:   const safe = dog.speak.bind(dog);   // glue this to dog forever
  arrow:  arrow functions (=>) do not have their own this. They use the this of the place they were written.`,

  type: `Finish three functions:
1. makeCat(name) returns an object with a name and a method intro() that returns "My name is Tom" (using this.name).
2. bindIntro(cat) returns a version of cat.intro that still works when called on its own (detached). Use bind.
3. makeScoreboard() returns an object with score: 0 and a method addAll(nums) that adds every number to this.score with forEach and an ARROW function, then returns this.score.`,

  break: `Break it on purpose: in addAll, change the arrow function inside forEach to a regular function(n) { ... }.
Now this is not the scoreboard any more, so the score never grows. Arrow functions keep this. Put the arrow back.`,

  say: `In one sentence: what does this point to inside a method, and how can you stop it from getting lost?`,

  starterCode: `// Strike 7: this.

function makeCat(name) {
  // return { name, intro() } where intro says "My name is <name>" using this.name
}

function bindIntro(cat) {
  // return cat.intro glued to cat, so it works even when called alone
}

function makeScoreboard() {
  // return { score: 0, addAll(nums) } - addAll uses forEach with an arrow function
}
`,

  tests: `test("makeCat has a name and an intro", () => {
  const cat = makeCat("Tom");
  expect(cat.name).toBe("Tom");
  expect(cat.intro()).toBe("My name is Tom");
});

test("bindIntro works even when the method is called alone", () => {
  const cat = makeCat("Tom");
  const detached = bindIntro(cat);
  expect(detached()).toBe("My name is Tom");
});

test("addAll adds numbers to the score and returns it", () => {
  const board = makeScoreboard();
  expect(board.addAll([1, 2, 3])).toBe(6);
});

test("the score keeps growing between calls", () => {
  const board = makeScoreboard();
  board.addAll([1, 2, 3]);
  expect(board.addAll([4])).toBe(10);
  expect(board.score).toBe(10);
});
`,

  hints: [
    'In makeCat, write intro as a method: intro() { return "My name is " + this.name; }. The word this reaches the cat.',
    "bindIntro: every function has a .bind(thing) method. cat.intro.bind(cat) gives back a new function with this locked to cat.",
    "addAll: nums.forEach((n) => { this.score = this.score + n; }); then return this.score. The arrow is what keeps this pointing at the scoreboard.",
  ],

  solution: `=== CODE ===
function makeCat(name) {
  return {
    name: name,
    intro() {
      return "My name is " + this.name;
    },
  };
}

function bindIntro(cat) {
  return cat.intro.bind(cat);
}

function makeScoreboard() {
  return {
    score: 0,
    addAll(nums) {
      nums.forEach((n) => {
        this.score = this.score + n;
      });
      return this.score;
    },
  };
}
=== LINE BY LINE ===
makeCat: when you call cat.intro(), the thing before the dot is the cat, so this.name is the cat's name.
bindIntro: bind makes a brand-new function whose this is permanently the cat. So even if someone calls detached() with nothing before the dot, it still knows the cat.
makeScoreboard: addAll is a method, so inside it this is the scoreboard. The arrow function passed to forEach does not make its own this, so it borrows addAll's this. A regular function would get a different this and the score would not change.`,
};
