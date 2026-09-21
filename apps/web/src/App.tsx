// The app shell: top bar (with the streak) and the four pages.
import { useEffect, useLayoutEffect, useState } from "react";
import { Link, Route, Routes } from "react-router";
import { Badge, Button } from "@hexhammer/design-system";
import { api, type StreakInfo } from "./api";
import { art } from "./mascots";
import { LevelMapPage } from "./pages/LevelMapPage";
import { LevelPage } from "./pages/LevelPage";
import { TrackPage } from "./pages/TrackPage";
import { StrikePage } from "./pages/StrikePage";
import { InterviewPage } from "./pages/InterviewPage";

type Theme = "light" | "dark";
const THEME_KEY = "hexhammer-theme";

// The theme I picked last time, or else what my computer prefers.
function firstTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Storage can be blocked (private window). Then we simply do not remember.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function App() {
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [theme, setTheme] = useState<Theme>(firstTheme);

  // Put the theme on the <html> tag (the CSS reads it there) and remember it.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // not remembered, that is fine
    }
  }, [theme]);

  // Mouse parallax: tell the CSS where the mouse is, from -1 (left / top) to 1 (right / bottom).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    function onMove(event: MouseEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const root = document.documentElement;
        root.style.setProperty(
          "--mouse-x",
          String((event.clientX / window.innerWidth) * 2 - 1),
        );
        root.style.setProperty(
          "--mouse-y",
          String((event.clientY / window.innerHeight) * 2 - 1),
        );
      });
    }
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Ask the API for the streak when the app opens.
  useEffect(() => {
    api
      .getStreak()
      .then(setStreak)
      .catch(() => setStreak(null));
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="topbar__logo">
          <img className="logo-img" src={art.logo} alt="" width={44} height={44} />{" "}
          Hexhammer
        </Link>
        <nav className="topbar__nav">
          <Link to="/">Level Map</Link>
          <Link to="/interview">Interview</Link>
        </nav>
        <div className="topbar__right">
          <Badge
            tone={streak?.doneToday ? "success" : "soft"}
            title="Days in a row that you practiced"
          >
            {streak?.current ?? 0} day streak
          </Badge>
          <Button
            size="small"
            variant="secondary"
            aria-pressed={theme === "dark"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </Button>
        </div>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<LevelMapPage />} />
          <Route path="/level/:number" element={<LevelPage />} />
          <Route path="/track/:id" element={<TrackPage />} />
          <Route
            path="/strike/:id"
            element={<StrikePage onProgress={() => api.getStreak().then(setStreak)} />}
          />
          <Route
            path="/interview"
            element={<InterviewPage onProgress={() => api.getStreak().then(setStreak)} />}
          />
        </Routes>
      </main>
    </div>
  );
}
