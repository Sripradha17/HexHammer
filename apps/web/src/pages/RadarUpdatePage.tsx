// One discovered update: verified facts from the source, the rule-based classification, optional
// (labelled) local-AI analysis, review actions, and "propose a curriculum change".
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Badge, Button, Field } from "@hexhammer/design-system";
import { radar } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { NotFoundPage } from "./NotFoundPage";
import { CLASSIFICATION_TONE, formatDate } from "../labels";

const ACTIONS: [string, string][] = [
  ["approve", "Approve (relevant)"],
  ["already-covered", "Already covered"],
  ["needs-verification", "Needs verification"],
  ["defer", "Defer"],
  ["reject", "Reject"],
];

export function RadarUpdatePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: u, error, loading, reload } = useLoad(() => radar.update(Number(id)), [id]);
  const [status, setStatus] = useState("");
  const [topicId, setTopicId] = useState("");
  const [kind, setKind] = useState("learning-mission");

  if (loading && !u) return <Loading label="Opening the update" />;
  if (error) return error.startsWith("No update") ? <NotFoundPage what="update" /> : <ErrorState message={error} onRetry={reload} />;
  if (!u) return null;
  const sourceUrl = u.canonicalUrl.replace(/#hexhammer-change-.*/, "");

  async function act(fn: () => Promise<unknown>, done: string) {
    setStatus("…");
    try {
      await fn();
      setStatus(done);
      reload();
    } catch (e) {
      setStatus((e as Error).message);
    }
  }

  async function propose() {
    try {
      const p = await radar.propose(u!.id, topicId || u!.topics?.[0]?.id || "", kind);
      navigate(`/radar/proposals/${p.id}`);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }

  return (
    <div className="page-narrow radar-update">
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/radar">Tech Radar</Link> <span aria-hidden="true">/</span> <span aria-current="page">Update</span></nav>
      <p className="eyebrow">{u.source.name} · {u.technology}</p>
      <h1 className="page-title">{u.title}</h1>
      <p>
        <Badge tone={CLASSIFICATION_TONE[u.classification] ?? "soft"}>{u.classification.replace("-", " ")}</Badge> <Badge tone="soft">review: {u.reviewStatus}</Badge>{" "}
        <Badge tone={u.verificationStatus === "verified" ? "success" : u.verificationStatus === "disputed" ? "danger" : "soft"}>{u.verificationStatus}</Badge>
      </p>

      <section className="radar-update__facts" aria-labelledby="facts">
        <h2 id="facts" className="section-title">From the source (plain text, never executed)</h2>
        <p>{u.summary || <span className="muted">The source gave no summary.</span>}</p>
        <dl className="facts">
          <div><dt>Published</dt><dd>{u.publishedAt ? formatDate(u.publishedAt, true) : "not stated by the source"}</dd></div>
          <div><dt>Discovered by this app</dt><dd>{formatDate(u.discoveredAt, true)}</dd></div>
          <div><dt>Seen</dt><dd>{u.seenCount}× {u.alsoSeenIn.length > 0 && `(also in ${u.alsoSeenIn.length} other source${u.alsoSeenIn.length > 1 ? "s" : ""})`}</dd></div>
        </dl>
        <p><a href={sourceUrl} target="_blank" rel="noreferrer noopener">Read the original</a> <span className="muted small">(if the link fails, the source may have moved; the facts above are what it said when discovered)</span></p>
      </section>

      <section aria-labelledby="why">
        <h2 id="why" className="section-title">Why the radar flagged it (rule-based)</h2>
        <p>{u.classificationReason}</p>
        <p>Might affect: {u.topics?.length ? u.topics.map((t) => <Link key={t.id} to={`/topic/${t.id}`} className="tag">{t.title}</Link>) : <span className="muted">no topics</span>}</p>
      </section>

      <section aria-labelledby="ai">
        <h2 id="ai" className="section-title">AI-generated analysis (optional, local model)</h2>
        {u.aiAnalysis ? (
          <blockquote className="ai-note"><strong>AI-generated (via {u.analysisBy}), unverified:</strong> {u.aiAnalysis}</blockquote>
        ) : (
          <p className="muted">None. This uses a local Ollama model only, never a paid API.</p>
        )}
        <Button variant="secondary" size="small" onClick={() => act(() => radar.analyze(u.id), "Analysis added.")}>Ask the local model</Button>
      </section>

      <section aria-labelledby="review">
        <h2 id="review" className="section-title">Review</h2>
        <div className="actions">
          {ACTIONS.map(([action, label]) => (
            <Button key={action} variant={action === "approve" ? "primary" : "secondary"} size="small" onClick={() => act(() => radar.review(u.id, action), `Marked: ${label}.`)}>{label}</Button>
          ))}
        </div>
        <div className="actions">
          <Button variant="ghost" size="small" onClick={() => act(() => radar.verify(u.id, "verified"), "Marked as verified against the source.")}>I checked the source: facts verified</Button>
          <Button variant="ghost" size="small" onClick={() => act(() => radar.verify(u.id, "disputed"), "Marked as disputed.")}>Facts disputed</Button>
        </div>
        <p role="status" className="muted">{status}</p>
      </section>

      <section aria-labelledby="propose">
        <h2 id="propose" className="section-title">Propose a curriculum change</h2>
        <p className="muted">Creates a DRAFT. Only the source facts are filled in; you write the rest after reading the source. Approval publishes a new lesson version; your progress is kept.</p>
        <div className="lab__grid">
          <Field label="Topic">
            {(p) => (
              <select className="hh-select" value={topicId} onChange={(e) => setTopicId(e.target.value)} {...p}>
                {(u.topics ?? []).map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            )}
          </Field>
          <Field label="Kind">
            {(p) => (
              <select className="hh-select" value={kind} onChange={(e) => setKind(e.target.value)} {...p}>
                <option value="learning-mission">Learning mission</option>
                <option value="lesson-update">Lesson update</option>
                <option value="migration-exercise">Migration exercise</option>
                <option value="interview-questions">Interview questions</option>
                <option value="project-enhancement">Project enhancement</option>
              </select>
            )}
          </Field>
        </div>
        <Button onClick={propose} disabled={!u.topics?.length}>Create proposal draft</Button>
        {u.proposals && u.proposals.length > 0 && (
          <p>Existing: {u.proposals.map((p) => <Link key={p.id} to={`/radar/proposals/${p.id}`} className="tag">#{p.id} {p.status}</Link>)}</p>
        )}
      </section>
    </div>
  );
}
