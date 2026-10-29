// One multiple-choice question: knowledge check, output prediction or spot-the-bug.
// I choose first; only then does the server reveal the answer and WHY. A wrong answer explains and
// lets me try again: mistakes are for learning, never punished.
import { useId, useState } from "react";
import { Badge, Button } from "@hexhammer/design-system";
import { atlas, type PublicChoice } from "../atlasApi";
import { CodeBlock, InlineText } from "./RichText";
import { useRewards } from "./Rewards";

interface Props {
  question: PublicChoice;
  kindLabel?: string; // "Predict the output", "Find the bug", "Quick check"
  alreadyDone?: boolean;
  onCorrect?: () => void;
  onAnswered?: (correct: boolean) => void; // every checked answer, right or wrong (Quick fire streaks)
}

export function ChoiceQuestion({ question, kindLabel = "Quick check", alreadyDone = false, onCorrect, onAnswered }: Props) {
  const name = useId();
  const [choice, setChoice] = useState<number | null>(null);
  const [result, setResult] = useState<{ correct: boolean; answerIndex: number; explanation: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { celebrate } = useRewards();

  async function check() {
    if (choice === null) return;
    setBusy(true);
    setError("");
    try {
      const r = await atlas.checkQuestion(question.id, choice);
      setResult(r);
      celebrate(r);
      if (r.correct) onCorrect?.();
      onAnswered?.(r.correct);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    setResult(null);
    setChoice(null);
  }

  return (
    <fieldset className={`choice ${result ? (result.correct ? "choice--right" : "choice--wrong") : ""}`}>
      <legend className="choice__legend">
        <span className="eyebrow">{kindLabel}</span>
        {alreadyDone && <Badge tone="success">Done before</Badge>}
        <span className="choice__prompt">
          <InlineText text={question.prompt} />
        </span>
      </legend>
      {question.code && <CodeBlock code={question.code} />}
      <div className="choice__options">
        {question.choices.map((text, i) => {
          const isAnswer = result && i === result.answerIndex;
          const isWrongPick = result && !result.correct && i === choice;
          return (
            <label key={i} className={`choice__option ${isAnswer ? "is-answer" : ""} ${isWrongPick ? "is-wrong" : ""}`}>
              <input type="radio" name={name} value={i} checked={choice === i} disabled={Boolean(result) || busy} onChange={() => setChoice(i)} />
              <span>
                <InlineText text={text} />
              </span>
              {isAnswer && <span className="visually-hidden"> (correct answer)</span>}
              {isWrongPick && <span className="visually-hidden"> (your answer, not correct)</span>}
            </label>
          );
        })}
      </div>
      {!result ? (
        <Button size="small" onClick={check} disabled={choice === null || busy}>
          {busy ? "Checking…" : "Check my answer"}
        </Button>
      ) : (
        <div className="choice__feedback" role="status">
          <p className="choice__verdict">{result.correct ? "Right." : "Not quite, and that's useful: here's why."}</p>
          <p>
            <InlineText text={result.explanation} />
          </p>
          {!result.correct && (
            <Button variant="secondary" size="small" onClick={retry}>
              Try again
            </Button>
          )}
        </div>
      )}
      {error && <p className="field-error" role="alert">{error}</p>}
    </fieldset>
  );
}
