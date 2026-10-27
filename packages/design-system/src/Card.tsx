import type { HTMLAttributes, ReactNode } from "react";

// I will rebuild this by hand later.
// A calm panel on the page.
//   level      a thin top edge in that classic level's color (1 to 8)
//   locked     the dashed "not open yet" look
//   tone       "postit" makes it a warm note
// (`decoration` and `tilt` are kept so older pages still compile; the redesign dropped the
//  mouse-following tilt on purpose: constant motion is distracting while reading.)
interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  level?: number;
  locked?: boolean;
  tone?: "paper" | "postit";
  decoration?: "none" | "tape" | "tack";
  tilt?: boolean;
}

export function Card({
  title,
  level,
  locked = false,
  tone = "paper",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  decoration,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tilt,
  className = "",
  children,
  ...rest
}: CardProps) {
  const classes = ["hh-card", locked ? "hh-card--locked" : "", tone === "postit" ? "hh-card--postit" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <section data-level={level} className={classes} {...rest}>
      {title && <h2 className="hh-card__title">{title}</h2>}
      {children}
    </section>
  );
}
