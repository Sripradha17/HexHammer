// The radar's starting list of sources (from the project brief), mapped to a machine-readable
// address where one exists. Each one is VALIDATED (fetched and parsed) before it is marked valid:
// `npm run radar:seed` registers them, then checks each and records the real result.
//
// Notes on mapping the brief's pages to sources:
// - GitHub release pages have an official Atom feed at <repo>/releases.atom.
// - kubernetes.io/docs/home has no feed; the official Kubernetes blog feed is used instead.
// - docs.docker.com has no single feed; the Docker Engine release-notes page is watched for changes.
// - aws.amazon.com/new has an official RSS feed at /about-aws/whats-new/recent/feed/.
// - nvd.nist.gov offers the public CVE API 2.0 (keyword search, no key needed, low rate limits).
// - github.com/advisories is read through the public REST API (no token needed, low rate limits).
// - OpenAI's changelog and deprecations pages are watched as pages. They are monitored only to stay
//   informed about the AI ecosystem; this app never calls a paid AI API (charter: Ollama only).
// - owasp.org's Top 10 project page is watched for changes.
export interface DefaultSource {
  name: string;
  url: string;
  kind: string;
  category: string;
  technology: string;
  topicIds: string[];
  checkIntervalHours: number;
  briefUrl: string; // the page named in the project brief that this source stands for
}

export const DEFAULT_SOURCES: DefaultSource[] = [
  { name: "React releases", url: "https://github.com/facebook/react/releases.atom", kind: "atom", category: "framework", technology: "React", topicIds: ["fe-react-components-state", "fe-react-effects-hooks", "fe-react-rendering"], checkIntervalHours: 168, briefUrl: "https://github.com/facebook/react/releases" },
  { name: "TypeScript releases", url: "https://github.com/microsoft/TypeScript/releases.atom", kind: "atom", category: "framework", technology: "TypeScript", topicIds: ["fe-ts-basics", "fe-ts-generics"], checkIntervalHours: 168, briefUrl: "https://github.com/microsoft/TypeScript/releases" },
  { name: "Node.js releases", url: "https://github.com/nodejs/node/releases.atom", kind: "atom", category: "framework", technology: "Node.js", topicIds: ["be-node-runtime", "fe-event-loop"], checkIntervalHours: 168, briefUrl: "https://github.com/nodejs/node/releases" },
  { name: "Express releases", url: "https://github.com/expressjs/express/releases.atom", kind: "atom", category: "framework", technology: "Express", topicIds: ["be-middleware-pipeline", "be-servers-routing"], checkIntervalHours: 168, briefUrl: "https://github.com/expressjs/express/releases" },
  { name: "Ollama releases", url: "https://github.com/ollama/ollama/releases.atom", kind: "atom", category: "ai-platform", technology: "Ollama", topicIds: ["ai-sizes-quantization", "ai-model-selection-cost"], checkIntervalHours: 168, briefUrl: "https://github.com/ollama/ollama/releases" },
  { name: "OpenAI API changelog (page watch)", url: "https://developers.openai.com/api/docs/changelog", kind: "page-watch", category: "ai-platform", technology: "OpenAI API", topicIds: ["ai-apis-resilience", "ai-model-selection-cost"], checkIntervalHours: 168, briefUrl: "https://developers.openai.com/api/docs/changelog" },
  { name: "OpenAI deprecations (page watch)", url: "https://platform.openai.com/docs/deprecations", kind: "page-watch", category: "ai-platform", technology: "OpenAI API", topicIds: ["ai-model-selection-cost", "ai-observability"], checkIntervalHours: 168, briefUrl: "https://platform.openai.com/docs/deprecations" },
  { name: "Kubernetes blog", url: "https://kubernetes.io/feed.xml", kind: "rss", category: "devops", technology: "Kubernetes", topicIds: ["ops-kubernetes"], checkIntervalHours: 168, briefUrl: "https://kubernetes.io/docs/home/" },
  { name: "Docker Engine release notes (page watch)", url: "https://docs.docker.com/engine/release-notes/", kind: "page-watch", category: "devops", technology: "Docker", topicIds: ["ops-docker", "ops-docker-compose"], checkIntervalHours: 168, briefUrl: "https://docs.docker.com/" },
  { name: "AWS What's New", url: "https://aws.amazon.com/about-aws/whats-new/recent/feed/", kind: "rss", category: "cloud", technology: "AWS", topicIds: ["ops-cloud-basics", "ops-aws-iam", "ops-serverless"], checkIntervalHours: 168, briefUrl: "https://aws.amazon.com/new/" },
  { name: "NVD: Node.js CVEs", url: "https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=node.js", kind: "nvd", category: "security", technology: "Node.js", topicIds: ["sec-supply-chain", "be-node-runtime"], checkIntervalHours: 24, briefUrl: "https://nvd.nist.gov/" },
  { name: "GitHub advisories: critical npm", url: "https://api.github.com/advisories?ecosystem=npm&severity=critical&per_page=20", kind: "github-advisories", category: "security", technology: "npm packages", topicIds: ["sec-supply-chain", "sec-secure-coding-testing"], checkIntervalHours: 24, briefUrl: "https://github.com/advisories" },
  { name: "OWASP Top 10 project (page watch)", url: "https://owasp.org/www-project-top-ten/", kind: "page-watch", category: "standards", technology: "OWASP", topicIds: ["sec-owasp-top10", "sec-injection"], checkIntervalHours: 720, briefUrl: "https://owasp.org/" },
];

// Fixture sources: local test files for demos and tests. They contain clearly fictional data
// ("Fixture Framework"), never invented facts about real products.
export const FIXTURE_SOURCES: DefaultSource[] = [
  { name: "Test fixture: Fixture Framework releases", url: "fixture://fixture-framework-releases.atom.xml", kind: "fixture", category: "framework", technology: "Fixture Framework", topicIds: ["fe-event-loop", "be-middleware-pipeline"], checkIntervalHours: 168, briefUrl: "" },
  { name: "Test fixture: Fixture Framework blog (same news)", url: "fixture://fixture-framework-blog.rss.xml", kind: "fixture", category: "publication", technology: "Fixture Framework", topicIds: ["fe-event-loop"], checkIntervalHours: 168, briefUrl: "" },
  { name: "Test fixture: security advisories", url: "fixture://fixture-advisories.json", kind: "fixture", category: "security", technology: "npm packages", topicIds: ["sec-supply-chain", "sec-injection"], checkIntervalHours: 24, briefUrl: "" },
];
