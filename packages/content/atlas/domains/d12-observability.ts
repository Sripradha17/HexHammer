// Domain 12: Observability, Performance and Reliability.
import { defineDomain, outline } from "../outline";
import { obsLogsMetricsTraces } from "../topics/obs-logs-metrics-traces";

export const d12 = defineDomain(
  {
    id: "obs",
    number: 12,
    title: "Observability, Performance & Reliability",
    short: "Reliability",
    tagline: "See what production is doing, make it fast, and keep it up.",
    story:
      "You cannot fix what you cannot see. This region turns 'it's slow' and 'it's down' into precise, evidence-backed answers, and into systems that degrade gracefully instead of falling over.",
    hue: 128,
    col: 0,
    row: 3,
    unlockedBy: ["ops", "be"],
  },
  [
    {
      id: "obs-telemetry",
      title: "Telemetry",
      summary: "Logs, metrics, traces, signals, dashboards and alerts.",
      topics: [
        outline({
          id: "obs-structured-logging",
          title: "Structured logging and log levels",
          difficulty: "foundation",
          objectives: ["Choose log levels consistently (debug, info, warn, error).", "Design log events that are searchable and safe."],
          prerequisites: ["be-logging-errors"],
          subtopics: ["Levels", "JSON logs", "Redaction", "Sampling logs"],
        }),
        obsLogsMetricsTraces,
        outline({
          id: "obs-signals-red-use",
          title: "Error rates, latency percentiles, throughput, saturation; golden signals, RED and USE",
          difficulty: "core",
          objectives: ["Apply RED to a service and USE to a resource.", "Explain saturation and why it predicts trouble."],
          prerequisites: ["obs-logs-metrics-traces"],
          subtopics: ["RED", "USE", "Saturation", "Throughput vs latency"],
        }),
        outline({
          id: "obs-dashboards-alerts",
          title: "Dashboards, alerts, thresholds and alert fatigue",
          difficulty: "core",
          objectives: ["Build a dashboard that answers 'is it healthy?' in five seconds.", "Tune alerts to be actionable and rare."],
          prerequisites: ["obs-signals-red-use"],
          subtopics: ["Dashboard design", "Thresholds", "Burn-rate alerts", "Alert review"],
        }),
      ],
    },
    {
      id: "obs-performance",
      title: "Performance",
      summary: "Profiling, optimisation techniques, load testing and leaks.",
      topics: [
        outline({
          id: "obs-profiling",
          title: "CPU, memory, network, database and browser profiling",
          difficulty: "advanced",
          objectives: ["Capture and read a CPU profile and a flame graph.", "Use the right profiler for the bottleneck (CPU, memory, I/O, database, browser)."],
          prerequisites: ["obs-logs-metrics-traces", "be-performance"],
          subtopics: ["Flame graphs", "Heap snapshots", "Query profiling", "Browser performance panel"],
        }),
        outline({
          id: "obs-optimisation",
          title: "Caching, batching, connection pooling and query optimisation",
          difficulty: "core",
          objectives: ["Pick the optimisation that matches a measured bottleneck.", "Prove an optimisation with before/after numbers."],
          prerequisites: ["arch-caching", "db-indexes-plans"],
          subtopics: ["Batching", "Pooling", "Query tuning", "Measure first"],
        }),
        outline({
          id: "obs-load-testing",
          title: "Load, stress, soak and capacity testing",
          difficulty: "core",
          objectives: ["Design a load test that reflects real traffic.", "Find the breaking point and the first resource to saturate."],
          prerequisites: ["obs-signals-red-use"],
          subtopics: ["Load profiles", "Stress tests", "Soak tests", "Capacity planning", "k6 / autocannon"],
        }),
        outline({
          id: "obs-leaks-exhaustion",
          title: "Memory leaks and resource exhaustion",
          difficulty: "advanced",
          objectives: ["Find a memory leak with heap snapshots.", "Spot file-handle, connection and thread exhaustion before it causes an outage."],
          prerequisites: ["cs-memory-gc", "obs-profiling"],
          subtopics: ["Heap growth", "Retainers", "Connection leaks", "Limits"],
        }),
      ],
    },
    {
      id: "obs-reliability",
      title: "Reliability",
      summary: "Targets, incidents, root causes and resilience patterns.",
      topics: [
        outline({
          id: "obs-reliability-targets",
          title: "Reliability targets, error budgets and incident management",
          difficulty: "core",
          objectives: ["Set an SLO for a journey and calculate its error budget.", "Lead an incident from detection to resolution."],
          prerequisites: ["obs-dashboards-alerts"],
          subtopics: ["SLOs", "Error budgets", "Incident command", "Communication"],
        }),
        outline({
          id: "obs-rca-postmortems",
          title: "Root-cause analysis and postmortems",
          difficulty: "core",
          objectives: ["Write a blameless postmortem with a clear timeline.", "Distinguish triggers, root causes and contributing factors."],
          prerequisites: ["obs-reliability-targets"],
          subtopics: ["Timelines", "Contributing factors", "Action items", "Blamelessness"],
        }),
        outline({
          id: "obs-resilience-patterns",
          title: "Graceful degradation, retries, timeouts and resilience patterns",
          difficulty: "advanced",
          objectives: ["Combine timeouts, retries, breakers and fallbacks coherently.", "Test resilience with fault injection."],
          prerequisites: ["dist-retries-idempotency", "dist-circuit-breakers"],
          subtopics: ["Timeout budgets", "Fallbacks", "Load shedding", "Fault injection"],
          capstone: true,
        }),
      ],
    },
  ],
);
