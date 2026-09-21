// All Level 1 lessons, in order. Add new lessons here.
import type { Lesson } from "../types";
import { lesson as s01 } from "./01-console-log";
import { lesson as s02 } from "./02-variables";
import { lesson as s03 } from "./03-numbers-and-strings";
import { lesson as s04 } from "./04-booleans";
import { lesson as s05 } from "./05-if-else";
import { lesson as s06 } from "./06-comparison-operators";
import { lesson as s07 } from "./07-functions";
import { lesson as s08 } from "./08-fizzbuzz";
import { lesson as s09 } from "./09-template-strings";
import { lesson as s10 } from "./10-grade-calculator";

export const level1Lessons: Lesson[] = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10];
export { interviewPack as level1InterviewPack } from "./interview-pack";
