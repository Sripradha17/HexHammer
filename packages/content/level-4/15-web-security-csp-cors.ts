import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l4-s15",
  level: 4,
  order: 15,
  title: "Web security: CSP and CORS",
  runner: "worker",

  look: `Two more browser security rules, both about WHERE things are allowed to come from. Neither can be demonstrated inside this tiny practice page (they are about real HTTP headers and real network requests), so this strike is GUIDED-LOCAL: read, then answer.

CSP (Content-Security-Policy) is a header (or a <meta> tag) a PAGE sends that tells the browser "only ever load scripts/images/styles from THESE sources, refuse everything else, even if some HTML on my page tries to sneak in a script tag". It is a second line of defense against XSS: even if an attacker manages to inject a <script>, a strict CSP can still stop it from running.

  <meta http-equiv="Content-Security-Policy" content="script-src 'self'" />

CORS (Cross-Origin Resource Sharing) is the opposite direction: it is what lets a SERVER say "yes, pages from other websites may fetch data from me". Without it, a script on siteA.com trying to fetch("https://siteB.com/data") is blocked by the browser, on purpose. This is the SAME-ORIGIN POLICY: by default, a page can only freely talk to its own origin (protocol + domain + port). CORS is the server handing out permission slips to other origins.

  Access-Control-Allow-Origin: https://siteA.com`,

  type: `Fill in the answers object:
  cspPurpose      pick a, b or c: what does a Content-Security-Policy do? (see the starter file)
  sameOrigin      pick a, b or c: what is the "same-origin policy"?
  corsGrants      does CORS run on the BROWSER or the SERVER? (answer "server")`,

  break: `Try it for real, for free: open your browser's DevTools (F12), go to the Network tab, and visit any site that loads things from other domains (most news sites do). Click a request and look at its Response Headers for Content-Security-Policy or Access-Control-Allow-Origin. Real examples, right there in a page you did not write.`,

  say: `In one sentence: what is the difference between what CSP protects and what CORS controls?`,

  starterCode: `// Strike 15: CSP and CORS.

// cspPurpose: what does a Content-Security-Policy do?
//   a) makes the page load faster
//   b) tells the browser which sources of scripts/styles/images are allowed to run, even if some HTML tries to sneak in others
//   c) encrypts the page's HTML

// sameOrigin: what is the "same-origin policy"?
//   a) by default, a page can only freely read data from its OWN protocol + domain + port
//   b) a rule that every website must use the same font
//   c) a rule that all servers must live in the same country

const answers = {
  cspPurpose: "",
  sameOrigin: "",
  corsGrants: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("cspPurpose", () => {
  if (said(answers.cspPurpose) !== "b") {
    throw new Error("What does a Content-Security-Policy do? (a, b or c)");
  }
});

test("sameOrigin", () => {
  if (said(answers.sameOrigin) !== "a") {
    throw new Error('What is the "same-origin policy"? (a, b or c)');
  }
});

test("corsGrants", () => {
  if (said(answers.corsGrants) !== "server") {
    throw new Error('Does CORS permission come from the "browser" or the "server"? (you wrote "' + answers.corsGrants + '")');
  }
});
`,

  hints: [
    "cspPurpose: think about what CSP is a second line of defense AGAINST (the strike right before this one).",
    'sameOrigin: "origin" means protocol + domain + port together, all three. The policy is about a page\'s OWN origin.',
    "corsGrants: CORS headers are sent BY the server, in its response. Write the single word: server",
  ],

  solution: `=== CODE ===
const answers = {
  cspPurpose: "b",
  sameOrigin: "a",
  corsGrants: "server",
};
=== LINE BY LINE ===
cspPurpose is b: a Content-Security-Policy is an allow-list. Even if an XSS bug lets an attacker inject a <script src="https://evil.example/steal.js">, a CSP that only allows scripts from 'self' makes the browser refuse to run it.
sameOrigin is a: "origin" is the combination of protocol (https), domain (example.com) and port. By default a page's own JavaScript can only freely read responses from that exact combination; anything else is a cross-origin request.
corsGrants is "server": the SERVER decides who may read its responses, by sending back an Access-Control-Allow-Origin header. The browser is the one that ENFORCES the same-origin policy, but the permission itself is granted by the server being asked.`,
};
