// DEVELOPER GLOSSARY: plain words first, the professional term second, and a line you can say in a
// meeting. Searchable; every entry links to the lessons that teach it.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Badge, Chip, EmptyState } from "@hexhammer/design-system";
import { atlas } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";

const CATEGORIES = ["web", "language", "architecture", "data", "ops", "security", "ai", "workplace", "acronym"];
const SUGGESTIONS = ["idempotency", "CORS", "event loop", "RAG", "SLO", "N+1", "JWT", "prompt injection"];

export function GlossaryPage() {
  const { data, error, loading, reload } = useLoad(() => atlas.glossary());
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const focusTerm = params.get("term");
  const focusRef = useRef<HTMLElement>(null);

  const terms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.terms ?? [])
      .filter((t) => !cats.length || cats.includes(t.category))
      .filter((t) => !q || [t.term, ...(t.aka ?? []), t.simple].some((s) => s.toLowerCase().includes(q)))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [data, query, cats]);

  // Arriving with ?term=... (from a lesson): scroll to that entry and move focus to it.
  useEffect(() => {
    if (focusTerm && focusRef.current) {
      focusRef.current.scrollIntoView({ block: "center" });
      focusRef.current.focus();
    }
  }, [focusTerm, data]);

  if (loading && !data) return <Loading label="Opening the glossary" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const byId = new Map((data?.terms ?? []).map((t) => [t.id, t]));

  return (
    <div className="glossary">
      <header className="page-head">
        <p className="eyebrow">Developer glossary · {data?.terms.length} terms</p>
        <h1 className="page-title">Words you'll hear at work.</h1>
        <label className="search">
          <span className="visually-hidden">Search the glossary</span>
          <input className="hh-input search__input" type="search" placeholder="Search a term or acronym…" value={query} onChange={(e) => (setQuery(e.target.value), focusTerm && setParams({}))} />
        </label>
        <p className="suggestions">
          Try:{" "}
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="link-btn" onClick={() => setQuery(s)}>{s}</button>
          ))}
        </p>
      </header>
      <div className="filters" role="group" aria-label="Categories">
        {CATEGORIES.map((c) => (
          <Chip key={c} pressed={cats.includes(c)} onToggle={() => setCats(cats.includes(c) ? cats.filter((x) => x !== c) : [...cats, c])}>{c}</Chip>
        ))}
      </div>
      <p className="muted" aria-live="polite">{terms.length} term{terms.length === 1 ? "" : "s"}</p>
      {terms.length === 0 ? (
        <EmptyState title="No term matches">Try a shorter word, or clear the category filters. Missing a term? It belongs in packages/content/atlas/glossary.ts.</EmptyState>
      ) : (
        <dl className="terms">
          {terms.map((t) => (
            <div
              key={t.id}
              id={`term-${t.id}`}
              className={`term ${focusTerm === t.id ? "is-focus" : ""}`}
              tabIndex={focusTerm === t.id ? -1 : undefined}
              ref={focusTerm === t.id ? (el) => void (focusRef.current = el) : undefined}
            >
              <dt className="term__name">
                {t.term} {t.aka && <span className="term__aka">({t.aka.join(", ")})</span>} <Badge tone="soft">{t.category}</Badge>
              </dt>
              <dd>
                <p className="term__simple">{t.simple}</p>
                <dl className="term__facts">
                  <dt>Why it matters</dt><dd>{t.whyItMatters}</dd>
                  <dt>Example</dt><dd>{t.example}</dd>
                  <dt>Where you meet it</dt><dd>{t.whereInApp}</dd>
                  <dt>Say it in a meeting</dt><dd className="term__meeting">"{t.meetingLine}"</dd>
                </dl>
                <p className="term__links">
                  {t.topics.map((tp) => <Link key={tp.id} to={`/topic/${tp.id}`}>Lesson: {tp.title}</Link>)}
                  {t.related.map((r) => byId.get(r) && (
                    <a key={r} href={`?term=${r}`} onClick={(e) => (e.preventDefault(), setQuery(""), setCats([]), setParams({ term: r }))}>See also: {byId.get(r)!.term}</a>
                  ))}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
