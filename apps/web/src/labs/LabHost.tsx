// Picks the right lab for a topic's visualizationType. Each lab is loaded only when needed
// (lazy), so the app stays fast even with many labs.
import { lazy, Suspense, useRef } from "react";
import type { Topic } from "@hexhammer/content";
import { Loading } from "../components/PageState";

const LABS = {
  "big-o": lazy(() => import("./BigOLab")),
  binary: lazy(() => import("./BinaryLab")),
  "event-loop": lazy(() => import("./EventLoopLab")),
  "http-journey": lazy(() => import("./HttpJourneyLab")),
  "middleware-pipeline": lazy(() => import("./MiddlewareLab")),
  cache: lazy(() => import("./CacheLab")),
  queue: lazy(() => import("./QueueLab")),
  "sql-join": lazy(() => import("./SqlJoinLab")),
  contrast: lazy(() => import("./ContrastLab")),
  "ci-pipeline": lazy(() => import("./CiPipelineLab")),
  injection: lazy(() => import("./InjectionLab")),
  "log-trace": lazy(() => import("./LogTraceLab")),
  "decision-boundary": lazy(() => import("./DecisionBoundaryLab")),
  embeddings: lazy(() => import("./EmbeddingsLab")),
  rag: lazy(() => import("./RagLab")),
  "prompt-injection": lazy(() => import("./PromptInjectionLab")),
  sorting: lazy(() => import("./BigOLab")),
  references: lazy(() => import("./ReferencesLab")),
} as const;

export function LabHost({ kind, onGoal }: { kind: Topic["visualizationType"]; onGoal?: (detail: string) => void }) {
  // Report the goal only once per page visit, even if the lab reaches it again.
  const reported = useRef(false);
  const Lab = kind === "none" ? null : LABS[kind as keyof typeof LABS];
  if (!Lab) return <p className="muted">No lab for this topic yet.</p>;
  return (
    <Suspense fallback={<Loading label="Loading the lab" />}>
      <Lab
        onGoal={(detail: string) => {
          if (reported.current) return;
          reported.current = true;
          onGoal?.(detail);
        }}
      />
    </Suspense>
  );
}
