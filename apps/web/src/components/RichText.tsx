// Shows lesson text SAFELY: blank lines become paragraphs, single newlines become line breaks, and
// `backticks` become inline code. No HTML is ever parsed, so text from anywhere (including the Tech
// Radar's internet sources) cannot inject markup or scripts.
import { Fragment } from "react";

function Inline({ text }: { text: string }) {
  // Split on `code` spans: odd pieces are code.
  const parts = text.split(/`([^`]+)`/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="inline-code">
            {part}
          </code>
        ) : (
          <Fragment key={i}>
            {part.split("\n").map((line, j, lines) => (
              <Fragment key={j}>
                {line}
                {j < lines.length - 1 && <br />}
              </Fragment>
            ))}
          </Fragment>
        ),
      )}
    </>
  );
}

export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n\s*\n/);
  return (
    <div className={`rich-text ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i}>
          <Inline text={p} />
        </p>
      ))}
    </div>
  );
}

export function InlineText({ text }: { text: string }) {
  return <Inline text={text} />;
}

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <figure className="code-block">
      {label && <figcaption className="code-block__label">{label}</figcaption>}
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
    </figure>
  );
}
