// Level 6 lessons, in order. First batch: Components and props, State, Effects, Custom hooks,
// Context (5 of 21 planned). All real React, running for real in the sandboxed iframe — see
// apps/web/src/runner/buildReactDoc.ts and reactIframeHarness.ts, and
// apps/web/scripts/build-react-env.mjs for how React/ReactDOM/Babel got in there with zero
// server-side execution and zero CDN dependency.
import type { Lesson } from "../types";
import { lesson as s01 } from "./01-components-and-props";
import { lesson as s02 } from "./02-state";
import { lesson as s03 } from "./03-effects";
import { lesson as s04 } from "./04-custom-hooks";
import { lesson as s05 } from "./05-context";

export const level6Lessons: Lesson[] = [s01, s02, s03, s04, s05];
