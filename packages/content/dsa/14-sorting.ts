import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "dsa-s14",
  level: 0,
  track: "dsa",
  order: 14,
  title: "Sorting",

  look: `Sorting puts things in order. You will never need to write your own sort at work (the built-in one is excellent), but interviews ask about it because it shows how you THINK. Here are the two you must know, and the trap in the built-in sort.

INSERTION SORT: like sorting playing cards in your hand. Take the next card and slide it left until it sits in the right spot among the cards already sorted. Simple, and great for tiny or nearly-sorted lists. Slow for big ones: O(n^2).

MERGE SORT: divide and conquer.
  1. Split the list in half.
  2. Sort each half (by calling yourself: recursion!).
  3. MERGE the two sorted halves into one, always taking the smaller front item (you did exactly this in "Arrays and strings").
  It is always O(n log n), and it is STABLE (equal items keep their original order).

A sort is STABLE if two items that compare equal stay in the same order as before. Stability matters when you sort by one thing and then another.

The trap of the built-in sort: with no help, list.sort() sorts as TEXT!
  [10, 9, 1].sort()                    // [1, 10, 9]   surprise!
  [10, 9, 1].sort((a, b) => a - b)     // [1, 9, 10]   the compare function fixes it

A compare function takes two items and answers with a number: negative means "a goes first", positive means "b goes first", zero means "equal". To sort by one thing, then break ties with another:  a.age - b.age || a.name.localeCompare(b.name)

Also: list.sort() changes the ORIGINAL list. Sort a copy ([...list].sort(...)) unless you mean to change it.`,

  type: `Solve three problems. In all of them, do NOT change the array you were given: return a new one.
1. insertionSort(nums) returns a new sorted array (smallest first) using insertion sort. Do not use the built-in sort.
2. mergeSort(nums) returns a new sorted array using merge sort. Do not use the built-in sort. It must be fast: the tests use 50,000 numbers.
3. sortPeople(people) takes an array of { name, age } and returns a new array sorted by age (youngest first). People of the same age are sorted by name (A to Z). Use the built-in sort with a compare function.`,

  break: `Break it on purpose: in sortPeople, call people.sort(...) directly, without copying first.
The answer looks right, but the ORIGINAL array was reordered too, and the "does not change the input" test fails. Copy first with [...people].`,

  say: `In one sentence: how does merge sort work, and why is a plain list.sort() dangerous for numbers?`,

  starterCode: `// DSA 14: sorting. Never change the input array.

function insertionSort(nums) {
  // slide each item left into its place. Do not use .sort()
}

function mergeSort(nums) {
  // split, sort each half, merge. Do not use .sort()
}

function sortPeople(people) {
  // youngest first; same age: name A to Z. Use .sort() with a compare function
}
`,

  tests: `function makeNumbers(count) {
  let seed = 42;
  const result = [];
  for (let i = 0; i < count; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    result.push((seed % 2001) - 1000);
  }
  return result;
}
function expected(nums) {
  return [...nums].sort((a, b) => a - b);
}

test("insertionSort sorts", () => {
  expect(insertionSort([5, 2, 9, 1, 5, 6])).toEqual([1, 2, 5, 5, 6, 9]);
  expect(insertionSort([3, -1, 0, -7])).toEqual([-7, -1, 0, 3]);
  expect(insertionSort([10, 9, 1])).toEqual([1, 9, 10]);
});

test("insertionSort edge cases and no changing the input", () => {
  expect(insertionSort([])).toEqual([]);
  expect(insertionSort([4])).toEqual([4]);
  const original = [3, 1, 2];
  insertionSort(original);
  expect(original).toEqual([3, 1, 2]);
});

test("insertionSort on 1,000 numbers matches the built-in sort", () => {
  const nums = makeNumbers(1000);
  expect(insertionSort(nums)).toEqual(expected(nums));
});

test("mergeSort sorts", () => {
  expect(mergeSort([5, 2, 9, 1, 5, 6])).toEqual([1, 2, 5, 5, 6, 9]);
  expect(mergeSort([10, 9, 1])).toEqual([1, 9, 10]);
  expect(mergeSort([])).toEqual([]);
  expect(mergeSort([4])).toEqual([4]);
});

test("mergeSort does not change the input", () => {
  const original = [3, 1, 2];
  mergeSort(original);
  expect(original).toEqual([3, 1, 2]);
});

test("mergeSort on 50,000 numbers is fast and right", () => {
  const nums = makeNumbers(50000);
  expect(mergeSort(nums)).toEqual(expected(nums));
});

test("sortPeople sorts by age, then name", () => {
  const people = [
    { name: "Zoe", age: 30 },
    { name: "Adam", age: 25 },
    { name: "Bea", age: 30 },
    { name: "Cy", age: 20 },
  ];
  expect(sortPeople(people).map((p) => p.name)).toEqual(["Cy", "Adam", "Bea", "Zoe"]);
});

test("sortPeople does not change the input", () => {
  const people = [{ name: "B", age: 2 }, { name: "A", age: 1 }];
  sortPeople(people);
  expect(people[0].name).toBe("B");
  expect(sortPeople([])).toEqual([]);
});
`,

  hints: [
    "insertionSort: copy the array first. For each position i from 1 upward, take the item, and shift every bigger item in the sorted part one place to the right, then drop the item into the gap.",
    "mergeSort: if the array has 0 or 1 items, return a copy of it. Otherwise cut it at the middle, mergeSort each half, and merge the two sorted halves: two fingers, always take the smaller front item.",
    "sortPeople: [...people].sort((a, b) => a.age - b.age || a.name.localeCompare(b.name)). The || part only matters when the ages are equal (a.age - b.age is 0).",
  ],

  solution: `=== CODE ===
function insertionSort(nums) {
  const sorted = [...nums];
  for (let i = 1; i < sorted.length; i++) {
    const item = sorted[i];
    let j = i - 1;
    while (j >= 0 && sorted[j] > item) {
      sorted[j + 1] = sorted[j];
      j--;
    }
    sorted[j + 1] = item;
  }
  return sorted;
}

function mergeSort(nums) {
  if (nums.length <= 1) {
    return [...nums];
  }
  const middle = Math.floor(nums.length / 2);
  const left = mergeSort(nums.slice(0, middle));
  const right = mergeSort(nums.slice(middle));
  const merged = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      merged.push(left[i]);
      i++;
    } else {
      merged.push(right[j]);
      j++;
    }
  }
  while (i < left.length) {
    merged.push(left[i]);
    i++;
  }
  while (j < right.length) {
    merged.push(right[j]);
    j++;
  }
  return merged;
}

function sortPeople(people) {
  return [...people].sort((a, b) => a.age - b.age || a.name.localeCompare(b.name));
}
=== LINE BY LINE ===
insertionSort: we work on a copy. Everything left of position i is already sorted. We lift item i out, shift every bigger item one place right to open a gap, and drop the item into the gap. For a list that is already sorted it does almost nothing, but the worst case is O(n^2).
mergeSort: a list of 0 or 1 items is already sorted (the base case). Otherwise we cut it in half, sort each half by calling ourselves, and merge. The merge takes the smaller front item each time. Using <= when the fronts are equal takes from the LEFT half first, which keeps equal items in their original order (that is what makes it stable). The list is halved log n times and each level costs n work, so O(n log n).
sortPeople: a.age - b.age is negative, zero or positive, exactly what a compare function must return. When ages tie the difference is 0, which is falsy, so the || moves on to compare the names. Copying first with [...people] protects the original array.`,
};
