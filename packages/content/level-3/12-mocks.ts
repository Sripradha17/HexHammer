import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s12",
  level: 3,
  order: 12,
  title: "Testing: mocks",

  look: `Some code does things you do NOT want during a test: sending a real email, charging a real credit card, calling a real server. A MOCK is a fake stand-in you hand to the code instead. It looks like the real thing, but it just RECORDS how it was used, so your test can check it afterwards.

Think of a crash-test dummy. You do not test a car with a real person inside. The dummy sits there and records what happened to it.

The trick that makes this possible is to PASS IN the helper instead of hard-wiring it:

  // hard to test: it sends a real email every time
  function welcome(user) { sendRealEmail(user.email, "Hi!"); }

  // easy to test: the sender is a parameter
  function welcome(user, sendEmail) { sendEmail(user.email, "Hi!"); }

  // in a test, hand over a fake:
  const calls = [];
  welcome({ email: "a@b.com" }, (to, text) => calls.push([to, text]));
  // now calls holds exactly what would have been sent

This is called dependency injection, a fancy name for "pass it in".

A tiny reusable mock is a function that remembers its calls.`,

  type: `Finish three things:
1. createMock(returnValue) returns a mock function. Every time it is called it saves the inputs it received (as an array) in mock.calls, and returns returnValue.
2. welcomeAll(users, sendEmail) calls sendEmail(user.email, "Welcome, " + user.name + "!") for each user, and returns how many emails it sent. (The sender is passed IN, so it can be mocked.)
3. retry(action, times) calls action(). If it throws, it tries again, up to times tries in total. It returns the first successful result. If every try fails, it throws the LAST error.`,

  break: `Break it on purpose: in welcomeAll, ignore the sendEmail input and call console.log instead (pretend it is the real sender).
The test hands in a fake sender and checks what it received: it received nothing, so the test fails. Code that does not use what you pass in cannot be mocked.`,

  say: `In one sentence: what is a mock, and why do we pass things in instead of hard-wiring them?`,

  starterCode: `// Strike 12: mocks.

function createMock(returnValue) {
  // return a function that saves its inputs in mock.calls and returns returnValue
}

function welcomeAll(users, sendEmail) {
  // sendEmail(user.email, "Welcome, " + user.name + "!") for each user. Return the count
}

function retry(action, times) {
  // try action() up to "times" times. Return the first result, or throw the last error
}
`,

  tests: `test("createMock returns what you told it to", () => {
  const mock = createMock(42);
  expect(mock("a", 1)).toBe(42);
});

test("createMock records every call", () => {
  const mock = createMock();
  mock("a", 1);
  mock("b");
  expect(mock.calls).toEqual([["a", 1], ["b"]]);
});

test("welcomeAll sends one email per user and counts them", () => {
  const sent = [];
  const fakeSend = (to, text) => { sent.push([to, text]); };
  const users = [
    { name: "Sam", email: "sam@x.com" },
    { name: "Ada", email: "ada@x.com" },
  ];
  expect(welcomeAll(users, fakeSend)).toBe(2);
  expect(sent).toEqual([
    ["sam@x.com", "Welcome, Sam!"],
    ["ada@x.com", "Welcome, Ada!"],
  ]);
});

test("welcomeAll with nobody sends nothing", () => {
  const mock = createMock();
  expect(welcomeAll([], mock)).toBe(0);
  expect(mock.calls).toEqual([]);
});

test("retry keeps trying until it works", () => {
  let attempts = 0;
  const flaky = () => {
    attempts = attempts + 1;
    if (attempts < 3) { throw new Error("try " + attempts); }
    return "ok";
  };
  expect(retry(flaky, 5)).toBe("ok");
  expect(attempts).toBe(3);
});

test("retry gives up and throws the LAST error", () => {
  let attempts = 0;
  const alwaysFails = () => {
    attempts = attempts + 1;
    throw new Error("fail " + attempts);
  };
  let caught = null;
  try { retry(alwaysFails, 3); } catch (error) { caught = error; }
  if (caught === null) { throw new Error("retry should throw when every try fails"); }
  expect(caught.message).toBe("fail 3");
  expect(attempts).toBe(3);
});
`,

  hints: [
    "createMock: make const calls = []. Define function mock(...args) { calls.push(args); return returnValue; }. Then mock.calls = calls; and return mock. (A function is an object, so it can have properties!)",
    "welcomeAll: loop over users, call sendEmail with the email and the message you build, add 1 to a counter, return the counter at the end.",
    "retry: loop times times. Inside, try { return action(); } catch (error) { remember it as lastError }. After the loop, throw lastError.",
  ],

  solution: `=== CODE ===
function createMock(returnValue) {
  const calls = [];
  function mock(...args) {
    calls.push(args);
    return returnValue;
  }
  mock.calls = calls;
  return mock;
}

function welcomeAll(users, sendEmail) {
  let count = 0;
  for (const user of users) {
    sendEmail(user.email, "Welcome, " + user.name + "!");
    count = count + 1;
  }
  return count;
}

function retry(action, times) {
  let lastError;
  for (let attempt = 1; attempt <= times; attempt++) {
    try {
      return action();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
=== LINE BY LINE ===
createMock: ...args collects every input into an array. We push that array into calls each time the mock runs. Functions are objects in JavaScript, so we can stick a calls property on the function itself, and the test can read mock.calls afterwards.
welcomeAll: because the sender comes in as an input, a test can hand in a fake and check exactly what it received, without sending a single real email.
retry: try/catch inside the loop. If action() works, return ends everything. If it throws, we remember the error and go around again. Only when every attempt has failed do we get past the loop and throw the last error.`,
};
