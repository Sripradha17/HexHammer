// A curriculum proposal: edit the 12-part learning mission, choose affected exercises/questions,
// then approve (publishes a new lesson version), reject or defer. Approval asks for confirmation.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Badge, Button, ConfirmDialog, Field } from "@hexhammer/design-system";
import { radar, type MissionContent, type Proposal } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";
import { useRewards } from "../components/Rewards";
import { NotFoundPage } from "./NotFoundPage";
import { formatDate } from "../labels";

const TEXT_FIELDS: [keyof MissionContent, string, string][] = [
  ["whatChanged", "1. What changed?", "Pre-filled from the source. Correct it if needed."],
  ["whyChanged", "2. Why did it change?", "Required. From the source's own explanation."],
  ["before", "3. What was true before?", "Required."],
  ["now", "4. What is true now?", "Required."],
  ["example", "6. A practical example", "Plain text or code."],
  ["demo", "7. A visual or lab that helps", "Optional."],
  ["exercise", "8. A debugging or migration exercise", "Required. Describe the task; never include its solution."],
  ["projectEnhancement", "10. Project enhancement", "Optional."],
];

export function ProposalPage() {
  const { id = "" } = useParams();
  const { data, error, loading, reload } = useLoad(() => radar.proposal(Number(id)), [id]);
  const [p, setP] = useState<Proposal | null>(null);
  const [status, setStatus] = useState("");
  const [confirm, setConfirm] = useState<"" | "approve" | "reject" | "defer">("");
  const [note, setNote] = useState("");
  const { celebrate } = useRewards();

  useEffect(() => {
    if (data) setP(data);
  }, [data]);

  if (loading && !data) return <Loading label="Opening the proposal" />;
  if (error) return error.startsWith("No such") ? <NotFoundPage what="proposal" /> : <ErrorState message={error} onRetry={reload} />;
  if (!p) return null;
  const editable = p.status === "proposed" || p.status === "deferred";
  const c = p.content;
  const setC = (k: keyof MissionContent, v: unknown) => setP({ ...p, content: { ...c, [k]: v } });
  const listOf = (k: "interviewQuestions" | "assessment") => c[k];

  async function save() {
    setStatus("Saving…");
    try {
      const saved = await radar.saveProposal(p!.id, { content: p!.content, migrationNotes: p!.migrationNotes, affectedExercises: p!.affectedExercises, affectedQuestions: p!.affectedQuestions });
      setP({ ...p!, ...saved });
      setStatus(saved.problems?.length ? "Saved. Still needed before approval: see the list." : "Saved. Ready for approval.");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }

  async function decide() {
    const decision = confirm;
    setConfirm("");
    try {
      if (decision === "approve") await save();
      const r = await radar.decide(p!.id, decision, note);
      celebrate({ ...r, message: decision === "approve" ? `Published as version ${r.version?.version}` : `Proposal ${decision}ed` });
      reload();
    } catch (e) {
      setStatus((e as Error).message);
    }
  }

  return (
    <div className="page-narrow proposal">
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/radar">Tech Radar</Link> <span aria-hidden="true">/</span> <span aria-current="page">Proposal #{p.id}</span></nav>
      <p className="eyebrow">{p.kind} · for <Link to={`/topic/${p.topicId}`}>{p.topicTitle}</Link> · created {formatDate(p.createdAt)}</p>
      <h1 className="page-title">{p.title}</h1>
      <p><Badge tone={p.status === "approved" ? "success" : p.status === "rejected" ? "danger" : "review"}>{p.status}</Badge> {p.version && <Badge tone="success">Published as version {p.version.version}</Badge>}</p>
      <p className="callout"><strong>Reason:</strong> {p.changeReason}</p>
      {p.update && <p>From: <a href={p.update.canonicalUrl.replace(/#hexhammer-change-.*/, "")} target="_blank" rel="noreferrer noopener">{p.update.title}</a></p>}

      {editable && p.problems && p.problems.length > 0 && (
        <div className="callout callout--locked" role="note">
          <strong>Before it can be approved:</strong>
          <ul>{p.problems.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      )}

      <form onSubmit={(e) => (e.preventDefault(), save())}>
        <fieldset disabled={!editable} className="proposal__fields">
          {TEXT_FIELDS.map(([k, label, hint]) => (
            <Field key={k} label={label} hint={hint}>
              {(props) => <textarea className="hh-textarea" value={String(c[k] ?? "")} onChange={(e) => setC(k, e.target.value)} {...props} />}
            </Field>
          ))}
          <p className="muted">5. Foundations: {c.foundations.map((f) => <Link key={f} to={`/topic/${f}`} className="tag">{f}</Link>)}</p>

          {(["interviewQuestions", "assessment"] as const).map((k) => (
            <fieldset key={k} className="checklist-edit">
              <legend>{k === "interviewQuestions" ? "9. Interview questions and model answers" : "11. Assessment (self-check questions)"}</legend>
              {listOf(k).map((q, i) => (
                <div key={i} className="qa-edit">
                  <label className="lab__field">Question<input className="hh-input" value={q.prompt} onChange={(e) => setC(k, listOf(k).map((x, j) => (j === i ? { ...x, prompt: e.target.value } : x)))} /></label>
                  <label className="lab__field">Model answer<textarea className="hh-textarea" value={q.modelAnswer} onChange={(e) => setC(k, listOf(k).map((x, j) => (j === i ? { ...x, modelAnswer: e.target.value } : x)))} /></label>
                  <Button variant="ghost" size="small" onClick={() => setC(k, listOf(k).filter((_, j) => j !== i))}>Remove</Button>
                </div>
              ))}
              <Button variant="secondary" size="small" onClick={() => setC(k, [...listOf(k), { prompt: "", modelAnswer: "" }])}>Add</Button>
            </fieldset>
          ))}

          <fieldset className="checklist-edit">
            <legend>12. References (https only)</legend>
            {c.references.map((r, i) => (
              <div key={i} className="inline-add inline-add--wide">
                <input className="hh-input" aria-label="Reference title" value={r.title} onChange={(e) => setC("references", c.references.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                <input className="hh-input" aria-label="Reference URL" value={r.url} onChange={(e) => setC("references", c.references.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
              </div>
            ))}
            <Button variant="secondary" size="small" onClick={() => setC("references", [...c.references, { title: "", url: "https://" }])}>Add reference</Button>
          </fieldset>

          <fieldset className="checklist-edit">
            <legend>Affected exercises</legend>
            {(p.topicExercises ?? []).map((ex) => (
              <label key={ex.index} className="check">
                <input type="checkbox" checked={p.affectedExercises.includes(String(ex.index))} onChange={() => setP({ ...p, affectedExercises: p.affectedExercises.includes(String(ex.index)) ? p.affectedExercises.filter((x) => x !== String(ex.index)) : [...p.affectedExercises, String(ex.index)] })} /> {ex.label}
              </label>
            ))}
          </fieldset>
          <fieldset className="checklist-edit">
            <legend>Affected interview questions</legend>
            {(p.topicQuestions ?? []).map((q) => (
              <label key={q.id} className="check">
                <input type="checkbox" checked={p.affectedQuestions.includes(q.id)} onChange={() => setP({ ...p, affectedQuestions: p.affectedQuestions.includes(q.id) ? p.affectedQuestions.filter((x) => x !== q.id) : [...p.affectedQuestions, q.id] })} /> {q.prompt}
              </label>
            ))}
          </fieldset>
          <Field label="Migration notes" hint="What learners who already studied this topic should know. Their progress is always kept.">
            {(props) => <textarea className="hh-textarea" value={p.migrationNotes} onChange={(e) => setP({ ...p, migrationNotes: e.target.value })} {...props} />}
          </Field>
        </fieldset>

        {editable && (
          <div className="editor__bar">
            <Button type="submit" variant="secondary">Save draft</Button>
            <Button onClick={() => setConfirm("approve")}>Approve and publish…</Button>
            <Button variant="ghost" onClick={() => setConfirm("defer")}>Defer</Button>
            <Button variant="danger" onClick={() => setConfirm("reject")}>Reject…</Button>
            <span role="status" className="muted">{status}</span>
          </div>
        )}
        {!editable && <p className="muted">Decided {formatDate(p.decidedAt)}{p.decisionNote ? `: "${p.decisionNote}"` : ""}. Decided proposals are kept for the audit trail.</p>}
      </form>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm === "approve" ? "Publish this as a new lesson version?" : confirm === "reject" ? "Reject this proposal?" : "Defer this proposal?"}
        confirmLabel={confirm === "approve" ? "Approve and publish" : confirm === "reject" ? "Reject" : "Defer"}
        danger={confirm === "reject"}
        onConfirm={decide}
        onCancel={() => setConfirm("")}
      >
        <p>{confirm === "approve" ? "The mission is added to the lesson as a new version. Older versions stay in the history, and learner progress is not touched." : "This is recorded in the audit trail."}</p>
        <label className="lab__field">Note (optional)<input className="hh-input" value={note} onChange={(e) => setNote(e.target.value)} /></label>
      </ConfirmDialog>
    </div>
  );
}
