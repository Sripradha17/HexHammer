// THE WORKSHOP: build real, fun things. Builds are sorted into shelves (games, creative tools,
// apps, AI toys, and the builds my quests suggest). Each one is a poster: a big picture, one line
// of story, what I'll make, and ONE button. Starting copies the brief into my own project record
// and opens the build (Briefing → Build → Test → Fix → Complete).
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { projectsApi, type Project, type ProjectTemplate } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { useRewards } from "../components/Rewards";
import { EMPTY_PROJECT } from "../projectDraft";
import { Kinetic } from "./HomePage";

const SHELVES: { id: ProjectTemplate["kind"]; label: string; emoji: string; hue: number }[] = [
  { id: "game", label: "Games", emoji: "🎮", hue: 262 },
  { id: "creative", label: "Creative tools", emoji: "🎨", hue: 330 },
  { id: "app", label: "Apps you'll use", emoji: "🏠", hue: 150 },
  { id: "ai", label: "AI toys", emoji: "🤖", hue: 200 },
  { id: "lesson", label: "From your quests", emoji: "📜", hue: 36 },
];
const STARS = { foundation: "★☆☆", core: "★★☆", advanced: "★★★" } as const;
const LEVEL = { foundation: "Easy", core: "Medium", advanced: "Hard" } as const;

function Poster({ t, hue, onStart, busy, highlight }: { t: ProjectTemplate; hue: number; onStart: () => void; busy: boolean; highlight: boolean }) {
  return (
    <article id={`build-${t.key}`} className={`poster ${highlight ? "is-highlight" : ""}`} style={{ "--hue": hue } as CSSProperties}>
      <div className="poster__art" aria-hidden="true">
        <span className="poster__emoji">{t.emoji ?? "⚒️"}</span>
      </div>
      <div className="poster__body">
        <p className="poster__meta">
          <span title={`Difficulty: ${LEVEL[t.difficulty]}`}>
            {STARS[t.difficulty]} {LEVEL[t.difficulty]}
          </span>
          <span>· {t.milestones?.length ?? 0} steps</span>
        </p>
        <h3 className="poster__title">{t.title}</h3>
        {t.quest && <p className="poster__quest">“{t.quest}”</p>}
        <p className="poster__what">{t.description}</p>
        <ul className="poster__tech" aria-label="You'll use">
          {t.technologies.slice(0, 3).map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <button type="button" className="btn btn--go" onClick={onStart} disabled={busy}>
          {busy ? "Opening…" : "Start build"} <span aria-hidden="true">▶</span>
        </button>
      </div>
    </article>
  );
}

export function WorkshopPage() {
  const { data, error, loading, reload } = useLoad(() => Promise.all([projectsApi.list(), projectsApi.templates()]));
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { celebrate } = useRewards();
  const [shelf, setShelf] = useState<ProjectTemplate["kind"]>("game");
  const [starting, setStarting] = useState<string | null>(null);
  const [startError, setStartError] = useState("");
  const highlight = params.get("start");

  // Arriving from a quest (?start=topic): open the shelf that has it and bring it into view.
  useEffect(() => {
    if (!highlight || !data) return;
    const t = data[1].templates.find((x) => x.key === highlight);
    if (t) setShelf(t.kind);
    setTimeout(() => document.getElementById(`build-${highlight}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }, [highlight, data]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of data?.[1].templates ?? []) c[t.kind] = (c[t.kind] ?? 0) + 1;
    return c;
  }, [data]);

  if (loading && !data) return <Loading label="Opening the workshop" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;
  const [{ projects }, { templates }] = data;
  const active = projects.filter((p) => !["complete", "archived"].includes(p.status));
  const finished = projects.filter((p) => p.status === "complete");
  const startedTitles = new Set(projects.map((p) => p.title));
  const current = SHELVES.find((s) => s.id === shelf)!;
  const shown = templates.filter((t) => t.kind === shelf && !startedTitles.has(t.title));

  async function start(t: ProjectTemplate) {
    setStarting(t.key);
    setStartError("");
    try {
      const draft = await projectsApi.template(t.key);
      const r = await projectsApi.create({ ...EMPTY_PROJECT, ...draft, status: "in_progress" });
      celebrate({ ...r, message: "Build bay open" });
      navigate(`/projects/${r.project.id}`);
    } catch (e) {
      setStartError((e as Error).message);
      setStarting(null);
    }
  }

  const progress = (p: Project) => (p.milestones.length ? p.milestones.filter((m) => m.doneAt).length / p.milestones.length : 0);

  return (
    <div className="workshop2">
      <header className="realm__title">
        <h1>
          <Kinetic text="The Workshop" />
        </h1>
        <p className="realm__bram">
          <span className="realm__who">⚒ Bram</span> Pick something fun to build. I'll guide you one step at a time.
        </p>
      </header>

      {active.length > 0 && (
        <section className="bench-row" aria-label="On your bench">
          <h2 className="shelf-title">On your bench</h2>
          <div className="bench-row__list">
            {active.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="bench-card">
                <span className="bench-card__emoji" aria-hidden="true">
                  {templates.find((t) => t.title === p.title)?.emoji ?? "⚒️"}
                </span>
                <span className="bench-card__text">
                  <strong>{p.title}</strong>
                  <span className="bench-card__bar" aria-hidden="true">
                    <span style={{ width: `${progress(p) * 100}%` }} />
                  </span>
                  <span className="bench-card__sub">
                    {p.milestones.filter((m) => m.doneAt).length} of {p.milestones.length} steps · Resume ▶
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="shelves" role="tablist" aria-label="Kinds of build">
        {SHELVES.map((s) => (
          <button key={s.id} type="button" role="tab" aria-selected={shelf === s.id} className="shelf-tab" style={{ "--hue": s.hue } as CSSProperties} onClick={() => setShelf(s.id)}>
            <span aria-hidden="true">{s.emoji}</span> {s.label} <span className="shelf-tab__n">{counts[s.id] ?? 0}</span>
          </button>
        ))}
      </div>

      {startError && <p className="nudge">Could not start that build: {startError}</p>}

      <div className="posters" key={shelf}>
        {shown.map((t, i) => (
          <div key={t.key} style={{ animationDelay: `${i * 70}ms` }} className="posters__item">
            <Poster t={t} hue={current.id === "lesson" ? t.region.hue : current.hue} busy={starting === t.key} highlight={t.key === highlight} onStart={() => start(t)} />
          </div>
        ))}
        {shown.length === 0 && <p className="realm__bram">You've started every build on this shelf. Try another!</p>}
      </div>

      {finished.length > 0 && (
        <section className="bench-row" aria-label="Built">
          <h2 className="shelf-title">🏆 Built</h2>
          <div className="bench-row__list">
            {finished.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="bench-card is-done">
                <span className="bench-card__emoji" aria-hidden="true">
                  {templates.find((t) => t.title === p.title)?.emoji ?? "🏆"}
                </span>
                <span className="bench-card__text">
                  <strong>{p.title}</strong>
                  <span className="bench-card__sub">Finished · see it ▶</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="workshop2__own">
        Have your own idea? <Link to="/projects/new">Start from a blank page</Link>
      </p>
    </div>
  );
}
