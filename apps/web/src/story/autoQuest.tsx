// THE STORY GAME: turns ANY written topic into a short adventure with Bram, using the topic's own
// real content. It is the fun part of the topic's PLAY step; Study and Test live on the topic page.
//
//   1. Arrival   in the town's own painting: why this topic matters
//   2. See it    read the worked example, PREDICT the output, then run it and walk the steps
//   3. Riddles   the topic's riddles (predict, spot the bug, quick checks) and its lab
//   4. Victory   where to go next: build it, then take the test
//
// Every reward comes from the server: exercises and labs save real progress. Animations follow
// results; they never cause them.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChoiceQuestion } from "../components/ChoiceQuestion";
import { CodeBlock } from "../components/RichText";
import { LabHost } from "../labs/LabHost";
import { BramFace, type Mood } from "../art/Bram";
import { regionArt } from "../art/realm";
import { Dialogue, type Line } from "./kit";
import { useStage } from "./stage";
import type { Chapter, ChapterProps } from "./byteford";

const GoOn = ({ next, label = "Continue" }: { next: () => void; label?: string }) => (
  <button type="button" className="btn btn--go" onClick={next}>
    {label}
  </button>
);

// Bram's face and name, above a card that is not a spoken line.
function Speaker({ mood }: { mood: Mood }) {
  return (
    <p className="talk__who">
      <BramFace mood={mood} /> Bram
    </p>
  );
}

