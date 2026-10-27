// THE WORLD BACKDROP: the atmosphere behind every screen.
//
// Four flat layers stacked on top of each other, each moving a different amount when the pointer
// moves (that difference is what makes "parallax", the feeling of depth):
//   1. far    = a dim star field and two colored glows (amber and cyan light)
//   2. grid   = a faint circuit-board grid with a few traces
//   3. motes  = slow floating particles of "data"
//   4. vignette = darker edges, so the middle of the screen is where the light is
//
// It is decoration only (aria-hidden). Under reduced motion it stays perfectly still.
import { useEffect, type CSSProperties } from "react";

// 18 particles with fixed, hand-picked positions (no randomness, so it looks the same every time).
const MOTES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  delay: (i % 6) * -3.1,
  size: 2 + (i % 3),
  cyan: i % 3 === 0,
}));

export function WorldBackdrop() {
  // Write the pointer position into two CSS variables (--px, --py, from -1 to 1). The layers read
  // them in CSS. requestAnimationFrame makes sure we update at most once per screen frame.
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
      <div className="backdrop__far" />
      <svg className="backdrop__grid" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1600 1000">
        <defs>
          <pattern id="bd-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" className="backdrop__gridline" />
          </pattern>
        </defs>
        <rect width="1600" height="1000" fill="url(#bd-grid)" />
        {/* A few circuit traces with "pads" at their ends; one pulse of light runs along each. */}
        {[
          "M0 220 H340 L400 280 H760",
          "M1600 160 H1240 L1180 220 H900",
          "M120 1000 V780 L180 720 H520",
          "M1600 820 H1320 L1260 760 V600",
        ].map((d, i) => (
          <g key={d}>
            <path d={d} className="backdrop__trace" />
            <path d={d} className="backdrop__pulse" style={{ animationDelay: `${i * -2.4}s` }} pathLength={100} />
          </g>
        ))}
      </svg>
      <div className="backdrop__motes">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className={`backdrop__mote ${m.cyan ? "is-cyan" : ""}`}
            style={{ left: `${m.left}%`, top: `${m.top}%`, width: m.size, height: m.size, animationDelay: `${m.delay}s` } as CSSProperties}
          />
        ))}
      </div>
      <div className="backdrop__vignette" />
    </div>
  );
}
