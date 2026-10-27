// Human words for the codes the API uses. One place, so every page says the same thing.
import type { CSSProperties } from "react";
import type { TopicStatus } from "./atlasApi";

export const STATUS_LABEL: Record<TopicStatus, string> = {
  locked: "Locked",
  new: "Ready to start",
  learning: "In progress",
  practiced: "Practised",
  assessed: "Assessment passed",
  mastered: "Mastered",
};

// How full a topic's hexagon is, by status.
export const STATUS_FILL: Record<TopicStatus, number> = {
  locked: 0,
  new: 0,
  learning: 0.25,
  practiced: 0.5,
  assessed: 0.75,
  mastered: 1,
};

export const CLASSIFICATION_TONE: Record<string, "danger" | "ember" | "review" | "success" | "soft" | "accent"> = {
  "critical-security": "danger",
  breaking: "ember",
  capability: "success",
  "practice-change": "review",
  emerging: "accent",
  minor: "soft",
  irrelevant: "soft",
};

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  idea: "Idea",
  planned: "Planned",
  in_progress: "In progress",
  blocked: "Blocked",
  complete: "Complete",
  archived: "Archived",
};

export const PROJECT_TYPE_LABEL: Record<string, string> = {
  exercise: "Coding exercise",
  "debugging-lab": "Debugging lab",
  implementation: "Implementation",
  architecture: "Architecture",
  application: "Full application",
};

export function formatDate(iso: string | null | undefined, withTime = false) {
  if (!iso) return "—";
  const d = new Date(iso);
  return withTime
    ? d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

// "in 3 days", "today", "2 days ago"
export function relativeDays(iso: string | null | undefined) {
  if (!iso) return "—";
  const day = 24 * 3600 * 1000;
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((start(new Date(iso)) - start(new Date())) / day);
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff === -1) return "yesterday";
  return diff > 0 ? `in ${diff} days` : `${-diff} days ago`;
}

// The style for anything colored by a region: <div style={hueStyle(196)}>. CSS turns --hue into
// the region's stroke, text and fill colors (see tokens.css "REGION COLORS").
export function hueStyle(hue: number): CSSProperties {
  return { "--hue": hue } as CSSProperties;
}
