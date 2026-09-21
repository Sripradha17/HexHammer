// The hint ladder: three hints, shown one at a time. Then, after 2 failed runs, an optional
// "Reveal" that asks "are you sure?" before showing the explained solution.
import { useState } from "react";
import { Button, Card } from "@hexhammer/design-system";
import { api } from "../api";
import { art } from "../mascots";

interface HintLadderProps {
  strikeId: string;
  hints: string[];
  failedRuns: number;
  level: number;
}

const RUNS_NEEDED = 2;

// The solution text has two parts, split by these markers (see packages/content/types.ts).
function splitSolution(text: string) {
  const [codePart, explainPart = ""] = text.split("=== LINE BY LINE ===");
  return {
    code: codePart.replace("=== CODE ===", "").trim(),
    explanation: explainPart.trim(),
  };
}

export function HintLadder({ strikeId, hints, failedRuns, level }: HintLadderProps) {
  const [hintsShown, setHintsShown] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [problem, setProblem] = useState("");

  const canReveal = failedRuns >= RUNS_NEEDED;

  async function handleReveal() {
    try {
      const data = await api.getSolution(strikeId);
      setSolution(data.solution);
      setConfirming(false);
    } catch (error) {
      setProblem((error as Error).message);
    }
  }

  const parts = solution ? splitSolution(solution) : null;

  return (
    <Card title="Need a nudge?" level={level}>
      <img className="hint-art" src={art.hint} alt="" />
      {hints.slice(0, hintsShown).map((hint, index) => (
        <p key={index} className="hint">
          <strong>Hint {index + 1}:</strong> {hint}
        </p>
      ))}

      {hintsShown < hints.length ? (
        <Button
          variant="secondary"
          size="small"
          onClick={() => setHintsShown(hintsShown + 1)}
        >
          Show hint {hintsShown + 1} of {hints.length}
        </Button>
      ) : (
        <p className="muted">That was the last hint. You can do this!</p>
      )}

      <hr className="divider" />

      {!canReveal && !solution && (
        <p className="muted">
          The full answer unlocks after {RUNS_NEEDED} tries that did not pass. You have
          had {failedRuns}.
        </p>
      )}

      {canReveal && !solution && !confirming && (
        <Button variant="danger" size="small" onClick={() => setConfirming(true)}>
          Reveal the solution
        </Button>
      )}

      {confirming && (
        <div>
          <p>
            <strong>Are you sure?</strong> Trying once more teaches you more. Peeking is
            okay, but then type it out by hand yourself.
          </p>
          <Button variant="danger" size="small" onClick={handleReveal}>
            Yes, show me
          </Button>{" "}
          <Button variant="secondary" size="small" onClick={() => setConfirming(false)}>
            No, I will try again
          </Button>
        </div>
      )}

      {problem && <p className="message message--bad">{problem}</p>}

      {parts && (
        <div>
          <h3>Solution</h3>
          <pre className="solution__code">{parts.code}</pre>
          <h3>Line by line</h3>
          <p className="solution__explain">{parts.explanation}</p>
        </div>
      )}
    </Card>
  );
}
