// THE CODE BAY: one hand-typed strike. Left: the four beats (Look, Type, Break, Say), one at a
// time, and the hint ladder. Right: the editor, Run tests, the results and the console.
// Beat 5 (Save) happens by itself: code auto-saves 1 second after I stop typing.
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { TextArea } from "@hexhammer/design-system";
import { api, type StrikeData } from "../api";
import { CodeEditor } from "../components/CodeEditor";
import { TestResults } from "../components/TestResults";
import { HintLadder } from "../components/HintLadder";
import { Icon } from "../components/Icon";
import { Loading } from "../components/Loading";
import { createWorker } from "../runner/createWorker";
import { runCode } from "../runner/runCode";
import { createTestFrame } from "../runner/createTestFrame";
import { runIframeTests } from "../runner/runIframeTests";
import { runServerCode } from "../runner/runServerCode";
import { runSqlCode } from "../runner/runSqlCode";
import { runReactTests } from "../runner/runReactTests";
import { buildReactPreviewDoc } from "../runner/buildReactDoc";
import { LivePreview } from "../components/LivePreview";
import type { RunResult } from "../runner/execute";

const AUTOSAVE_DELAY_MS = 1000;

// The outer page only reads the id from the URL. The `key` makes React start fresh for each strike.
export function StrikePage({ onProgress }: { onProgress: () => void }) {
  const { id = "" } = useParams();
  return <StrikeView key={id} id={id} onProgress={onProgress} />;
}

