// Talks to the API. Every call goes to /api/... and Vite forwards it to the API server.
import type { TrackMeta } from "@hexhammer/content";

// A track (like DSA) with its progress numbers.
export interface TrackInfo extends TrackMeta {
  isOpen: boolean;
  totalStrikes: number;
  completedStrikes: number;
  percentComplete: number;
  strikes: StrikeSummary[];
}

export interface StrikeSummary {
  id: string;
  order: number;
  title: string;
  status: "not_started" | "in_progress" | "complete";
}

export interface LevelInfo {
  number: number;
  name: string;
  color: string;
  title: string;
  description: string;
  runner: string;
  rebuild: string;
  isOpen: boolean;
  plannedStrikes: string[];
  totalStrikes: number;
  completedStrikes: number;
  percentComplete: number;
  strikes: StrikeSummary[];
}

export interface StrikeData {
  id: string;
  level: number; // the level number, or the track's color number for a track strike
  trackId: string | null;
  trackTitle: string | null;
  order: number;
  title: string;
  look: string;
  type: string;
  break: string;
  say: string;
  starterCode: string;
  tests: string;
  hints: string[];
  status: StrikeSummary["status"];
  savedCode: string | null;
  attempts: number; // failed runs so far
  sayNote: string;
  nextStrikeId: string | null;
}

export interface Card {
  id: number;
  level: number;
  question: string;
  answer: string;
  box: number;
  isPreview: boolean;
}

export interface StreakInfo {
  current: number;
  doneToday: boolean;
  totalDays: number;
}

// One small helper that does the fetch, sends JSON, and throws a readable error if it fails.
async function call<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch("/api" + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return data as T;
}

export const api = {
  getLevels: () => call<{ levels: LevelInfo[]; tracks: TrackInfo[] }>("/levels"),
  getStrike: (id: string) => call<StrikeData>(`/strikes/${id}`),
  saveCode: (id: string, code: string) =>
    call<{ ok: true }>(`/strikes/${id}/code`, "PUT", { code }),
  recordAttempt: (id: string, passed: boolean, code: string) =>
    call<{ status: string; attempts: number; canReveal: boolean }>(
      `/strikes/${id}/attempt`,
      "POST",
      {
        passed,
        code,
      },
    ),
  getSolution: (id: string) => call<{ solution: string }>(`/strikes/${id}/solution`),
  saveSay: (id: string, text: string) =>
    call<{ ok: true }>(`/strikes/${id}/say`, "PUT", { text }),
  getDueCards: () => call<{ count: number; cards: Card[] }>("/cards/due"),
  reviewCard: (id: number, knew: boolean) =>
    call<{ box: number }>(`/cards/${id}/review`, "POST", { knew }),
  getStreak: () => call<StreakInfo>("/streak"),
};
