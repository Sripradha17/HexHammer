// LOGS AND TRACES LAB: 60 simulated requests through three services. Latencies come from a seeded
// generator; one hop is slow for some requests. Percentiles are computed for real from the data.
import { useMemo, useState } from "react";
import { Button } from "@hexhammer/design-system";
import { LabFrame, seeded, useGoal, type LabProps } from "./shared";

interface Span {
  service: string;
  operation: string;
  start: number;
  ms: number;
}
interface Trace {
  traceId: string;
  totalMs: number;
  spans: Span[];
  slowSpan: number; // index of the injected slow span (-1 when none)
}

export function makeTraces(): Trace[] {
  const rand = seeded(11);
  return Array.from({ length: 60 }, (_, n) => {
    const slow = n % 9 === 4; // some requests hit the slow query
    const gateway = 5 + Math.round(rand() * 5);
    const api = 10 + Math.round(rand() * 15);
    const pricing = 15 + Math.round(rand() * 20);
    const query = slow ? 700 + Math.round(rand() * 250) : 8 + Math.round(rand() * 12);
    const spans: Span[] = [
      { service: "gateway", operation: "GET /checkout", start: 0, ms: 0 },
      { service: "api", operation: "checkout handler", start: gateway, ms: 0 },
      { service: "pricing", operation: "POST /quote", start: gateway + api, ms: 0 },
      { service: "pricing", operation: "SELECT prices", start: gateway + api + 5, ms: query },
    ];
    spans[2].ms = pricing + query;
    spans[1].ms = api + spans[2].ms;
    spans[0].ms = gateway + spans[1].ms + 3;
    const traceId = Array.from({ length: 16 }, () => Math.floor(rand() * 16).toString(16)).join("");
    return { traceId, totalMs: spans[0].ms, spans, slowSpan: slow ? 3 : -1 };
  });
}

export function percentile(values: number[], p: number) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil((p / 100) * sorted.length) - 1];
}

export default function LogTraceLab({ onGoal }: LabProps) {
  const traces = useMemo(makeTraces, []);
  const totals = traces.map((t) => t.totalMs);
  const [selected, setSelected] = useState<Trace | null>(null);
  const [blamed, setBlamed] = useState<{ traceId: string; span: number } | null>(null);
  const [logFilter, setLogFilter] = useState<string | null>(null);

  const correctBlame = Boolean(blamed && selected && blamed.traceId === selected.traceId && selected.slowSpan === blamed.span && selected.totalMs > 800);
  const goal = useGoal(correctBlame && logFilter === selected?.traceId, `Found the slow span (${selected?.spans[3].operation}) and its logs by trace id.`, onGoal);

  const logs = traces.flatMap((t) =>
    t.spans.slice(1).map((s) => ({ traceId: t.traceId, line: JSON.stringify({ level: s.ms > 500 ? "warn" : "info", service: s.service, msg: s.operation, durationMs: s.ms, traceId: t.traceId }) })),
  );
  const shownLogs = logFilter ? logs.filter((l) => l.traceId === logFilter) : logs.slice(0, 6);
  const scale = selected ? selected.totalMs : 1;

  return (
    <LabFrame title="Logs and traces" note="60 simulated checkout requests (seeded). The percentiles below are computed from these 60 numbers." goalMet={goal}>
      <div className="stat-row">
        <p><span className="stat-row__big">{Math.round(totals.reduce((a, b) => a + b, 0) / totals.length)} ms</span> average</p>
        <p><span className="stat-row__big">{percentile(totals, 50)} ms</span> p50</p>
        <p><span className="stat-row__big">{percentile(totals, 95)} ms</span> p95</p>
        <p><span className="stat-row__big">{percentile(totals, 99)} ms</span> p99</p>
      </div>
      <p className="muted">Pick a request. The slowest ones are where the p99 comes from.</p>
      <div className="trace-picker" role="group" aria-label="Requests by duration">
        {[...traces].sort((a, b) => b.totalMs - a.totalMs).slice(0, 8).map((t) => (
          <button key={t.traceId} type="button" className="hh-chip" aria-pressed={selected?.traceId === t.traceId} onClick={() => (setSelected(t), setBlamed(null), setLogFilter(null))}>
            {t.totalMs} ms
          </button>
        ))}
      </div>
      {selected && (
        <>
          <p>Trace <code>{selected.traceId}</code></p>
          <ol className="waterfall waterfall--trace">
            {selected.spans.map((s, i) => (
              <li key={i}>
                <span className="waterfall__name">{s.service}: {s.operation}</span>
                <span className="waterfall__bar" aria-hidden="true">
                  <span style={{ marginLeft: `${(s.start / scale) * 100}%`, width: `${Math.max(0.5, (s.ms / scale) * 100)}%` }} />
                </span>
                <span className="waterfall__ms">{s.ms} ms</span>
                <Button variant="ghost" size="small" onClick={() => setBlamed({ traceId: selected.traceId, span: i })}>This is the culprit</Button>
              </li>
            ))}
          </ol>
          {blamed && (
            <p className="lab__readout" aria-live="polite">
              {correctBlame
                ? "Right: the database query inside the pricing service is the slow part; the parent spans are only slow because they wait for it."
                : "Not that one. A parent span includes its children's time; find the deepest span with the big number."}
            </p>
          )}
          {correctBlame && <Button size="small" onClick={() => setLogFilter(selected.traceId)}>Show this trace's logs</Button>}
        </>
      )}
      <h4>Logs {logFilter ? `for trace ${logFilter}` : "(latest 6)"}</h4>
      <pre className="lab__code lab__code--logs">{shownLogs.map((l) => l.line).join("\n")}</pre>
    </LabFrame>
  );
}
