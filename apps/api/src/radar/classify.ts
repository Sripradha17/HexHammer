// RULE-BASED relevance classification. This is NOT AI: it is a short list of keyword and version
// rules, and every result carries the exact rule that fired, so I can judge it myself.
import { getTopic } from "@hexhammer/content";

export type Classification =
  | "critical-security"
  | "breaking"
  | "capability"
  | "practice-change"
  | "emerging"
  | "minor"
  | "irrelevant";

export const CLASSIFICATION_LABELS: Record<Classification, string> = {
  "critical-security": "Critical security issue",
  breaking: "Breaking change / migration required",
  capability: "Important new capability",
  "practice-change": "Recommended practice change",
  emerging: "Emerging technology worth exploring",
  minor: "Minor update",
  irrelevant: "Irrelevant to the current curriculum",
};

export interface ClassifyInput {
  title: string;
  summary: string;
  category: string; // the source's category
  sourceTopicIds: string[];
  severity?: string | null; // from a security advisory, when the source provides one
  pageChange?: boolean; // the page watcher only knows "the page changed"
}

// Extra topics suggested by words in the text (on top of the source's own topics).
const KEYWORD_TOPICS: [RegExp, string[]][] = [
  [/\breact\b/i, ["fe-react-components-state", "fe-react-effects-hooks", "fe-react-rendering"]],
  [/\btypescript\b/i, ["fe-ts-basics", "fe-ts-generics"]],
  [/\bnode(\.js)?\b/i, ["be-node-runtime", "fe-event-loop"]],
  [/\bexpress\b/i, ["be-middleware-pipeline", "be-servers-routing"]],
  [/\bkubernetes|k8s\b/i, ["ops-kubernetes"]],
  [/\bdocker|container image\b/i, ["ops-docker", "ops-docker-compose"]],
  [/\baws|amazon\b/i, ["ops-cloud-basics", "ops-aws-iam"]],
  [/\bprompt injection\b/i, ["ai-prompt-injection"]],
  [/\b(embedding|vector|retrieval|rag)\b/i, ["ai-rag-pipeline", "ai-vector-search"]],
  [/\b(llm|model|gpt|llama|ollama)\b/i, ["ai-llm-basics", "ai-model-selection-cost"]],
  [/\b(sql injection|injection)\b/i, ["sec-injection"]],
  [/\b(xss|cross-site scripting)\b/i, ["sec-xss"]],
  [/\b(postgres|postgresql)\b/i, ["db-postgres", "db-relational-basics"]],
  [/\bopentelemetry\b/i, ["obs-logs-metrics-traces"]],
];

export function suggestTopics(text: string, sourceTopicIds: string[]): string[] {
  const found = new Set(sourceTopicIds.filter((id) => getTopic(id)));
  for (const [pattern, ids] of KEYWORD_TOPICS) if (pattern.test(text)) ids.forEach((id) => getTopic(id) && found.add(id));
  return [...found];
}

export function classify(input: ClassifyInput): { classification: Classification; reason: string; topicIds: string[] } {
  const text = `${input.title} ${input.summary}`;
  const topicIds = suggestTopics(text, input.sourceTopicIds);
  const result = (classification: Classification, reason: string) => ({ classification, reason, topicIds });

  if (input.pageChange) {
    return result("minor", "Rule: the watched page's text changed. The radar cannot tell what changed; open the page and verify before acting.");
  }
  if (topicIds.length === 0) {
    return result("irrelevant", "Rule: no Atlas topic matches this source or its text.");
  }

  const severity = (input.severity ?? "").toLowerCase();
  const securityWords = /\bcve-\d{4}-\d+|vulnerab|security (advisory|release|fix|update)|exploit|remote code execution/i;
  if (input.category === "security" || securityWords.test(text)) {
    if (["critical", "high"].includes(severity) || /\bcritical\b|remote code execution|\brce\b/i.test(text)) {
      return result("critical-security", `Rule: security item${severity ? ` with severity "${severity}"` : " mentioning critical impact"}. This is a DETECTED advisory, not a verified impact on your projects: check whether you use the affected versions.`);
    }
    return result("minor", `Rule: security item${severity ? ` with severity "${severity}"` : ""} below high severity. Check whether you use the affected package.`);
  }
  if (/breaking change|\bremoved\b|no longer supported|drops? support|end[- ]of[- ]life|\beol\b/i.test(text)) {
    return result("breaking", "Rule: the text mentions breaking changes, removals or end of support.");
  }
  if (/deprecat/i.test(text)) {
    return result("breaking", "Rule: the text mentions a deprecation, which usually means a migration will be required.");
  }
  if (/\b(alpha|beta|preview|experimental|release candidate|-rc\.?\d*)\b/i.test(text)) {
    return result("emerging", "Rule: pre-release wording (alpha, beta, preview, experimental or RC). Worth exploring, not adopting yet.");
  }
  const version = input.title.match(/\bv?(\d+)\.(\d+)\.(\d+)\b/);
  if (version) {
    const [, major, minor, patch] = version.map(Number);
    if (major > 0 && minor === 0 && patch === 0) {
      return result("breaking", `Rule: new major version ${version[0]}. Under semantic versioning a major release may contain breaking changes; read its migration notes.`);
    }
    if (patch === 0) return result("capability", `Rule: new minor version ${version[0]}. Under semantic versioning this adds features without breaking existing ones.`);
    return result("minor", `Rule: patch version ${version[0]}. Usually bug fixes only.`);
  }
  if (/best practice|recommend|guidance|we now suggest/i.test(text)) {
    return result("practice-change", "Rule: the text talks about recommendations or guidance.");
  }
  if (/\b(introducing|announcing|launch(es|ed)?|now available|generally available)\b/i.test(text)) {
    return result("capability", "Rule: announcement wording (introducing, now available, generally available).");
  }
  return result("minor", "Rule: no stronger rule matched.");
}
