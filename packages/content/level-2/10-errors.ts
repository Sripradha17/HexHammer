import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l2-s10",
  level: 2,
  order: 10,
  title: "Error handling (try/catch, custom errors)",

  look: `Things go wrong: bad input, missing files, broken text. An error handler is a safety net under a trapeze artist. Without it the whole show crashes. With it, you catch the fall and carry on.

  try {
    JSON.parse("oops");          // this throws an error
  } catch (error) {
    console.log("Caught: " + error.message);   // we land safely here
  }

You can throw your own error on purpose:

  throw new Error("Something is wrong");

And you can make your OWN kind of error, so you can tell them apart:

  class OutOfPizzaError extends Error {
    constructor(message) {
      super(message);
      this.name = "OutOfPizzaError";
    }
  }

Rule of thumb: try only around the risky line, and always say something useful in the message.`,

  type: `Finish four things:
1. safeParse(text) tries JSON.parse(text) and returns the result. If the text is not valid JSON, return null (do not crash).
2. class ValidationError that extends Error and sets this.name to "ValidationError".
3. validateAge(age) returns the age if it is a number from 0 to 150. Otherwise it THROWS a ValidationError with the message "Age must be a number from 0 to 150".
4. describeAge(age) calls validateAge inside try/catch. It returns "Age OK: 30" when fine, or "Problem: " plus the error message when not.`,

  break: `Break it on purpose: in safeParse, remove the try/catch and call JSON.parse alone. Run the tests.
safeParse("not json") now crashes the whole function instead of returning null. That is the trapeze artist without the net. Put it back.`,

  say: `In one sentence: what do try, catch and throw each do?`,

  starterCode: `// Strike 10: error handling.

function safeParse(text) {
  // try JSON.parse. If it fails, return null
}

class ValidationError {
  // should extend Error and set this.name = "ValidationError"
}

function validateAge(age) {
  // return age if it is a number from 0 to 150, otherwise throw a ValidationError
}

function describeAge(age) {
  // use try/catch around validateAge
}
`,

  tests: `function catchError(action) {
  try {
    action();
  } catch (error) {
    return error;
  }
  return null;
}

test("safeParse returns the parsed data", () => {
  expect(safeParse('{"a":1}')).toEqual({ a: 1 });
  expect(safeParse("[1,2]")).toEqual([1, 2]);
});

test("safeParse returns null for broken text instead of crashing", () => {
  expect(safeParse("not json")).toBe(null);
});

test("ValidationError is a real Error with its own name", () => {
  const error = new ValidationError("oops");
  expect(error instanceof Error).toBe(true);
  expect(error.name).toBe("ValidationError");
  expect(error.message).toBe("oops");
});

test("validateAge returns a good age", () => {
  expect(validateAge(30)).toBe(30);
});

test("validateAge throws a ValidationError for bad ages", () => {
  const tooLow = catchError(() => validateAge(-1));
  expect(tooLow instanceof ValidationError).toBe(true);
  expect(tooLow.message).toBe("Age must be a number from 0 to 150");
  expect(catchError(() => validateAge("ten")) instanceof ValidationError).toBe(true);
  expect(catchError(() => validateAge(200)) instanceof ValidationError).toBe(true);
});

test("describeAge reports good and bad ages", () => {
  expect(describeAge(30)).toBe("Age OK: 30");
  expect(describeAge(200)).toBe("Problem: Age must be a number from 0 to 150");
});
`,

  hints: [
    "try { ...risky line... } catch (error) { ...what to do instead... }. In safeParse, return the parsed data inside try and null inside catch.",
    "A custom error is a class that extends Error. In its constructor call super(message) first, then set this.name.",
    'validateAge: check typeof age !== "number" || age < 0 || age > 150. If bad, throw new ValidationError("..."). describeAge: try { validateAge(age); return ... } catch (error) { return ... error.message }.',
  ],

  solution: `=== CODE ===
function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateAge(age) {
  if (typeof age !== "number" || age < 0 || age > 150) {
    throw new ValidationError("Age must be a number from 0 to 150");
  }
  return age;
}

function describeAge(age) {
  try {
    validateAge(age);
    return "Age OK: " + age;
  } catch (error) {
    return "Problem: " + error.message;
  }
}
=== LINE BY LINE ===
safeParse: JavaScript runs the try block. If JSON.parse throws, it jumps straight to catch and we return null. No crash.
ValidationError: extends Error gives us all the normal error powers (like .message and a stack trace). super(message) passes the message up to Error. Setting this.name lets us tell it apart from other errors.
validateAge: || means "or", so any one bad thing throws. throw stops the function on the spot and sends the error up to whoever is watching (a catch).
describeAge: if validateAge throws, the line after it never runs and we land in catch, where error.message holds our sentence.`,
};
