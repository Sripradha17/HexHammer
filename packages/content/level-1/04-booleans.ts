import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l1-s04",
  level: 1,
  order: 4,
  title: "Booleans",

  look: `A boolean is a yes/no value. There are only two: true and false.
You can combine them:
  &&  means AND  (both must be true)
  ||  means OR   (at least one must be true)
  !   means NOT  (flips true to false)

  const hasHat = true;
  const hasCoat = false;
  console.log(hasHat && hasCoat); // false
  console.log(hasHat || hasCoat); // true
  console.log(!hasCoat);          // true`,

  type: `Finish three functions. Each one returns true or false:
1. canRide(age, height): true only if age is 8 or more AND height is 120 or more.
2. isWeekend(day): true if day is "Saturday" OR "Sunday".
3. isNotEmpty(text): true if text is NOT the empty string "".`,

  break: `Break it on purpose: in canRide swap && for ||. Run the tests and see which ones fail.
That is the difference between "both" and "either". Then fix it.`,

  say: `In one sentence: what is the difference between && and || ?`,

  starterCode: `// Strike 4: booleans are true or false.

function canRide(age, height) {
  // true only if age >= 8 AND height >= 120
}

function isWeekend(day) {
  // true if day is "Saturday" OR "Sunday"
}

function isNotEmpty(text) {
  // true if text is NOT ""
}
`,

  tests: `test("canRide(10, 130) is true", () => {
  expect(canRide(10, 130)).toBe(true);
});

test("canRide(10, 100) is false (too short)", () => {
  expect(canRide(10, 100)).toBe(false);
});

test("canRide(6, 150) is false (too young)", () => {
  expect(canRide(6, 150)).toBe(false);
});

test("isWeekend works for Saturday, Sunday and Monday", () => {
  expect(isWeekend("Saturday")).toBe(true);
  expect(isWeekend("Sunday")).toBe(true);
  expect(isWeekend("Monday")).toBe(false);
});

test("isNotEmpty works for text and empty text", () => {
  expect(isNotEmpty("hi")).toBe(true);
  expect(isNotEmpty("")).toBe(false);
});
`,

  hints: [
    "Comparisons like age >= 8 already give back true or false. You can return them directly.",
    "To need BOTH conditions use &&. To need EITHER one use ||. Compare text with === and quote marks.",
    "isNotEmpty: compare text to the empty string using the not-equal sign !==.",
  ],

  solution: `=== CODE ===
function canRide(age, height) {
  return age >= 8 && height >= 120;
}

function isWeekend(day) {
  return day === "Saturday" || day === "Sunday";
}

function isNotEmpty(text) {
  return text !== "";
}
=== LINE BY LINE ===
canRide: "age >= 8" is true or false. "height >= 120" is true or false. && is true only when BOTH sides are true, so we return that directly. No if needed.
isWeekend: each === check gives true or false. || is true when at least one side is true. Notice we write day === twice; day === "Saturday" || "Sunday" would be a classic bug.
isNotEmpty: !== means "is not equal to". If text is "" the answer is false, otherwise true.`,
};
