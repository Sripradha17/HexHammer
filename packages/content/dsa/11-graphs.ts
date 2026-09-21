import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "dsa-s11",
  level: 0,
  track: "dsa",
  order: 11,
  title: "Graphs",

  look: `A graph is a set of dots (nodes) joined by lines (edges). Maps are graphs: cities are the dots, roads are the lines. So are friendships on a social network, links between web pages, and the levels of a game.

We store a graph as an ADJACENCY LIST: for every node, the list of its neighbours.

  const graph = {
    A: ["B", "C"],
    B: ["D"],
    C: ["D"],
    D: [],
  };

A tree is a graph with no loops. But a general graph CAN have loops, so a walk could go round and round forever. The fix is a visited Set: remember every node you have already been to and never visit it twice.

  const visited = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const neighbour of graph[current]) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);          // mark BEFORE adding to the queue
        queue.push(neighbour);
      }
    }
  }

BFS (a queue) spreads out in rings: first everything 1 step away, then 2 steps away. So the FIRST time BFS reaches a node is the shortest way there. DFS (a stack or recursion) dives deep.

A grid is a graph too! Each cell's neighbours are the cells above, below, left and right. Counting islands in a grid means: each time you find land you have not seen, count one island, and flood-fill it with a walk so you never count it again.`,

  type: `Solve three problems:
1. hasPath(graph, start, end) is true if you can walk from start to end following the edges. The graph can have loops. A node can always reach itself.
2. shortestPathLength(graph, start, end) is the fewest edges you must follow to get from start to end, or -1 if there is no way. Use BFS. The distance from a node to itself is 0.
3. countIslands(grid) counts groups of connected land in a grid given as an array of strings of "1" (land) and "0" (water). Land connects UP, DOWN, LEFT and RIGHT only (not diagonally). ["11000","11000","00100","00011"] has 3 islands.`,

  break: `Break it on purpose: in hasPath, forget the visited Set.
On a graph with a loop, like A -> B -> A, your walk goes round forever until Hexhammer stops it after 3 seconds. The visited Set is what makes graph walks safe.`,

  say: `In one sentence: why does a graph walk need a visited Set, and why does BFS find the shortest path?`,

  starterCode: `// DSA 11: graphs.

function hasPath(graph, start, end) {
  // can I walk from start to end? beware of loops
}

function shortestPathLength(graph, start, end) {
  // fewest edges from start to end, or -1 (BFS)
}

function countIslands(grid) {
  // grid is an array of strings of "1" and "0"
}
`,

  tests: `const roads = {
  A: ["B", "C"],
  B: ["D"],
  C: ["D", "E"],
  D: ["F"],
  E: [],
  F: [],
  G: ["A"],
};

test("hasPath follows the edges", () => {
  expect(hasPath(roads, "A", "F")).toBe(true);
  expect(hasPath(roads, "A", "E")).toBe(true);
  expect(hasPath(roads, "A", "A")).toBe(true);
});

test("hasPath respects direction", () => {
  expect(hasPath(roads, "F", "A")).toBe(false);
  expect(hasPath(roads, "A", "G")).toBe(false);
});

test("hasPath survives loops", () => {
  const loopy = { X: ["Y"], Y: ["X", "Z"], Z: [], W: [] };
  expect(hasPath(loopy, "X", "Z")).toBe(true);
  expect(hasPath(loopy, "X", "W")).toBe(false);
});

test("shortestPathLength counts edges", () => {
  expect(shortestPathLength(roads, "A", "F")).toBe(3);
  expect(shortestPathLength(roads, "A", "E")).toBe(2);
  expect(shortestPathLength(roads, "A", "A")).toBe(0);
  expect(shortestPathLength(roads, "G", "F")).toBe(4);
});

test("shortestPathLength says -1 when there is no way", () => {
  expect(shortestPathLength(roads, "F", "A")).toBe(-1);
});

test("countIslands", () => {
  expect(countIslands(["11000", "11000", "00100", "00011"])).toBe(3);
  expect(countIslands(["111", "010", "111"])).toBe(1);
  expect(countIslands(["101", "010", "101"])).toBe(5);
  expect(countIslands(["000"])).toBe(0);
  expect(countIslands([])).toBe(0);
});

test("countIslands on a 300 x 300 grid", () => {
  const row = Array.from({ length: 300 }, (_, i) => (i % 2 === 0 ? "1" : "0")).join("");
  const grid = Array.from({ length: 300 }, () => row);
  expect(countIslands(grid)).toBe(150);
});
`,

  hints: [
    "hasPath: BFS or DFS with a visited Set. Start by marking start as visited. When you reach end, return true. When the queue is empty and you never met end, return false.",
    "shortestPathLength: BFS again, but store the distance with each node in the queue (like [node, distance]). The first time you pop end, that distance is the answer.",
    'countIslands: loop over every cell. When you find a "1" you have not visited: add 1 to the count and flood-fill: walk to all connected "1" cells (up, down, left, right), marking each as visited so you never count it again. Use a stack or a queue instead of recursion, so a big island cannot overflow.',
  ],

  solution: `=== CODE ===
function hasPath(graph, start, end) {
  const visited = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === end) {
      return true;
    }
    for (const neighbour of graph[current]) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        queue.push(neighbour);
      }
    }
  }
  return false;
}

function shortestPathLength(graph, start, end) {
  const visited = new Set([start]);
  const queue = [[start, 0]];
  while (queue.length > 0) {
    const [current, distance] = queue.shift();
    if (current === end) {
      return distance;
    }
    for (const neighbour of graph[current]) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        queue.push([neighbour, distance + 1]);
      }
    }
  }
  return -1;
}

function countIslands(grid) {
  const seen = new Set();
  let islands = 0;
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] !== "1" || seen.has(row + "," + col)) {
        continue;
      }
      islands++;
      const stack = [[row, col]];
      seen.add(row + "," + col);
      while (stack.length > 0) {
        const [r, c] = stack.pop();
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = r + dr;
          const nc = c + dc;
          const inside = nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[nr].length;
          if (inside && grid[nr][nc] === "1" && !seen.has(nr + "," + nc)) {
            seen.add(nr + "," + nc);
            stack.push([nr, nc]);
          }
        }
      }
    }
  }
  return islands;
}
=== LINE BY LINE ===
hasPath: the queue holds nodes waiting to be explored, and visited holds every node we have ever added. A node is marked visited when it JOINS the queue, so no node enters twice, and loops cannot trap us. If the queue empties without meeting end, there is no path.
shortestPathLength: the same walk, but each queue entry carries its distance. BFS explores in rings (everything 1 step away, then 2 ...), so the first time we take end out of the queue we got there by the fewest possible edges.
countIslands: scan every cell. A land cell we have not seen starts a new island, and a flood fill (a walk using a stack) visits every land cell connected to it in four directions and marks them as seen. Later scans skip those cells, so each island is counted exactly once. Cells are named "row,col" so a Set can remember them. An explicit stack (instead of recursion) means even a huge island cannot overflow the call stack.`,
};
