// TECHNOLOGY RADAR: what changed in the tools I am learning, what it might mean, and a review queue
// that decides what (if anything) reaches the curriculum. Nothing changes a lesson without approval.
import { useState } from "react";
import { Link } from "react-router";
import { Badge, Button, Chip, EmptyState, Field } from "@hexhammer/design-system";
import { radar, type RadarSource } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { CLASSIFICATION_TONE, formatDate, relativeDays } from "../labels";

const QUEUE_FILTERS = [
  ["", "All"],
  ["new", "New"],
  ["needs-verification", "Needs verification"],
  ["deferred", "Deferred"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
  ["already-covered", "Already covered"],
];

function SourceRow({ s, onChanged }: { s: RadarSource; onChanged: () => void }) {
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  async function act(label: string, fn: () => Promise<unknown>) {
    setBusy(label);
    setNote("");
    try {
      const r = (await fn()) as { run?: { itemsNew: number; itemsDuplicate: number; status: string; error: string | null }; validation?: { detail: string } };
      if (r?.run) setNote(r.run.status === "ok" ? `${r.run.itemsNew} new, ${r.run.itemsDuplicate} already known` : `Failed: ${r.run.error}`);
      if (r?.validation) setNote(r.validation.detail);
      onChanged();
    } catch (e) {
      setNote((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <tr>
      <th scope="row">
        {s.name}
        <br />
        <span className="muted small">{s.kind} · {s.technology} · every {s.checkIntervalHours}h</span>
      </th>
      <td><Badge tone="soft">{s.category}</Badge></td>
      <td>
        <Badge tone={s.health === "healthy" ? "success" : s.health === "failing" ? "danger" : s.health === "stale" ? "review" : "soft"}>{s.health.replace("-", " ")}</Badge>
        {s.validationStatus !== "valid" && <Badge tone={s.validationStatus === "invalid" ? "danger" : "soft"}>{s.validationStatus}</Badge>}
        {s.lastError && <span className="small muted" title={s.lastError}> {s.lastError.slice(0, 60)}</span>}
      </td>
      <td className="small">{s.lastCheckedAt ? relativeDays(s.lastCheckedAt) : "never"} · {s.updateCount} items</td>
      <td>
        <div className="row-actions">
          <Button size="small" variant="secondary" disabled={Boolean(busy) || !s.enabled} onClick={() => act("check", () => radar.checkSource(s.id))}>{busy === "check" ? "Checking…" : "Check now"}</Button>
          <Button size="small" variant="ghost" disabled={Boolean(busy)} onClick={() => act("validate", () => radar.validateSource(s.id))}>Validate</Button>
          <Button size="small" variant="ghost" disabled={Boolean(busy)} onClick={() => act("toggle", () => radar.editSource(s.id, { enabled: !s.enabled }))}>{s.enabled ? "Disable" : "Enable"}</Button>
        </div>
        {note && <p className="small" role="status">{note}</p>}
      </td>
    </tr>
  );
}

function AddSource({ onAdded }: { onAdded: () => void }) {
  const [form, setForm] = useState({ name: "", url: "", kind: "atom", category: "framework", technology: "" });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    setBusy(true);
    setStatus("Checking the source before registering it…");
    try {
      const r = await radar.addSource({ ...form, topicIds: [] });
      setStatus(`Registered. ${r.validation.detail}`);
      setForm({ name: "", url: "", kind: "atom", category: "framework", technology: "" });
      onAdded();
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="add-source">
      <summary>Add a source</summary>
      <form className="add-source__form" onSubmit={(e) => (e.preventDefault(), submit())}>
        <Field label="Name">{(p) => <input className="hh-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} {...p} />}</Field>
        <Field label="URL" hint="https only, public sites only. GitHub releases have a feed at …/releases.atom">{(p) => <input className="hh-input" type="url" required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} {...p} />}</Field>
        <Field label="Kind">
          {(p) => (
            <select className="hh-select" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} {...p}>
              <option value="atom">Atom feed</option><option value="rss">RSS feed</option><option value="page-watch">Watch a page for changes</option>
              <option value="github-advisories">GitHub advisories API</option><option value="nvd">NVD CVE API</option>
            </select>
          )}
        </Field>
        <Field label="Category">
          {(p) => (
            <select className="hh-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} {...p}>
              {["security", "framework", "ai-platform", "cloud", "devops", "standards", "publication"].map((c) => <option key={c}>{c}</option>)}
            </select>
          )}
        </Field>
        <Field label="Technology">{(p) => <input className="hh-input" required value={form.technology} onChange={(e) => setForm({ ...form, technology: e.target.value })} {...p} />}</Field>
        <div className="editor__bar">
          <Button type="submit" disabled={busy || !form.name || !form.url || !form.technology}>Validate and add</Button>
          <span role="status" className="muted">{status}</span>
        </div>
      </form>
    </details>
  );
}

export function RadarPage() {
  const overview = useLoad(() => radar.overview());
  const [filter, setFilter] = useState("new");
  const [query, setQuery] = useState("");
  const updates = useLoad(() => radar.updates({ status: filter, q: query }), [filter, query]);
  const proposals = useLoad(() => radar.proposals());
  const [busy, setBusy] = useState(false);

  if (overview.loading && !overview.data) return <Loading label="Warming up the radar" />;
  if (overview.error) return <ErrorState message={overview.error} onRetry={overview.reload} />;
  const o = overview.data!;
  const reloadAll = () => (overview.reload(), updates.reload(), proposals.reload());

  async function checkDue() {
    setBusy(true);
    try {
      await radar.checkDue();
    } finally {
      setBusy(false);
      reloadAll();
    }
  }

  return (
    <div className="radar">
      <header className="page-head page-head--row">
        <div>
          <p className="eyebrow">Technology Radar · {o.sources.length} sources · {o.pendingProposals} proposals waiting</p>
          <h1 className="page-title">What changed, and does it matter?</h1>
          <p className="lead">
            Classifications are <strong>rule-based</strong> (each shows the rule that fired). Optional AI analysis uses a local model and is always labelled.
            Nothing reaches a lesson until you approve it.
          </p>
        </div>
        <Button onClick={checkDue} disabled={busy}>{busy ? "Checking…" : "Check due sources now"}</Button>
      </header>

      <p className="callout">
        <strong>Scheduler:</strong> {o.scheduler.running ? `running, wakes every ${o.scheduler.tickMinutes} min${o.scheduler.lastTickAt ? `, last ${formatDate(o.scheduler.lastTickAt, true)}` : ""}` : "not running"}. {o.scheduler.note}
      </p>

      <section aria-labelledby="queue-title">
        <h2 id="queue-title" className="section-title">Review queue</h2>
        <div className="filters" role="group" aria-label="Review status">
          {QUEUE_FILTERS.map(([v, l]) => <Chip key={v} pressed={filter === v} onToggle={() => setFilter(v)}>{l}</Chip>)}
          <label className="filters__select">
            <span className="visually-hidden">Search updates</span>
            <input className="hh-input" type="search" placeholder="Search titles…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>
        {updates.error ? (
          <ErrorState message={updates.error} onRetry={updates.reload} />
        ) : !updates.data ? (
          <Loading />
        ) : updates.data.updates.length === 0 ? (
          <EmptyState title="Nothing here">
            {filter === "new" ? "No new updates. Use \"Check now\" on a source below (the fixture sources work offline)." : "No updates with this status."}
          </EmptyState>
        ) : (
          <ul className="update-list">
            {updates.data.updates.map((u) => (
              <li key={u.id} className="update-item">
                <Badge tone={CLASSIFICATION_TONE[u.classification] ?? "soft"}>{o.labels[u.classification] ?? u.classification}</Badge>
                <Link to={`/radar/updates/${u.id}`} className="update-item__title">{u.title}</Link>
                <span className="muted small">
                  {u.source.name} · published {u.publishedAt ? formatDate(u.publishedAt) : "date not given"} · discovered {formatDate(u.discoveredAt)}
                  {u.seenCount > 1 && ` · seen ${u.seenCount}×`} · {u.reviewStatus.replace("-", " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="prop-title">
        <h2 id="prop-title" className="section-title">Curriculum proposals</h2>
        {(proposals.data?.proposals ?? []).length === 0 ? (
          <p className="muted">None yet. Open an update and choose "Propose a curriculum change".</p>
        ) : (
          <ul className="update-list">
            {proposals.data!.proposals.map((p) => (
              <li key={p.id} className="update-item">
                <Badge tone={p.status === "approved" ? "success" : p.status === "rejected" ? "danger" : p.status === "deferred" ? "soft" : "review"}>{p.status}</Badge>
                <Link to={`/radar/proposals/${p.id}`} className="update-item__title">{p.title}</Link>
                <span className="muted small">{p.kind} · {p.topicTitle} · {formatDate(p.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="src-title">
        <h2 id="src-title" className="section-title">Sources</h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr><th scope="col">Source</th><th scope="col">Category</th><th scope="col">Health</th><th scope="col">Last check</th><th scope="col">Actions</th></tr>
            </thead>
            <tbody>{o.sources.map((s) => <SourceRow key={s.id} s={s} onChanged={reloadAll} />)}</tbody>
          </table>
        </div>
        <AddSource onAdded={reloadAll} />
      </section>

      <section aria-labelledby="runs-title">
        <h2 id="runs-title" className="section-title">Run history</h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th scope="col">When</th><th scope="col">What</th><th scope="col">Trigger</th><th scope="col">Result</th></tr></thead>
            <tbody>
              {o.runs.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.startedAt, true)}</td>
                  <td>{r.source?.name ?? r.kind}</td>
                  <td>{r.trigger}</td>
                  <td>{r.status === "ok" ? (r.kind === "source-check" ? `${r.itemsFound} found, ${r.itemsNew} new, ${r.itemsDuplicate} duplicates` : "recorded") : <span className="field-error">{r.error}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
