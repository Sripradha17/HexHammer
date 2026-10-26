// All Professional Skills track lessons, in order. Complete: all 9 planned topics.
// Mostly guided-local (the topics are workplace habits, not code to write), matching the
// pattern already used for similar topics elsewhere (OWASP Top 10, Agile-adjacent quizzes).
// Two are real hands-on exercises: a debugging method (a genuine off-by-one bug to find and
// fix) and reviewing/verifying AI-generated code (the charter's own stated goal, made concrete).
import type { Lesson } from "../types";
import { lesson as s01 } from "./01-git-workflow-pr-etiquette";
import { lesson as s02 } from "./02-code-review";
import { lesson as s03 } from "./03-reading-unfamiliar-code";
import { lesson as s04 } from "./04-debugging-method";
import { lesson as s05 } from "./05-design-docs-adrs";
import { lesson as s06 } from "./06-estimating-breaking-down-work";
import { lesson as s07 } from "./07-agile-basics";
import { lesson as s08 } from "./08-technical-writing";
import { lesson as s09 } from "./09-reviewing-ai-generated-code";

export const professionalLessons: Lesson[] = [
  s01,
  s02,
  s03,
  s04,
  s05,
  s06,
  s07,
  s08,
  s09,
];
