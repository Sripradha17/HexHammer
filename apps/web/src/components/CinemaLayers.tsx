// The "movie set" layers: light beams behind the page, and a spotlight, a vignette and film grain over it.
// All of them are decoration only, so they are hidden from screen readers and they never catch clicks.
// The spotlight follows the mouse: App.tsx sets --spot-x and --spot-y (see app.css).
export function CinemaLayers() {
  return (
    <div className="cinema" aria-hidden="true">
      <div className="cinema__beams" />
      <div className="cinema__spot" />
      <div className="cinema__vignette" />
      <div className="cinema__grain" />
    </div>
  );
}
