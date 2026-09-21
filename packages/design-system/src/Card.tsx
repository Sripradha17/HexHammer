import type { HTMLAttributes, ReactNode } from "react";

// I will rebuild this by hand later.
// A wobbly white "paper" card.
//   level      picks the marker color (highlighter under the title, color of the tape)
//   locked     gives the grey dashed "coming soon" look
//   tone       "postit" makes it a yellow sticky note
//   decoration "tape" or "tack" sticks something on the top edge
interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  level?: number;
  locked?: boolean;
  tone?: "paper" | "postit";
  decoration?: "none" | "tape" | "tack";
}

export function Card({
  title,
  level,
  locked = false,
  tone = "paper",
  decoration = "none",
  className = "",
  children,
  ...rest
}: CardProps) {
  const classes = [
    "hh-card",
    locked ? "hh-card--locked" : "",
    tone === "postit" ? "hh-card--postit" : "",
    decoration === "none" ? "" : `hh-card--${decoration}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section data-level={level} className={classes} {...rest}>
      {title && <h2 className="hh-card__title">{title}</h2>}
      {children}
    </section>
  );
}
