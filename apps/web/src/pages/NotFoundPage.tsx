// Shown for any address that does not exist (and for unknown topics, regions or projects).
import { Link } from "react-router";

export function NotFoundPage({ what = "page" }: { what?: string }) {
  return (
    <div className="page-narrow not-found">
      <p className="eyebrow">404 · off the map</p>
      <h1 className="page-title">This {what} isn't on the map.</h1>
      <p className="lead">The link may be old, or the address may have a typo. Nothing you did is lost.</p>
      <div className="actions">
        <Link to="/" className="hh-button hh-button--primary">Back to Mission Control</Link>
        <Link to="/map" className="hh-button hh-button--secondary">Open the World Map</Link>
      </div>
    </div>
  );
}
