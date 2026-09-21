import type { HTMLAttributes } from "react";

// I will rebuild this by hand later.
// A small pill of text, like "Level 1" or "Done!".
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "accent" | "soft" | "success" | "danger";
  level?: number;
}

export function Badge({ tone = "accent", level, className = "", ...rest }: BadgeProps) {
  // "accent" is the default look, which uses the level color (or a plain grey when there is no level).
  const toneClass = tone === "accent" ? "" : `hh-badge--${tone}`;
  return (
    <span data-level={level} className={`hh-badge ${toneClass} ${className}`} {...rest} />
  );
}
