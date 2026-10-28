// THE KINGDOM OF HEX: story names for the 16 regions, and the quests written so far.
// A region of the curriculum is a TOWN in the kingdom. A topic with a written quest is played as a
// story (/quest/:id); a topic without one still opens as a normal mission (/topic/:id).
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
    teaser: "The bridge fell into the river and the bakery sign reads gibberish. Learn the lantern runes and fix them both.",
    chapters: BYTEFORD,
  },
};

// Where a topic is played: its quest if one is written, otherwise the mission page.
export const playPath = (topicId: string) => (QUESTS[topicId] ? `/quest/${topicId}` : `/topic/${topicId}`);
