// The Interview page: pick a level, then practise its Say-It flashcards (spaced repetition),
// its Solve-It problem, and its STAR story prompt.
// NOTE: we import only the interview packs file (not the whole content package),
// so lesson solutions never get bundled into the browser.
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Badge, Button, Card } from "@hexhammer/design-system";
import { interviewPacks } from "@hexhammer/content/interview-packs";
import { api, type Card as FlashCard } from "../api";
import { art } from "../mascots";
import { CodeEditor } from "../components/CodeEditor";
import { ConsolePanel, TestResults } from "../components/TestResults";
import { createWorker } from "../runner/createWorker";
import { runCode } from "../runner/runCode";
import type { RunResult } from "../runner/execute";

// The levels that have an Interview Pack so far.
const LEVELS_WITH_PACKS = Object.keys(interviewPacks).map(Number);

export function InterviewPage({ onProgress }: { onProgress: () => void }) {
  // The chosen level lives in the address (/interview?level=2), so links can point straight to it.
  const [searchParams, setSearchParams] = useSearchParams();
  const asked = Number(searchParams.get("level"));
  const level = LEVELS_WITH_PACKS.includes(asked) ? asked : 1;

  return (
    <div className="stack">
      <div className="hero">
        <div>
          <h1>Interview practice</h1>
          <p className="muted">Say it out loud first. Then check yourself.</p>
        </div>
        <img className="hero__art" src={art.interview} alt="" />
      </div>

      <div className="level-tabs" role="group" aria-label="Choose a level">
        {LEVELS_WITH_PACKS.map((number) => (
          <Button
            key={number}
            level={number}
            variant={number === level ? "primary" : "secondary"}
            aria-pressed={number === level}
            onClick={() => setSearchParams({ level: String(number) })}
          >
            Level {number}
          </Button>
        ))}
      </div>

      {/* The key makes React start fresh (new timer, new editor) when you switch level. */}
      <InterviewLevel key={level} level={level} onProgress={onProgress} />
    </div>
  );
}

function InterviewLevel({
  level,
  onProgress,
}: {
  level: number;
  onProgress: () => void;
}) {
  const pack = interviewPacks[level];
  const solve = pack.solveIt;

  const [cards, setCards] = useState<FlashCard[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [leaving, setLeaving] = useState(false); // true while the answered card slides away
  const [error, setError] = useState("");

  // Solve-It state (not saved to the database yet).
  const [code, setCode] = useState(solve.starterCode);
  const [run, setRun] = useState<RunResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // Load the cards that are due today, and keep only this level's cards.
  useEffect(() => {
    api
      .getDueCards()
      .then((data) => setCards(data.cards.filter((card) => card.level === level)))
      .catch((e: Error) => setError(e.message));
  }, [level]);

  // Count the timer down once per second after I press Start.
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const current = cards[0];

  async function review(knew: boolean) {
    if (!current || leaving) return;
    await api.reviewCard(current.id, knew);
    setLeaving(true);
    // Let the card slide away, then show the next one.
    setTimeout(() => {
      setCards((list) => list.slice(1)); // this card is done for today
      setShowAnswer(false);
      setLeaving(false);
      onProgress();
    }, 320);
  }

  const minutes = secondsLeft === null ? solve.minutes : Math.floor(secondsLeft / 60);
  const seconds = secondsLeft === null ? 0 : secondsLeft % 60;

  return (
    <>
      <Card title={`Level ${level} Say-It flashcards`} level={level}>
        <img className="card-art" src={art.flashcards} alt="" />
        <p>
          <Badge level={level}>Due today: {cards.length}</Badge>
        </p>
        {error && <p className="message message--bad">Could not load cards: {error}</p>}

        {!current && !error && <p>No cards due for this level. Come back tomorrow!</p>}

        {current && (
          <div
            className={`flip ${showAnswer ? "flip--flipped" : ""} ${leaving ? "flip--leaving" : ""}`}
          >
            <div className="flip__inner">
              <div className="flashcard flip__face flip__front">
                {current.isPreview && <Badge tone="soft">Preview of a later level</Badge>}
                <h2>{current.question}</h2>
                <Button level={level} onClick={() => setShowAnswer(true)}>
                  Show answer
                </Button>
              </div>
              <div className="flashcard flip__face flip__back">
                <p className="flip__question">{current.question}</p>
                <p className="flashcard__answer">{current.answer}</p>
                <p className="muted">Did you say it out loud before peeking?</p>
                <Button level={4} onClick={() => review(true)}>
                  I knew it
                </Button>{" "}
                <Button variant="secondary" onClick={() => review(false)}>
                  Missed it
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card title={`Solve-It: ${solve.title}`} level={level}>
        <img className="card-art" src={art.whiteboard} alt="" />
        <pre className="lesson-text">{solve.prompt}</pre>
        <p>
          <Badge tone="soft">
            Time left {minutes}:{String(seconds).padStart(2, "0")}
          </Badge>{" "}
          <Button
            size="small"
            variant="secondary"
            onClick={() => setSecondsLeft(solve.minutes * 60)}
          >
            Start {solve.minutes}-minute timer
          </Button>
        </p>
        <CodeEditor value={code} onChange={setCode} height="320px" />
        <p>
          <Button
            level={level}
            onClick={async () => setRun(await runCode(code, solve.tests, createWorker))}
          >
            Run tests
          </Button>
        </p>
        <TestResults run={run} />
        <ConsolePanel lines={run?.consoleLines ?? []} />
      </Card>

      <Card title="STAR story prompt" level={level}>
        <img className="card-art" src={art.interviewTable} alt="" />
        <p>
          <strong>{pack.star.prompt}</strong>
        </p>
        <ul>
          {pack.star.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </Card>
    </>
  );
}