function StrikeView({ id, onProgress }: { id: string; onProgress: () => void }) {
  const [strike, setStrike] = useState<StrikeData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [code, setCode] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState<RunResult | null>(null);
  const [failedRuns, setFailedRuns] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [sayText, setSayText] = useState("");
  const [sayState, setSayState] = useState<"idle" | "saved">("idle");
  const [beat, setBeat] = useState<"look" | "type" | "break" | "say">("look");
  const location = useLocation();

  // The last code we know the database has. Used so we do not save the same code twice.
  const lastSavedCode = useRef("");

  // 1. Load the strike when the page opens.
  useEffect(() => {
    api
      .getStrike(id)
      .then((data) => {
        setStrike(data);
        const startCode = data.savedCode ?? data.starterCode;
        setCode(startCode);
        // If I have not typed anything yet, the starter code counts as "already saved",
        // so just opening a strike does not mark it in progress.
        lastSavedCode.current = startCode;
        setFailedRuns(data.attempts);
        setSayText(data.sayNote);
      })
      .catch((error: Error) => setLoadError(error.message));
  }, [id]);

  // 2. Auto-save: wait until I stop typing for 1 second, then save.
  useEffect(() => {
    if (!strike || code === lastSavedCode.current) return;

    setSaveState("saving");
    const timer = setTimeout(() => {
      api
        .saveCode(id, code)
        .then(() => {
          lastSavedCode.current = code;
          setSaveState("saved");
        })
        .catch(() => setSaveState("idle"));
    }, AUTOSAVE_DELAY_MS);

    // If I type again before the second is up, cancel this timer (a new one starts).
    return () => clearTimeout(timer);
  }, [code, id, strike]);

  async function handleRunTests() {
    if (!strike) return;
    setRunning(true);
    setCelebrate(false);

    // A web page strike runs in a sandboxed iframe. A React strike (Level 6) runs in the same
    // sandboxed iframe, with React/ReactDOM/Babel loaded first. A server strike (Level 5+) runs
    // for real on the local API, in a throwaway process. A sql strike runs for real too, but
    // against a throwaway IN-MEMORY database, never the app's real one. Everything else runs in
    // a Web Worker. Same give-up-after-a-while safety net either way, just a different sandbox.
    const result =
      strike.runner === "iframe"
        ? await runIframeTests(code, strike.tests, createTestFrame)
        : strike.runner === "react"
          ? await runReactTests(code, strike.tests, createTestFrame)
          : strike.runner === "server"
            ? await runServerCode(code, strike.tests)
            : strike.runner === "sql"
              ? await runSqlCode(code, strike.sqlSeed ?? "", strike.tests)
              : await runCode(code, strike.tests, createWorker);
    setRun(result);

    const allPassed =
      !result.timedOut &&
      !result.error &&
      result.results.length > 0 &&
      result.results.every((r) => r.passed);

    try {
      const answer = await api.recordAttempt(id, allPassed, code);
      lastSavedCode.current = code;
      setFailedRuns(answer.attempts);
      if (allPassed) {
        setCelebrate(true);
        setStrike({ ...strike, status: "complete" });
        onProgress(); // refresh the streak counter
      }
    } catch {
      // If the API is down we still show the test results. Only the saving is skipped.
    }
    setRunning(false);
  }

  async function handleSaveSay() {
    await api.saveSay(id, sayText);
    setSayState("saved");
    onProgress();
  }

  if (loadError)
    return (
      <p className="message message--bad">Could not load this strike: {loadError}</p>
    );
  if (!strike) return <Loading />;

  // Back to the mission that sent me here (?mission=topic-id), or to the world map.
  const missionId = new URLSearchParams(location.search).get("mission");
  const backTo = missionId ? `/topic/${missionId}#solve` : "/map";
  const backLabel = missionId ? "Back to the mission" : "World";
  const BEATS = [
    { id: "look", label: "Look", text: strike.look },
    { id: "type", label: "Type", text: strike.type },
    { id: "break", label: "Break", text: strike.break },
  ] as const;

  return (
    <div className="bay-page">
      <header className="mission__head">
        <Link to={backTo} className="mission__back">
          <Icon name="back" size={16} /> {backLabel}
        </Link>
        <p className="kicker">
          Code bay · {strike.trackTitle ?? "hand-typed strike"}
          {strike.status === "complete" && <span className="pill pill--green">Passed</span>}
        </p>
        <h1 className="mission__title">{strike.title}</h1>
      </header>

      <div className="bay-grid">
        <div className="bay-left">
          <div className="tabs" role="tablist" aria-label="The four beats">
            {[...BEATS.map((b) => b.id), "say" as const].map((id) => (
              <button key={id} type="button" role="tab" aria-selected={beat === id} className="tabs__tab" onClick={() => setBeat(id)}>
                {id[0].toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
          <div className="stage-box beat" key={beat}>
            {beat === "say" ? (
              <>
                <p>{strike.say}</p>
                <TextArea
                  className="say-box"
                  aria-label="Your one-sentence explanation"
                  rows={3}
                  value={sayText}
                  placeholder="Type your one sentence here…"
                  onChange={(event) => {
                    setSayText(event.target.value);
                    setSayState("idle");
                  }}
                />
                <button type="button" className="cta cta--small" onClick={handleSaveSay} disabled={sayText.trim() === ""}>
                  Save my sentence
                </button>{" "}
                {sayState === "saved" && <span className="pill pill--green">Saved</span>}
              </>
            ) : (
              <pre className="lesson-text">{BEATS.find((b) => b.id === beat)!.text}</pre>
            )}
          </div>
          <HintLadder strikeId={id} hints={strike.hints} failedRuns={failedRuns} level={strike.level} />
        </div>

        <div className="bay-right">
          <div className="stage-box stage-box--bench">
            <div className="bench__bar">
              <span className="bench__label">
                <Icon name="code" size={14} /> Your code {saveState === "saving" ? "· saving…" : saveState === "saved" ? "· saved" : ""}
              </span>
              <button type="button" className="cta cta--small" onClick={handleRunTests} disabled={running}>
                <Icon name="play" size={14} /> {running ? "Running…" : "Run tests"}
              </button>
            </div>
            <div className="bench__editor">
              <CodeEditor value={code} onChange={setCode} height="380px" language={strike.runner === "iframe" ? "html" : strike.runner === "sql" ? "sql" : "javascript"} />
            </div>
            {(strike.runner === "iframe" || strike.runner === "react") && (
              <div className="bench__preview">
                <p className="bench__label">Live preview</p>
                {strike.runner === "iframe" ? <LivePreview html={code} /> : <LivePreview html={code} buildDoc={buildReactPreviewDoc} />}
              </div>
            )}
            {strike.runner === "server" && (
              <p className="message message--bad">
                This strike runs real Node code on your own local API server, in a throwaway process that only answers requests from this computer, in development. Never deploy this app publicly with that switched on.
              </p>
            )}
            {strike.runner === "sql" && <p className="message message--info">Your SQL runs for real, against a throwaway in-memory database that disappears after the run. Never your real data.</p>}
          </div>

          {celebrate && (
            <div className="stage-box win burst" role="status">
              <h2 className="ms-card__title">All tests pass. Strike complete!</h2>
              <p className="muted">Now write your one sentence in the Say beat.</p>
              <Link to={strike.nextStrikeId && !missionId ? `/strike/${strike.nextStrikeId}` : backTo} className="cta cta--small">
                {strike.nextStrikeId && !missionId ? "Next strike" : backLabel} <Icon name="arrow" size={15} />
              </Link>
            </div>
          )}

          <div className="bench__out">
            <div className="bench__tests">
              <p className="bench__label">
                <Icon name="test" size={14} /> Tests
              </p>
              <TestResults run={run} />
            </div>
            <div className="bench__terminal">
              <p className="bench__label">
                <Icon name="terminal" size={14} /> Console
              </p>
              <pre className="bench__lines">{run ? (run.consoleLines.length ? run.consoleLines.join("\n") : "(nothing printed)") : "Run the tests to see output."}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
