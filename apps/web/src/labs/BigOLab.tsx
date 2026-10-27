// BIG O LAB: real functions, really run, with step counters. Nothing here is a canned animation.
import { useMemo, useState } from "react";
import { LabFrame, useGoal, type LabProps } from "./shared";

// Each function returns how many basic steps it took for input size n.
function constantLookup(arr: number[]) {
  void arr[arr.length - 1];
  return 1;
}
function binarySearchSteps(arr: number[], target: number) {
  let lo = 0, hi = arr.length - 1, steps = 0;
  while (lo <= hi) {
    steps++;
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return steps;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return steps;
}
function linearSearchSteps(arr: number[], target: number) {
  let steps = 0;
  for (const x of arr) {
    steps++;
    if (x === target) break;
  }
  return steps;
}
function mergeSortComparisons(arr: number[]): number {
  let comparisons = 0;
  function sort(a: number[]): number[] {
    if (a.length < 2) return a;
    const mid = a.length >> 1;
    const left = sort(a.slice(0, mid));
    const right = sort(a.slice(mid));
    const out: number[] = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
      comparisons++;
      out.push(left[i] <= right[j] ? left[i++] : right[j++]);
    }
    return out.concat(left.slice(i), right.slice(j));
  }
  sort(arr);
  return comparisons;
}
function pairComparisons(arr: number[]) {
  let comparisons = 0;
  for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) comparisons++;
  return comparisons;
}

const ROWS = [
  { name: "O(1) index lookup", run: (a: number[]) => constantLookup(a) },
  { name: "O(log n) binary search (worst case)", run: (a: number[]) => binarySearchSteps(a, -1) },
  { name: "O(n) linear search (worst case)", run: (a: number[]) => linearSearchSteps(a, -1) },
  { name: "O(n log n) merge sort comparisons", run: (a: number[]) => mergeSortComparisons([...a].reverse()) },
  { name: "O(n²) compare every pair", run: (a: number[]) => pairComparisons(a) },
];

export default function BigOLab({ onGoal }: LabProps) {
  const [n, setN] = useState(100);
  const counts = useMemo(() => {
    const arr = Array.from({ length: n }, (_, i) => i);
    return ROWS.map((r) => r.run(arr));
  }, [n]);
  const max = Math.max(...counts, 1);

  // Goal: the smallest n where the O(n²) counter passes 1,000,000. Checked by really counting n-1 too.
  const quadratic = counts[4];
  const previous = n > 1 ? pairComparisons(Array.from({ length: n - 1 }, (_, i) => i)) : 0;
  const goal = useGoal(quadratic > 1_000_000 && previous <= 1_000_000, `n = ${n}: ${quadratic.toLocaleString()} pair comparisons (n − 1 gives ${previous.toLocaleString()}).`, onGoal);

  return (
    <LabFrame title="Growth lab" note="Every counter below comes from actually running the function on an array of n numbers, right now, in your browser." goalMet={goal}>
      <div className="lab__controls">
        <label className="lab__field">
          Input size n
          <input type="range" min={1} max={3000} value={n} onChange={(e) => setN(Number(e.target.value))} />
        </label>
        <label className="lab__field lab__field--small">
          exact n
          <input className="hh-input" type="number" min={1} max={3000} value={n} onChange={(e) => setN(Math.max(1, Math.min(3000, Number(e.target.value) || 1)))} />
        </label>
      </div>
      <table className="data-table lab__table">
        <caption className="visually-hidden">Steps per algorithm for n = {n}</caption>
        <thead>
          <tr><th scope="col">Algorithm</th><th scope="col">Steps for n = {n}</th><th scope="col" aria-hidden="true">Relative</th></tr>
        </thead>
        <tbody>
          {ROWS.map((r, i) => (
            <tr key={r.name}>
              <th scope="row">{r.name}</th>
              <td className="num">{counts[i].toLocaleString()}</td>
              <td aria-hidden="true">
                <span className="bar" style={{ width: `${Math.max(1, (Math.log10(counts[i] + 1) / Math.log10(max + 1)) * 100)}%` }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted">Bars use a logarithmic scale; otherwise the O(n²) bar would hide all the others.</p>
    </LabFrame>
  );
}
