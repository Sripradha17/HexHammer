import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l2-s08",
  level: 2,
  order: 8,
  title: "Prototypes and classes",

  look: `A class is a COOKIE CUTTER. Each object you make from it is a cookie: same shape, but each can have its own sprinkles.

  class Vehicle {
    constructor(wheels) {        // runs once when you make a new one
      this.wheels = wheels;
    }
    describe() {
      return "I have " + this.wheels + " wheels";
    }
  }
  const car = new Vehicle(4);
  car.describe();                // "I have 4 wheels"

extends means "start from that recipe, then change some parts":

  class Bike extends Vehicle {
    describe() { return "Ring ring! " + super.describe(); }   // super = the parent's version
  }

Under the hood JavaScript uses prototypes: an object that does not know a method asks its parent, then its grandparent, up a chain (the prototype chain), until someone knows. Classes are the friendly way to write that.`,

  type: `Finish three things:
1. class Animal with a constructor(name) that saves this.name, and a method speak() returning "Blob makes a sound" (using the name).
2. class Dog that EXTENDS Animal and overrides speak() to return "Rex says woof".
3. isAnimal(thing) returns true if thing was made from Animal (or from something that extends it). Use instanceof.`,

  break: `Break it on purpose: in Dog, forget to write "extends Animal". Run the tests.
The dog no longer has a name, and isAnimal says false. Without extends, it is a different cookie cutter. Put it back.`,

  say: `In one sentence: what is the difference between a class and an object made from it, and what does extends do?`,

  starterCode: `// Strike 8: classes and prototypes.

class Animal {
  // constructor(name) and speak()
}

class Dog {
  // should extend Animal and change speak()
}

function isAnimal(thing) {
  // true if thing came from Animal (or a class that extends it)
}
`,

  tests: `test("an Animal has a name and speaks", () => {
  const animal = new Animal("Blob");
  expect(animal.name).toBe("Blob");
  expect(animal.speak()).toBe("Blob makes a sound");
});

test("a Dog overrides speak", () => {
  expect(new Dog("Rex").speak()).toBe("Rex says woof");
});

test("a Dog still gets its name from Animal", () => {
  expect(new Dog("Rex").name).toBe("Rex");
});

test("Dog extends Animal", () => {
  expect(Dog.prototype instanceof Animal).toBe(true);
});

test("isAnimal recognises animals and dogs but not plain objects", () => {
  expect(isAnimal(new Animal("Blob"))).toBe(true);
  expect(isAnimal(new Dog("Rex"))).toBe(true);
  expect(isAnimal({ name: "Fake" })).toBe(false);
});
`,

  hints: [
    "A class body holds a constructor(name) { this.name = name; } and methods like speak() { ... }. No commas between them.",
    "To inherit, write class Dog extends Animal { ... }. You do not even need a constructor in Dog: it borrows the parent's.",
    "isAnimal is one line: return thing instanceof Animal;",
  ],

  solution: `=== CODE ===
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return this.name + " makes a sound";
  }
}

class Dog extends Animal {
  speak() {
    return this.name + " says woof";
  }
}

function isAnimal(thing) {
  return thing instanceof Animal;
}
=== LINE BY LINE ===
Animal: the constructor runs when you write new Animal("Blob"). It saves the name on the new object with this.name. speak is a method that every animal shares.
Dog extends Animal: Dog starts with everything Animal has (including the constructor, so dogs get a name). Then we write speak again, which replaces the parent's version for dogs only. That is called overriding.
isAnimal: instanceof asks "is Animal somewhere in this object's family tree (its prototype chain)?". A Dog says yes. A plain object says no.`,
};
