// An empty project, with every field the API expects. Templates and the blueprint form start here.
import type { ProjectDraft } from "./atlasApi";

export const EMPTY_PROJECT: ProjectDraft = {
  title: "",
  description: "",
  topicId: null,
  domainId: null,
  type: "implementation",
  difficulty: "core",
  status: "planned",
  objectives: [],
  prerequisites: [],
  requirements: [],
  acceptanceCriteria: [],
  technologies: [],
  tasks: [],
  tests: [],
  stretchGoals: [],
  repoUrl: null,
  demoUrl: null,
  evidence: null,
  reflection: null,
  milestones: [],
};

// The first sentence of a description: the one-line objective a card shows.
export function firstSentence(text: string) {
  const match = text.match(/^.*?[.!?](\s|$)/);
  return (match ? match[0] : text).trim();
}
