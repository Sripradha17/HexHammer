// Topic: Trees and graphs. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csTreesGraphs: Topic = {
  id: "cs-trees-graphs",
  domainId: "",
  moduleId: "",
  title: "Trees and graphs",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Traverse a tree with depth-first and breadth-first search.",
    "Explain how a binary search tree keeps lookups fast, and when it does not.",
    "Represent a graph with an adjacency list and find a shortest path in an unweighted graph.",
    "Order tasks with dependencies using a topological sort.",
  ],
  prerequisites: ["cs-linear-structures", "cs-call-stack-recursion"],
  subtopics: ["Tree vocabulary", "DFS: pre, in, post order", "BFS level by level", "Binary search trees", "Balance", "Graphs: adjacency lists", "Shortest path with BFS", "Cycles and topological sort"],
  strikeIds: ["dsa-s10", "dsa-s11"],

  story:
    "A build tool must compile 400 packages, each depending on others, in an order where nothing builds before its dependencies. A social app wants 'people you may know' within two connections. A file explorer must show folders inside folders. All three are graphs and trees, and all three are solved with the same two walks: go deep first, or go wide first.",
  mentalModel: {
    plain:
      "A graph is a set of nodes connected by edges (friends, roads, imports). A tree is a graph with no cycles and one root, where every node has exactly one parent. Depth-first search (DFS) follows one path as far as it goes before backing up, using a stack or recursion. Breadth-first search (BFS) visits all neighbours first, then their neighbours, using a queue, so it finds the shortest path in steps.",
    analogy:
      "Exploring a maze. DFS: keep one hand on the wall and go as deep as you can, back up at dead ends. BFS: send a ring of explorers outwards one step at a time, so the first one to reach the exit took the fewest steps.",
    analogyLimit:
      "In a maze every step costs the same. When edges have different costs (road lengths), BFS no longer finds the cheapest route; you need Dijkstra's algorithm.",
  },
  lessonSections: [
    {
      heading: "1. Tree words",
      body:
        "Root: the top node. Children and parent: direct links. Leaf: a node with no children. Depth: how far a node is from the root. Height: the longest root-to-leaf path. A binary tree gives each node at most two children, left and right.\n\nThe DOM, file systems, JSON, comment threads and org charts are trees.",
    },
    {
      heading: "2. Depth-first traversal",
      body:
        "Visit a node, then recursively visit its children. The three orders for binary trees:\n\nPre-order: node, left, right (copying a tree, printing folders).\nIn-order: left, node, right (gives a binary search tree's values sorted).\nPost-order: left, right, node (deleting, or totals computed from children).\n\nRecursion uses the call stack; for very deep trees use an explicit stack.",
    },
    {
      heading: "3. Breadth-first traversal",
      body:
        "Put the root in a queue. Repeatedly take the front node, visit it, and add its children to the back. Nodes come out level by level.\n\nUse it for level-order printing, the nearest matching node, and shortest paths when every edge counts as one step.",
    },
    {
      heading: "4. Binary search trees",
      body:
        "In a BST, everything in a node's left subtree is smaller and everything in its right subtree is larger. A lookup compares and goes left or right, discarding half the tree each step when it is balanced: O(log n).\n\nInsert sorted data into a plain BST and it becomes a long chain: O(n). Self-balancing trees (red-black, AVL) and B-trees (inside database indexes) keep the height O(log n).",
    },
    {
      heading: "5. Graphs and adjacency lists",
      body:
        "Store a graph as a Map from each node to an array of its neighbours: the adjacency list. Edges can be directed (follows) or undirected (friends), weighted or not.\n\nUnlike trees, graphs can have cycles, so every traversal keeps a visited Set, or it may loop forever.",
    },
    {
      heading: "6. Topological sort: dependencies in order",
      body:
        "In a directed graph with no cycles (a DAG), a topological order lists every node after all the nodes it depends on: build order, course prerequisites, task scheduling.\n\nKahn's algorithm: count each node's incoming edges, start with nodes that have none, and each time you output a node, decrease its dependents' counts. If nodes remain that never reach zero, there is a cycle.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "The worked example prints the visit order of DFS and BFS on the same graph and a shortest path, which makes the two strategies visible line by line; the project builds the visual explorer.",
  codeExamples: [
    {
      title: "DFS vs BFS on the same graph, and a shortest path",
      language: "js",
      code: `const graph = new Map([
  ["A", ["B", "C"]],
  ["B", ["D"]],
  ["C", ["D", "E"]],
  ["D", ["F"]],
  ["E", ["F"]],
  ["F", []],
]);

function dfs(node, seen = new Set(), order = []) {
  if (seen.has(node)) return order;
  seen.add(node);
  order.push(node);
  for (const next of graph.get(node)) dfs(next, seen, order);
  return order;
}

function shortestPath(start, goal) {
  const queue = [[start]];
  const seen = new Set([start]);
  for (let i = 0; i < queue.length; i++) {        // i acts as the queue's head
    const path = queue[i];
    const node = path.at(-1);
    if (node === goal) return path;
    for (const next of graph.get(node)) {
      if (!seen.has(next)) { seen.add(next); queue.push([...path, next]); }
    }
  }
  return null;
}

console.log("DFS:", dfs("A").join(" "));
console.log("Shortest A to F:", shortestPath("A", "F").join(" -> "));`,
      expectedOutput: `DFS: A B D F C E
Shortest A to F: A -> B -> D -> F`,
      steps: [
        "DFS from A goes deep first: A, then B, then B's neighbour D, then D's neighbour F. Only when that path is exhausted does it back up to try C, then E. F is already seen, so it is not visited twice.",
        "BFS starts with the path [A] in the queue and explores outward one step at a time, storing whole paths.",
        "Paths of length 2 (A-B, A-C) are explored before length 3 (A-B-D, A-C-E...), so the first path that reaches F is a shortest one: A, B, D, F (3 edges).",
        "The visited Set stops nodes being queued twice, which also protects against cycles.",
      ],
    },
  ],
  practicalApplication:
    "Trees: rendering nested UI (menus, comments, file trees), walking the DOM, parsing (compilers build syntax trees), database indexes (B-trees). Graphs: dependency resolution in package managers and build tools (topological sort, cycle detection), social connections and recommendations (BFS within N hops), routing and maps (Dijkstra), permission inheritance. In interviews, tree and graph traversal questions are among the most frequent at every level.",
  commonMistakes: [
    {
      mistake: "Forgetting a visited set on graphs.",
      symptom: "Infinite loops or exponential work on graphs with cycles or shared nodes.",
      fix: "Mark a node visited when you first discover it, before exploring further.",
    },
    {
      mistake: "Using DFS when the question asks for the fewest steps.",
      symptom: "A valid but longer path is returned.",
      fix: "Use BFS for shortest paths in unweighted graphs; Dijkstra when edges have weights.",
    },
    {
      mistake: "Assuming a BST is always O(log n).",
      symptom: "Lookups become slow after inserting data that was already sorted.",
      fix: "Use a balanced tree or a library/database index; check the tree's height.",
    },
  ],
  misconceptions: [
    { myth: "Trees and graphs are different subjects.", truth: "A tree is a special graph: connected, no cycles, one path between any two nodes." },
    { myth: "BFS and DFS find different sets of nodes.", truth: "Both reach every node reachable from the start; they differ only in the order, which matters for shortest paths and memory." },
    { myth: "Recursion is required for DFS.", truth: "An explicit stack gives the same order without risking a stack overflow on deep graphs." },
  ],
  exercises: [
    { kind: "strike", strikeId: "dsa-s10", why: "Write tree traversals by hand: pre, in, post and level order." },
    { kind: "strike", strikeId: "dsa-s11", why: "Model a graph with an adjacency list and search it." },
    {
      kind: "predict",
      question: {
        id: "cs-trees-graphs-p1",
        prompt: "A binary search tree is built by inserting 8, 3, 10, 1, 6 in that order. What does an in-order traversal print?",
        choices: ["8 3 10 1 6", "1 3 6 8 10", "8 3 1 6 10", "1 6 3 10 8"],
        answerIndex: 1,
        explanation: "In-order (left, node, right) on a BST always produces the values in sorted order. 8 3 1 6 10 would be pre-order; 1 6 3 10 8 post-order.",
        objective: 1,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-trees-graphs-k1",
      prompt: "Which data structure does BFS rely on?",
      choices: ["A stack", "A queue", "A heap", "A hash map only"],
      answerIndex: 1,
      explanation: "BFS processes nodes in the order they were discovered: first in, first out.",
      objective: 0,
    },
    {
      id: "cs-trees-graphs-k2",
      prompt: "Package A needs B, B needs C, C needs A. What does a topological sort report?",
      choices: ["A, B, C", "C, B, A", "A cycle: no valid order exists", "Any order works"],
      answerIndex: 2,
      explanation: "Topological order only exists for graphs without cycles; Kahn's algorithm detects nodes whose counts never reach zero.",
      objective: 3,
    },
  ],
  project: {
    title: "Build Planner: dependency graphs, build order and impact analysis",
    summary: "Read a set of packages and their dependencies, compute a valid build order, detect cycles with a clear message, and answer 'what must rebuild if this package changes?'.",
    type: "implementation",
    objectivesCovered: [0, 2, 3],
    requirements: [
      "Parse a JSON file of packages and their dependencies into an adjacency list.",
      "Kahn's algorithm for a build order; on a cycle, report the packages involved.",
      "Reverse the edges and use BFS to list every package affected by a change, with its distance.",
      "Group packages into 'waves' that can build in parallel (same level of the order).",
    ],
    acceptanceCriteria: [
      "A test shows every package appears after all its dependencies.",
      "A test with a cycle reports exactly the packages in the cycle.",
      "A test checks the affected set and distances for a diamond-shaped graph.",
    ],
    technologies: ["TypeScript", "Vitest"],
    milestones: [
      { title: "Graph", done_when: "Packages load into an adjacency list with tests." },
      { title: "Order", done_when: "Topological sort and cycle detection are tested." },
      { title: "Impact", done_when: "Reverse BFS lists affected packages with distances." },
      { title: "Waves", done_when: "Parallel build waves are computed and printed." },
    ],
    testIdeas: ["Empty graph", "Self-dependency", "Disconnected packages"],
    stretchGoals: ["Read real dependencies from an npm workspace", "Render the graph as an SVG"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-trees-graphs-a1",
        prompt: "Which traversal visits a tree level by level?",
        choices: ["Pre-order DFS", "In-order DFS", "Post-order DFS", "BFS"],
        answerIndex: 3,
        explanation: "BFS uses a queue, so it finishes each level before starting the next.",
        objective: 0,
      },
      {
        id: "cs-trees-graphs-a2",
        prompt: "Why can lookups in a binary search tree degrade to O(n)?",
        choices: ["Comparisons are slow", "If keys are inserted in sorted order, the tree becomes a long chain", "Trees cannot store numbers", "Because of recursion"],
        answerIndex: 1,
        explanation: "Without balancing, sorted inserts always go to the same side, so height becomes n.",
        objective: 1,
      },
      {
        id: "cs-trees-graphs-a3",
        prompt: "What is the best algorithm for the fewest hops between two users in a friendship graph?",
        choices: ["DFS", "BFS", "Sorting", "Binary search"],
        answerIndex: 1,
        explanation: "Every friendship counts as one step, so BFS finds a shortest path first.",
        objective: 2,
      },
      {
        id: "cs-trees-graphs-a4",
        prompt: "In Kahn's topological sort, which nodes start in the queue?",
        choices: ["Nodes with no outgoing edges", "Nodes with no incoming edges (no unmet dependencies)", "All nodes", "The node with the most edges"],
        answerIndex: 1,
        explanation: "A node with nothing it depends on can be done first. Removing it may free its dependents.",
        objective: 3,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-trees-graphs-q01", tags: ["bfs", "dfs"], difficulty: "core", kind: "concept",
      prompt: "Compare BFS and DFS. When do you use each?",
      expectedElements: ["BFS: queue, level order, shortest path unweighted", "DFS: stack/recursion, deep first", "DFS for cycle detection, topological sort, backtracking", "memory differences"],
      modelAnswer: "BFS explores neighbours level by level using a queue, so it finds shortest paths in unweighted graphs and suits 'nearest' questions, but can hold a whole level in memory. DFS goes as deep as possible using recursion or a stack, uses memory proportional to depth, and suits exhaustive search, cycle detection, topological ordering and backtracking. Both are O(V + E) with an adjacency list.",
      explanation: "Use cases plus complexity is complete.",
      commonWrongAnswers: ["DFS is always faster."],
    },
    {
      id: "cs-trees-graphs-q02", tags: ["trees"], difficulty: "core", kind: "implementation",
      prompt: "How do you check if a binary tree is a valid binary search tree?",
      expectedElements: ["pass min/max bounds down", "every node within (min, max)", "or in-order traversal strictly increasing", "common mistake: only comparing with children"],
      modelAnswer: "Recursively pass allowed bounds down: the root can be anything, a left child must be less than its parent's value and greater than the parent's own lower bound, and similarly for the right. If any node falls outside its range, it is invalid. Alternatively, an in-order traversal must produce strictly increasing values. Comparing each node only with its direct children is the classic mistake, because a deep descendant can violate an ancestor's rule.",
      explanation: "Naming the common mistake is a strong signal.",
      commonWrongAnswers: ["Check left < node < right for each node only."],
    },
    {
      id: "cs-trees-graphs-q03", tags: ["graphs", "representation"], difficulty: "foundation", kind: "concept",
      prompt: "Adjacency list or adjacency matrix: which and why?",
      expectedElements: ["list: O(V + E) space, good for sparse", "matrix: O(V²), O(1) edge check, dense graphs", "most real graphs sparse"],
      modelAnswer: "An adjacency list stores each node's neighbours, using O(V + E) space, and iterating neighbours is cheap, so it suits sparse graphs, which most real ones are (social networks, dependencies). An adjacency matrix uses O(V²) space but answers 'is there an edge between u and v?' in O(1), so it suits small or dense graphs.",
      explanation: "Sparse versus dense is the deciding factor.",
      commonWrongAnswers: ["Matrices are always better."],
    },
    {
      id: "cs-trees-graphs-q04", tags: ["topological-sort"], difficulty: "core", kind: "scenario",
      prompt: "How would you find the order to take university courses given their prerequisites?",
      expectedElements: ["model as directed graph", "topological sort (Kahn or DFS)", "detect cycle = impossible", "O(V + E)"],
      modelAnswer: "Model courses as nodes with an edge from each prerequisite to the course that needs it. A topological sort gives a valid order: with Kahn's algorithm, start from courses with no prerequisites, take them, reduce their dependents' remaining-prerequisite counts, and enqueue any that reach zero. If some courses are never reached, there is a cycle and no valid order exists. It runs in O(V + E).",
      explanation: "A very common interview problem ('course schedule').",
      commonWrongAnswers: ["Sort courses alphabetically."],
    },
    {
      id: "cs-trees-graphs-q05", tags: ["trees", "recursion"], difficulty: "foundation", kind: "implementation",
      prompt: "How would you compute the maximum depth of a binary tree, recursively and iteratively?",
      expectedElements: ["recursive: 1 + max(left, right)", "iterative: BFS counting levels", "O(n)"],
      modelAnswer: "Recursively: an empty node has depth 0, otherwise 1 plus the larger depth of its two subtrees. Iteratively: BFS with a queue, processing one whole level per loop iteration and counting the levels. Both visit every node once, O(n); recursion uses O(height) stack space, BFS up to the width of the widest level.",
      explanation: "Two approaches with complexity is ideal.",
      commonWrongAnswers: ["Count all nodes."],
    },
    {
      id: "cs-trees-graphs-q06", tags: ["graphs", "dijkstra"], difficulty: "advanced", kind: "concept",
      prompt: "When does BFS fail to give the shortest path, and what do you use instead?",
      expectedElements: ["weighted edges", "Dijkstra with a priority queue", "non-negative weights", "Bellman-Ford for negative"],
      modelAnswer: "BFS counts steps, so it fails when edges have different costs, like road distances: two short roads may beat one long one. Dijkstra's algorithm handles non-negative weights by always expanding the closest unexplored node, using a priority queue, in O((V + E) log V). With negative weights you need Bellman-Ford.",
      explanation: "Links to the heaps topic.",
      commonWrongAnswers: ["BFS always finds shortest paths."],
    },
    {
      id: "cs-trees-graphs-q07", tags: ["graphs", "islands"], difficulty: "core", kind: "implementation",
      prompt: "Count the islands in a grid of land and water cells.",
      expectedElements: ["grid as implicit graph", "for each unvisited land cell start DFS/BFS", "mark connected land visited", "count starts", "O(rows × cols)"],
      modelAnswer: "Treat the grid as a graph where each land cell connects to its land neighbours up, down, left and right. Scan every cell; when I find unvisited land, I increase the island count and run DFS or BFS from it to mark all connected land as visited. Each cell is visited once, so it is O(rows × cols) time.",
      explanation: "Grids as implicit graphs is a key pattern.",
      commonWrongAnswers: ["Count all land cells."],
    },
    {
      id: "cs-trees-graphs-q08", tags: ["trees", "real-world"], difficulty: "core", kind: "concept",
      prompt: "Why do databases use B-trees for indexes instead of binary search trees?",
      expectedElements: ["many keys per node, wide and shallow", "few disk/page reads", "always balanced", "range scans via sorted leaves"],
      modelAnswer: "A B-tree node holds many keys and many children, so the tree is very wide and shallow: millions of rows need only three or four levels, and each level is one page read from disk. B-trees stay balanced automatically, and their sorted leaves make range queries efficient. A binary tree would be much taller, needing many more slow page reads.",
      explanation: "Connects algorithms to the database topic.",
      commonWrongAnswers: ["B-trees are binary trees."],
    },
  ],
  references: [
    { title: "Introduction to Algorithms (CLRS), ch. 12 and 20: BSTs and Elementary Graph Algorithms", url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/", kind: "book" },
    { title: "MIT 6.006 Introduction to Algorithms (OpenCourseWare)", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", kind: "course" },
    { title: "MDN: Introduction to the DOM (a tree)", url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction", kind: "official-docs" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Tree and graph traversal, BSTs and topological sort are fundamental and unchanging."],
  versionSpecific: [],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
