import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l6-s05",
  level: 6,
  order: 5,
  title: "Context",
  runner: "react",

  look: `Props pass data DOWN, one level at a time. Context lets a value skip straight from a Provider to any component that asks for it, no matter how deeply nested, without every component in between having to pass it along just to relay it further.

  const ThemeContext = React.createContext("light");

  function ShowTheme() {
    const theme = React.useContext(ThemeContext);
    return <p>{theme}</p>;
  }

  <ThemeContext.Provider value="dark">
    <ShowTheme />
  </ThemeContext.Provider>

ShowTheme reads whatever value the NEAREST matching Provider actually set ("dark" here), not the default given to createContext ("light", only used if there is no Provider at all above it).`,

  type: `Finish ShowTheme: read the current theme from ThemeContext with useContext, and display it.`,

  break: `Break it on purpose: have ShowTheme just display the hardcoded word "light" instead of actually reading ThemeContext. It still renders something, so the mistake is easy to miss — but it no longer reflects whatever the real Provider above it actually set, which defeats the entire point of using context in the first place. Read the value with React.useContext(ThemeContext) instead.`,

  say: `In one sentence: what problem does context solve that passing props down, level by level, does not?`,

  starterCode: `const ThemeContext = React.createContext("light");

function ShowTheme() {
  // your code here
  return <p id="theme"></p>;
}

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ShowTheme />
    </ThemeContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
`,

  tests: `test("ShowTheme reads the real theme from context, not a hardcoded guess", async () => {
  await settle();
  expect(document.getElementById("theme").textContent).toBe("dark");
});
`,

  hints: [
    "Read the context value with a hook: const theme = React.useContext(ThemeContext);",
    "Display it inside the <p>: return <p id=\"theme\">{theme}</p>;",
    'function ShowTheme() {\n  const theme = React.useContext(ThemeContext);\n  return <p id="theme">{theme}</p>;\n}',
  ],

  solution: `=== CODE ===
const ThemeContext = React.createContext("light");

function ShowTheme() {
  const theme = React.useContext(ThemeContext);
  return <p id="theme">{theme}</p>;
}

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ShowTheme />
    </ThemeContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
=== LINE BY LINE ===
React.createContext("light") creates the context itself, with "light" as a fallback default — only used if a component reads it with NO Provider anywhere above it at all.
<ThemeContext.Provider value="dark"> is what ShowTheme actually sees here: the Provider's value always wins over the default, for every component nested inside it.
React.useContext(ThemeContext) is the read side: it looks UP the tree for the nearest matching Provider and returns whatever value it set — ShowTheme never needed App to pass it a theme prop directly at all.`,
};
