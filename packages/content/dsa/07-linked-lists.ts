import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "dsa-s07",
  level: 0,
  track: "dsa",
  order: 7,
  title: "Linked lists",

  look: `A linked list is a chain of little boxes. Each box (a node) holds a value and an ARROW to the next box. There is no numbered row like an array: to reach the 5th item you must follow 4 arrows from the start.

  1 -> 2 -> 3 -> null        each node: { value, next }

  class ListNode {
    constructor(value, next = null) { this.value = value; this.next = next; }
  }

The first node is called the head. The last node's next is null. That null is how you know you reached the end.

  let current = head;
  while (current !== null) {
    // use current.value
    current = current.next;        // follow the arrow
  }

Why use one? Adding or removing in the middle is cheap: you only change arrows, no shifting. The price: no jumping to position i.

Three classic tricks:
  REVERSING   walk along, and flip each arrow to point BACKWARD. You need three names: previous, current, and next (saved before you flip!).
  FAST AND SLOW POINTERS   two walkers, one takes 1 step and the other takes 2. If the list has a loop (a cycle), the fast walker eventually laps the slow one and they meet. If there is no loop, fast reaches null. It is the tortoise and the hare!
  DUMMY HEAD   start with a fake first node so you never have to treat "the first node" as a special case.

The starter file already gives you ListNode, fromArray (builds a list from an array) and toArray (reads a list back into an array), so you can concentrate on the problems.`,

  type: `Solve three problems (the helpers ListNode, fromArray and toArray are already written for you):
1. reverseList(head) reverses the list and returns the NEW head. Reverse the arrows, do not create new nodes.
2. hasCycle(head) is true if following next arrows ever loops back on itself. Use slow and fast pointers, no Set. An empty list has no cycle.
3. mergeTwoLists(a, b) takes two SORTED lists and returns one sorted list made by relinking the existing nodes. Either list may be empty (null).`,

  break: `Break it on purpose: in reverseList, flip current.next = previous BEFORE you save current.next in a variable.
You lose the rest of the list, because you overwrote the only arrow that led to it. Always save the next node first.`,

  say: `In one sentence: how do the slow and fast pointers prove that a linked list has a cycle?`,

  starterCode: `// DSA 7: linked lists.

class ListNode {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
  }
}

// Helpers (already written for you)
function fromArray(values) {
  let head = null;
  for (let i = values.length - 1; i >= 0; i--) {
    head = new ListNode(values[i], head);
  }
  return head;
}

function toArray(head) {
  const values = [];
  let current = head;
  while (current !== null) {
    values.push(current.value);
    current = current.next;
  }
  return values;
}

function reverseList(head) {
  // flip every arrow, return the new head
}

function hasCycle(head) {
  // slow and fast pointers
}

function mergeTwoLists(a, b) {
  // merge two sorted lists by relinking nodes
}
`,

  tests: `test("reverseList reverses", () => {
  expect(toArray(reverseList(fromArray([1, 2, 3, 4])))).toEqual([4, 3, 2, 1]);
  expect(toArray(reverseList(fromArray([1])))).toEqual([1]);
});

test("reverseList of an empty list is empty", () => {
  expect(reverseList(null)).toBe(null);
});

test("reverseList reuses the same nodes", () => {
  const head = fromArray([1, 2, 3]);
  const newHead = reverseList(head);
  expect(newHead.value).toBe(3);
  expect(head.next).toBe(null);
});

test("hasCycle says no for a plain list", () => {
  expect(hasCycle(fromArray([1, 2, 3, 4]))).toBe(false);
  expect(hasCycle(null)).toBe(false);
  expect(hasCycle(fromArray([1]))).toBe(false);
});

test("hasCycle says yes when the tail points back", () => {
  const head = fromArray([1, 2, 3, 4]);
  head.next.next.next.next = head.next;
  expect(hasCycle(head)).toBe(true);
});

test("hasCycle with a node pointing at itself", () => {
  const head = fromArray([1]);
  head.next = head;
  expect(hasCycle(head)).toBe(true);
});

test("mergeTwoLists merges sorted lists", () => {
  const merged = mergeTwoLists(fromArray([1, 3, 5]), fromArray([2, 4, 6]));
  expect(toArray(merged)).toEqual([1, 2, 3, 4, 5, 6]);
  expect(toArray(mergeTwoLists(fromArray([1, 1]), fromArray([1])))).toEqual([1, 1, 1]);
});

test("mergeTwoLists with empty lists", () => {
  expect(toArray(mergeTwoLists(null, fromArray([1, 2])))).toEqual([1, 2]);
  expect(toArray(mergeTwoLists(fromArray([3]), null))).toEqual([3]);
  expect(mergeTwoLists(null, null)).toBe(null);
});

test("all three handle a list of 100,000 nodes", () => {
  const values = Array.from({ length: 100000 }, (_, i) => i);
  const reversed = reverseList(fromArray(values));
  expect(reversed.value).toBe(99999);
  expect(hasCycle(fromArray(values))).toBe(false);
  const merged = mergeTwoLists(fromArray(values), fromArray(values));
  expect(toArray(merged).length).toBe(200000);
});
`,

  hints: [
    "reverseList: keep previous (start null) and current (start head). In a loop: save const next = current.next; then point current.next = previous; then move previous = current; current = next. At the end previous is the new head.",
    "hasCycle: slow and fast both start at head. In a loop while fast and fast.next are not null: move slow one step, fast two steps. If they are ever the same node, return true. If the loop ends, return false.",
    "mergeTwoLists: make a dummy node as the fake start and a tail pointer. While both lists have nodes, attach the smaller front node to tail and step that list forward. When one runs out, attach the rest of the other. Return dummy.next.",
  ],

  solution: `=== CODE ===
class ListNode {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
  }
}

// The helpers from the starter file, unchanged
function fromArray(values) {
  let head = null;
  for (let i = values.length - 1; i >= 0; i--) {
    head = new ListNode(values[i], head);
  }
  return head;
}

function toArray(head) {
  const values = [];
  let current = head;
  while (current !== null) {
    values.push(current.value);
    current = current.next;
  }
  return values;
}

function reverseList(head) {
  let previous = null;
  let current = head;
  while (current !== null) {
    const next = current.next;
    current.next = previous;
    previous = current;
    current = next;
  }
  return previous;
}

function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      return true;
    }
  }
  return false;
}

function mergeTwoLists(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (a !== null && b !== null) {
    if (a.value <= b.value) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a !== null ? a : b;
  return dummy.next;
}
=== LINE BY LINE ===
reverseList: three names walk down the chain. Save next FIRST (otherwise flipping the arrow loses the rest of the list). Flip the arrow to point backward. Then everyone steps forward. When current runs off the end, previous is the last real node, which is the new head. O(n) time, O(1) memory.
hasCycle: the hare (fast) moves two steps for every one of the tortoise (slow). In a straight list the hare hits the end and stops. In a loop both run around the ring forever, and because the hare gains one step per turn it must eventually land exactly on the tortoise. No Set needed, so O(1) memory.
mergeTwoLists: the dummy node is a fake starting point, so we never have to ask "is this the first node?". We always attach the smaller front node to the tail and step that list forward. When one list is used up, the other is already sorted, so we hang it on the end in one move. dummy.next is the real head.`,
};
