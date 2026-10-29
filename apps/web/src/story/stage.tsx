// THE STAGE: what the painted stage behind a quest is showing right now. The story (dialogue,
// puzzles) changes it; StageArt.tsx draws it. They share it through React context.
//
//   scene     which set: the Rune Engine chamber (the forge), or the village with the bridge
//   shot      what the stage shows (a wide view, the sign, the lanterns, the bridge, Bram)
//   mood      Bram's face and pose; `talking` makes him gesture
//   bits      the 8 lanterns of the rune (true = lit), plus whether they are shown and in hex
//   signFixed / bridgeFixed   the story's two repairs
//   painting  for the quests made from any topic (autoQuest.tsx): which painting fills the stage
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Mood } from "../art/Bram";

export type Scene = "forge" | "village";
export type Shot = "wide" | "sign" | "lanterns" | "bridge" | "bram";

export interface StageState {
  scene: Scene;
  shot: Shot;
  mood: Mood;
  talking: boolean;
  bits: boolean[];
  lanterns: boolean; // are the lanterns on stage?
  hex: boolean; // show the two hex marks above the halves
  signFixed: boolean;
  bridgeFixed: boolean;
  solved: boolean; // the lantern puzzle on stage was really solved: the Rune Engine opens
  painting: number | null; // a whole painted place (by picture number), instead of Byteford's sets
  cheer: number; // bumps on every success: the scene throws a burst of sparks
}

const START: StageState = { scene: "village", shot: "wide", mood: "happy", talking: false, bits: Array(8).fill(false), lanterns: false, hex: false, signFixed: false, bridgeFixed: false, solved: false, painting: null, cheer: 0 };

interface StageApi {
  stage: StageState;
  set: (part: Partial<StageState>) => void;
  toggleBit: (i: number) => void;
  cheer: () => void;
}

const StageContext = createContext<StageApi | null>(null);

export function StageProvider({ initial, children }: { initial?: Partial<StageState>; children: ReactNode }) {
  const [stage, setStage] = useState<StageState>({ ...START, ...initial });
  const set = useCallback((part: Partial<StageState>) => setStage((s) => ({ ...s, ...part })), []);
  const toggleBit = useCallback((i: number) => setStage((s) => ({ ...s, bits: s.bits.map((b, j) => (j === i ? !b : b)) })), []);
  const cheer = useCallback(() => setStage((s) => ({ ...s, cheer: s.cheer + 1 })), []);
  const api = useMemo(() => ({ stage, set, toggleBit, cheer }), [stage, set, toggleBit, cheer]);
  return <StageContext.Provider value={api}>{children}</StageContext.Provider>;
}

export function useStage() {
  const api = useContext(StageContext);
  if (!api) throw new Error("useStage must be used inside <StageProvider>");
  return api;
}

export const LANTERN_VALUES = [128, 64, 32, 16, 8, 4, 2, 1];
export const runeValue = (bits: boolean[]) => bits.reduce((sum, on, i) => sum + (on ? LANTERN_VALUES[i] : 0), 0);
