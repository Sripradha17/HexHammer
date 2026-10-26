import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s13",
  level: 4,
  order: 13,
  title: "Browser storage",
  runner: "iframe",

  look: `localStorage is a little box of storage that lives in the VISITOR's browser and survives even after they close the tab. It is perfect for small things like "remember which theme they picked" (Hexhammer's own dark mode toggle uses it for exactly that).

  localStorage.setItem("theme", "dark");   // save
  localStorage.getItem("theme");           // "dark" (or null if never set)
  localStorage.removeItem("theme");        // forget it

localStorage only stores TEXT. To save an object or a number, turn it into text first with JSON.stringify, and turn it back with JSON.parse when you read it:

  localStorage.setItem("scores", JSON.stringify([1, 2, 3]));
  const scores = JSON.parse(localStorage.getItem("scores"));

A quick safety note: THIS practice page runs in an extra-locked-down sandbox (on purpose, so learner code can never be dangerous), which blocks the REAL localStorage. The starter code below gives you fakeStorage, a stand-in with the exact same shape, so you practise the real pattern safely.`,

  type: `Write two functions using fakeStorage (it works exactly like localStorage):
1. saveName(name) saves name under the key "name".
2. loadName() reads the key "name" back and returns it, or returns "friend" if nothing has been saved yet (fakeStorage.getItem gives back null when a key is missing).`,

  break: `Break it on purpose: in loadName, return fakeStorage.getItem("name") directly, without the "friend" fallback for when it is null. Run the tests: the very first time (nothing saved yet) it returns null instead of a friendly default. Real pages often forget this exact check and show "Hello, null" to a first-time visitor. Put the fallback back.`,

  say: `In one sentence: why does localStorage only store text, and what do you do about it?`,

  starterCode: `<!-- Strike 13: browser storage. -->
<script>
  // Given: a pretend localStorage, so this strike works inside our extra-safe sandbox.
  function makeFakeStorage() {
    const data = {};
    return {
      setItem(key, value) { data[key] = String(value); },
      getItem(key) { return key in data ? data[key] : null; },
    };
  }
  const fakeStorage = makeFakeStorage();

  function saveName(name) {
    // your code here
  }

  function loadName() {
    // your code here
  }

  window.fakeStorage = fakeStorage;
  window.saveName = saveName;
  window.loadName = loadName;
</script>
`,

  tests: `test("loadName gives a friendly default before anything is saved", () => {
  expect(window.loadName()).toBe("friend");
});

test("saveName then loadName remembers the name", () => {
  window.saveName("Sam");
  expect(window.loadName()).toBe("Sam");
});

test("saveName really uses fakeStorage (not just a local variable)", () => {
  window.saveName("Ada");
  expect(window.fakeStorage.getItem("name")).toBe("Ada");
});
`,

  hints: [
    'saveName: fakeStorage.setItem("name", name);',
    'loadName: const saved = fakeStorage.getItem("name"); then check if it is null.',
    'loadName: return saved === null ? "friend" : saved;',
  ],

  solution: `=== CODE ===
<script>
  function makeFakeStorage() {
    const data = {};
    return {
      setItem(key, value) { data[key] = String(value); },
      getItem(key) { return key in data ? data[key] : null; },
    };
  }
  const fakeStorage = makeFakeStorage();

  function saveName(name) {
    fakeStorage.setItem("name", name);
  }

  function loadName() {
    const saved = fakeStorage.getItem("name");
    return saved === null ? "friend" : saved;
  }

  window.fakeStorage = fakeStorage;
  window.saveName = saveName;
  window.loadName = loadName;
</script>
=== LINE BY LINE ===
saveName writes straight into storage under the key "name". Real localStorage.setItem works exactly the same way.
loadName reads the same key back. getItem gives null when the key was never set (nobody has visited before, or they cleared their browser data), so we check for that and hand back a sensible default instead of showing "null" on the screen.
Because fakeStorage has the exact same setItem/getItem shape as the real localStorage, this code would work completely unchanged if you swapped fakeStorage for the real thing on a normal (non-sandboxed) page.`,
};
