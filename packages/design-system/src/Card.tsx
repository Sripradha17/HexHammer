import {
  useEffect,
  useRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

// I will rebuild this by hand later.
// A raised, rounded panel that looks like it floats above the page.
//   level      picks the color (the top edge, the marker stripe under the title, the pin)
//   locked     gives the dimmed, pressed-in "coming soon" look
//   tone       "postit" makes it a yellow sticky note
//   decoration "tape" (a glossy ribbon) or "tack" (a glossy pin) on the top edge
//   tilt       makes the card lean toward the mouse, like a real object under a lamp
interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  level?: number;
  locked?: boolean;
  tone?: "paper" | "postit";
  decoration?: "none" | "tape" | "tack";
  tilt?: boolean;
}

// The most the card may lean, in degrees. It matches --hh-tilt in tokens.css.
const MAX_LEAN = 9;

export function Card({
  title,
  level,
  locked = false,
  tone = "paper",
  decoration = "none",
  tilt = false,
  className = "",
  children,
  ...rest
}: CardProps) {
  const ref = useRef<HTMLElement>(null);

  const classes = [
    "hh-card",
    locked ? "hh-card--locked" : "",
    tone === "postit" ? "hh-card--postit" : "",
    decoration === "none" ? "" : `hh-card--${decoration}`,
    tilt && !locked ? "hh-card--tilt" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Where is the mouse inside the card? Turn that into a small lean toward it.
  function handleMove(event: MouseEvent<HTMLElement>) {
    const card = ref.current;
    if (!tilt || locked || !card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5; // -0.5 (left edge) to 0.5 (right edge)
    const y = (event.clientY - box.top) / box.height - 0.5; // -0.5 (top edge) to 0.5 (bottom edge)
    card.style.setProperty("--hh-tilt-y", `${x * 2 * MAX_LEAN}deg`);
    card.style.setProperty("--hh-tilt-x", `${-y * 2 * MAX_LEAN}deg`);
  }

  // The lean goes away when the mouse really leaves. The CSS transition eases the card back to flat.
  // A leaning card sits in a 3D scene, and the browser can report a "leave" while the pointer is still
  // just inside the card. So we only flatten when the pointer is truly outside. If a leave report looks
  // false, we keep a small watch on the mouse and flatten as soon as it really is outside.
  const watcher = useRef<((event: globalThis.MouseEvent) => void) | null>(null);

  function isOutside(x: number, y: number) {
    const box = ref.current?.getBoundingClientRect();
    return !box || x < box.left || x > box.right || y < box.top || y > box.bottom;
  }

  function stopWatching() {
    if (watcher.current) document.removeEventListener("mousemove", watcher.current);
    watcher.current = null;
  }

  function flatten() {
    ref.current?.style.removeProperty("--hh-tilt-x");
    ref.current?.style.removeProperty("--hh-tilt-y");
    stopWatching();
  }

  function handleLeave(event: MouseEvent<HTMLElement>) {
    if (isOutside(event.clientX, event.clientY)) {
      flatten();
      return;
    }
    if (watcher.current) return;
    watcher.current = (moveEvent) => {
      if (isOutside(moveEvent.clientX, moveEvent.clientY)) flatten();
    };
    document.addEventListener("mousemove", watcher.current);
  }

  // If the card goes away while we are watching, stop.
  useEffect(() => {
    return () => {
      if (watcher.current) document.removeEventListener("mousemove", watcher.current);
    };
  }, []);

  return (
    <section
      ref={ref}
      data-level={level}
      className={classes}
      {...rest}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {title && <h2 className="hh-card__title">{title}</h2>}
      {children}
    </section>
  );
}
