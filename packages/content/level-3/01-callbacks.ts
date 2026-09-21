import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s01",
  level: 3,
  order: 1,
  title: "Async: callbacks",

  look: `Some jobs take time: loading a picture, asking a server, waiting a second. JavaScript does NOT stand still and wait. It says "call me back when you are done" and carries on. That "call me back" function is a CALLBACK.

Think of ordering a pizza. You do not stand at the counter for 20 minutes. You leave your phone number, go and play, and the shop CALLS YOU BACK when the pizza is ready.

  setTimeout(() => console.log("pizza is ready!"), 1000);   // call this function in 1 second
  console.log("I am playing meanwhile");                    // this prints FIRST

Many callbacks follow one habit, called error-first: the callback gets an error as its first input (or null if all went well), then the result.

  function callback(error, result) {
    if (error) { /* something went wrong */ } else { /* use result */ }
  }

Callbacks inside callbacks inside callbacks make a "pyramid of doom". Promises (next strike) fix that.`,

  type: `Finish three functions:
1. afterDelay(ms, callback) waits ms milliseconds, then calls callback("done"). It must NOT call it right away.
2. doubleLater(n, callback) waits a moment (10 ms), then calls callback(null, n * 2). If n is not a number, it calls callback(new Error("not a number")) instead. (Error first!)
3. readTwice(getValue, callback) calls getValue twice, ONE AFTER THE OTHER (the second only after the first finished). getValue takes a callback of its own: getValue((value) => ...). When both are done, call callback(first + second).`,

  break: `Break it on purpose: in afterDelay, call callback("done") straight away, without setTimeout.
The test says "The callback ran before afterDelay finished". Sync code is not the same as async code! Put the setTimeout back.`,

  say: `In one sentence: what is a callback, and why does JavaScript use them for slow jobs?`,

  starterCode: `// Strike 1: callbacks.

function afterDelay(ms, callback) {
  // wait ms milliseconds, then callback("done")
}

function doubleLater(n, callback) {
  // after 10 ms: callback(null, n * 2), or callback(new Error("not a number"))
}

function readTwice(getValue, callback) {
  // call getValue, and when it answers call it AGAIN, then callback(first + second)
}
`,

  tests: `test("afterDelay calls back with done, but not right away", () => new Promise((resolve, reject) => {
  let returned = false;
  afterDelay(20, (message) => {
    if (!returned) { reject(new Error("The callback ran before afterDelay finished. It should wait.")); return; }
    if (message !== "done") { reject(new Error("I expected \\"done\\" but got " + JSON.stringify(message))); return; }
    resolve();
  });
  returned = true;
}));

test("doubleLater(4) calls back with no error and 8", () => new Promise((resolve, reject) => {
  doubleLater(4, (error, value) => {
    if (error) { reject(error); return; }
    if (value !== 8) { reject(new Error("I expected 8 but got " + value)); return; }
    resolve();
  });
}));

test("doubleLater with a non-number gives an Error first", () => new Promise((resolve, reject) => {
  doubleLater("x", (error) => {
    if (error instanceof Error) { resolve(); } else { reject(new Error("The first input of the callback should be an Error")); }
  });
}));

test("readTwice adds the two values, one after the other", () => new Promise((resolve, reject) => {
  let count = 0;
  let running = 0;
  let overlapped = false;
  const getValue = (done) => {
    running = running + 1;
    if (running > 1) { overlapped = true; }
    setTimeout(() => { count = count + 1; running = running - 1; done(count); }, 5);
  };
  readTwice(getValue, (sum) => {
    if (overlapped) { reject(new Error("The second getValue started before the first one finished")); return; }
    if (sum !== 3) { reject(new Error("I expected 1 + 2 = 3 but got " + sum)); return; }
    resolve();
  });
}));
`,

  hints: [
    "setTimeout(function, milliseconds) runs the function later. Put the callback call INSIDE that function.",
    'doubleLater: inside the setTimeout function, check typeof n !== "number". If bad, callback(new Error(...)), otherwise callback(null, n * 2).',
    "readTwice: call getValue with a function that receives the first value. INSIDE that function call getValue again, with a function that receives the second value, and finally call callback(first + second).",
  ],

  solution: `=== CODE ===
function afterDelay(ms, callback) {
  setTimeout(() => callback("done"), ms);
}

function doubleLater(n, callback) {
  setTimeout(() => {
    if (typeof n !== "number") {
      callback(new Error("not a number"));
    } else {
      callback(null, n * 2);
    }
  }, 10);
}

function readTwice(getValue, callback) {
  getValue((first) => {
    getValue((second) => {
      callback(first + second);
    });
  });
}
=== LINE BY LINE ===
afterDelay: setTimeout hands the little function to the browser and says "run this in ms milliseconds". afterDelay returns immediately, and the callback arrives later. That is what async means.
doubleLater: error-first means the first input tells you if something went wrong. null there means "no error". We check the type inside the timer so both answers arrive later, in the same way.
readTwice: the second getValue is INSIDE the first callback, so it can only start after the first one answered. That nesting is the pyramid of doom. With three or four steps it gets very deep, which is why promises were invented.`,
};
