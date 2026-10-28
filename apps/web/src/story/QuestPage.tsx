// THE QUEST PLAYER: a full-screen 3D stage with the story panel floating over it. The top bar shows
// the chapters as a path. My chapter is remembered in this browser, so I can come back later.
import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router";
import { atlas, type TopicView } from "../atlasApi";
import { useRewards } from "../components/Rewards";
import { ErrorState, Loading } from "../components/PageState";
import type { Chapter } from "./byteford";
import { StageProvider, useStage } from "./stage";
// three.js is big: the 3D stage loads on its own, after the story panel is ready.
const Stage3D = lazy(() => import("./Stage3D").then((m) => ({ default: m.Stage3D })));

const placeKey = (id: string) => `hexhammer-quest-${id}`;
function savedPlace(id: string, max: number) {
  try {
    const n = Number(localStorage.getItem(placeKey(id)));
    return Number.isInteger(n) && n >= 0 && n < max ? n : 0;
  } catch {
    return 0;
  }
}

function Player({ topicId, title, chapters }: { topicId: string; title: string; chapters: Chapter[] }) {
  const { set } = useStage();
  const { celebrate } = useRewards();
  const [view, setView] = useState<TopicView | null>(null);
  const [error, setError] = useState("");
  const [at, setAt] = useState(() => savedPlace(topicId, chapters.length));

  const load = () =>
    atlas
      .topic(topicId)
      .then(setView)
      .catch((e: Error) => setError(e.message));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  // A new chapter: remember it, and set the 3D stage the way this chapter begins.
  useEffect(() => {
    try {
      localStorage.setItem(placeKey(topicId), String(at));
    } catch {
      // not remembered; fine
    }
    set({ lanterns: false, hex: false, signFixed: false, bridgeFixed: false, ...chapters[at].stage });
  }, [at, topicId, chapters, set]);

  const chapter = chapters[at];
  const { Play } = chapter;
  const props = view && {
    view,
    next: () => setAt((a) => Math.min(a + 1, chapters.length - 1)),
    reload: load,
    celebrate,
    markRead: () => {
      if (view.progress.lessonRead) return;
      atlas.markRead(topicId).then((r) => (celebrate(r), load())).catch(() => undefined);
    },
    completeLab: (detail: string) => {
      atlas
        .completeLab(topicId, "binary", detail)
        .then((r) => (celebrate({ ...r, message: "Lab goal reached" }), load()))
        .catch(() => undefined);
    },
  };

  return (
    <div className="quest">
      <Suspense fallback={<div className="stage3d stage3d--loading" />}>
        <Stage3D />
      </Suspense>

      <header className="quest__bar">
        <Link to="/" className="quest__exit" aria-label="Leave the quest">
          ✕
        </Link>
        <div className="quest__name">
          <span className="quest__kicker">Quest</span>
          {title}
        </div>
        <ol className="quest__path" aria-label="Chapters">
          {chapters.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                className={`quest__dot ${i < at ? "is-done" : ""} ${i === at ? "is-now" : ""}`}
                aria-current={i === at ? "step" : undefined}
                aria-label={`Chapter ${i + 1}: ${c.title}${i < at ? " (done)" : ""}`}
                title={c.title}
                // Earlier chapters can be replayed; later ones open as I reach them.
                disabled={i > at}
                onClick={() => setAt(i)}
              >
                <span aria-hidden="true">{c.icon}</span>
              </button>
            </li>
          ))}
        </ol>
      </header>

      <p className="quest__chapter" key={`c-${chapter.id}`}>
        <span>Chapter {at + 1}</span> {chapter.title}
      </p>

      <main className="quest__panel" key={`p-${chapter.id}`}>
        {error ? <ErrorState message={error} onRetry={load} /> : props ? <Play {...props} /> : <Loading label="Bram is lighting the forge" />}
      </main>
    </div>
  );
}

export function QuestPage(props: { topicId: string; title: string; chapters: Chapter[] }) {
  return (
    <StageProvider initial={props.chapters[0].stage}>
      <Player {...props} />
    </StageProvider>
  );
}
