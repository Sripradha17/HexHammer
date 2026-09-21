import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l2-s06",
  level: 2,
  order: 6,
  title: "Scope and closures",

  look: `Scope is "where can I see this variable?". A variable made inside a function can only be seen inside that function, like things in your bedroom.

  function room() {
    const secret = 42;     // only visible inside room
  }
  // secret is not visible out here

A closure is a function that REMEMBERS the variables around the place where it was born. Picture a backpack the function carries everywhere.

  function makeAdder(n) {
    return function (x) { return x + n; };   // this little function remembers n
  }
  const addFive = makeAdder(5);
  addFive(10)    // 15
  addFive(1)     // 6

Each call to makeAdder packs a NEW backpack. So closures are how you keep things private and remember state.`,

  type: `Finish three functions:
1. makeCounter() returns a function. Every time you call that function it gives the next number: 1, then 2, then 3. Two counters must be independent.
2. makeGreeter(greeting) returns a function that takes a name and returns something like "Hello, Sam".
3. makeBank(start) returns an object with deposit(amount) (adds money and returns the new total) and balance() (returns the total). The money must be private: nobody outside can change it directly.`,

  break: `Break it on purpose: in makeCounter, move the line let count = 0 INSIDE the returned function.
Now every call starts over, so it always says 1. The backpack got emptied each time. Put it back outside.`,

  say: `In one sentence: what is a closure, and what is it good for?`,

  starterCode: `// Strike 6: scope and closures.

function makeCounter() {
  // return a function that says 1, then 2, then 3 ...
}

function makeGreeter(greeting) {
  // return a function that takes a name, like "Hello, Sam"
}

function makeBank(start) {
  // return { deposit(amount), balance() } and keep the money private
}
`,

  tests: `test("makeCounter counts 1, 2, 3", () => {
  const counter = makeCounter();
  expect(counter()).toBe(1);
  expect(counter()).toBe(2);
  expect(counter()).toBe(3);
});

test("two counters do not share their count", () => {
  const first = makeCounter();
  const second = makeCounter();
  first();
  first();
  expect(second()).toBe(1);
});

test("makeGreeter remembers the greeting", () => {
  expect(makeGreeter("Hello")("Sam")).toBe("Hello, Sam");
  expect(makeGreeter("Yo")("Ada")).toBe("Yo, Ada");
});

test("makeBank deposits and reports the balance", () => {
  const bank = makeBank(100);
  expect(bank.deposit(50)).toBe(150);
  expect(bank.balance()).toBe(150);
  bank.deposit(25);
  expect(bank.balance()).toBe(175);
});

test("the bank's money is private", () => {
  const bank = makeBank(100);
  expect(bank.money).toBe(undefined);
  expect(bank.start).toBe(undefined);
});
`,

  hints: [
    "makeCounter: make a box (let count = 0) OUTSIDE the function you return. The returned function adds 1 to count and gives it back.",
    'makeGreeter: the outer function receives greeting. Return an inner function that receives name and glues greeting + ", " + name.',
    "makeBank: keep the money in a let variable inside makeBank (not on the returned object). The returned object has two little functions that use that variable.",
  ],

  solution: `=== CODE ===
function makeCounter() {
  let count = 0;
  return function () {
    count = count + 1;
    return count;
  };
}

function makeGreeter(greeting) {
  return function (name) {
    return greeting + ", " + name;
  };
}

function makeBank(start) {
  let money = start;
  return {
    deposit(amount) {
      money = money + amount;
      return money;
    },
    balance() {
      return money;
    },
  };
}
=== LINE BY LINE ===
makeCounter: count lives in makeCounter's room. The function we return carries it in its backpack. Every call adds 1 to that same count. A second call to makeCounter builds a second room with its own count, so counters do not mix.
makeGreeter: the inner function remembers greeting even after makeGreeter has finished, because of the backpack.
makeBank: money is a plain variable inside makeBank, so nothing outside can touch it. The two little functions inside the object are the only doors to it. That is how closures give you private data.`,
};
