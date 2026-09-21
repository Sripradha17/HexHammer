import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "dsa-s06",
  level: 0,
  track: "dsa",
  order: 6,
  title: "Stacks and queues",

  look: `You built a Stack and a Queue in Level 2. Now let us use them to solve real interview problems.

  STACK  last in, first out   push / pop / peek       a pile of pancakes
  QUEUE  first in, first out  enqueue / dequeue       a line at the ice cream shop

Interview pattern 1: THE MONOTONIC STACK. To answer "for each item, where is the next bigger one?", keep a stack of items still WAITING for an answer. When a new item arrives that is bigger than the waiting ones, it answers them all!

  temperatures: [73, 74, 75, 71]
   73 waits ... 74 arrives (bigger) -> 73 is answered, 74 waits ... 75 arrives -> 74 answered, 75 waits, 71 waits.

Interview pattern 2: A STACK WITH A SUPERPOWER. A stack that can also tell you the minimum in O(1), by remembering the smallest value at every level.

Interview pattern 3: BUILD ONE FROM THE OTHER. Make a queue out of two stacks. Pushing goes onto stack "in". When you need to dequeue and stack "out" is empty, pour everything from "in" to "out": the order flips, so the oldest item is now on top.

  in:  [1, 2, 3]  (3 on top)          pour ->     out: [3, 2, 1]  (1 on top)

Remember to keep the ORIGINAL positions when a problem asks for positions: store indexes in the stack, not values.`,

  type: `Solve three problems:
1. dailyTemperatures(temps) returns, for each day, how many days you must wait for a WARMER day (0 if there never is one). [73,74,75,71,69,72,76,73] gives [1,1,4,2,1,1,0,0]. Use a stack of positions.
2. class MinStack with push(x), pop(), top() (the newest item), and getMin() (the smallest item now in the stack). All four must be O(1).
3. class QueueFromStacks with enqueue(x), dequeue() and size(), built ONLY from two arrays that you use like stacks (push and pop only, never shift). dequeue on an empty queue returns undefined.`,

  break: `Break it on purpose: in QueueFromStacks, pour from "in" to "out" on EVERY dequeue, even when "out" still has items.
Items get shuffled into the wrong order. Only pour when "out" is completely empty.`,

  say: `In one sentence: how does a monotonic stack find the "next bigger item" for every position in one pass?`,

  starterCode: `// DSA 6: stacks and queues.

function dailyTemperatures(temps) {
  // for each day, days until a warmer day (0 if never)
}

class MinStack {
  // push(x), pop(), top(), getMin() - all O(1)
}

class QueueFromStacks {
  // enqueue(x), dequeue(), size() using only two arrays as stacks
}
`,

  tests: `test("dailyTemperatures", () => {
  expect(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73])).toEqual([1, 1, 4, 2, 1, 1, 0, 0]);
  expect(dailyTemperatures([30, 40, 50, 60])).toEqual([1, 1, 1, 0]);
  expect(dailyTemperatures([60, 50, 40])).toEqual([0, 0, 0]);
  expect(dailyTemperatures([])).toEqual([]);
});

test("dailyTemperatures is fast on 100,000 days", () => {
  const cold = Array.from({ length: 100000 }, (_, i) => 100000 - i);
  expect(dailyTemperatures(cold)[0]).toBe(0);
  const warm = Array.from({ length: 100000 }, (_, i) => i);
  expect(dailyTemperatures(warm)[99998]).toBe(1);
});

test("MinStack works like a stack", () => {
  const stack = new MinStack();
  stack.push(5);
  stack.push(7);
  expect(stack.top()).toBe(7);
  stack.pop();
  expect(stack.top()).toBe(5);
});

test("MinStack always knows the minimum", () => {
  const stack = new MinStack();
  stack.push(3);
  stack.push(1);
  stack.push(2);
  expect(stack.getMin()).toBe(1);
  stack.pop();
  expect(stack.getMin()).toBe(1);
  stack.pop();
  expect(stack.getMin()).toBe(3);
});

test("MinStack with equal minimums", () => {
  const stack = new MinStack();
  stack.push(2);
  stack.push(2);
  stack.pop();
  expect(stack.getMin()).toBe(2);
});

test("QueueFromStacks is first in, first out", () => {
  const queue = new QueueFromStacks();
  queue.enqueue(1);
  queue.enqueue(2);
  queue.enqueue(3);
  expect(queue.dequeue()).toBe(1);
  queue.enqueue(4);
  expect(queue.dequeue()).toBe(2);
  expect(queue.dequeue()).toBe(3);
  expect(queue.dequeue()).toBe(4);
  expect(queue.size()).toBe(0);
});

test("QueueFromStacks empty queue and size", () => {
  const queue = new QueueFromStacks();
  expect(queue.dequeue()).toBe(undefined);
  queue.enqueue("a");
  expect(queue.size()).toBe(1);
});

test("QueueFromStacks is fast for 100,000 items", () => {
  const queue = new QueueFromStacks();
  for (let i = 0; i < 100000; i++) { queue.enqueue(i); }
  for (let i = 0; i < 100000; i++) {
    if (queue.dequeue() !== i) { throw new Error("Out of order at " + i); }
  }
});
`,

  hints: [
    "dailyTemperatures: keep a stack of positions of days still waiting. For each day i, while the stack is not empty and temps[i] is warmer than the day on top, pop that day and set its answer to i minus its position. Then push i.",
    "MinStack: keep a second array. Whenever you push x, also push the smaller of x and the current minimum onto it. pop() removes from both, and getMin() reads the top of the second one.",
    'QueueFromStacks: an "in" array and an "out" array. enqueue pushes onto in. dequeue: if out is empty, pop everything from in and push it onto out. Then pop from out. size is the two lengths added.',
  ],

  solution: `=== CODE ===
function dailyTemperatures(temps) {
  const answer = new Array(temps.length).fill(0);
  const waiting = [];
  for (let i = 0; i < temps.length; i++) {
    while (waiting.length > 0 && temps[i] > temps[waiting[waiting.length - 1]]) {
      const earlier = waiting.pop();
      answer[earlier] = i - earlier;
    }
    waiting.push(i);
  }
  return answer;
}

class MinStack {
  constructor() {
    this.items = [];
    this.minimums = [];
  }
  push(x) {
    const smallest = this.minimums.length === 0 ? x : Math.min(x, this.minimums[this.minimums.length - 1]);
    this.items.push(x);
    this.minimums.push(smallest);
  }
  pop() {
    this.minimums.pop();
    return this.items.pop();
  }
  top() {
    return this.items[this.items.length - 1];
  }
  getMin() {
    return this.minimums[this.minimums.length - 1];
  }
}

class QueueFromStacks {
  constructor() {
    this.inbox = [];
    this.outbox = [];
  }
  enqueue(x) {
    this.inbox.push(x);
  }
  dequeue() {
    if (this.outbox.length === 0) {
      while (this.inbox.length > 0) {
        this.outbox.push(this.inbox.pop());
      }
    }
    return this.outbox.pop();
  }
  size() {
    return this.inbox.length + this.outbox.length;
  }
}
=== LINE BY LINE ===
dailyTemperatures: waiting holds the POSITIONS of days that have not found a warmer day yet. Their temperatures are always going down from bottom to top (that is what "monotonic" means). When a warmer day arrives it answers every colder waiting day on top of the stack. Each day is pushed once and popped once, so it is O(n), not O(n^2).
MinStack: minimums is a shadow stack. At each level it stores "the smallest value from the bottom up to here". So the minimum is always just the top of the shadow stack, and popping keeps both stacks in step.
QueueFromStacks: the inbox holds new items with the newest on top. Pouring the inbox into the outbox flips the order, putting the OLDEST item on top, which is the one a queue must serve first. We only pour when the outbox is empty, so each item is moved at most once. That makes dequeue O(1) on average.`,
};
