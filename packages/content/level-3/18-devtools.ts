import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s18",
  level: 3,
  order: 18,
  title: "Debugging: DevTools",

  look: `Every modern browser has a secret workshop built in, called DevTools (developer tools). It lets you look INSIDE any web page: see its HTML, test its CSS, read its messages, and watch it talk to the internet. It is the best debugging friend you will ever have.

Open it with F12 (or Ctrl+Shift+I, or right-click a page and choose Inspect).

The main panels (tabs):

  Elements     the page's HTML and CSS. Click things, edit them live, see changes instantly.
  Console      where console.log messages and errors appear. You can also type JavaScript here to try it.
  Sources      the page's JavaScript files. This is where you pause code (next strike).
  Network      every request the page makes (pictures, data, API calls), with status codes and timing.
  Application  saved data: localStorage, cookies and more.

Status codes you will see in the Network panel: 200 means OK, 404 means not found, 500 means the server had an error.

Debugging habit: do not guess! Look at what is REALLY happening: what the request was, what came back, what the page holds.

This is a GUIDED-LOCAL strike: use DevTools on your own running Hexhammer at http://localhost:5173.`,

  type: `Fill in the answers object:
  openShortcut       a keyboard shortcut that opens DevTools
  panelForHtml       the panel that shows the page's HTML and CSS
  panelForLogs       the panel where console.log messages appear
  panelForRequests   the panel that lists everything the page asks the internet for
  panelForStorage    the panel that shows localStorage and cookies
  levelsStatus       the status code of the request to /api/levels (find it yourself, see the Break card)`,

  break: `Do this on your own Hexhammer, running at http://localhost:5173:
  1. Press F12 and click the Network tab.
  2. Reload the page (F5). A list of requests appears.
  3. Click the one named levels. Look at its Status, then its Response tab (it shows all your levels as data).
Write the status code in your answers.
Break it on purpose: stop the API (or make a typo in a request URL) and reload. Watch a red failed request appear in the Network panel and an error in the Console. That is how real bugs look, and now you know where to find them.`,

  say: `In one sentence: what is DevTools, and which panel would you open to see if a page's request to a server worked?`,

  starterCode: `// Strike 18: DevTools. Type each answer.

const answers = {
  openShortcut: "",
  panelForHtml: "",
  panelForLogs: "",
  panelForRequests: "",
  panelForStorage: "",
  levelsStatus: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().split(" ").filter(Boolean).join(" ").toLowerCase();
}
function need(what, actual, accepted) {
  if (!accepted.map(said).includes(said(actual))) {
    throw new Error(what + ' (you wrote: "' + String(actual).trim() + '")');
  }
}

test("openShortcut", () => {
  need("A shortcut that opens DevTools", answers.openShortcut, [
    "F12", "Ctrl+Shift+I", "Ctrl + Shift + I", "Cmd+Option+I", "Cmd + Option + I", "Ctrl+Shift+J", "Ctrl+Shift+C",
  ]);
});
test("panelForHtml", () => {
  need("Which panel shows the HTML and CSS?", answers.panelForHtml, ["Elements", "Elements panel"]);
});
test("panelForLogs", () => {
  need("Which panel shows console.log messages?", answers.panelForLogs, ["Console", "Console panel"]);
});
test("panelForRequests", () => {
  need("Which panel lists the requests to the internet?", answers.panelForRequests, ["Network", "Network panel"]);
});
test("panelForStorage", () => {
  need("Which panel shows localStorage and cookies?", answers.panelForStorage, ["Application", "Application panel"]);
});
test("levelsStatus", () => {
  need("The status code of /api/levels (look in the Network panel)", answers.levelsStatus, ["200", "200 OK"]);
});
`,

  hints: [
    "The shortcut is one of the function keys, or Ctrl, Shift and a letter together.",
    "The five panels are named Elements, Console, Sources, Network and Application. Match each job to the right name.",
    "For the status code, do the hands-on steps: Network tab, reload, click the request named levels, read its Status. A healthy one is a three-digit number that starts with a 2.",
  ],

  solution: `=== CODE ===
const answers = {
  openShortcut: "F12",
  panelForHtml: "Elements",
  panelForLogs: "Console",
  panelForRequests: "Network",
  panelForStorage: "Application",
  levelsStatus: "200",
};
=== LINE BY LINE ===
F12 opens DevTools in almost every browser (Ctrl+Shift+I also works, and right-click then Inspect).
Elements shows the live HTML and CSS. You can click a piece of the page and change its styles to test ideas.
Console is where your console.log output and any errors show up.
Network lists every request. Click one to see its status, headers and the response data, which is perfect for checking whether an API call worked.
Application shows saved browser data like localStorage and cookies.
200 means "OK, here is your data". Codes starting with 4 are the caller's fault (404 not found) and codes starting with 5 are the server's fault.`,
};
