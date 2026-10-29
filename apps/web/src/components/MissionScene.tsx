// MISSION SCENES: the live, touchable object on the Home screen (and in a mission's "See" step).
// Each mission gets the scene that fits its topic (its visualizationType):
//
//   EncodingFlow   "binary": one character becoming a number, then bytes, then hex, then back.
//                  Everything is REAL: TextEncoder / TextDecoder do the work.
//   PipelineScene  topics that are "a thing travelling through stages" (HTTP, middleware, queues,
//                  CI, traces, RAG...). Press Send and watch a packet move, one stage at a time.
//   RegionBeacon   everything else: the region's emblem, ringed by its modules, each lit by how
//                  much of it I have really passed.
import { useEffect, useState, type CSSProperties } from "react";
import type { Region } from "../atlasApi";
import type { VisualizationType } from "@hexhammer/content";

// ================================================================== 1. Encoding flow

const PRESETS = ["A", "é", "€", "🙂", "ß"];
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(2, "0");

// How many leading bits of a UTF-8 byte are "markers" (not data):
//   1-byte char: 0xxxxxxx   first of 2: 110xxxxx   of 3: 1110xxxx   of 4: 11110xxx   later: 10xxxxxx
function markerBits(byteIndex: number, byteCount: number) {
  if (byteIndex > 0) return 2;
  return byteCount === 1 ? 1 : byteCount + 1;
}

