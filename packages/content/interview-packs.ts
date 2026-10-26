// Every level's Interview Pack, looked up by level number.
// The browser imports THIS file (not the whole content package), so lesson solutions
// never get bundled into the web app.
import type { InterviewPack } from "./types";
import { interviewPack as level1 } from "./level-1/interview-pack";
import { interviewPack as level2 } from "./level-2/interview-pack";
import { interviewPack as level3 } from "./level-3/interview-pack";
import { interviewPack as level4 } from "./level-4/interview-pack";
import { interviewPack as level5 } from "./level-5/interview-pack";

export const interviewPacks: Record<number, InterviewPack> = {
  1: level1,
  2: level2,
  3: level3,
  4: level4,
  5: level5,
};
