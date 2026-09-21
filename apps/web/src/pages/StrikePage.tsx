// The main screen. Left: the four lesson cards. Right: the editor, Run tests, and results.
// Beat 5 (Save) happens by itself: code auto-saves 1 second after I stop typing.
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { Badge, Button, Card, TextArea } from "@hexhammer/design-system";
import { api, type StrikeData } from "../api";
import { CodeEditor } from "../components/CodeEditor";
import { ConsolePanel, TestResults } from "../components/TestResults";
import { HintLadder } from "../components/HintLadder";
import { Celebration } from "../components/Celebration";
import { art } from "../mascots";
import { Loading } from "../components/Loading";
import { createWorker } from "../runner/createWorker";
import { runCode } from "../runner/runCode";
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

    const result = await runCode(code, strike.tests, createWorker);
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

  // A strike belongs to a level or to a track. "Back" goes to whichever one.
  const backTo = strike.trackId ? `/track/${strike.trackId}` : `/level/${strike.level}`;
  const backLabel = strike.trackId
    ? `Back to the ${strike.trackTitle}`
    : `Back to Level ${strike.level}`;

  return (
    <div>
      <div className="strike-header">
        <Link to={backTo}>{backLabel}</Link>
        <h1>
          Strike {strike.order}: {strike.title}
        </h1>
        <Badge level={strike.level}>{strike.trackTitle ?? `Level ${strike.level}`}</Badge>{" "}
        {strike.status === "complete" && <Badge tone="success">Done</Badge>}
      </div>

      <div className="strike-grid">
        {/* LEFT: the four lesson cards */}
        <div className="strike-left">
          <Card title="Look" level={strike.level} decoration="tape">
            <img className="card-art card-art--small" src={art.look} alt="" />
            <pre className="lesson-text">{strike.look}</pre>
          </Card>
          <Card title="Type" level={strike.level}>
            <img className="card-art card-art--small" src={art.type} alt="" />
            <pre className="lesson-text">{strike.type}</pre>
          </Card>
          <Card title="Break" level={strike.level}>
            <img className="card-art card-art--small" src={art.breakIt} alt="" />
            <pre className="lesson-text">{strike.break}</pre>
          </Card>
          <Card title="Say" level={strike.level} tone="postit" decoration="tack">
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
            <Button
              size="small"
              level={strike.level}
              onClick={handleSaveSay}
              disabled={sayText.trim() === ""}
            >
              Save my sentence
            </Button>{" "}
            {sayState === "saved" && <Badge tone="success">Saved</Badge>}
          </Card>
        </div>

        {/* RIGHT: the editor and the test area */}
        <div className="strike-right">
          <Card level={strike.level}>
            <div className="editor-bar">
              <strong>Your code</strong>
              <span className="muted">
                {saveState === "saving" && "Saving…"}
                {saveState === "saved" && "Saved"}
              </span>
            </div>
            <div className="editor-frame">
              <CodeEditor value={code} onChange={setCode} />
            </div>
          </Card>

          <div className="run-bar">
            <Button level={strike.level} onClick={handleRunTests} disabled={running}>
              {running ? "Running…" : "Run tests"}
            </Button>
          </div>

          {celebrate && (
            <Celebration
              nextStrikeId={strike.nextStrikeId}
              level={strike.level}
              backTo={backTo}
              backLabel={backLabel}
            />
          )}

          <Card title="Test results" level={strike.level}>
            <img className="card-art card-art--small" src={art.launch} alt="" />
            <TestResults run={run} />
          </Card>
          <ConsolePanel lines={run?.consoleLines ?? []} />
        </div>
      </div>

      <HintLadder
        strikeId={id}
        hints={strike.hints}
        failedRuns={failedRuns}
        level={strike.level}
      />

      {strike.status === "complete" && !celebrate && (
        <div className="done-banner">
          <img className="done-banner__art" src={art.thumbs} alt="" />
          <p>
            <Link to={strike.nextStrikeId ? `/strike/${strike.nextStrikeId}` : backTo}>
              <Button level={strike.level}>
                {strike.nextStrikeId ? "Next strike" : backLabel}
              </Button>
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
