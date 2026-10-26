// Level 4 lessons, in order. All 20 planned topics are now covered (3 pairs of closely related
// topics are combined into one strike each: keyboard+ARIA, WCAG+screen-reader, CSP+CORS), so
// this level is complete, matching Levels 1-3 and the DSA track.
import type { Lesson } from "../types";
import { lesson as s01 } from "./01-semantic-html";
import { lesson as s02 } from "./02-forms";
import { lesson as s03 } from "./03-box-model";
import { lesson as s04 } from "./04-flexbox";
import { lesson as s05 } from "./05-grid";
import { lesson as s06 } from "./06-custom-properties";
import { lesson as s07 } from "./07-dom-events";
import { lesson as s08 } from "./08-accessibility-basics";
import { lesson as s09 } from "./09-responsive-design";
import { lesson as s10 } from "./10-fetch-web-apis";
import { lesson as s11 } from "./11-accessibility-wcag";
import { lesson as s12 } from "./12-core-web-vitals";
import { lesson as s13 } from "./13-browser-storage";
import { lesson as s14 } from "./14-web-security-xss";
import { lesson as s15 } from "./15-web-security-csp-cors";
import { lesson as s16 } from "./16-seo-basics";
import { lesson as s17 } from "./17-design-tokens-patterns";

export const level4Lessons: Lesson[] = [
  s01,
  s02,
  s03,
  s04,
  s05,
  s06,
  s07,
  s08,
  s09,
  s10,
  s11,
  s12,
  s13,
  s14,
  s15,
  s16,
  s17,
];
