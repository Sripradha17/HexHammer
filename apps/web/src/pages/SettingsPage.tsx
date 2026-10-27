// SETTINGS AND LEARNING PREFERENCES. Saved to the database (so they survive a browser change).
// Theme is per-browser (localStorage), because it is a display choice, not learning data.
import { useEffect, useState } from "react";
import { Button, Field } from "@hexhammer/design-system";
import { atlas, type Preferences } from "../atlasApi";
import { useLoad } from "../useLoad";
import { ErrorState, Loading } from "../components/PageState";

const RADAR_CATEGORIES = ["security", "framework", "ai-platform", "cloud", "devops", "standards", "publication"];

export function SettingsPage() {
  const { data, error, loading, reload } = useLoad(() => Promise.all([atlas.preferences(), atlas.map()]));
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (data) setPrefs(data[0]);
  }, [data]);

  if (loading && !data) return <Loading label="Opening settings" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!prefs || !data) return null;
  const regions = data[1].regions;
  const set = <K extends keyof Preferences>(k: K, v: Preferences[K]) => setPrefs({ ...prefs, [k]: v });

  async function save() {
    setStatus("Saving…");
    try {
      const saved = await atlas.savePreferences(prefs!);
      setPrefs(saved);
      if (saved.motion === "system") delete document.documentElement.dataset.motion;
      else document.documentElement.dataset.motion = saved.motion;
      setStatus("Saved.");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }

  function setTheme(theme: "light" | "dark") {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("hexhammer-theme", theme);
    } catch {
      // not remembered
    }
  }

  return (
    <div className="page-narrow settings">
      <p className="eyebrow">Settings</p>
      <h1 className="page-title">Learning preferences</h1>
      <form onSubmit={(e) => (e.preventDefault(), save())}>
        <fieldset className="settings__group">
          <legend>Goals</legend>
          <Field label="Daily practice goal (minutes)" hint="Shown as a target only. Missing a day never resets anything.">
            {(p) => <input className="hh-input" type="number" min={5} max={480} value={prefs.dailyGoalMinutes} onChange={(e) => set("dailyGoalMinutes", Number(e.target.value))} {...p} />}
          </Field>
          <Field label="Topics to assess per week">
            {(p) => <input className="hh-input" type="number" min={1} max={20} value={prefs.weeklyGoalTopics} onChange={(e) => set("weeklyGoalTopics", Number(e.target.value))} {...p} />}
          </Field>
        </fieldset>

        <fieldset className="settings__group">
          <legend>Path and difficulty</legend>
          <Field label="Preferred learning path" hint="Mission Control suggests topics from this region first.">
            {(p) => (
              <select className="hh-select" value={prefs.preferredDomainId ?? ""} onChange={(e) => set("preferredDomainId", e.target.value || null)} {...p}>
                <option value="">Follow my recent activity</option>
                {regions.map((r) => <option key={r.id} value={r.id}>{r.number}. {r.title}</option>)}
              </select>
            )}
          </Field>
          <Field label="Suggested difficulty">
            {(p) => (
              <select className="hh-select" value={prefs.difficulty} onChange={(e) => set("difficulty", e.target.value as Preferences["difficulty"])} {...p}>
                <option value="foundation">Foundation: rebuild the basics first</option>
                <option value="core">Core</option>
                <option value="advanced">Advanced</option>
              </select>
            )}
          </Field>
          <label className="check"><input type="checkbox" checked={prefs.strictUnlocking} onChange={(e) => set("strictUnlocking", e.target.checked)} /> Strict unlocking: locked regions cannot be opened at all</label>
        </fieldset>

        <fieldset className="settings__group">
          <legend>Reviews</legend>
          <Field label="Review frequency" hint="Relaxed stretches every gap by 1.5×; intense shrinks it to 0.6×.">
            {(p) => (
              <select className="hh-select" value={prefs.reviewIntensity} onChange={(e) => set("reviewIntensity", e.target.value as Preferences["reviewIntensity"])} {...p}>
                <option value="relaxed">Relaxed</option>
                <option value="normal">Normal</option>
                <option value="intense">Intense</option>
              </select>
            )}
          </Field>
        </fieldset>

        <fieldset className="settings__group">
          <legend>Notifications (shown inside the app)</legend>
          <label className="check"><input type="checkbox" checked={prefs.notifyReviews} onChange={(e) => set("notifyReviews", e.target.checked)} /> Show reviews due on Mission Control</label>
          <label className="check"><input type="checkbox" checked={prefs.notifyRadar} onChange={(e) => set("notifyRadar", e.target.checked)} /> Show technology updates on Mission Control</label>
        </fieldset>

        <fieldset className="settings__group">
          <legend>Technology Radar categories</legend>
          <p className="muted">The scheduler only checks sources in these categories (you can still check any source by hand).</p>
          {RADAR_CATEGORIES.map((c) => (
            <label key={c} className="check">
              <input type="checkbox" checked={prefs.radarCategories.includes(c)} onChange={() => set("radarCategories", prefs.radarCategories.includes(c) ? prefs.radarCategories.filter((x) => x !== c) : [...prefs.radarCategories, c])} /> {c}
            </label>
          ))}
        </fieldset>

        <fieldset className="settings__group">
          <legend>Motion and theme</legend>
          <Field label="Motion" hint="Reduce turns off every animation.">
            {(p) => (
              <select className="hh-select" value={prefs.motion} onChange={(e) => set("motion", e.target.value as Preferences["motion"])} {...p}>
                <option value="system">Follow my system setting</option>
                <option value="reduce">Reduce motion</option>
                <option value="full">Full motion</option>
              </select>
            )}
          </Field>
          <div className="actions">
            <Button variant="secondary" size="small" onClick={() => setTheme("light")}>Light theme</Button>
            <Button variant="secondary" size="small" onClick={() => setTheme("dark")}>Dark theme</Button>
          </div>
        </fieldset>

        <div className="editor__bar">
          <Button type="submit">Save preferences</Button>
          <span role="status" className="muted">{status}</span>
        </div>
      </form>

      <section className="settings__group" aria-labelledby="backup-title">
        <h2 id="backup-title" className="section-title">Data export and backup</h2>
        <p>
          Your learning data lives in your local PostgreSQL (Docker volume <code>hexhammer-data</code>). Download a JSON copy of everything you have done at any time:
        </p>
        <div className="actions">
          <a className="hh-button hh-button--secondary" href="/api/atlas/export" download>Download my data (JSON)</a>
          <a className="hh-button hh-button--secondary" href="/api/projects/export/markdown" download>Portfolio (Markdown)</a>
        </div>
        <p className="muted">
          For a full database backup, run <code>docker exec hexhammer-db pg_dump -U hexhammer hexhammer &gt; backup.sql</code>. See the README for restoring.
        </p>
      </section>
    </div>
  );
}
