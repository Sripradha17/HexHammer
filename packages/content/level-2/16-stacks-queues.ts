import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l2-s16",
  level: 2,
  order: 16,
  title: "Stacks and queues",

  look: `Two simple ways to keep a list, each with one rule about who gets out first.

A STACK is a pile of pancakes. You add on top and take from the top. Last in, first out (LIFO).
  push(x)   put a pancake on top
  pop()     take the top pancake
  peek()    look at the top pancake without taking it

A QUEUE is the line at the ice cream shop. New people join the back, and the person at the front is served first. First in, first out (FIFO).
  enqueue(x)   join the back of the line
  dequeue()    serve the person at the front

An array can do both jobs:
  const stack = [];  stack.push(1);  stack.push(2);  stack.pop();     // 2
  const queue = [];  queue.push(1);  queue.push(2);  queue.shift();   // 1  (shift takes from the FRONT)

Stacks are everywhere: the undo button, the browser back button, and matching brackets.`,

  type: `Finish three things:
1. class Stack with push(item), pop() (returns undefined when empty), peek() (the top item without removing it) and size().
2. class Queue with enqueue(item), dequeue() (returns undefined when empty) and size().
3. isBalanced(text) returns true when every bracket ( ) [ ] { } is closed in the right order. "(a[b]{c})" is true. "(]" is false. "((" is false. Hint: use a stack!`,

  break: `Break it on purpose: in your Queue, make dequeue use pop() instead of shift().
Now the line is served from the BACK, and the "first in, first out" test fails. You just turned your queue into a stack! Put shift back.`,

  say: `In one sentence: what is the difference between a stack and a queue?`,

  starterCode: `// Strike 16: stacks and queues.

class Stack {
  // push, pop, peek, size
}

class Queue {
  // enqueue, dequeue, size
}

function isBalanced(text) {
  // are all the brackets closed in the right order?
}
`,

  tests: `test("a Stack is last in, first out", () => {
  const stack = new Stack();
  stack.push(1);
  stack.push(2);
  stack.push(3);
  expect(stack.pop()).toBe(3);
  expect(stack.pop()).toBe(2);
  expect(stack.size()).toBe(1);
});

test("a Stack can peek without removing", () => {
  const stack = new Stack();
  stack.push("a");
  expect(stack.peek()).toBe("a");
  expect(stack.size()).toBe(1);
});

test("an empty Stack pops undefined", () => {
  expect(new Stack().pop()).toBe(undefined);
});

test("a Queue is first in, first out", () => {
  const queue = new Queue();
  queue.enqueue("Sam");
  queue.enqueue("Ada");
  queue.enqueue("Kim");
  expect(queue.dequeue()).toBe("Sam");
  expect(queue.dequeue()).toBe("Ada");
  expect(queue.size()).toBe(1);
});

test("an empty Queue dequeues undefined", () => {
  expect(new Queue().dequeue()).toBe(undefined);
});

test("isBalanced accepts correct brackets", () => {
  expect(isBalanced("(a[b]{c})")).toBe(true);
  expect(isBalanced("")).toBe(true);
  expect(isBalanced("no brackets at all")).toBe(true);
});

test("isBalanced rejects wrong brackets", () => {
  expect(isBalanced("(]")).toBe(false);
  expect(isBalanced("((")).toBe(false);
  expect(isBalanced(")(")).toBe(false);
  expect(isBalanced("{[}]")).toBe(false);
});
`,

  hints: [
    "Both classes keep a private array in their constructor: this.items = []. Stack uses the END of the array (push and pop). Queue uses push to join and shift to serve from the front.",
    "peek is this.items[this.items.length - 1]. size is this.items.length. pop and shift on an empty array already return undefined for you.",
    "isBalanced: go through the text. When you see an opening bracket, push it. When you see a closing bracket, pop the stack and check it is the matching opener. At the end the stack must be empty.",
  ],

  solution: `=== CODE ===
class Stack {
  constructor() {
    this.items = [];
  }
  push(item) {
    this.items.push(item);
  }
  pop() {
    return this.items.pop();
  }
  peek() {
    return this.items[this.items.length - 1];
  }
  size() {
    return this.items.length;
  }
}

class Queue {
  constructor() {
    this.items = [];
  }
  enqueue(item) {
    this.items.push(item);
  }
  dequeue() {
    return this.items.shift();
  }
  size() {
    return this.items.length;
  }
}

function isBalanced(text) {
  const openerFor = { ")": "(", "]": "[", "}": "{" };
  const stack = new Stack();
  for (const character of text) {
    if (character === "(" || character === "[" || character === "{") {
      stack.push(character);
    } else if (character in openerFor) {
      if (stack.pop() !== openerFor[character]) {
        return false;
      }
    }
  }
  return stack.size() === 0;
}
=== LINE BY LINE ===
Stack: a private array plus two rules: push adds to the end, pop removes from the end. The end of the array is the top of the pile.
Queue: enqueue adds to the end (the back of the line) and dequeue uses shift to remove from the FRONT. That is the only difference from the stack.
isBalanced: openerFor says which opener belongs to each closer. Every opener goes on the stack. When a closer arrives, the most recent opener (the top of the stack) must be its partner, otherwise the brackets are tangled. If the stack pop gives undefined (a closer with no opener, like ")(") the comparison fails, so we return false.
At the end the stack must be empty. If it is not, some opener was never closed, as in "((".`,
};
