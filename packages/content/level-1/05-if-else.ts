import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l1-s05",
  level: 1,
  order: 5,
  title: "if / else",

  look: `if / else lets your code choose a path, like a fork in the road.

  function sizeOfPet(kilos) {
    if (kilos < 5) {
      return "small";
    } else if (kilos < 30) {
      return "medium";
    } else {
      return "large";
    }
  }

JavaScript checks from the top and takes the FIRST path that is true. Order matters!`,

  type: `Finish describeTemperature(degrees). It returns:
  "cold" if degrees is below 10
  "warm" if degrees is 10 or more but below 25
  "hot"  if degrees is 25 or more`,

  break: `Break it on purpose: swap the order of your checks so the biggest one is first.
Run the tests. Which ones fail and why? Then put the order back.`,

  say: `In one sentence: how does JavaScript decide which branch of an if / else if / else to run?`,

  starterCode: `// Strike 5: if / else makes decisions.

function describeTemperature(degrees) {
  // return "cold", "warm" or "hot"
}
`,

  tests: `test("5 degrees is cold", () => {
  expect(describeTemperature(5)).toBe("cold");
});

test("9 degrees is still cold", () => {
  expect(describeTemperature(9)).toBe("cold");
});

test("10 degrees is warm (edge)", () => {
  expect(describeTemperature(10)).toBe("warm");
});

test("24 degrees is still warm", () => {
  expect(describeTemperature(24)).toBe("warm");
});

test("25 degrees is hot (edge)", () => {
  expect(describeTemperature(25)).toBe("hot");
});
`,

  hints: [
    "You need an if, an else if, and an else. Three paths, three answers.",
    "Start with the smallest group: if (degrees < 10). Then the middle group. The else catches everything left.",
    "Because the first true check wins, the middle check only needs to say degrees < 25. Anything below 10 already left.",
  ],

  solution: `=== CODE ===
function describeTemperature(degrees) {
  if (degrees < 10) {
    return "cold";
  } else if (degrees < 25) {
    return "warm";
  } else {
    return "hot";
  }
}
=== LINE BY LINE ===
Line 2: first check. Anything below 10 is cold and we return right away, so the function stops.
Line 4: we only get here if the first check was false, so degrees is already 10 or more. "degrees < 25" then means "10 up to 24".
Line 6: the else has no condition. It catches whatever is left: 25 and up.
Because return ends the function, the order of the checks is what makes the edges (10 and 25) work.`,
};
