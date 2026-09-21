// Public door of the content package. Everything else imports from "@hexhammer/content".
import curriculumJson from "./curriculum.json";

export type { Lesson, SayItCard, InterviewPack } from "./types";
import { level1Lessons } from "./level-1";
import { level2Lessons } from "./level-2";
import { level3Lessons } from "./level-3";
import { dsaLessons } from "./dsa";

export { level1Lessons, level1InterviewPack } from "./level-1";
export { level2Lessons } from "./level-2";
export { level3Lessons } from "./level-3";
export { dsaLessons } from "./dsa";
export { interviewPack as level2InterviewPack } from "./level-2/interview-pack";
export { interviewPacks } from "./interview-packs";

// Every lesson, in level order. The seed script loads this list.
export const allLessons = [
  ...level1Lessons,
  ...level2Lessons,
  ...level3Lessons,
  ...dsaLessons,
];

// Metadata for all 8 levels and the 3 tracks.
export interface LevelMeta {
  number: number;
  name: string;
  color: string;
  title: string;
  description: string;
  runner: string;
  phase: number;
  fullLessons: boolean;
  strikes: string[];
  interviewPack: { sayIt: string; solveIt: string; star: string };
  rebuild: string;
}

export interface TrackMeta {
  id: string;
  title: string;
  startsAtLevel: number;
  fullLessons: boolean; // true once the track has real strikes
  accent: number; // which level color (1 to 8) the track uses
  description: string;
  topics: string[];
}

export const curriculum = curriculumJson as { levels: LevelMeta[]; tracks: TrackMeta[] };
