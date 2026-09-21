import type { Lesson } from "../types";

// NOTE for editing this file: these lesson texts are JavaScript template literals,
// so a backtick inside them is written \` and a dollar-brace is written \${
export const lesson: Lesson = {
  id: "l1-s09",
  level: 1,
  order: 9,
  title: "Template strings",

  look: `Gluing strings with + gets messy. A template string uses backticks (the key above Tab) and lets you drop values right inside with \${ }.

  const name = "Sam";
  const age = 10;
  console.log(\`\${name} is \${age} years old\`);  // Sam is 10 years old

Anything inside \${ } is real JavaScript, so you can do math in there too: \${age + 1}.
A number has .toFixed(2) to show exactly 2 decimal places: (2.5).toFixed(2) is "2.50".`,

  type: `Finish three functions using template strings (backticks!):
1. introduce(name, age) returns: My name is Sam and I am 10 years old.
   (that is the answer for introduce("Sam", 10))
2. priceTag(item, price) returns: Apple costs $2.50   for priceTag("Apple", 2.5)
3. nextYear(age) returns: Next year you will be 11.   for nextYear(10)`,

  break: `Break it on purpose: forget the $ before the curly braces, like {name}, or use normal quotes instead of backticks.
Your output will print the words {name} instead of the value. Then fix it.`,

  say: `In one sentence: what does \${ } do inside a template string?`,

  starterCode: `// Strike 9: template strings use backticks and \${ }.

function introduce(name, age) {
  // return My name is <name> and I am <age> years old.
}

function priceTag(item, price) {
  // return <item> costs $<price with 2 decimals>
}

function nextYear(age) {
  // return Next year you will be <age plus 1>.
}
`,

  tests: `test("introduce works", () => {
  expect(introduce("Sam", 10)).toBe("My name is Sam and I am 10 years old.");
});

test("introduce works for someone else", () => {
  expect(introduce("Ada", 36)).toBe("My name is Ada and I am 36 years old.");
});

test("priceTag shows 2 decimals", () => {
  expect(priceTag("Apple", 2.5)).toBe("Apple costs $2.50");
});

test("priceTag works for whole numbers", () => {
  expect(priceTag("Book", 12)).toBe("Book costs $12.00");
});

test("nextYear adds one to the age", () => {
  expect(nextYear(10)).toBe("Next year you will be 11.");
});
`,

  hints: [
    "Start and end with a backtick, not a quote mark. Write the words normally and put each variable inside ${ }.",
    "For priceTag, the dollar sign is just a normal character, so it can sit right before the ${ }. The price part needs .toFixed(2).",
    "For nextYear you can do math inside the braces: ${age + 1}. Do not forget the final period.",
  ],

  solution: `=== CODE ===
function introduce(name, age) {
  return \`My name is \${name} and I am \${age} years old.\`;
}

function priceTag(item, price) {
  return \`\${item} costs $\${price.toFixed(2)}\`;
}

function nextYear(age) {
  return \`Next year you will be \${age + 1}.\`;
}
=== LINE BY LINE ===
introduce: the backticks make a template string. Each \${ } is replaced by the value of what is inside it. Everything outside the braces (words, spaces, the final period) is copied as-is.
priceTag: the first \${item} is replaced by the item name. The $ right after "costs " is a plain dollar sign. Then \${price.toFixed(2)} runs the toFixed tool, so 2.5 becomes "2.50".
nextYear: anything inside \${ } is real JavaScript, so age + 1 is worked out first (10 + 1 = 11), then dropped into the sentence.`,
};
