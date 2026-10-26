import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s20",
  level: 5,
  order: 20,
  title: "Security: CSRF",
  runner: "worker",

  look: `CSRF (Cross-Site Request Forgery) abuses a fact you already relied on in the cookies strike: a browser attaches a site's cookies to a request AUTOMATICALLY, no matter what page TRIGGERED that request. This strike needs a real cross-site browser scenario to demonstrate safely, so it stays guided-local: read, then answer.

Imagine you are logged into your-bank.example (its session cookie is sitting in your browser). Then you visit a completely different, malicious page, which contains:

  <form action="https://your-bank.example/transfer" method="POST">
    <input type="hidden" name="amount" value="1000" />
    <input type="hidden" name="to" value="attacker" />
  </form>
  <script>document.forms[0].submit();</script>

Your browser submits that POST to your-bank.example, and — because it is YOUR browser, still logged in — it attaches YOUR session cookie automatically. The bank's server sees a normal, authenticated-looking request. It has no way to tell this request came from the malicious page instead of the bank's own real form.

Two real defenses: a CSRF TOKEN (a random value the bank's own page embeds and sends back with the form; the attacker's page has no way to read or guess it), and SameSite cookies (telling the browser "never attach this cookie to a request that came from another site" in the first place).`,

  type: `Fill in the answers object:
  whatCsrfAbuses     pick a, b or c: what browser behavior does CSRF actually abuse?
  csrfTokenWorks     pick a, b or c: why does a CSRF token stop the attack?
  sameSiteDefense    write one word: the cookie setting whose whole job is stopping a cookie from being attached to a cross-site request.`,

  break: `Try it for real, for free: open your browser's DevTools (F12), Application tab, and look at any cookie's own attributes for a site you are logged into. You will often see a real SameSite value (Lax or Strict) already set, right there on a page you did not write.`,

  say: `In one sentence: why can a malicious page trigger a request that carries YOUR cookies, without ever being able to read those cookies itself?`,

  starterCode: `// Strike 20: CSRF.

// whatCsrfAbuses: what browser behavior does CSRF actually abuse?
//   a) the browser remembers your typed passwords
//   b) the browser attaches a site's cookies automatically, no matter which page triggered the request
//   c) the browser blocks all cross-site requests by default

// csrfTokenWorks: why does a CSRF token stop the attack?
//   a) it encrypts the request
//   b) the attacker's page cannot read or guess a random value embedded in the bank's OWN page, so it cannot include it
//   c) it makes the request slower

const answers = {
  whatCsrfAbuses: "",
  csrfTokenWorks: "",
  sameSiteDefense: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("whatCsrfAbuses", () => {
  if (said(answers.whatCsrfAbuses) !== "b") {
    throw new Error("What browser behavior does CSRF actually abuse? (a, b or c)");
  }
});

test("csrfTokenWorks", () => {
  if (said(answers.csrfTokenWorks) !== "b") {
    throw new Error("Why does a CSRF token stop the attack? (a, b or c)");
  }
});

test("sameSiteDefense", () => {
  if (said(answers.sameSiteDefense) !== "samesite") {
    throw new Error('Write the single word (no space): the cookie setting whose job is stopping cross-site attachment. Answer: SameSite');
  }
});
`,

  hints: [
    "whatCsrfAbuses: think about the cookies strike, a few strikes back — CSRF abuses the exact same automatic-attachment behavior.",
    "csrfTokenWorks: the attacker's page can trigger a request, but it cannot READ anything from the bank's own page (that is the browser's same-origin policy protecting the token, not the request).",
    'sameSiteDefense: write the single word, matching its real capitalization: SameSite',
  ],

  solution: `=== CODE ===
const answers = {
  whatCsrfAbuses: "b",
  csrfTokenWorks: "b",
  sameSiteDefense: "SameSite",
};
=== LINE BY LINE ===
whatCsrfAbuses is b: the browser has always attached a site's cookies to any request going to that site, regardless of which page caused the request. That convenience is exactly what CSRF turns against you.
csrfTokenWorks is b: the malicious page can force your browser to SEND a request, but the same-origin policy (from Level 4) stops it from ever READING the bank's own page to steal the token in the first place. No token, no valid request.
sameSiteDefense is SameSite: this cookie attribute tells the browser directly "do not attach me to a request that started on another site", stopping the whole attack at the browser level, before the malicious request even leaves.`,
};