// Split a paragraph into short spoken lines of one or two sentences each.
function toLines(text: string, moods: Mood[]): Line[] {
  const sentences = text.match(/[^.!?]+[.!?]+["')]?/g)?.map((s) => s.trim()) ?? [text];
  const lines: Line[] = [];
  for (let i = 0; i < sentences.length; i += 2) lines.push({ mood: moods[lines.length % moods.length], text: sentences.slice(i, i + 2).join(" ") });
  return lines;
}

// ------------------------------------------------------------------ 1. Arrival

function ArrivePlay({ view, next }: ChapterProps) {
  const { set } = useStage();
  const { topic, domain, glossary } = view;
  // The town's own painting (this chapter's stage is only known once the topic has loaded).
  useEffect(() => set({ painting: regionArt(domain.id).scene }), [domain.id, set]);
  const goals = topic.learningObjectives.slice(0, 3);
  return (
    <Dialogue
      lines={[
        { mood: "happy", shot: "bram", text: `Welcome back to ${domain.short}, apprentice! Today's quest: ${topic.title}.` },
        ...toLines(topic.story ?? "", ["wow", "think"]),
        {
          mood: "proud",
          text: `By the end you'll be able to: ${goals.map((g) => g.replace(/\.$/, "")).join("; ")}.`,
          terms: glossary.slice(0, 3).map((g) => ({ word: g.term, plain: g.simple })),
        },
      ]}
    >
      <GoOn next={next} label="Show me" />
    </Dialogue>
  );
}

// ------------------------------------------------------------------ 2. See it run

function ExamplePlay({ view, next }: ChapterProps) {
  const { set, cheer } = useStage();
  const examples = view.topic.codeExamples;
  const [at, setAt] = useState(0);
  const [ran, setRan] = useState(false);
  const ex = examples[at];
  const lastExample = at === examples.length - 1;

  function run() {
    setRan(true);
    set({ mood: "wow" });
    cheer();
  }

  return (
    <div className="qexample">
      {!ran && (
        <>
          <Speaker mood="think" />
          <p className="talk__text">
            Read this slowly. Before we run it, say out loud what you think it prints. Guessing first is what makes it stick.
          </p>
        </>
      )}
      <h2 className="lesson-card__title">{ex.title}</h2>
      <CodeBlock code={ex.code} />
      {!ran ? (
        <div className="talk__actions">
          <button type="button" className="btn btn--go" onClick={run}>
            I've guessed. Run it
          </button>
        </div>
      ) : (
        <>
          <p className="qexample__label">It prints</p>
          <pre className="qexample__output">{ex.expectedOutput}</pre>
          <Dialogue lines={ex.steps.map((s, i) => ({ mood: (i % 2 ? "happy" : "think") as Mood, text: s }))}>
            {lastExample ? (
              <GoOn next={next} label="Time to practise" />
            ) : (
              <GoOn next={() => (setAt(at + 1), setRan(false))} label="Next example" />
            )}
          </Dialogue>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ 3. Riddles

function PracticePlay({ view, next, reload, completeLab }: ChapterProps) {
  const { topic, strikes, progress } = view;
  const riddles = [
    ...topic.exercises.flatMap((e) => (e.kind === "predict" || e.kind === "debug" ? [{ key: `${e.kind}:${e.question.id}`, label: e.kind === "predict" ? "What will it print?" : "Spot the bug", question: e.question }] : [])),
    ...topic.knowledgeChecks.map((q) => ({ key: `check:${q.id}`, label: "Quick check", question: q })),
  ];
  const lab = topic.exercises.find((e) => e.kind === "lab");
  const [at, setAt] = useState(0);
  const [showLab, setShowLab] = useState(false);
  const done = new Set(progress.exercisesDone);
  const r = riddles[at];

  return (
    <div className="puzzle">
      <Speaker mood="happy" />
      <p className="ask">
        Riddle {Math.min(at + 1, riddles.length)} of {riddles.length}. Guess wrong as often as you like: that's how smiths learn.
      </p>
      {r && (
        <div className="riddle" key={r.key}>
          <ChoiceQuestion question={r.question} kindLabel={r.label} alreadyDone={done.has(r.key)} onCorrect={reload} />
        </div>
      )}
      {lab && lab.kind === "lab" && (
        <div className="practice-lab">
          <button type="button" className="btn btn--ghost" aria-expanded={showLab} onClick={() => setShowLab(!showLab)}>
            {showLab ? "Close the lab" : "Open the lab"}
          </button>
          {showLab && (
            <>
              <p className="practice-lab__goal">
                <strong>Goal:</strong> {lab.goal}
              </p>
              <LabHost kind={lab.lab} onGoal={(detail) => completeLab(lab.lab, detail)} />
            </>
          )}
        </div>
      )}
      {strikes.length > 0 && (
        <p className="practice-strikes">
          Type it by hand:{" "}
          {strikes.slice(0, 3).map((s, i) => (
            <span key={s.id}>
              {i > 0 && " · "}
              <Link to={`/strike/${s.id}?mission=${topic.id}`}>{s.title}</Link>
            </span>
          ))}
        </p>
      )}
      <div className="talk__actions">
        {at < riddles.length - 1 && (
          <button type="button" className="btn btn--ghost" onClick={() => setAt(at + 1)}>
            Next riddle
          </button>
        )}
        <GoOn next={next} label="Finish the game" />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ 4. Victory

function RewardPlay({ view }: ChapterProps) {
  const { cheer } = useStage();
  useEffect(() => cheer(), [cheer]);
  const met = view.mastery.filter((m) => m.met).length;
  return (
    <Dialogue
      lines={[
        { mood: "proud", text: `Quest complete: ${view.topic.title}!` },
        { mood: "happy", text: `You hold ${met} of ${view.mastery.length} mastery seals. Next: build something with it, then take the test.` },
      ]}
    >
      <Link to={`/topic/${view.topic.id}#build`} className="btn btn--go">
        Next: Build it
      </Link>
      <Link to={`/topic/${view.topic.id}#test`} className="btn btn--ghost">
        Take the test
      </Link>
    </Dialogue>
  );
}

// ------------------------------------------------------------------ the chapters, in order

// Each chapter stands in its own painted place (picture numbers from assets/webdesign).
export const AUTO_CHAPTERS: Chapter[] = [
  { id: "arrive", title: "Arrival", stage: { painting: 21, shot: "bram", mood: "happy" }, Play: ArrivePlay },
  { id: "example", title: "See it run", stage: { painting: 24, shot: "wide", mood: "think" }, Play: ExamplePlay },
  { id: "practice", title: "Riddles", stage: { painting: 3, shot: "wide", mood: "happy" }, Play: PracticePlay },
  { id: "reward", title: "Victory", stage: { painting: 19, shot: "wide", mood: "proud" }, Play: RewardPlay },
];
