// Shown while the page waits for the API.
import { BramFace } from "../art/Bram";

export function Loading() {
  return (
    <div className="loading" role="status">
      <BramFace mood="think" size={64} />
      <p>Loading, one moment...</p>
    </div>
  );
}