export function EncodingFlow({ compact = false }: { compact?: boolean }) {
  const [char, setChar] = useState("é");
  const codePoint = char ? char.codePointAt(0)! : null;
  const bytes = char ? [...encoder.encode(char)] : [];
  const decoded = bytes.length ? decoder.decode(new Uint8Array(bytes)) : "";

  // Typing replaces the character: keep only the last one typed (a whole emoji counts as one).
  function onType(value: string) {
    const points = [...value];
    setChar(points[points.length - 1] ?? "");
  }

  return (
    <div className={`flow ${compact ? "flow--compact" : ""}`}>
      <div className="flow__controls" role="group" aria-label="Pick or type a character">
        {PRESETS.map((p) => (
          <button key={p} type="button" className="flow__preset" aria-pressed={char === p} onClick={() => setChar(p)}>
            {p}
          </button>
        ))}
        <label className="flow__input">
          <span className="visually-hidden">Type any character</span>
          <input value={char} onChange={(e) => onType(e.target.value)} onFocus={(e) => e.target.select()} placeholder="type" maxLength={8} />
        </label>
      </div>

      {codePoint === null ? (
        <p className="flow__empty">Type a character to send it through.</p>
      ) : (
        // The key restarts the entrance animation each time the character changes.
        <ol className="flow__track" key={char} aria-live="polite">
          <li className="flow__station" style={{ "--n": 0 } as CSSProperties}>
            <span className="flow__label">Character</span>
            <span className="flow__glyph">{char === " " ? "␠" : char}</span>
          </li>
          <li className="flow__station" style={{ "--n": 1 } as CSSProperties}>
            <span className="flow__label">Unicode code point</span>
            <span className="flow__value">U+{codePoint.toString(16).toUpperCase().padStart(4, "0")}</span>
            <span className="flow__sub">{codePoint} in decimal</span>
          </li>
          <li className="flow__station flow__station--wide" style={{ "--n": 2 } as CSSProperties}>
            <span className="flow__label">
              UTF-8 bytes · {bytes.length} byte{bytes.length > 1 ? "s" : ""}
            </span>
            <span className="flow__bytes">
              {bytes.map((b, i) => {
                const marker = markerBits(i, bytes.length);
                return (
                  <span key={i} className="flow__byte" aria-label={`byte ${i + 1}: ${b.toString(2).padStart(8, "0")}`}>
                    {b
                      .toString(2)
                      .padStart(8, "0")
                      .split("")
                      .map((bit, j) => (
                        <span key={j} className={`flow__bit ${j < marker ? "is-marker" : ""} ${bit === "1" ? "is-on" : ""}`} style={{ "--b": i * 8 + j } as CSSProperties}>
                          {bit}
                        </span>
                      ))}
                  </span>
                );
              })}
            </span>
          </li>
          <li className="flow__station" style={{ "--n": 3 } as CSSProperties}>
            <span className="flow__label">Hexadecimal</span>
            <span className="flow__value flow__value--hex">{bytes.map(hex2).join(" ")}</span>
          </li>
          <li className="flow__station flow__station--end" style={{ "--n": 4 } as CSSProperties}>
            <span className="flow__label">Decoded</span>
            <span className="flow__glyph">{decoded}</span>
            <span className={`flow__sub ${decoded === char ? "is-ok" : ""}`}>{decoded === char ? "round trip OK" : "mismatch"}</span>
          </li>
        </ol>
      )}
      {!compact && codePoint !== null && (
        <p className="flow__note">
          <span className="flow__key is-marker" aria-hidden="true" /> marker bits say "how many bytes"
          <span className="flow__key" aria-hidden="true" /> payload bits carry the number
          {char.length > 1 && <> · JavaScript's <code>.length</code> says {char.length}, not 1</>}
        </p>
      )}
    </div>
  );
}

// ================================================================== 2. Pipeline scene

interface Stage {
  name: string;
  says: string; // what happens here, in plain words
}

// The stages for each topic that is "something travelling through steps".
const PIPELINES: Partial<Record<VisualizationType, { thing: string; stages: Stage[] }>> = {
  "http-journey": {
    thing: "request",
    stages: [
      { name: "Browser", says: "You press Enter. The browser reads the URL." },
      { name: "DNS", says: "The name (example.com) is looked up and becomes an IP address." },
      { name: "TCP + TLS", says: "A connection opens, then gets encrypted." },
      { name: "Server", says: "The request is routed and a handler does the work." },
      { name: "Response", says: "Status, headers and bytes travel back. The page renders." },
    ],
  },
  "middleware-pipeline": {
    thing: "request",
    stages: [
      { name: "Request", says: "A request arrives at the server." },
      { name: "Logger", says: "Writes down what came in, then calls next()." },
      { name: "Auth", says: "No valid token? It answers 401 and the trip stops here." },
      { name: "Validate", says: "Checks the body has the right shape." },
      { name: "Handler", says: "Does the real work and sends the response." },
    ],
  },
  queue: {
    thing: "message",
    stages: [
      { name: "Producer", says: "Something happened; a message is published." },
      { name: "Queue", says: "The message waits safely, even if nobody is ready." },
      { name: "Consumer", says: "A worker picks it up and processes it." },
      { name: "Retry", says: "It failed? Try again later, with a growing wait." },
      { name: "Done", says: "Acknowledged. Only now is it removed from the queue." },
    ],
  },
  "ci-pipeline": {
    thing: "commit",
    stages: [
      { name: "Commit", says: "You push code." },
      { name: "Lint", says: "Style and obvious mistakes are checked in seconds." },
      { name: "Test", says: "Automated tests run. One failure blocks the rest." },
      { name: "Build", says: "The app is packaged exactly once." },
      { name: "Deploy", says: "That same package goes live." },
    ],
  },
  "log-trace": {
    thing: "request",
    stages: [
      { name: "Edge", says: "A trace id is created for this one request." },
      { name: "API", says: "A span records how long the API took." },
      { name: "Cache", says: "Another span: was it a hit or a miss?" },
      { name: "Database", says: "The slowest span usually lives here." },
      { name: "Trace", says: "All spans line up into one waterfall picture." },
    ],
  },
  rag: {
    thing: "question",
    stages: [
      { name: "Question", says: "A user asks something." },
      { name: "Embed", says: "The question becomes a vector of numbers." },
      { name: "Retrieve", says: "The closest document chunks are found." },
      { name: "Prompt", says: "Those chunks are placed next to the question." },
      { name: "Answer", says: "The model answers only from the chunks." },
    ],
  },
  cache: {
    thing: "read",
    stages: [
      { name: "Request", says: "Someone asks for a product page." },
      { name: "Cache", says: "Is a fresh copy already in memory?" },
      { name: "Database", says: "Miss: read the slow, true source." },
      { name: "Store", says: "Save the copy with an expiry time." },
      { name: "Hit", says: "Next time it comes straight from the cache." },
    ],
  },
  "event-loop": {
    thing: "callback",
    stages: [
      { name: "Call stack", says: "Your code runs to the end first." },
      { name: "Web API", says: "The timer or fetch waits outside JavaScript." },
      { name: "Microtasks", says: "Promise callbacks wait here, first in line." },
      { name: "Task queue", says: "Timer callbacks wait here, after microtasks." },
      { name: "Event loop", says: "Stack empty? Run the next waiting callback." },
    ],
  },
  "sql-join": {
    thing: "row",
    stages: [
      { name: "users", says: "The left table: one row per user." },
      { name: "orders", says: "The right table: many rows can share a user_id." },
      { name: "ON match", says: "Rows pair up where the keys are equal." },
      { name: "Result", says: "INNER keeps pairs; LEFT also keeps users with no orders." },
    ],
  },
  injection: {
    thing: "input",
    stages: [
      { name: "Input", says: "A user types into a form." },
      { name: "Parameter", says: "Sent as DATA, separately from the SQL text." },
      { name: "Query", says: "The SQL shape is fixed before the data arrives." },
      { name: "Database", says: "The input can never become a command." },
    ],
  },
  "prompt-injection": {
    thing: "text",
    stages: [
      { name: "Rules", says: "Your system instructions." },
      { name: "Untrusted", says: "A web page says: ignore your rules." },
      { name: "Model", says: "It cannot reliably tell rules from data." },
      { name: "Guard", says: "Limit what tools the model may call." },
      { name: "Output", says: "Check the result before anyone acts on it." },
    ],
  },
};

export function hasPipeline(kind: VisualizationType) {
  return Boolean(PIPELINES[kind]);
}

export function PipelineScene({ kind, hue }: { kind: VisualizationType; hue: number }) {
  const pipe = PIPELINES[kind]!;
  const [at, setAt] = useState(-1); // which stage the packet is at; -1 = not sent yet
  const [running, setRunning] = useState(false);
  const last = pipe.stages.length - 1;

  // While running, step forward every 0.9 s (state, not CSS, so it also works with motion off).
  useEffect(() => {
    if (!running) return;
    if (at >= last) {
      setRunning(false);
      return;
    }
    const timer = setTimeout(() => setAt((a) => a + 1), at < 0 ? 100 : 900);
    return () => clearTimeout(timer);
  }, [running, at, last]);

  const current = at >= 0 ? pipe.stages[at] : null;
  return (
    <div className="pipe" style={{ "--hue": hue } as CSSProperties}>
      <div className="pipe__track">
        <span className="pipe__rail" aria-hidden="true">
          <span className="pipe__fill" style={{ width: `${(Math.max(0, at) / last) * 100}%` }} />
          {at >= 0 && <span className="pipe__packet" style={{ left: `${(at / last) * 100}%` }} />}
        </span>
        <ol className="pipe__stages">
          {pipe.stages.map((s, i) => (
            <li key={s.name}>
              <button type="button" className={`pipe__stage ${i === at ? "is-here" : ""} ${i < at ? "is-passed" : ""}`} aria-current={i === at ? "step" : undefined} onClick={() => (setRunning(false), setAt(i))}>
                <span className="pipe__node" aria-hidden="true">
                  {i + 1}
                </span>
                {s.name}
              </button>
            </li>
          ))}
        </ol>
      </div>
      <p className="pipe__caption" aria-live="polite">
        {current ? (
          <>
            <strong>{current.name}.</strong> {current.says}
          </>
        ) : (
          <>Send a {pipe.thing} and follow it through every stage.</>
        )}
      </p>
      <button type="button" className="cta cta--small cta--ghost" onClick={() => (setAt(-1), setRunning(true))} disabled={running}>
        {running ? "Travelling…" : at >= last ? `Send another ${pipe.thing}` : `Send the ${pipe.thing}`}
      </button>
    </div>
  );
}

// ================================================================== 3. Region beacon

export function RegionBeacon({ region }: { region: Region }) {
  const modules = region.modules;
  const R = 118; // orbit radius in SVG units
  return (
    <figure className="beacon" style={{ "--hue": region.hue } as CSSProperties}>
      <svg viewBox="-170 -170 340 340" role="img" aria-label={`${region.short}: ${modules.length} modules around the region emblem`}>
        <circle r={R} className="beacon__orbit" />
        <circle r={R - 42} className="beacon__orbit beacon__orbit--inner" />
        <g className="beacon__ring">
          {modules.map((m, i) => {
            const angle = (i / modules.length) * Math.PI * 2 - Math.PI / 2;
            const passed = m.topics.filter((t) => t.status === "assessed" || t.status === "mastered").length;
            const started = m.topics.some((t) => t.status !== "new" && t.status !== "locked");
            const share = m.topics.length ? passed / m.topics.length : 0;
            return (
              <g key={m.id} transform={`translate(${Math.cos(angle) * R} ${Math.sin(angle) * R})`}>
                <title>{`${m.title}: ${passed} of ${m.topics.length} passed`}</title>
                <circle r="15" className={`beacon__module ${started ? "is-started" : ""}`} />
                <circle r="15" className="beacon__module-fill" style={{ strokeDasharray: `${share * 94.2} 94.2` }} transform="rotate(-90)" />
              </g>
            );
          })}
        </g>
        <polygon points="0,-62 54,-31 54,31 0,62 -54,31 -54,-31" className="beacon__core" />
      </svg>
      <figcaption className="beacon__caption">
{region.short} · {modules.length} modules · {region.counts.assessed}/{region.counts.topics} passed
      </figcaption>
    </figure>
  );
}

// ================================================================== Picker

export function MissionScene({ kind, region, compact }: { kind: VisualizationType; region: Region | null; compact?: boolean }) {
  if (kind === "binary") return <EncodingFlow compact={compact} />;
  if (hasPipeline(kind)) return <PipelineScene kind={kind} hue={region?.hue ?? 196} />;
  return region ? <RegionBeacon region={region} /> : null;
}
