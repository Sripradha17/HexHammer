// IN PLAIN WORDS: a topic's beginner cards (atlas/beginner.ts), shown one at a time, large and
// centred. Each card: a short title, one or two everyday sentences, an example, and only then the
// real technical word. It is the first thing on a topic's Study step.
import { useState } from "react";
import type { BeginnerCard } from "@hexhammer/content";

export function PlainWords({ cards, onFinished }: { cards: BeginnerCard[]; onFinished?: () => void }) {
  const [at, setAt] = useState(0);
  if (cards.length === 0) return null;
  const card = cards[at];
  const last = at === cards.length - 1;
  return (
    <section className="plain" aria-label="In plain words">
      <header className="plain__head">
        <p className="kicker kicker--amber">In plain words</p>
        <p className="plain__count">
          Card {at + 1} of {cards.length}
        </p>
      </header>
      <div className="plain__dots" aria-hidden="true">
        {cards.map((c, i) => (
          <i key={c.title} className={i < at ? "is-done" : i === at ? "is-now" : ""} />
        ))}
      </div>
      <article className="plain__card" key={at}>
        <span className="plain__n" aria-hidden="true">
          {at + 1}
        </span>
        <h2 className="plain__title">{card.title}</h2>
        <p className="plain__say">{card.say}</p>
        {card.example && <p className="plain__example">{card.example}</p>}
        {card.code && <pre className="plain__code">{card.code}</pre>}
        {card.word && (
          <p className="plain__word">
            The real word: <strong>{card.word.term}</strong>, {card.word.means}.
          </p>
        )}
      </article>
      <div className="plain__nav">
        <button type="button" className="cta cta--ghost cta--small" onClick={() => setAt(at - 1)} disabled={at === 0}>
          Back
        </button>
        {!last ? (
          <button type="button" className="cta cta--small" onClick={() => setAt(at + 1)}>
            Next card
          </button>
        ) : (
          <button type="button" className="cta cta--small" onClick={onFinished}>
            Got it: show me the full lesson
          </button>
        )}
      </div>
    </section>
  );
}
