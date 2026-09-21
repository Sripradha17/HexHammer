import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "dsa-s10",
  level: 0,
  track: "dsa",
  order: 10,
  title: "Trees with BFS/DFS",

  look: `A tree is like a family tree or a folder structure: one node at the top (the root), and each node can have children below it. In a BINARY tree every node has at most two children: a left and a right.

        4                 each node: { value, left, right }
       / \\                a missing child is null
      2   6
     / \\ / \\
    1  3 5  7

Two ways to walk through every node:

  DFS (depth-first) goes as DEEP as possible first, like exploring one corridor of a maze to the end before trying the next. It is naturally RECURSIVE:

    function visit(node) {
      if (node === null) { return; }      // base case: nothing here
      visit(node.left);
      visit(node.right);
    }

  BFS (breadth-first) goes LEVEL by level, like ripples spreading in a pond. It uses a QUEUE:

    const queue = [root];
    while (queue.length > 0) {
      const node = queue.shift();
      // use node, then add its children to the back of the queue
    }

Level-by-level trick: at the start of each round, note how many nodes are in the queue right now (that is one whole level), and process exactly that many.

A Binary Search Tree (BST) keeps a rule: everything in the LEFT part is smaller than the node, everything in the RIGHT part is bigger. That makes searching quick, like binary search.

The starter file gives you the little builder  node(value, left, right)  so you can make trees easily.`,

  type: `Solve three problems (node(value, left, right) is already written for you):
1. maxDepth(root) is the number of levels in the tree. An empty tree (null) has depth 0. A single node has depth 1. Use DFS recursion.
2. levelOrder(root) returns the values level by level as an array of arrays, like [[4],[2,6],[1,3,5,7]]. Use BFS with a queue. An empty tree gives [].
3. isValidBST(root) is true if the tree follows the BST rule for EVERY node (not just each node's direct children). An empty tree is valid.`,

  break: `Break it on purpose: in isValidBST, only compare each node with its direct left and right child.
A tree like 5 with a right child 7 whose left child is 3 passes that weak check, but 3 is on the right side of 5, so it is NOT a valid BST. You must pass down the allowed range (a minimum and a maximum) to every node.`,

  say: `In one sentence: what is the difference between DFS and BFS, and what data structure does each use?`,

  starterCode: `// DSA 10: trees.

// Helper (already written): builds one tree node
const node = (value, left = null, right = null) => ({ value, left, right });

function maxDepth(root) {
  // number of levels (DFS)
}

function levelOrder(root) {
  // [[level 0 values], [level 1 values], ...] (BFS)
}

function isValidBST(root) {
  // every node must fit the smaller-left, bigger-right rule
}
`,

  tests: `const perfect = node(4, node(2, node(1), node(3)), node(6, node(5), node(7)));

test("maxDepth counts levels", () => {
  expect(maxDepth(perfect)).toBe(3);
  expect(maxDepth(node(1))).toBe(1);
  expect(maxDepth(null)).toBe(0);
  expect(maxDepth(node(1, node(2, node(3, node(4)))))).toBe(4);
});

test("levelOrder goes level by level", () => {
  expect(levelOrder(perfect)).toEqual([[4], [2, 6], [1, 3, 5, 7]]);
  expect(levelOrder(node(1, null, node(2)))).toEqual([[1], [2]]);
  expect(levelOrder(null)).toEqual([]);
});

test("isValidBST accepts a real BST", () => {
  expect(isValidBST(perfect)).toBe(true);
  expect(isValidBST(null)).toBe(true);
  expect(isValidBST(node(1))).toBe(true);
});

test("isValidBST rejects direct mistakes", () => {
  expect(isValidBST(node(2, node(3), node(1)))).toBe(false);
  expect(isValidBST(node(2, node(2), null))).toBe(false);
});

test("isValidBST rejects a deep mistake (3 is on the right side of 5)", () => {
  const sneaky = node(5, node(1), node(7, node(3), node(9)));
  expect(isValidBST(sneaky)).toBe(false);
});

test("a very unbalanced tree of 5,000 nodes", () => {
  let chain = null;
  for (let i = 5000; i >= 1; i--) { chain = node(i, null, chain); }
  expect(maxDepth(chain)).toBe(5000);
  expect(levelOrder(chain).length).toBe(5000);
  expect(isValidBST(chain)).toBe(true);
});
`,

  hints: [
    "maxDepth: the base case is null (depth 0). Otherwise the depth is 1 plus the bigger of the left depth and the right depth: 1 + Math.max(maxDepth(root.left), maxDepth(root.right)).",
    "levelOrder: start with queue = [root] (if root is null return []). While the queue has items: let size = queue.length (this is one level). Repeat size times: take from the front, save its value, add its left and right children if they exist. Push that level's list into the result.",
    "isValidBST: write a helper check(node, min, max) where min and max start as null (no limit). A null node is fine. The node's value must be greater than min and less than max (when they are not null). Then check the left side with max = node.value, and the right side with min = node.value.",
  ],

  solution: `=== CODE ===
// The helper from the starter file, unchanged
const node = (value, left = null, right = null) => ({ value, left, right });

function maxDepth(root) {
  if (root === null) {
    return 0;
  }
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

function levelOrder(root) {
  if (root === null) {
    return [];
  }
  const levels = [];
  const queue = [root];
  while (queue.length > 0) {
    const size = queue.length;
    const level = [];
    for (let i = 0; i < size; i++) {
      const current = queue.shift();
      level.push(current.value);
      if (current.left !== null) {
        queue.push(current.left);
      }
      if (current.right !== null) {
        queue.push(current.right);
      }
    }
    levels.push(level);
  }
  return levels;
}

function isValidBST(root) {
  function check(current, min, max) {
    if (current === null) {
      return true;
    }
    if (min !== null && current.value <= min) {
      return false;
    }
    if (max !== null && current.value >= max) {
      return false;
    }
    return check(current.left, min, current.value) && check(current.right, current.value, max);
  }
  return check(root, null, null);
}
=== LINE BY LINE ===
maxDepth: an empty tree has depth 0 (the base case). Otherwise the tree is the root (1 level) plus whichever side goes deeper. DFS recursion visits every node once: O(n).
levelOrder: the queue always holds the nodes of the current level and, behind them, the children we have collected for the next one. Taking "size" items at the start of a round processes exactly one level. Children are added to the back, so they wait for the next round. That is BFS.
isValidBST: each node has an allowed range (min, max), exclusive. The root can be anything. Going left, everything must be SMALLER than the parent, so the parent's value becomes the new max. Going right, everything must be BIGGER, so it becomes the new min. Passing the range down catches deep mistakes, like a 3 hiding in the right side of a 5.`,
};
