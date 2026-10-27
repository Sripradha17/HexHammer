// I will rebuild this by hand later.
// A colored bar that fills from 0 to 100 percent.
// `name` is what a screen reader announces ("Level progress"); without it, every bar on a page would
// just be called "progress bar" and nobody could tell them apart.
interface ProgressBarProps {
  percent: number; // 0 to 100
  level?: number;
  label?: string; // the visible text next to the bar; defaults to "42%"
  name?: string; // the accessible name
}

export function ProgressBar({ percent, level, label, name }: ProgressBarProps) {
  // Keep the number between 0 and 100 so the bar never overflows.
  const safe = Math.round(Math.min(100, Math.max(0, percent)));

  return (
    <div className="hh-progress" data-level={level}>
      <div
        className="hh-progress__track"
        role="progressbar"
        aria-label={name ?? "Progress"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safe}
        aria-valuetext={label ?? `${safe}%`}
      >
        <div className="hh-progress__fill" style={{ width: `${safe}%` }} />
      </div>
      <span className="hh-progress__label" aria-hidden="true">
        {label ?? `${safe}%`}
      </span>
    </div>
  );
}
