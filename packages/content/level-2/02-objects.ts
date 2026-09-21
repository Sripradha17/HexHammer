import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l2-s02",
  level: 2,
  order: 2,
  title: "Objects",

  look: `An object is a toy box with labels. Each label (a key) points at a thing (a value).

  const robot = { name: "Bolt", legs: 2, happy: true };

  robot.name          // "Bolt"      read with a dot
  robot["legs"]       // 2           or with square brackets
  robot.legs = 4;     // change a value
  robot.color = "red" // add a brand new label
  Object.keys(robot)  // ["name", "legs", "happy", "color"]

If you ask for a label that is not in the box, you get undefined. That is JavaScript saying "nothing here".`,

  type: `Finish three functions:
1. makePet(name, animal) returns an object like { name: "Milo", animal: "cat", hungry: true }.
2. feed(pet) sets pet.hungry to false and returns that same pet.
3. petSummary(pet) returns "Milo the cat is hungry" or "Milo the cat is full".`,

  break: `Break it on purpose: in petSummary, misspell a key, like pet.nam instead of pet.name.
JavaScript does not crash. It quietly says "undefined the cat is full". Objects are forgiving, so typos hide! Then fix it.`,

  say: `In one sentence: how do you read a value from an object, and what do you get if the key is not there?`,

  starterCode: `// Strike 2: objects.

function makePet(name, animal) {
  // return an object with name, animal, and hungry set to true
}

function feed(pet) {
  // make the pet not hungry, then return the pet
}

function petSummary(pet) {
  // "Milo the cat is hungry"  or  "Milo the cat is full"
}
`,

  tests: `test("makePet builds the object", () => {
  expect(makePet("Milo", "cat")).toEqual({ name: "Milo", animal: "cat", hungry: true });
});

test("feed makes the pet not hungry and returns the same pet", () => {
  const pet = makePet("Rex", "dog");
  const result = feed(pet);
  expect(result.hungry).toBe(false);
  expect(result).toBe(pet);
});

test("petSummary for a hungry pet", () => {
  expect(petSummary(makePet("Milo", "cat"))).toBe("Milo the cat is hungry");
});

test("petSummary for a fed pet", () => {
  const pet = feed(makePet("Rex", "dog"));
  expect(petSummary(pet)).toBe("Rex the dog is full");
});
`,

  hints: [
    "An object is written with curly braces: { key: value, key: value }. The keys here are name, animal and hungry.",
    "feed only needs two lines: set the key with a dot (pet.hungry = false), then return pet.",
    "For petSummary, first pick the word (hungry or full) with an if / else, then glue the pieces together with +.",
  ],

  solution: `=== CODE ===
function makePet(name, animal) {
  return { name: name, animal: animal, hungry: true };
}

function feed(pet) {
  pet.hungry = false;
  return pet;
}

function petSummary(pet) {
  let state = "full";
  if (pet.hungry) {
    state = "hungry";
  }
  return pet.name + " the " + pet.animal + " is " + state;
}
=== LINE BY LINE ===
makePet: the curly braces make a new object. name: name means "the label name holds the value of the input called name".
feed: pet.hungry = false changes the value inside the SAME object, so anyone holding that pet sees the change. Then we return the pet.
petSummary: we start with "full", and only switch to "hungry" if pet.hungry is true. Then + glues the name, the animal and the state into one sentence.`,
};
