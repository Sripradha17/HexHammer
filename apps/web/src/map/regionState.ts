// Plain rules that turn the map data from the API into the states the World view draws.
// No drawing here: these are small functions I can read (and test) on their own.
import { useEffect, useState } from "react";
import type { MapTopic, Region, TopicStatus } from "../atlasApi";

// A region is in exactly one of these states.
//   locked      = its unlock rule is not met yet
//   available   = open, but I have not started anything in it
//   active      = I have started at least one topic
//   complete    = every topic in it has a passed assessment (or better)
export type RegionState = "locked" | "available" | "active" | "complete";

export function regionState(r: Region): RegionState {
  if (!r.unlocked) return "locked";
  if (r.counts.topics > 0 && r.counts.assessed >= r.counts.topics) return "complete";
  if (r.counts.started > 0) return "active";
  return "available";
}

export const REGION_STATE_LABEL: Record<RegionState, string> = {
  locked: "Locked",
  available: "Open",
  active: "In progress",
  complete: "Complete",
};

// A mission (topic) node has a simpler set of states, made from the topic's real status.
export type NodeState = "locked" | "available" | "progress" | "done" | "unwritten";

export function nodeState(t: MapTopic): NodeState {
  if (t.status === "locked") return "locked";
  if (t.status === "assessed" || t.status === "mastered") return "done";
  if (t.status === "learning" || t.status === "practiced") return "progress";
  // "new": open to start. Outline topics (no lesson yet) are shown honestly as not written.
  return t.stage === "complete" ? "available" : "unwritten";
}

export const NODE_STATE_LABEL: Record<NodeState, string> = {
  locked: "Locked",
  available: "Ready to start",
  progress: "In progress",
  done: "Assessment passed",
  unwritten: "Lesson not written yet",
};

const DONE: TopicStatus[] = ["assessed", "mastered"];

// The next thing to do inside one region: the first written topic that is open and not yet
// passed; otherwise an outline topic that has hands-on strikes; otherwise nothing.
export function nextTopicIn(region: Region): MapTopic | null {
  const all = region.modules.flatMap((m) => m.topics);
  const open = (t: MapTopic) => t.status !== "locked" && !DONE.includes(t.status);
  return all.find((t) => open(t) && t.stage === "complete") ?? all.find((t) => open(t) && t.strikeCount > 0) ?? null;
}

// "Mission 03": a topic's position inside its region, counting every topic in map order.
export function missionNumber(region: Region, topicId: string) {
  const index = region.modules.flatMap((m) => m.topics).findIndex((t) => t.id === topicId);
  return index < 0 ? null : String(index + 1).padStart(2, "0");
}

// Which regions became unlocked since I last looked at the map (remembered in this browser only,
// so the "just unlocked" animation plays once). The very first visit remembers without animating.
const SEEN_KEY = "hexhammer-unlocked-regions";

export function useNewlyUnlocked(regions: Region[] | undefined) {
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!regions) return;
    const open = regions.filter((r) => r.unlocked).map((r) => r.id);
    try {
      const saved = localStorage.getItem(SEEN_KEY);
      if (saved) {
        const seen = new Set<string>(JSON.parse(saved));
        setFresh(new Set(open.filter((id) => !seen.has(id))));
      }
      localStorage.setItem(SEEN_KEY, JSON.stringify(open));
    } catch {
      // Storage blocked: no animation, nothing else changes.
    }
  }, [regions]);
  return fresh;
}
