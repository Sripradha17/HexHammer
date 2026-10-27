// SQL JOIN LAB: the same authors/books tables as the lesson, joined and grouped by a small JavaScript
// implementation of INNER/LEFT JOIN and COUNT. (The lesson's SQL results were checked against pg-mem;
// this lab follows the same SQL rules so you can SEE each intermediate row.)
import { useState } from "react";
import { LabFrame, useGoal, type LabProps } from "./shared";

const AUTHORS = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Grace" },
  { id: 3, name: "Linus" },
];
const BOOKS = [
  { id: 10, author_id: 1, title: "Notes" },
  { id: 11, author_id: 1, title: "Engines" },
  { id: 12, author_id: 2, title: "Compilers" },
];

type Row = { a_id: number; name: string; b_id: number | null; title: string | null };

export function join(kind: "inner" | "left"): Row[] {
  const rows: Row[] = [];
  for (const a of AUTHORS) {
    const matches = BOOKS.filter((b) => b.author_id === a.id); // ON books.author_id = authors.id
    if (matches.length === 0 && kind === "left") rows.push({ a_id: a.id, name: a.name, b_id: null, title: null });
    for (const b of matches) rows.push({ a_id: a.id, name: a.name, b_id: b.id, title: b.title });
  }
  return rows;
}

export function groupCount(rows: Row[], count: "star" | "column") {
  const groups = new Map<string, Row[]>();
  for (const r of rows) groups.set(r.name, [...(groups.get(r.name) ?? []), r]);
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, rs]) => ({ name, book_count: count === "star" ? rs.length : rs.filter((r) => r.b_id !== null).length }));
}

export default function SqlJoinLab({ onGoal }: LabProps) {
  const [kind, setKind] = useState<"inner" | "left">("inner");
  const [count, setCount] = useState<"star" | "column">("star");
  const rows = join(kind);
  const result = groupCount(rows, count);
  const correct = result.length === 3 && result.every((r) => r.book_count === BOOKS.filter((b) => b.author_id === AUTHORS.find((a) => a.name === r.name)!.id).length);
  const goal = useGoal(correct, `${kind.toUpperCase()} JOIN with COUNT(${count === "star" ? "*" : "b.id"}) lists every author once with the right count.`, onGoal);

  return (
    <LabFrame title="Join explorer" note="The lesson's tables, joined by a small implementation of the SQL rules so every intermediate row is visible." goalMet={goal}>
      <div className="lab__controls">
        <label className="lab__field lab__field--small">
          Join
          <select className="hh-select" value={kind} onChange={(e) => setKind(e.target.value as "inner" | "left")}>
            <option value="inner">INNER JOIN</option>
            <option value="left">LEFT JOIN</option>
          </select>
        </label>
        <label className="lab__field lab__field--small">
          Count
          <select className="hh-select" value={count} onChange={(e) => setCount(e.target.value as "star" | "column")}>
            <option value="star">COUNT(*)</option>
            <option value="column">COUNT(b.id)</option>
          </select>
        </label>
      </div>
      <pre className="lab__code">{`SELECT a.name, ${count === "star" ? "COUNT(*)" : "COUNT(b.id)"} AS book_count
FROM authors a
${kind === "inner" ? "JOIN" : "LEFT JOIN"} books b ON b.author_id = a.id
GROUP BY a.name ORDER BY a.name;`}</pre>
      <div className="lab__grid">
        <table className="data-table">
          <caption>1. Rows after the join ({rows.length})</caption>
          <thead><tr><th scope="col">a.name</th><th scope="col">b.id</th><th scope="col">b.title</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={r.b_id === null ? "is-null" : ""}>
                <td>{r.name}</td><td>{r.b_id ?? "NULL"}</td><td>{r.title ?? "NULL"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="data-table">
          <caption>2. After GROUP BY</caption>
          <thead><tr><th scope="col">name</th><th scope="col">book_count</th></tr></thead>
          <tbody>
            {result.map((r) => (
              <tr key={r.name}><td>{r.name}</td><td className="num">{r.book_count}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="lab__readout" aria-live="polite">
        {kind === "inner" ? "INNER JOIN drops Linus: he has no matching book." : count === "star" ? "LEFT JOIN keeps Linus, but COUNT(*) counts his NULL row as 1." : "LEFT JOIN + COUNT(b.id): Linus appears with 0. Correct."}
      </p>
    </LabFrame>
  );
}
