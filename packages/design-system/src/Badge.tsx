import type { HTMLAttributes } from "react";

// I will rebuild this by hand later.
// A small pill of text, like "Level 1", "Done" or "Review due".
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "accent" | "soft" | "success" | "danger" | "review" | "ember";
  level?: number;
}

export function Badge({ tone = "accent", level, className = "", ...rest }: BadgeProps) {
  // "accent" uses the level color when there is a level, or a plain neutral pill otherwise.
  const toneClass = tone === "accent" ? "" : `hh-badge--${tone}`;
  return <span data-level={level} className={`hh-badge ${toneClass} ${className}`} {...rest} />;
}
