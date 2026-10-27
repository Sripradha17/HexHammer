// The app shell: navigation (a rail on wide screens, a floating dock on phones), the level badge,
// theme and motion settings, and every page's route.
import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router";
import { atlas, type Me } from "./atlasApi";
import { api } from "./api";
import { RewardsProvider, useRewards } from "./components/Rewards";
import { MissionControlPage } from "./pages/MissionControlPage";
import { WorldMapPage } from "./pages/WorldMapPage";
import { RegionPage } from "./pages/RegionPage";
import { TopicStudioPage } from "./pages/TopicStudioPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { InterviewArenaPage } from "./pages/InterviewArenaPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectEditorPage } from "./pages/ProjectEditorPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { GlossaryPage } from "./pages/GlossaryPage";
import { RadarPage } from "./pages/RadarPage";
import { RadarUpdatePage } from "./pages/RadarUpdatePage";
import { ProposalPage } from "./pages/ProposalPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { Loading } from "./components/PageState";
import { LevelMapPage } from "./pages/LevelMapPage";
import { LevelPage } from "./pages/LevelPage";
import { TrackPage } from "./pages/TrackPage";
// The two pages with a code editor are loaded only when opened (the editor is large).
const StrikePage = lazy(() => import("./pages/StrikePage").then((m) => ({ default: m.StrikePage })));
const InterviewPage = lazy(() => import("./pages/InterviewPage").then((m) => ({ default: m.InterviewPage })));

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

// The main places, in order. The first five also appear in the phone dock.
const NAV = [
  { to: "/", label: "Mission Control", glyph: "◎", end: true },
  { to: "/map", label: "World Map", glyph: "⬡" },
  { to: "/reviews", label: "Reviews", glyph: "↻" },
  { to: "/interview", label: "Interview Arena", glyph: "✎" },
  { to: "/projects", label: "Projects", glyph: "⚒" },
  { to: "/portfolio", label: "Portfolio", glyph: "▦" },
  { to: "/glossary", label: "Glossary", glyph: "Aa" },
  { to: "/radar", label: "Tech Radar", glyph: "◉" },
  { to: "/analytics", label: "Analytics", glyph: "∿" },
  { to: "/levels", label: "Classic levels", glyph: "▤" },
  { to: "/settings", label: "Settings", glyph: "⚙" },
];

function LevelBadge() {
  const { xpVersion } = useRewards();
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    atlas.me().then(setMe).catch(() => setMe(null));
  }, [xpVersion]);
  if (!me) return null;
  const pct = Math.round((me.xpIntoLevel / me.xpForNextLevel) * 100);
  return (
    <NavLink to="/analytics" className="level-badge" title={`${me.xp} XP in total. ${me.xpForNextLevel - me.xpIntoLevel} XP to level ${me.level + 1}.`}>
      <span className="level-badge__level">Lv {me.level}</span>
      <span className="level-badge__bar" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </span>
      <span className="level-badge__xp">
        {me.xp} XP<span className="visually-hidden">, {pct}% of the way to level {me.level + 1}</span>
      </span>
      {me.streak.current > 0 && <span className="level-badge__streak">{me.streak.current}-day streak</span>}
    </NavLink>
  );
}

function Shell() {
  const [theme, setTheme] = useState<Theme>(firstTheme);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // Put the theme on <html> (the CSS reads it there) and remember it.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // not remembered, that is fine
    }
  }, [theme]);

  // Motion preference from Settings ("system" leaves it to the operating system).
  useEffect(() => {
    atlas
      .preferences()
      .then((p) => {
        if (p.motion === "system") delete document.documentElement.dataset.motion;
        else document.documentElement.dataset.motion = p.motion;
      })
      .catch(() => undefined);
  }, []);

  // On every page change: move keyboard focus to the main area (so screen readers announce the new
  // page) and scroll to the top. Skipped on the first load.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  // Keep the old streak endpoint warm for the classic pages (they call it after progress).
  const refreshStreak = () => api.getStreak().catch(() => undefined);

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <nav className="rail" aria-label="Main">
        <NavLink to="/" className="brand" end>
          <svg className="brand__mark" viewBox="0 0 100 100" aria-hidden="true">
            <polygon points="50,4 92,27 92,73 50,96 8,73 8,27" />
            <path d="M35 30 V70 M65 30 V70 M35 50 H65" />
          </svg>
          <span className="brand__name">Hexhammer</span>
        </NavLink>
        <LevelBadge />
        <ul className="rail__list">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className="rail__link">
                <span className="rail__glyph" aria-hidden="true">
                  {item.glyph}
                </span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="theme-toggle"
          aria-pressed={theme === "dark"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "☀ Light mode" : "☾ Dark mode"}
        </button>
      </nav>

      {/* Phone navigation: a floating dock with the five most-used places plus "More". */}
      <nav className="dock" aria-label="Quick">
        {NAV.slice(0, 5).map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className="dock__link">
            <span aria-hidden="true">{item.glyph}</span>
            <span className="dock__label">{item.label.split(" ")[0]}</span>
          </NavLink>
        ))}
        <NavLink to="/more" className="dock__link">
          <span aria-hidden="true">⋯</span>
          <span className="dock__label">More</span>
        </NavLink>
      </nav>

      <main id="main" ref={mainRef} tabIndex={-1} className="main">
        <div key={location.pathname} className="scene">
          <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<MissionControlPage />} />
            <Route path="/map" element={<WorldMapPage />} />
            <Route path="/map/:regionId" element={<RegionPage />} />
            <Route path="/topic/:id" element={<TopicStudioPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/interview" element={<InterviewArenaPage />} />
            <Route path="/interview/flashcards" element={<InterviewPage onProgress={refreshStreak} />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<ProjectEditorPage />} />
            <Route path="/projects/:id" element={<ProjectEditorPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
            <Route path="/radar" element={<RadarPage />} />
            <Route path="/radar/updates/:id" element={<RadarUpdatePage />} />
            <Route path="/radar/proposals/:id" element={<ProposalPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/more" element={<MorePage />} />
            <Route path="/levels" element={<LevelMapPage />} />
            <Route path="/level/:number" element={<LevelPage />} />
            <Route path="/track/:id" element={<TrackPage />} />
            <Route path="/strike/:id" element={<StrikePage onProgress={refreshStreak} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}

// "More" on phones: every place that does not fit in the dock.
function MorePage() {
  return (
    <div className="page-narrow">
      <p className="eyebrow">Navigation</p>
      <h1 className="page-title">Everywhere else</h1>
      <ul className="more-list">
        {NAV.slice(5).map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} className="more-list__link">
              <span aria-hidden="true">{item.glyph}</span> {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function App() {
  return (
    <RewardsProvider>
      <Shell />
    </RewardsProvider>
  );
}
