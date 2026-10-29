// THE KINGDOM OF HEX: story names for the 16 regions, and the quests written so far.
// A region of the curriculum is a TOWN in the kingdom. Every written topic is played as a story
// quest (/quest/:id): Byteford has its own hand-written story (QUESTS); every other written topic is
// told by the shared chapters in autoQuest.tsx. Outline topics open as a mission (/topic/:id).
import { BYTEFORD, type Chapter } from "./byteford";

export const TOWNS: Record<string, { name: string; icon: string }> = {
  cs: { name: "Byteford", icon: "🏘" },
  web: { name: "Webmoor Harbor", icon: "⚓" },
  fe: { name: "Pixel Gardens", icon: "🌷" },
  ds: { name: "Palette Palace", icon: "🎨" },
  be: { name: "Engine Keep", icon: "🏰" },
  db: { name: "Vault Mines", icon: "⛏" },
  dist: { name: "Courier Isles", icon: "🕊" },
  arch: { name: "Architect's Spire", icon: "🗼" },
  test: { name: "Trial Grounds", icon: "🎯" },
  ops: { name: "Cloud Port", icon: "☁" },
  sec: { name: "Shield Wall", icon: "🛡" },
  obs: { name: "Lighthouse Point", icon: "🔦" },
  ml: { name: "Oracle Grove", icon: "🔮" },
  ai: { name: "Golem Workshop", icon: "🤖" },
  pt: { name: "Guild Hall", icon: "🤝" },
  adv: { name: "Dragon Peaks", icon: "🐉" },
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

// Where a topic is played: a quest when its lesson is written, otherwise the mission page.
// (When the stage is unknown, the quest page itself sends outline topics on to the mission page.)
export const playPath = (topicId: string, stage: string = "complete") => (QUESTS[topicId] || stage === "complete" ? `/quest/${topicId}` : `/topic/${topicId}`);
