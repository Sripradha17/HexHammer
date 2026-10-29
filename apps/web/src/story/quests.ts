// THE KINGDOM OF HEX: story names for the 16 regions, and the quests written so far.
// A region of the curriculum is a TOWN in the kingdom. Every topic is learned on its topic page
// (/topic/:id) in four steps: Study, Play, Build, Test. The story game (/quest/:id) is part of Play:
// Byteford has its own hand-written story (QUESTS); every other written topic uses autoQuest.tsx.
import { BYTEFORD, type Chapter } from "./byteford";

export const TOWNS: Record<string, { name: string }> = {
  cs: { name: "Byteford" },
  web: { name: "Webmoor Harbor" },
  fe: { name: "Pixel Gardens" },
  ds: { name: "Palette Palace" },
  be: { name: "Engine Keep" },
  db: { name: "Vault Mines" },
  dist: { name: "Courier Isles" },
  arch: { name: "Architect's Spire" },
  test: { name: "Trial Grounds" },
  ops: { name: "Cloud Port" },
  sec: { name: "Shield Wall" },
  obs: { name: "Lighthouse Point" },
  ml: { name: "Oracle Grove" },
  ai: { name: "Golem Workshop" },
  pt: { name: "Guild Hall" },
  adv: { name: "Dragon Peaks" },
};

export interface Quest {
  title: string;
  teaser: string; // one or two short sentences: the problem in the story
  chapters: Chapter[];
}

export const QUESTS: Record<string, Quest> = {
  "cs-binary-encoding": {
    title: "The Broken Bridge of Byteford",
    teaser: "The bridge went dark and the bakery sign reads gibberish. Learn the lantern runes and fix them both.",
    chapters: BYTEFORD,
  },
};

// Where a topic starts: its topic page, which always opens at the first step not yet done
// (Study for a new topic).
export const playPath = (topicId: string) => `/topic/${topicId}`;
