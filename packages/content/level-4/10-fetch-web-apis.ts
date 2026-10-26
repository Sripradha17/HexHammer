import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s10",
  level: 4,
  order: 10,
  title: "fetch and Web APIs",
  runner: "iframe",

  look: `fetch is the browser's built-in tool for asking a server for data. It returns a promise (you met promises in Level 3), so you can await it:

  async function loadUser() {
    const response = await fetch("/api/user");   // 1. ask
    const data = await response.json();           // 2. unpack the body as JSON
    return data;
  }

Two awaits, because two things take time: getting the response's HEADERS (fast), and reading its whole BODY (can be slower, especially for a big response). Checking response.ok tells you whether the server said everything was fine:

  const response = await fetch("/api/user");
  if (!response.ok) {
    throw new Error("Could not load the user");
  }

This strike cannot make a REAL network request (this classroom runs fully offline, and a sandboxed page like this one is not allowed to reach out anyway). Instead, you will write a function that RECEIVES its fetch as an input, the same trick you used for mocks back in Level 3. That way the function works with the real fetch AND is easy to test with a pretend one.`,

  type: `Write loadUser(doFetch). doFetch behaves like fetch: call it and await it. Your function should:
1. Call doFetch("/api/user") and await the response.
2. If response.ok is false, throw new Error("Could not load the user").
3. Otherwise, await response.json() and return that data.`,

  break: `Break it on purpose: forget the first await, so you write const response = doFetch("/api/user"); (no await). Now response is a PROMISE, not the real response, so response.ok is always undefined (never false, so your error check never fires) and response.json is not a function. Put the await back.`,

  say: `In one sentence: why does fetch usually need TWO awaits, and what does response.ok tell you?`,

  starterCode: `<!-- Strike 10: fetch and Web APIs. -->
<script>
  async function loadUser(doFetch) {
    // your code here
  }

  window.loadUser = loadUser; // so the tests can reach it
</script>
`,

  tests: `function workingFetch(url) {
  if (url === "/api/user") {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ name: "Sam" }) });
  }
  return Promise.resolve({ ok: false, json: () => Promise.resolve(null) });
}
function failingFetch() {
  return Promise.resolve({ ok: false, json: () => Promise.resolve(null) });
}

test("loadUser awaits doFetch and returns the parsed data", async () => {
  const data = await window.loadUser(workingFetch);
  expect(data).toEqual({ name: "Sam" });
});

test("loadUser throws a friendly error when the response is not ok", async () => {
  let message = null;
  try {
    await window.loadUser(failingFetch);
  } catch (error) {
    message = error.message;
  }
  expect(message).toBe("Could not load the user");
});
`,

  hints: [
    'First line: const response = await doFetch("/api/user");',
    'Then: if (!response.ok) { throw new Error("Could not load the user"); }',
    "Finally: const data = await response.json(); return data;",
  ],

  solution: `=== CODE ===
<script>
  async function loadUser(doFetch) {
    const response = await doFetch("/api/user");
    if (!response.ok) {
      throw new Error("Could not load the user");
    }
    const data = await response.json();
    return data;
  }

  window.loadUser = loadUser;
</script>
=== LINE BY LINE ===
doFetch is an INPUT to the function, not a fixed name it depends on. Real code would call loadUser(fetch), using the browser's real fetch. Our tests call loadUser(workingFetch) or loadUser(failingFetch), two small pretend versions, exactly the way Level 3's mocks strike passed a fake sender into welcomeAll.
const response = await doFetch(...) waits for the first promise: the "headers arrived" moment. response is now a real object with .ok and .json on it, not a promise any more.
if (!response.ok) throws our own friendly error the moment we know something went wrong, before we even try to read the body.
const data = await response.json() waits for the SECOND promise: reading and parsing the whole response body as JSON. Only after this line do we actually have the data.`,
};
