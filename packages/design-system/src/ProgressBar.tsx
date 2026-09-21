// I will rebuild this by hand later.
// A colored bar that fills from 0 to 100 percent.
interface ProgressBarProps {
  percent: number; // 0 to 100
  level?: number;
  label?: string; // defaults to "42%"
}

export function ProgressBar({ percent, level, label }: ProgressBarProps) {
  // Keep the number between 0 and 100 so the bar never overflows.
  const safe = Math.min(100, Math.max(0, percent));

  return (
    <div className="hh-progress" data-level={level}>
      <div
        className="hh-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safe}
      >
        <div className="hh-progress__fill" style={{ width: `${safe}%` }} />
      </div>
      <span className="hh-progress__label">{label ?? `${safe}%`}</span>
    </div>
  );
}
