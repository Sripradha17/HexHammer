// The shape of one lesson ("strike"). Every file in level-1/ exports one of these.
// NOTE: `solution` is the ONLY place a solution may live. It stays hidden until "reveal".
export interface Lesson {
  id: string; // e.g. "l1-s01", or "dsa-s01" for a track
  level: number; // 1..8. Use 0 for a lesson that belongs to a track instead
  track?: string; // set for track lessons, like "dsa"
  order: number; // position inside the level, starting at 1
  title: string;
  look: string; // Beat 1: read a tiny example
  type: string; // Beat 2: what to type by hand
  break: string; // Beat 3: make it fail, then fix it
  say: string; // Beat 4: the prompt for your one-sentence explanation
  starterCode: string; // shown in the editor. Must make the tests FAIL.
  tests: string; // uses the shared helper: test(), expect().toBe(), expect().toEqual()
  hints: [string, string, string]; // revealed one at a time
  solution: string; // "=== CODE ===" then code, "=== LINE BY LINE ===" then explanation
}

// A Say-It flashcard (front = question, back = model answer).
export interface SayItCard {
  question: string;
  answer: string;
  isPreview?: boolean; // preview cards teach a later level's idea
}

// Interview Pack for one level. Note: the Solve-It problem has tests but NO solution.
export interface InterviewPack {
  level: number;
  sayIt: SayItCard[];
  solveIt: {
    title: string;
    minutes: number;
    prompt: string;
    starterCode: string;
    tests: string;
  };
  star: { prompt: string; tips: string[] };
}
