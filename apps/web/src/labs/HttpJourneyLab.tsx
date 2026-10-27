// HTTP JOURNEY LAB: a request's phases as a waterfall. It is a SIMULATION with typical example
// timings (you can change them), applying the real rules: no DNS lookup when the answer is cached,
// no TCP/TLS handshake when a kept-alive connection is reused, no request at all when the browser
// cache is fresh, and no body download on a 304.
import { useState } from "react";
import { Button } from "@hexhammer/design-system";
import { LabFrame, useGoal, type LabProps } from "./shared";

interface Phase {
  name: string;
  ms: number;
  why: string;
}

export function journey(opts: { dnsCached: boolean; keepAlive: boolean; cache: "none" | "fresh" | "revalidate"; first: boolean; serverMs: number; rttMs: number; bodyKb: number }): Phase[] {
  const { dnsCached, keepAlive, cache, first, serverMs, rttMs, bodyKb } = opts;
  if (!first && cache === "fresh") return [{ name: "Browser cache", ms: 0, why: "Cache-Control says the copy is still fresh: no request leaves the browser." }];
  const reuse = !first && keepAlive;
  const phases: Phase[] = [];
  phases.push(first || !dnsCached ? { name: "DNS lookup", ms: rttMs, why: "Ask a resolver for the IP address." } : { name: "DNS lookup", ms: 0, why: "Answer cached (within its TTL)." });
  phases.push(reuse ? { name: "TCP handshake", ms: 0, why: "Connection reused (keep-alive)." } : { name: "TCP handshake", ms: rttMs, why: "SYN, SYN-ACK, ACK: one round trip." });
  phases.push(reuse ? { name: "TLS handshake", ms: 0, why: "Already encrypted connection reused." } : { name: "TLS handshake", ms: rttMs, why: "TLS 1.3 agrees keys in one round trip." });
  const notModified = !first && cache === "revalidate";
  phases.push({ name: "Waiting (TTFB)", ms: rttMs + serverMs, why: notModified ? "Request with If-None-Match; server checks the ETag." : "Request travels, server runs middleware + database, first byte returns." });
  phases.push(notModified ? { name: "Download", ms: 0, why: "304 Not Modified: no body is sent." } : { name: "Download", ms: Math.round(bodyKb / 50), why: `${bodyKb} KB at about 50 KB per ms of bandwidth.` });
  return phases;
}

export default function HttpJourneyLab({ onGoal }: LabProps) {
  const [dnsCached, setDnsCached] = useState(true);
  const [keepAlive, setKeepAlive] = useState(false);
  const [cache, setCache] = useState<"none" | "fresh" | "revalidate">("none");
  const [rttMs, setRtt] = useState(40);
  const [serverMs, setServer] = useState(40);
  const [bodyKb, setBody] = useState(120);
  const [sent, setSent] = useState(0); // how many requests so far (0 = none, 1 = first, 2+ = repeat)

  const phases = sent === 0 ? [] : journey({ dnsCached, keepAlive, cache, first: sent === 1, serverMs, rttMs, bodyKb });
  const total = phases.reduce((n, p) => n + p.ms, 0);
  const max = Math.max(1, ...phases.map((p) => p.ms));
  const goal = useGoal(sent >= 2 && total < 50, `A repeat request took ${total} ms (${phases.filter((p) => p.ms === 0).map((p) => p.name).join(", ")} skipped).`, onGoal);

  return (
    <LabFrame title="Request journey" note="Simulation with example timings you control. The rules for what is skipped are the real HTTP rules; real numbers come from your browser's Network panel." goalMet={goal}>
      <div className="lab__grid">
        <fieldset className="lab__fieldset">
          <legend>Connection and caching</legend>
          <label className="check"><input type="checkbox" checked={dnsCached} onChange={(e) => setDnsCached(e.target.checked)} /> DNS answer cached for repeat requests</label>
          <label className="check"><input type="checkbox" checked={keepAlive} onChange={(e) => setKeepAlive(e.target.checked)} /> Keep-alive (reuse the connection)</label>
          <label className="lab__field">
            HTTP cache
            <select className="hh-select" value={cache} onChange={(e) => setCache(e.target.value as typeof cache)}>
              <option value="none">no-store (always download)</option>
              <option value="revalidate">no-cache + ETag (revalidate, 304)</option>
              <option value="fresh">max-age=3600 (fresh copy)</option>
            </select>
          </label>
        </fieldset>
        <fieldset className="lab__fieldset">
          <legend>Example timings</legend>
          <label className="lab__field">Round trip {rttMs} ms<input type="range" min={5} max={300} value={rttMs} onChange={(e) => setRtt(Number(e.target.value))} /></label>
          <label className="lab__field">Server work {serverMs} ms<input type="range" min={5} max={800} value={serverMs} onChange={(e) => setServer(Number(e.target.value))} /></label>
          <label className="lab__field">Body {bodyKb} KB<input type="range" min={1} max={2000} value={bodyKb} onChange={(e) => setBody(Number(e.target.value))} /></label>
        </fieldset>
      </div>
      <div className="lab__controls">
        <Button onClick={() => setSent(sent + 1)}>{sent === 0 ? "Send first request" : "Send it again"}</Button>
        {sent > 0 && <Button variant="ghost" size="small" onClick={() => setSent(0)}>Start over (new visit)</Button>}
      </div>
      {phases.length > 0 && (
        <>
          <p className="lab__readout" aria-live="polite">
            {sent === 1 ? "First request" : `Repeat request #${sent - 1}`}: <strong>{total} ms</strong>
          </p>
          <ol className="waterfall">
            {phases.map((p) => (
              <li key={p.name} className={p.ms === 0 ? "is-skipped" : ""}>
                <span className="waterfall__name">{p.name}</span>
                <span className="waterfall__bar" aria-hidden="true"><span style={{ width: `${(p.ms / max) * 100}%` }} /></span>
                <span className="waterfall__ms">{p.ms} ms</span>
                <span className="waterfall__why">{p.why}</span>
              </li>
            ))}
          </ol>
        </>
      )}
    </LabFrame>
  );
}
