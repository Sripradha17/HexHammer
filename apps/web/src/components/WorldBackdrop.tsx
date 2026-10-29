// THE WORLD BACKDROP: every page of the app stands in a painted place (art/realm.ts says which:
// the Workshop is the night market, Challenge the amphitheater, and so on).
//
//   - When I move to another page, the new place fades in over the old one (a cross-fade), so it
//     feels like travelling, not like a new page loading.
//   - The painting drifts very slowly, and shifts a little with the pointer (parallax).
//   - A dark veil sits on top, so text on the page is always easy to read.
//
// It also writes the pointer position into two CSS variables (--px, --py, from -1 to 1) that
// other layers use for parallax (the world map, its clouds).
//
// It is decoration only (aria-hidden). Under reduced motion it stays perfectly still.
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { scene, sceneForPath } from "../art/realm";

export function WorldBackdrop() {
  const { pathname } = useLocation();
  const n = sceneForPath(pathname);

  // The places on screen: the newest last. Older ones are removed once the new one has faded in.
  const [layers, setLayers] = useState<{ n: number; id: number }[]>([]);
  useEffect(() => {
    if (n === null) return;
    setLayers((all) => (all.at(-1)?.n === n ? all : [...all, { n, id: Date.now() }]));
    const t = setTimeout(() => setLayers((all) => all.slice(-1)), 1400);
    return () => clearTimeout(t);
  }, [n]);

  // requestAnimationFrame makes sure we update the pointer at most once per screen frame.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    function onMove(e: PointerEvent) {
      if (reduce.matches || document.documentElement.dataset.motion === "reduce") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const root = document.documentElement.style;
        root.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        root.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="backdrop" aria-hidden="true">
      {layers.map((l) => (
        <img key={l.id} className="backdrop__scene" src={scene(l.n)} alt="" />
      ))}
      <div className="backdrop__veil" />
    </div>
  );
}
