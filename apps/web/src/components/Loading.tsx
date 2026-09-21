// Shown while the page waits for the API.
import { art } from "../mascots";

export function Loading() {
  return (
    <div className="loading" role="status">
      <img className="loading__art" src={art.loading} alt="" />
      <p>Loading, one moment...</p>
    </div>
  );
}
