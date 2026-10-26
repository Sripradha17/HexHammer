import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l5-s16",
  level: 5,
  order: 16,
  title: "Auth: OAuth/OIDC basics",
  runner: "worker",

  look: `"Log in with Google" is OAuth (and usually OIDC) at work. Neither can be honestly demonstrated here: a real flow needs a real external provider and a real browser redirect, which this offline classroom cannot do. This strike is guided-local: read, then answer.

OAuth is about AUTHORIZATION: "let this app access some of my data, without ever handing it my password." You get redirected to Google, you approve, Google redirects back with an ACCESS TOKEN the app can use to call Google's APIs on your behalf, scoped to only what you approved.

OIDC (OpenID Connect) is built ON TOP of OAuth, adding AUTHENTICATION: "prove who I am." It adds an ID TOKEN (a JWT, exactly the shape you just built by hand) containing your identity — name, email, a stable user ID — which is what actually lets an app say "you are signed in as ___".

The short version: OAuth alone answers "what can this app do on my behalf?"; OIDC adds "who is this, actually?"`,

  type: `Fill in the answers object:
  oauthAnswers      pick a, b or c: what does OAuth, by itself, let an app do?
  oidcAdds          pick a, b or c: what does OIDC add on top of plain OAuth?
  idTokenShape      write one word: what KIND of token is an OIDC ID token? (you already built one by hand)`,

  break: `Try it for real, for free: next time you click "Sign in with Google" (or GitHub, or any provider) on a real site, watch the URL bar during the redirect. You will see real OAuth/OIDC query parameters flash by, things like client_id, redirect_uri and scope, on a page you did not write.`,

  say: `In one sentence: what is the difference between what OAuth grants and what OIDC proves?`,

  starterCode: `// Strike 16: OAuth and OIDC basics.

// oauthAnswers: what does OAuth, by itself, let an app do?
//   a) prove who you are
//   b) access some of your data on another service, with your approval, without ever seeing your password
//   c) store your password securely

// oidcAdds: what does OIDC add on top of plain OAuth?
//   a) a faster login button
//   b) a way to identify WHO you are (an ID token), not just what an app may access
//   c) encryption for the whole website

const answers = {
  oauthAnswers: "",
  oidcAdds: "",
  idTokenShape: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().toLowerCase();
}

test("oauthAnswers", () => {
  if (said(answers.oauthAnswers) !== "b") {
    throw new Error("What does OAuth, by itself, let an app do? (a, b or c)");
  }
});

test("oidcAdds", () => {
  if (said(answers.oidcAdds) !== "b") {
    throw new Error("What does OIDC add on top of plain OAuth? (a, b or c)");
  }
});

test("idTokenShape", () => {
  if (said(answers.idTokenShape) !== "jwt") {
    throw new Error('What KIND of token is an OIDC ID token? (write the single word: "JWT")');
  }
});
`,

  hints: [
    "oauthAnswers: think about what the redirect-and-approve flow is actually granting: access, not identity.",
    'oidcAdds: OIDC is literally OAuth plus one more token, whose whole job is answering "who".',
    'idTokenShape: you built this exact shape by hand, one strike ago: a signed, base64-encoded payload. Write the single word: JWT',
  ],

  solution: `=== CODE ===
const answers = {
  oauthAnswers: "b",
  oidcAdds: "b",
  idTokenShape: "jwt",
};
=== LINE BY LINE ===
oauthAnswers is b: OAuth's whole job is letting one service access part of another service's data on your behalf, with your explicit, scoped approval — your password itself is never shared with the requesting app.
oidcAdds is b: plain OAuth never actually tells the app WHO you are, only what it may now do. OIDC layers an ID token on top specifically to answer that identity question.
idTokenShape is "jwt": an OIDC ID token is a real JWT, the exact signed-payload shape you built by hand in the previous strike, just issued by the identity provider (Google, GitHub, ...) instead of your own server.`,
};
