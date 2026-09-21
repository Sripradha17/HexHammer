import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l2-s12",
  level: 2,
  order: 12,
  title: "JSON and dates",

  look: `JSON is data written as plain text, so it can be saved in a file or sent over the internet. Think of flattening a toy into a box to post it, then rebuilding it at the other end.

  const text = JSON.stringify({ name: "Sam", scores: [1, 2] });   // '{"name":"Sam","scores":[1,2]}'
  const back = JSON.parse(text);                                    // a real object again

A neat trick: stringify then parse makes a completely separate COPY of the data.

Dates: a Date is a moment in time.

  const d = new Date("2026-03-05");
  d.getUTCFullYear()   // 2026
  d.getUTCMonth()      // 2      (WATCH OUT: months start at 0! January is 0, March is 2)
  d.getUTCDate()       // 5

Subtracting two dates gives milliseconds. There are 86400000 milliseconds in one day.`,

  type: `Finish three things:
1. deepCopy(data) makes a completely separate copy using JSON.stringify and JSON.parse. Changing the copy must not change the original, even inside nested objects.
2. daysBetween(startText, endText) takes two dates like "2026-01-01" and returns the number of whole days from start to end. It can be negative.
3. formatDate(text) turns "2026-03-05" into "5 March 2026". The list of month names is already written for you.`,

  break: `Break it on purpose: in formatDate, use MONTHS[date.getUTCMonth() + 1].
March turns into April! That is the "months start at 0" trap, and it has bitten every JavaScript developer. Remove the + 1.`,

  say: `In one sentence: what do JSON.stringify and JSON.parse do, and what is the sneaky thing about months in JavaScript dates?`,

  starterCode: `// Strike 12: JSON and dates.

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function deepCopy(data) {
  // a separate copy, using JSON
}

function daysBetween(startText, endText) {
  // whole days from start to end
}

function formatDate(text) {
  // "2026-03-05" becomes "5 March 2026"
}
`,

  tests: `test("deepCopy makes an equal copy", () => {
  const original = { name: "Sam", tags: ["a", "b"] };
  expect(deepCopy(original)).toEqual(original);
});

test("changing the copy does not change the original", () => {
  const original = { inner: { value: 1 } };
  const copy = deepCopy(original);
  copy.inner.value = 2;
  expect(original.inner.value).toBe(1);
});

test("daysBetween counts whole days", () => {
  expect(daysBetween("2026-01-01", "2026-01-31")).toBe(30);
  expect(daysBetween("2026-02-28", "2026-03-01")).toBe(1);
});

test("daysBetween can be negative", () => {
  expect(daysBetween("2026-03-05", "2026-03-01")).toBe(-4);
});

test("formatDate writes the date in words", () => {
  expect(formatDate("2026-03-05")).toBe("5 March 2026");
  expect(formatDate("2025-12-25")).toBe("25 December 2025");
});
`,

  hints: [
    "deepCopy is one line: turn the data into text, then turn the text back into data. JSON.parse(JSON.stringify(data)).",
    "daysBetween: new Date(endText) - new Date(startText) gives milliseconds. Divide by 86400000 and use Math.round.",
    "formatDate: make a Date from the text. Then glue together date.getUTCDate(), a space, MONTHS[date.getUTCMonth()], a space, and date.getUTCFullYear().",
  ],

  solution: `=== CODE ===
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function deepCopy(data) {
  return JSON.parse(JSON.stringify(data));
}

function daysBetween(startText, endText) {
  const milliseconds = new Date(endText) - new Date(startText);
  return Math.round(milliseconds / 86400000);
}

function formatDate(text) {
  const date = new Date(text);
  return date.getUTCDate() + " " + MONTHS[date.getUTCMonth()] + " " + date.getUTCFullYear();
}
=== LINE BY LINE ===
deepCopy: stringify flattens everything (including nested objects) into text. parse builds brand-new objects from that text, so nothing is shared with the original. (Careful: this trick drops things JSON cannot hold, like functions.)
daysBetween: subtracting two dates gives the gap in milliseconds. One day is 24 * 60 * 60 * 1000 = 86400000 milliseconds. Math.round keeps the answer a whole number.
formatDate: a date like "2026-03-05" is read as a UTC date, so the getUTC... methods give back exactly 2026, month number 2 (March, because months start at 0) and day 5. MONTHS[2] is "March". We glue the pieces with +.`,
};
