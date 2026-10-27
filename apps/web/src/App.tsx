// THE APP SHELL: the world backdrop, the top HUD (brand, the five places, my level, the utility
// menu), a dock at the bottom on phones, and every page's route.
//
// The five places, and nothing else at the top level:
//   Home      enter the next mission
//   World     explore the engineering regions
//   Workshop  build practical projects
//   Challenge interview and coding practice
//   Progress  mastery, achievements, reviews
// Secondary tools (reviews, portfolio, glossary, tech radar, settings) live in the utility menu.
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Navigate, NavLink, Route, Routes, useLocation } from "react-router";
import { atlas, type Me } from "./atlasApi";
import { api } from "./api";
import { RewardsProvider, useRewards } from "./components/Rewards";
import { WorldBackdrop } from "./components/WorldBackdrop";
import { HomePage } from "./pages/HomePage";
import { WorldPage } from "./pages/WorldPage";
import { MissionPage } from "./pages/MissionPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { ChallengePage } from "./pages/ChallengePage";
import { WorkshopPage } from "./pages/WorkshopPage";
import { BuildPage } from "./pages/BuildPage";
import { ProjectEditorPage } from "./pages/ProjectEditorPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { GlossaryPage } from "./pages/GlossaryPage";
import { RadarPage } from "./pages/RadarPage";
import { RadarUpdatePage } from "./pages/RadarUpdatePage";
import { ProposalPage } from "./pages/ProposalPage";
import { ProgressPage } from "./pages/ProgressPage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { Loading } from "./components/PageState";
import { Icon, type IconName } from "./components/Icon";
import { setSoundOn, soundOn } from "./sound";
// The strike runner pulls in the Monaco editor, so it loads only when a strike opens.
const StrikePage = lazy(() => import("./pages/StrikePage").then((m) => ({ default: m.StrikePage })));

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
}
const PRIMARY: NavItem[] = [
  { to: "/", label: "Home", icon: "mission", end: true },
  { to: "/map", label: "World", icon: "map" },
  { to: "/projects", label: "Workshop", icon: "workshop" },
  { to: "/interview", label: "Challenge", icon: "interview" },
  { to: "/progress", label: "Progress", icon: "analytics" },
];
const TOOLS: NavItem[] = [
  { to: "/reviews", label: "Reviews", icon: "reviews" },
  { to: "/portfolio", label: "Portfolio", icon: "portfolio" },
  { to: "/glossary", label: "Glossary", icon: "glossary" },
  { to: "/radar", label: "Tech Radar", icon: "radar" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

// My level, XP bar and streak. Refreshes whenever a reward is celebrated anywhere in the app.
function PlayerChip() {
  const { xpVersion } = useRewards();
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    atlas.me().then(setMe).catch(() => setMe(null));
  }, [xpVersion]);
  if (!me) return null;
  const pct = Math.round((me.xpIntoLevel / me.xpForNextLevel) * 100);
  return (
    <NavLink to="/progress" className="player" title={`${me.xpForNextLevel - me.xpIntoLevel} XP to level ${me.level + 1}`}>
      <span className="player__level" aria-hidden="true">
        {me.level}
      </span>
      <span className="player__info">
        <span className="player__xp">{me.xp} XP</span>
        <span className="player__bar" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </span>
      </span>
      {me.streak.current > 0 && (
        <span className="player__streak" title={`${me.streak.current}-day streak`}>
          <Icon name="flame" size={14} /> {me.streak.current}
        </span>
      )}
      <span className="visually-hidden">
        Level {me.level}, {pct}% of the way to level {me.level + 1}
      </span>
    </NavLink>
  );
}

// The utility menu: a small popover with the secondary tools and the sound switch.
function UtilityMenu() {
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(soundOn);
  const location = useLocation();
  const box = useRef<HTMLDivElement>(null);

  // Close when I navigate, press Escape, or click outside.
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div className="utility" ref={box}>
      <button type="button" className="utility__toggle" aria-expanded={open} aria-controls="utility-menu" onClick={() => setOpen(!open)}>
        <Icon name="more" size={20} />
        <span className="visually-hidden">Tools</span>
      </button>
      {open && (
        <div id="utility-menu" className="utility__menu">
          <ul>
            {TOOLS.map((t) => (
              <li key={t.to}>
                <NavLink to={t.to} className="utility__link">
                  <Icon name={t.icon} size={17} /> {t.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="utility__link utility__sound"
            aria-pressed={sound}
            onClick={() => {
              setSoundOn(!sound);
              setSound(!sound);
            }}
          >
            <Icon name={sound ? "volume" : "mute"} size={17} /> Sound {sound ? "on" : "off"}
          </button>
        </div>
      )}
    </div>
  );
}

function Shell() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // The motion preference lives in the database (Settings). Apply it once at start.
  useEffect(() => {
    atlas
      .preferences()
      .then((p) => {
        if (p.motion === "system") delete document.documentElement.dataset.motion;
        else document.documentElement.dataset.motion = p.motion;
      })
      .catch(() => undefined);
  }, []);

  // A new page: back to the top, and move keyboard focus to the page (screen readers announce it).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  const refreshStreak = () => api.getStreak().catch(() => undefined);

  return (
    <div className="shell">
      <WorldBackdrop />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="hud">
        <NavLink to="/" className="brand" end aria-label="Hexhammer home">
          <svg className="brand__mark" viewBox="0 0 100 100" aria-hidden="true">
            <polygon points="50,4 92,27 92,73 50,96 8,73 8,27" />
            <path d="M35 30 V70 M65 30 V70 M35 50 H65" />
          </svg>
          <span className="brand__name">Hexhammer</span>
        </NavLink>
        <nav className="hud__nav" aria-label="Main">
          {PRIMARY.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="hud__link">
              <Icon name={item.icon} size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hud__right">
          <PlayerChip />
          <UtilityMenu />
        </div>
      </header>

      <nav className="dock" aria-label="Quick">
        {PRIMARY.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className="dock__link">
            <Icon name={item.icon} size={20} />
            <span className="dock__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <main id="main" ref={mainRef} tabIndex={-1} className="main">
        <div key={location.pathname} className="scene">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/map" element={<WorldPage />} />
              <Route path="/map/:regionId" element={<WorldPage />} />
              <Route path="/topic/:id" element={<MissionPage />} />
              <Route path="/strike/:id" element={<StrikePage onProgress={refreshStreak} />} />
              <Route path="/projects" element={<WorkshopPage />} />
              <Route path="/projects/new" element={<ProjectEditorPage />} />
              <Route path="/projects/:id" element={<BuildPage />} />
              <Route path="/projects/:id/blueprint" element={<ProjectEditorPage />} />
              <Route path="/interview" element={<ChallengePage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/glossary" element={<GlossaryPage />} />
              <Route path="/radar" element={<RadarPage />} />
              <Route path="/radar/updates/:id" element={<RadarUpdatePage />} />
              <Route path="/radar/proposals/:id" element={<ProposalPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Old addresses from earlier versions point to their new homes, so bookmarks still work. */}
              <Route path="/analytics" element={<Navigate to="/progress" replace />} />
              <Route path="/learn" element={<Navigate to="/map" replace />} />
              <Route path="/more" element={<Navigate to="/" replace />} />
              <Route path="/levels" element={<Navigate to="/map" replace />} />
              <Route path="/level/:number" element={<Navigate to="/map" replace />} />
              <Route path="/track/:id" element={<Navigate to="/map" replace />} />
              <Route path="/interview/flashcards" element={<Navigate to="/interview" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </main>
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
