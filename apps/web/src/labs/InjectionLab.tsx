// INJECTION LAB: the same input, glued into SQL text vs sent as a parameter.
// A tiny evaluator understands exactly the WHERE clauses this lab can produce
// (email = '...' joined by OR/AND, string literals compared to each other), so you can see which rows
// each version would return. It is a teaching evaluator, not a database; the lesson's real check was
// run against pg-mem.
import { useState } from "react";
import { LabFrame, useGoal, type LabProps } from "./shared";

const USERS = [
  { id: 1, email: "ada@example.com" },
  { id: 2, email: "grace@example.com" },
  { id: 3, email: "linus@example.com" },
];

// Splits a WHERE clause into tokens: quoted strings, identifiers, =, OR, AND, and -- comments.
function tokenize(where: string): string[] | null {
  const tokens: string[] = [];
  let i = 0;
  while (i < where.length) {
    const c = where[i];
    if (/\s/.test(c)) { i++; continue; }
    if (where.startsWith("--", i)) break; // a comment hides the rest of the query
    if (c === "'") {
      let j = i + 1, text = "";
      while (j < where.length) {
        if (where[j] === "'" && where[j + 1] === "'") { text += "'"; j += 2; continue; } // '' is an escaped quote
        if (where[j] === "'") break;
        text += where[j++];
      }
      if (j >= where.length) return null; // unterminated string: a syntax error
      tokens.push(`'${text}`);
      i = j + 1;
      continue;
    }
    if (c === "=") { tokens.push("="); i++; continue; }
    const word = where.slice(i).match(/^[A-Za-z_][A-Za-z0-9_.]*/);
    if (!word) return null;
    tokens.push(word[0].toUpperCase() === "OR" || word[0].toUpperCase() === "AND" ? word[0].toUpperCase() : word[0]);
    i += word[0].length;
  }
  return tokens;
}

// Evaluates "a = b (OR|AND a = b)*" for one row. AND binds tighter than OR, like SQL.
function matches(tokens: string[], row: { email: string }): boolean | null {
  const value = (t: string) => (t.startsWith("'") ? t.slice(1) : t === "email" ? row.email : undefined);
  const comparisons: (boolean | "OR" | "AND")[] = [];
  for (let i = 0; i < tokens.length; ) {
    const [a, eq, b] = [tokens[i], tokens[i + 1], tokens[i + 2]];
    if (eq !== "=" || value(a) === undefined || value(b) === undefined) return null;
    comparisons.push(value(a) === value(b));
    i += 3;
    if (i < tokens.length) {
      if (tokens[i] !== "OR" && tokens[i] !== "AND") return null;
      comparisons.push(tokens[i] as "OR" | "AND");
      i++;
    }
  }
  const orGroups: boolean[] = [];
  let current = comparisons[0] as boolean;
  for (let i = 1; i < comparisons.length; i += 2) {
    if (comparisons[i] === "AND") current = current && (comparisons[i + 1] as boolean);
    else { orGroups.push(current); current = comparisons[i + 1] as boolean; }
  }
  orGroups.push(current);
  return orGroups.some(Boolean);
}

export function runGlued(input: string) {
  const where = `email = '${input}'`;
  const tokens = tokenize(where);
  if (!tokens) return { sql: `SELECT * FROM users WHERE ${where}`, rows: null };
  const rows = USERS.filter((u) => matches(tokens, u));
  return { sql: `SELECT * FROM users WHERE ${where}`, rows: tokens.length && USERS.every((u) => matches(tokens, u) !== null) ? rows : null };
}

export default function InjectionLab({ onGoal }: LabProps) {
  const [input, setInput] = useState("ada@example.com");
  const glued = runGlued(input);
  const paramRows = USERS.filter((u) => u.email === input);
  const goal = useGoal(Boolean(glued.rows && glued.rows.length === USERS.length && paramRows.length === 0), `Input ${JSON.stringify(input)} returned every row when glued, none when parameterized.`, onGoal);

  return (
    <LabFrame title="Injection" note="A tiny teaching evaluator for this one query shape shows which rows each version returns. The parameterized version is a plain equality check, exactly what a database does with a bound value." goalMet={goal}>
      <label className="lab__field">
        Email typed into the form
        <input className="hh-input" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
      </label>
      <p className="muted">Try: <code>x' OR '1'='1</code> or <code>ada@example.com' --</code></p>
      <div className="lab__grid">
        <div className="injection injection--bad">
          <h4>Glued into the SQL text</h4>
          <pre className="lab__code">{glued.sql}</pre>
          <p aria-live="polite">{glued.rows === null ? "Syntax error: the input broke the query." : `Returns ${glued.rows.length} row(s): ${glued.rows.map((r) => r.email).join(", ") || "none"}`}</p>
        </div>
        <div className="injection injection--good">
          <h4>Sent as a parameter</h4>
          <pre className="lab__code">{`text:   SELECT * FROM users WHERE email = $1\nvalues: [${JSON.stringify(input)}]`}</pre>
          <p aria-live="polite">Returns {paramRows.length} row(s){paramRows.length ? `: ${paramRows[0].email}` : ""}. The query's shape never changes.</p>
        </div>
      </div>
    </LabFrame>
  );
}
