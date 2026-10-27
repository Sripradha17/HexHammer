// Topic: Logs, metrics and traces (the three pillars) and percentiles. A COMPLETE topic.
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const obsLogsMetricsTraces: Topic = {
  id: "obs-logs-metrics-traces",
  domainId: "",
  moduleId: "",
  title: "Logs, metrics and traces: seeing inside a running system",
  stage: "complete",
  difficulty: "core",
  learningObjectives: [
    "Explain what logs, metrics and traces each answer, and pick the right one for a question.",
    "Write structured log events with levels and correlation/trace ids.",
    "Explain why latency is reported as percentiles (p50/p95/p99) rather than averages, and compute them.",
    "Describe the golden signals (latency, traffic, errors, saturation) and how OpenTelemetry fits in.",
  ],
  prerequisites: ["be-logging-errors", "web-http-lifecycle"],
  subtopics: ["Structured logging", "Log levels", "Counters, gauges, histograms", "Percentiles", "Traces and spans", "Context propagation", "Golden signals, RED and USE", "OpenTelemetry", "Cardinality"],
  strikeIds: ["l5-s33"],

  story:
    "Checkout is 'sometimes slow'. The dashboard's average latency is a calm 126 ms. Meanwhile one request in ten takes a quarter of a second or more, and the slowest take nearly a second. Those are exactly the customers abandoning their carts. The average was hiding them. And without a trace, nobody could tell which of the six services was responsible.",
  mentalModel: {
    plain:
      "Metrics tell you THAT something is wrong (numbers over time, cheap to keep). Traces tell you WHERE it is wrong (the path of one request across services, with timings). Logs tell you WHY (detailed events with context). Good observability links all three with a shared id.",
    analogy:
      "A hospital: metrics are the vital-signs monitor (heart rate over time), traces are the patient's journey through departments with timestamps, and logs are the doctors' detailed notes. You glance at the monitor, follow the journey to the department where things went wrong, then read the notes from there.",
    analogyLimit:
      "In a hospital every patient gets notes. In large systems you cannot keep every log line or trace forever, because of cost, so you sample traces and choose log levels, which means the one request you care about may not have been recorded unless you planned for it.",
  },
  lessonSections: [
    {
      heading: "1. Three tools, three questions",
      body:
        "Metrics: numeric measurements aggregated over time (requests per second, error rate, p95 latency). Cheap, great for dashboards and alerts.\nTraces: one request's journey, made of spans (one per operation) with start time and duration, linked by a trace id across services.\nLogs: individual events with details, such as an error message, a user id or a decision taken.",
    },
    {
      heading: "2. Structured logs",
      body:
        "Write logs as JSON objects with consistent fields instead of free text: `{\"level\":\"error\",\"msg\":\"payment failed\",\"orderId\":\"o_42\",\"traceId\":\"4bf9...\",\"durationMs\":812}`. Machines can filter and aggregate them, and the trace id links a log line to the trace it belongs to. Never log secrets, tokens or unnecessary personal data.",
    },
    {
      heading: "3. Metric types",
      body:
        "Counter: only goes up (total requests, total errors); rates are computed from it. Gauge: goes up and down (queue length, memory in use). Histogram: counts values in buckets (request durations), from which percentiles are estimated.\n\nBeware high cardinality: labelling a metric with user id or full URL creates millions of time series and can overwhelm the metrics system.",
    },
    {
      heading: "4. Percentiles beat averages",
      body:
        "p50 (the median): half of requests are faster than this. p95: 95% are faster, so 1 in 20 is slower. p99: 1 in 100 is slower. Averages are pulled around by a few extreme values and hide the shape: a page that makes 20 backend calls will hit the p95 of each call often, so tail latency is what users feel.",
    },
    {
      heading: "5. Traces and context propagation",
      body:
        "When service A calls service B, A passes the trace context in a header (the W3C `traceparent` header), and B creates child spans under the same trace id. A trace waterfall then shows every hop with its duration, making it obvious which call or query was slow. Most systems sample traces (e.g. keep 10%) to control cost.",
    },
    {
      heading: "6. Golden signals, RED and USE",
      body:
        "Golden signals (from Google's SRE book): latency, traffic, errors, saturation. RED for request-driven services: Rate, Errors, Duration. USE for resources (CPU, disks, pools): Utilization, Saturation, Errors. OpenTelemetry is the vendor-neutral standard for producing logs, metrics and traces, so you can switch backends without re-instrumenting.",
    },
  ],
  visualizationType: "log-trace",
  codeExamples: [
    {
      title: "Why the average lies: computing percentiles",
      language: "js",
      code: `const latenciesMs = [12, 15, 14, 13, 250, 16, 15, 14, 13, 900];

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length); // nearest-rank method
  return sorted[rank - 1];
}

const average = latenciesMs.reduce((sum, v) => sum + v, 0) / latenciesMs.length;
console.log("average:", average);
console.log("p50:", percentile(latenciesMs, 50), "p90:", percentile(latenciesMs, 90), "p99:", percentile(latenciesMs, 99));`,
      expectedOutput: `average: 126.2
p50: 14 p90: 250 p99: 900`,
      steps: [
        "Sorted, the latencies are 12, 13, 13, 14, 14, 15, 15, 16, 250, 900.",
        "The average is 1262 / 10 = 126.2 ms: a number that describes NO actual request.",
        "p50 (rank 5) is 14 ms: a typical request is fast.",
        "p90 (rank 9) is 250 ms and p99 (rank 10) is 900 ms: the slow tail that users notice.",
        "Real systems estimate percentiles from histograms over thousands of requests, but the idea is identical. Output verified with Node 22.",
      ],
    },
  ],
  practicalApplication:
    "For any service you own: emit RED metrics per route (rate, errors, duration histogram), structured logs with a trace id on every line, and propagate trace context on every outgoing call. Build one dashboard with p50/p95/p99 latency and error rate, and alert on user-facing symptoms (high error rate, high p99) rather than on causes like CPU.",
  commonMistakes: [
    { mistake: "Alerting on average latency.", symptom: "Slow requests for real users never trigger an alert.", fix: "Alert on high percentiles (p95/p99) or on SLO burn rate." },
    { mistake: "Free-text logs without ids.", symptom: "You cannot find all log lines for one failing request.", fix: "JSON logs with a trace/correlation id on every line." },
    { mistake: "User ids or full URLs as metric labels.", symptom: "The metrics system slows down or the bill explodes.", fix: "Keep labels low-cardinality (route template, status class); put high-cardinality details in logs and traces." },
  ],
  misconceptions: [
    { myth: "More logs means more observability.", truth: "Unstructured, unlinked, noisy logs make problems harder to find. Fewer, structured, correlated events beat volume." },
    { myth: "Monitoring and observability are the same.", truth: "Monitoring watches known failure modes with predefined checks; observability is the ability to ask new questions about unknown failures from the telemetry you emit." },
    { myth: "You can average percentiles across servers.", truth: "Averaging p99s from several servers does not give the overall p99. Merge the underlying histograms instead." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l5-s33", why: "Add real logging and error monitoring middleware to an Express app." },
    { kind: "lab", lab: "log-trace", task: "Send requests through the simulated services and inspect the logs and the trace waterfall for each.", goal: "Find the slow hop in a request with p99 latency over 800 ms using only the trace view, then find its log line by trace id." },
    {
      kind: "predict",
      question: {
        id: "obs-logs-metrics-traces-p1",
        prompt: "Latencies: 10, 10, 10, 10, 10, 10, 10, 10, 10, 1000 ms. What are the average and p50?",
        choices: ["average 10, p50 10", "average 109, p50 10", "average 109, p50 109", "average 1000, p50 10"],
        answerIndex: 1,
        explanation: "Sum = 1090, average = 109, yet the median request took 10 ms. The average describes no real request.",
        objective: 2,
      },
    },
  ],
  knowledgeChecks: [
    { id: "obs-logs-metrics-traces-k1", prompt: "Which tool best answers 'which service made this request slow'?", choices: ["A counter metric", "A trace", "CPU graph", "Uptime check"], answerIndex: 1, explanation: "A trace shows each hop of one request with its duration.", objective: 0 },
    { id: "obs-logs-metrics-traces-k2", prompt: "Queue length that rises and falls is best recorded as a…", choices: ["Counter", "Gauge", "Histogram", "Log line"], answerIndex: 1, explanation: "Gauges represent a current value that can go up and down.", objective: 3 },
  ],
  project: {
    title: "Instrumented app and an incident diagnosis",
    summary: "Instrument a two-service app with OpenTelemetry (logs, metrics, traces) running locally in Docker, inject a performance fault, and write an incident report that finds the root cause using only telemetry.",
    type: "application",
    objectivesCovered: [0, 1, 2, 3],
    requirements: [
      "Two services (API and a pricing service) and a database, with trace context propagated between them.",
      "JSON logs with trace ids, RED metrics per route, and traces exported to a local open-source backend (e.g. Jaeger and Prometheus/Grafana in Docker).",
      "A dashboard with p50/p95/p99 latency, request rate and error rate.",
      "A fault switch that adds a slow query to 5% of requests.",
      "A written incident report: detection, diagnosis via traces, root cause, fix, prevention.",
    ],
    acceptanceCriteria: [
      "A single request's logs from both services can be found by one trace id.",
      "With the fault on, p99 visibly degrades while p50 stays roughly the same, and the dashboard screenshot shows it.",
      "The trace waterfall identifies the slow span as the database query in the pricing service.",
      "No log line contains a password, token or full card number (checked by a test that greps log output).",
    ],
    technologies: ["Node.js", "OpenTelemetry", "Docker Compose", "Prometheus", "Grafana", "Jaeger"],
    milestones: [
      { title: "Logs", done_when: "Structured logs with trace ids in both services." },
      { title: "Traces", done_when: "Cross-service traces appear in the trace viewer." },
      { title: "Metrics", done_when: "RED dashboard with percentiles works." },
      { title: "Incident", done_when: "Fault injected, diagnosed and written up." },
    ],
    testIdeas: ["traceparent header is forwarded", "Logger redacts sensitive fields", "Histogram buckets cover expected latencies"],
    stretchGoals: ["Add an SLO and a burn-rate alert rule for the checkout route."],
  },
  assessment: {
    passingScore: 0.8,
    questions: [
      { id: "obs-logs-metrics-traces-a1", prompt: "You need to know how many 500 errors happened per minute over the last week. Which tool?", choices: ["Traces", "Metrics", "A debugger", "Code review"], answerIndex: 1, explanation: "Aggregated counts over time are what metrics are for, cheaply.", objective: 0 },
      { id: "obs-logs-metrics-traces-a2", prompt: "What makes a log 'structured'?", choices: ["It is long", "It is machine-parseable key/value data (e.g. JSON) with consistent fields", "It uses colours", "It is written to a database"], answerIndex: 1, explanation: "Consistent fields let you filter, aggregate and correlate.", objective: 1 },
      { id: "obs-logs-metrics-traces-a3", prompt: "Why include a trace id in every log line?", choices: ["To make logs longer", "To link log events to the trace of the same request across services", "It is required by JSON", "To encrypt logs"], answerIndex: 1, explanation: "Correlation is what turns three separate tools into one picture.", objective: 1 },
      { id: "obs-logs-metrics-traces-a4", prompt: "p95 latency is 800 ms. What does that mean?", choices: ["The average is 800 ms", "95% of requests took 800 ms or less; 1 in 20 took longer", "5% of requests took 800 ms", "The fastest request took 800 ms"], answerIndex: 1, explanation: "Percentiles describe the distribution, including its tail.", objective: 2 },
      { id: "obs-logs-metrics-traces-a5", prompt: "Which are the four golden signals?", choices: ["CPU, memory, disk, network", "Latency, traffic, errors, saturation", "Logs, metrics, traces, alerts", "Rate, errors, duration, uptime"], answerIndex: 1, explanation: "From the Google SRE book. RED (rate, errors, duration) is a related subset for request-driven services.", objective: 3 },
    ],
  },
  interviewQuestions: [
    { id: "obs-logs-metrics-traces-q01", tags: ["observability"], difficulty: "foundation", kind: "concept", prompt: "Explain the difference between logs, metrics and traces.", expectedElements: ["metrics: aggregated numbers over time", "traces: one request across services", "logs: detailed events", "when to use each", "correlation"], modelAnswer: "Metrics are numeric aggregates over time, such as request rate, error rate or latency percentiles. They are cheap and ideal for dashboards and alerts, and tell you that something is wrong. Traces follow one request across services as timed spans, and show where time was spent or where it failed. Logs are detailed events with context, and tell you why. Linking them by a trace id lets you go from an alert, to the slow trace, to the relevant log lines.", explanation: "The 'that/where/why' framing works well.", commonWrongAnswers: ["They are all just logs."] },
    { id: "obs-logs-metrics-traces-q02", tags: ["observability", "latency"], difficulty: "core", kind: "concept", prompt: "Why do teams monitor p99 latency rather than the average?", expectedElements: ["averages hidden by outliers", "tail affects real users", "fan-out amplifies tail", "SLOs on percentiles"], modelAnswer: "An average blends fast and slow requests into a number that may describe no real request, hiding a slow tail. Real users experience that tail, and with fan-out, where one page makes many backend calls, the chance of hitting at least one slow call grows quickly. So SLOs and alerts are usually set on high percentiles like p95 or p99.", explanation: "Mention fan-out amplification.", commonWrongAnswers: ["p99 is more accurate than the average."] },
    { id: "obs-logs-metrics-traces-q03", tags: ["observability", "debugging"], difficulty: "core", kind: "scenario", prompt: "An alert fires: checkout p99 latency doubled. Walk me through your investigation.", expectedElements: ["check scope (all routes? one region?)", "recent changes/deploys", "traces of slow requests", "find slow span", "logs by trace id", "saturation metrics", "mitigate first"], modelAnswer: "First check the scope: which routes, regions or versions, and whether it lines up with a deploy or config change. Mitigate if users are badly affected, for example with a rollback. Then open traces for slow checkout requests and find the span that grew, such as a database query or a downstream call. Read that service's logs by trace id, and check saturation metrics like connection pool usage, CPU or queue depth. Confirm the root cause and fix it, then follow up with a postmortem.", explanation: "Structured, mitigation-first answer.", commonWrongAnswers: ["Restart all services."] },
    { id: "obs-logs-metrics-traces-q04", tags: ["observability", "metrics"], difficulty: "advanced", kind: "concept", prompt: "What is metric cardinality and why does it matter?", expectedElements: ["number of unique label combinations = time series", "user id/URL labels explode it", "cost and performance", "use logs/traces for high-cardinality"], modelAnswer: "Cardinality is the number of unique label combinations for a metric, and each combination is its own time series. Labels like user id, request id or raw URL can create millions of series, which slows the metrics system and raises cost dramatically. Keep metric labels bounded, such as route template, method and status class, and put high-cardinality details in logs or traces.", explanation: "A common real-world mistake.", commonWrongAnswers: ["Cardinality is the number of metrics."] },
    { id: "obs-logs-metrics-traces-q05", tags: ["observability", "tracing"], difficulty: "core", kind: "concept", prompt: "How does a trace follow a request across services?", expectedElements: ["trace id and span ids", "context propagated in headers (W3C traceparent)", "child spans", "instrumentation libraries"], modelAnswer: "The first service starts a trace with a unique trace id and a root span. When it calls another service, it injects the trace context, the trace id plus the current span id, into the outgoing request headers, using the W3C traceparent header. The receiving service extracts it and creates child spans under the same trace. The backend then assembles all the spans into one waterfall.", explanation: "Propagation is the key mechanism.", commonWrongAnswers: ["The tracing tool guesses which requests are related."] },
    { id: "obs-logs-metrics-traces-q06", tags: ["observability", "alerting"], difficulty: "core", kind: "design", prompt: "How do you design alerts that wake people up only when it matters?", expectedElements: ["alert on symptoms/user impact", "SLO burn rate", "actionable with runbook", "avoid cause-based noisy alerts", "severity levels"], modelAnswer: "Page only on user-facing symptoms such as error rate, high-percentile latency or SLO burn rate, not on every cause like CPU at 80%. Every page should be actionable and link to a runbook. Lower-urgency signals become tickets or dashboard items. Review alerts regularly and delete ones that fire without action, to avoid alert fatigue.", explanation: "Shows SRE maturity.", commonWrongAnswers: ["Alert on everything so nothing is missed."] },
    { id: "obs-logs-metrics-traces-q07", tags: ["observability", "privacy"], difficulty: "foundation", kind: "debugging", prompt: "A security review finds access tokens in your logs. How did it happen and how do you prevent it?", expectedElements: ["logging whole request/headers/objects", "redaction/allow-list of fields", "tests", "rotate exposed tokens", "restrict log access"], modelAnswer: "Usually by logging whole request objects, headers or error objects that contain Authorization headers or tokens. Fix it by logging an allow-list of fields, or by using redaction in the logger for known sensitive keys, with a test that fails if sensitive patterns appear. Then rotate the exposed tokens, purge or restrict the affected logs, and review access to the log store.", explanation: "Includes the incident response step.", commonWrongAnswers: ["Logs are internal, so it is fine."] },
    { id: "obs-logs-metrics-traces-q08", tags: ["observability", "opentelemetry"], difficulty: "core", kind: "concept", prompt: "What is OpenTelemetry and why would a team adopt it?", expectedElements: ["vendor-neutral standard and SDKs", "logs/metrics/traces", "collector", "avoid lock-in", "auto-instrumentation"], modelAnswer: "OpenTelemetry is a vendor-neutral, open-source standard with APIs, SDKs and a collector for producing and exporting traces, metrics and logs. Teams adopt it to instrument once and send data to any backend, open-source or commercial, avoiding lock-in, and to use auto-instrumentation for common libraries like HTTP servers and database clients.", explanation: "Know it is a CNCF project and the de facto standard.", commonWrongAnswers: ["It is a monitoring SaaS."] },
  ],
  references: [
    { title: "OpenTelemetry documentation: Observability primer", url: "https://opentelemetry.io/docs/concepts/observability-primer/", kind: "official-docs" },
    { title: "Google SRE Book: Monitoring Distributed Systems (golden signals)", url: "https://sre.google/sre-book/monitoring-distributed-systems/", kind: "book" },
    { title: "W3C Trace Context", url: "https://www.w3.org/TR/trace-context/", kind: "spec" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.8, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Metrics/traces/logs roles, percentiles over averages, symptom-based alerting."],
  versionSpecific: ["OpenTelemetry signal maturity (logs reached stability later than traces and metrics) and SDK APIs vary by language and version."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
