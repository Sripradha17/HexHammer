import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "dsa-s12",
  level: 0,
  track: "dsa",
  order: 12,
  title: "Heaps",

  look: `A heap is a special pile that always keeps the SMALLEST item on top (a min-heap). It is like the line at a hospital emergency room: no matter who arrives, the most urgent patient is always seen next.

  push(x)    add an item                 O(log n)
  pop()      remove and return the smallest   O(log n)
  peek()     look at the smallest             O(1)

Finding the smallest in a plain array costs O(n) each time. Sorting costs O(n log n). A heap lets you keep adding items and always grab the smallest cheaply.

How does it work? A heap is a TREE stored inside a plain array. No pointers needed, just arithmetic. For the item at position i:
  its parent is at   Math.floor((i - 1) / 2)
  its children are at   2 * i + 1   and   2 * i + 2

  positions:   0
              / \\
             1   2
            / \\ / \\
           3  4 5  6          array:  [1, 3, 2, 7, 4, 5, 6]

The one rule: every parent is smaller than or equal to its children.

push: put the new item at the END, then "bubble up": while it is smaller than its parent, swap them.
pop:  take the top (position 0). Move the LAST item to the top. Then "sink down": while it is bigger than a child, swap it with the SMALLER child.

The famous use: "the k-th largest item". Keep a min-heap of size k. Each new item that beats the smallest one in there kicks it out. At the end the top of the heap is exactly the k-th largest.`,

  type: `Solve three problems:
1. class MinHeap with push(x), pop() (the smallest, or undefined if empty), peek() (the smallest without removing, or undefined) and size(). Store it in an array using the parent/child arithmetic. Do not sort the array.
2. kthLargest(nums, k) returns the k-th largest number (k = 1 is the biggest). Use your MinHeap of size k. You can assume 1 <= k <= nums.length.
3. topKFrequent(nums, k) returns the k numbers that appear most often, most frequent first. If two numbers appear equally often, the smaller number goes first.`,

  break: `Break it on purpose: in pop(), move the last item to the top but forget to sink it down.
The next pop() returns the wrong item, because the smallest is no longer on top. The sink-down step is what keeps the heap rule true.`,

  say: `In one sentence: what does a min-heap keep on top, and how are its parent and children found inside an array?`,

  starterCode: `// DSA 12: heaps.

class MinHeap {
  // push(x), pop(), peek(), size() - keep the smallest on top
}

function kthLargest(nums, k) {
  // use a MinHeap that never grows past k items
}

function topKFrequent(nums, k) {
  // the k most frequent numbers, most frequent first (ties: smaller number first)
}
`,

  tests: `test("MinHeap pops in ascending order", () => {
  const heap = new MinHeap();
  for (const x of [5, 3, 8, 1, 9, 2]) { heap.push(x); }
  const out = [];
  while (heap.size() > 0) { out.push(heap.pop()); }
  expect(out).toEqual([1, 2, 3, 5, 8, 9]);
});

test("MinHeap peek and size", () => {
  const heap = new MinHeap();
  expect(heap.peek()).toBe(undefined);
  expect(heap.pop()).toBe(undefined);
  heap.push(4);
  heap.push(2);
  expect(heap.peek()).toBe(2);
  expect(heap.size()).toBe(2);
});

test("MinHeap handles duplicates and mixed pushing and popping", () => {
  const heap = new MinHeap();
  heap.push(3);
  heap.push(3);
  heap.push(1);
  expect(heap.pop()).toBe(1);
  heap.push(0);
  expect(heap.pop()).toBe(0);
  expect(heap.pop()).toBe(3);
  expect(heap.pop()).toBe(3);
});

test("MinHeap sorts 100,000 numbers quickly", () => {
  const heap = new MinHeap();
  let seed = 7;
  for (let i = 0; i < 100000; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    heap.push(seed);
  }
  let previous = -1;
  for (let i = 0; i < 100000; i++) {
    const value = heap.pop();
    if (value < previous) { throw new Error("Out of order at " + i); }
    previous = value;
  }
});

test("kthLargest", () => {
  expect(kthLargest([3, 2, 1, 5, 6, 4], 2)).toBe(5);
  expect(kthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)).toBe(4);
  expect(kthLargest([7], 1)).toBe(7);
});

test("kthLargest is fast on 100,000 numbers", () => {
  const nums = Array.from({ length: 100000 }, (_, i) => (i * 7919) % 100003);
  const sorted = [...nums].sort((a, b) => b - a);
  expect(kthLargest(nums, 10)).toBe(sorted[9]);
});

test("topKFrequent orders by count, then by smaller number", () => {
  expect(topKFrequent([1, 1, 1, 2, 2, 3], 2)).toEqual([1, 2]);
  expect(topKFrequent([4, 4, 5, 5, 6], 2)).toEqual([4, 5]);
  expect(topKFrequent([9, 8, 9, 8, 7], 3)).toEqual([8, 9, 7]);
  expect(topKFrequent([1], 1)).toEqual([1]);
});
`,

  hints: [
    "MinHeap: keep this.items = []. push: add at the end, then while the item is smaller than its parent (at Math.floor((i - 1) / 2)), swap them and move i to the parent.",
    "pop: save the top (items[0]). Take the last item off the array and, if any items are left, put it at position 0. Then sink: find the smaller child (2i+1 or 2i+2); if it is smaller than the item, swap and continue from there. Return the saved top.",
    "kthLargest: push each number into the heap. If the heap grows bigger than k, pop once (that removes the smallest). At the end peek() is the k-th largest. topKFrequent: count with a Map, turn the entries into an array, and sort by count (biggest first), then by number (smallest first), and take the first k.",
  ],

  solution: `=== CODE ===
class MinHeap {
  constructor() {
    this.items = [];
  }

  size() {
    return this.items.length;
  }

  peek() {
    return this.items[0];
  }

  push(x) {
    this.items.push(x);
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.items[i] >= this.items[parent]) {
        break;
      }
      [this.items[i], this.items[parent]] = [this.items[parent], this.items[i]];
      i = parent;
    }
  }

  pop() {
    if (this.items.length === 0) {
      return undefined;
    }
    const top = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0) {
      this.items[0] = last;
      let i = 0;
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;
        if (left < this.items.length && this.items[left] < this.items[smallest]) {
          smallest = left;
        }
        if (right < this.items.length && this.items[right] < this.items[smallest]) {
          smallest = right;
        }
        if (smallest === i) {
          break;
        }
        [this.items[i], this.items[smallest]] = [this.items[smallest], this.items[i]];
        i = smallest;
      }
    }
    return top;
  }
}

function kthLargest(nums, k) {
  const heap = new MinHeap();
  for (const n of nums) {
    heap.push(n);
    if (heap.size() > k) {
      heap.pop();
    }
  }
  return heap.peek();
}

function topKFrequent(nums, k) {
  const counts = new Map();
  for (const n of nums) {
    counts.set(n, (counts.get(n) || 0) + 1);
  }
  const entries = [...counts.entries()];
  entries.sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  return entries.slice(0, k).map((entry) => entry[0]);
}
=== LINE BY LINE ===
MinHeap.push: the new item goes at the end of the array (the next free spot in the tree), then bubbles up: while it is smaller than its parent, swap. It climbs at most the height of the tree, which is log n levels.
MinHeap.pop: the smallest is always at position 0. To remove it without leaving a hole, move the LAST item to the top, then sink it: compare with both children, swap with the smaller one if that one is smaller than the item, and repeat. Again at most log n swaps. The array destructuring swap [a, b] = [b, a] swaps two positions in one line.
kthLargest: the heap only ever holds the k biggest numbers seen so far. Whenever it grows past k we throw out its smallest. What is left on top is the smallest of the k biggest, which is exactly the k-th largest. O(n log k), which beats sorting everything when k is small.
topKFrequent: count, then sort the (number, count) pairs. b[1] - a[1] puts bigger counts first. || a[0] - b[0] only runs on a tie (when the first part is 0, which is falsy) and puts the smaller number first.`,
};
