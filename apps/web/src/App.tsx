// The app shell: top bar (with the streak) and the four pages.
import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router";
import { Badge } from "@hexhammer/design-system";
import { api, type StreakInfo } from "./api";
import { art } from "./mascots";
import { LevelMapPage } from "./pages/LevelMapPage";
import { LevelPage } from "./pages/LevelPage";
import { TrackPage } from "./pages/TrackPage";
import { StrikePage } from "./pages/StrikePage";
import { InterviewPage } from "./pages/InterviewPage";

export function App() {
  const [streak, setStreak] = useState<StreakInfo | null>(null);

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
        <Badge
          tone={streak?.doneToday ? "success" : "soft"}
          title="Days in a row that you practiced"
        >
          {streak?.current ?? 0} day streak
        </Badge>
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
