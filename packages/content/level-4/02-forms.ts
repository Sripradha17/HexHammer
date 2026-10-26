import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s02",
  level: 4,
  order: 2,
  title: "Forms",
  runner: "iframe",

  look: `A form collects information from a person: their name, an email, a choice. Every input needs a LABEL, or a visitor using a screen reader has no idea what the box is for.

  <form>
    <label for="name">Your name</label>
    <input id="name" type="text" required />

    <button type="submit">Send</button>
  </form>

The label and input are linked by TWO matching values: the label's for and the input's id. Click the label's text and watch the input light up: that link is what makes it happen (try it in "Your page" once you build one!).

Useful input types (they each change the keyboard/box you get):
  type="text"      any text
  type="email"     an email address (some browsers check the shape for you)
  type="password"  hides what you type

The required attribute means the browser will not let the form be sent until that box is filled in. It needs no value: just the word required by itself.

  <input id="name" type="text" required />`,

  type: `Build a tiny sign-up form:
1. One <form>.
2. A label "Your name" linked to a required text input with id="name".
3. A label "Your email" linked to a required email input with id="email".
4. A submit button, <button type="submit">Sign up</button>.`,

  break: `Break it on purpose: change the label's for to "names" (add an "s") so it no longer matches the input's id="name". Run the tests. The link is broken, even though both elements still LOOK connected on the page. Matching text really matters here, not just being nearby. Fix the typo.`,

  say: `In one sentence: how does a <label> get linked to an <input>, and why does that link matter?`,

  starterCode: `<!-- Strike 2: forms. -->
<form>
  <p>Your name</p>
  <input type="text" />

  <p>Your email</p>
  <input type="text" />

  <button>Sign up</button>
</form>
`,

  tests: `test("there is one form", () => {
  expect(document.querySelectorAll("form").length).toBe(1);
});

test("the name input is linked to its label, and required", () => {
  const nameInput = document.getElementById("name");
  expect(nameInput !== null).toBe(true);
  expect(nameInput.tagName).toBe("INPUT");
  expect(nameInput.type).toBe("text");
  expect(nameInput.required).toBe(true);
  const label = document.querySelector('label[for="name"]');
  expect(label !== null).toBe(true);
});

test("the email input is linked to its label, is type=email, and required", () => {
  const emailInput = document.getElementById("email");
  expect(emailInput !== null).toBe(true);
  expect(emailInput.type).toBe("email");
  expect(emailInput.required).toBe(true);
  const label = document.querySelector('label[for="email"]');
  expect(label !== null).toBe(true);
});

test("there is a submit button", () => {
  const button = document.querySelector('form button[type="submit"]');
  expect(button !== null).toBe(true);
  expect(button.textContent.trim().length > 0).toBe(true);
});
`,

  hints: [
    'Swap each <p>Your name</p> for a <label for="...">Your name</label>. The for value must exactly match the id you give the input right after it.',
    'The name input needs id="name" and required. The email input needs id="email", type="email" and required.',
    'The button needs type="submit" written on it: <button type="submit">Sign up</button>.',
  ],

  solution: `=== CODE ===
<form>
  <label for="name">Your name</label>
  <input id="name" type="text" required />

  <label for="email">Your email</label>
  <input id="email" type="email" required />

  <button type="submit">Sign up</button>
</form>
=== LINE BY LINE ===
label for="name" points at the input with id="name". Because the two match exactly, the browser (and a screen reader) treats them as one unit: clicking the label focuses the input.
type="text" and type="email" tell the browser what kind of box and keyboard to show. required blocks the form from submitting until the box has something in it.
The submit button needs type="submit" written on it. Without a type, a <button> inside a form still defaults to "submit" in real browsers, but writing it out is clearer and is what our test checks for.`,
};
