// The Level Map: 8 level cards (Levels 1 to 3 open, the rest locked) and the three tracks.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Badge, Card, ProgressBar } from "@hexhammer/design-system";
import { api, type LevelInfo, type TrackInfo } from "../api";
import { art, levelArt, trackArt } from "../mascots";
import { Loading } from "../components/Loading";

// Show only the first few planned topics on a locked card, so cards stay small.
const TOPICS_SHOWN = 6;

function TopicList({ topics }: { topics: string[] }) {
  return (
    <ul className="topics">
      {topics.slice(0, TOPICS_SHOWN).map((topic) => (
        <li key={topic}>{topic}</li>
      ))}
      {topics.length > TOPICS_SHOWN && (
        <li className="muted">…and {topics.length - TOPICS_SHOWN} more</li>
      )}
    </ul>
  );
}

export function LevelMapPage() {
  const [levels, setLevels] = useState<LevelInfo[]>([]);
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getLevels()
      .then((data) => {
        setLevels(data.levels);
        setTracks(data.tracks);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return (
      <p className="message message--bad">
        Could not reach the API ({error}). Is the database running and seeded? See the
        README.
      </p>
    );
  }

  if (levels.length === 0) return <Loading />;

  return (
    <div>
      <div className="hero">
        <div>
          <h1 className="scribble">Pick your level</h1>
          <p className="muted">
            One tiny idea at a time. Levels 1, 2 and 3 are open. The rest unlock in later
            phases.
          </p>
        </div>
        <img className="hero__art" src={art.hero} alt="" />
      </div>

      <div className="card-grid">
        {levels.map((level) =>
          level.isOpen ? (
            <Link key={level.number} to={`/level/${level.number}`} className="card-link">
              <Card
                level={level.number}
                decoration="tack"
                title={`Level ${level.number}: ${level.name}`}
              >
                {/* Hand-drawn note and arrow. Decoration only, so hidden from screen readers and small screens. */}
                {level.number === 1 && (
                  <div className="start-here" aria-hidden="true">
                    <span>start here!</span>
                    <svg width="70" height="40" viewBox="0 0 70 40" fill="none">
                      <path
                        d="M4 6 C 25 2, 45 10, 60 30"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="6 5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M48 28 L61 32 L59 18"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
                <img className="level-art" src={levelArt[level.number]} alt="" />
                <p>
                  <strong>{level.title}</strong>
                </p>
                <p className="muted">{level.description}</p>
                <ProgressBar level={level.number} percent={level.percentComplete} />
                <p className="muted">
                  {level.completedStrikes} of {level.totalStrikes} strikes done
                </p>
              </Card>
            </Link>
          ) : (
            <Card
              key={level.number}
              level={level.number}
              locked
              title={`Level ${level.number}: ${level.name}`}
            >
              <img
                className="level-art level-art--locked"
                src={levelArt[level.number]}
                alt=""
                loading="lazy"
              />
              <p>
                <Badge tone="soft">Coming soon</Badge>
              </p>
              <p>
                <strong>{level.title}</strong>
              </p>
              <ProgressBar percent={0} />
              <TopicList topics={level.plannedStrikes} />
            </Card>
          ),
        )}
      </div>

      <h2>Tracks that run alongside</h2>
      <div className="card-grid">
        {tracks.map((track) =>
          track.isOpen ? (
            <Link key={track.id} to={`/track/${track.id}`} className="card-link">
              <Card level={track.accent} decoration="tack" title={track.title}>
                <img className="level-art" src={trackArt[track.id]} alt="" />
                <p className="muted">{track.description}</p>
                <ProgressBar level={track.accent} percent={track.percentComplete} />
                <p className="muted">
                  {track.completedStrikes} of {track.totalStrikes} strikes done
                </p>
              </Card>
            </Link>
          ) : (
            <Card key={track.id} locked title={track.title}>
              <img
                className="level-art level-art--locked"
                src={trackArt[track.id]}
                alt=""
                loading="lazy"
              />
              <p>
                <Badge tone="soft">Coming soon</Badge>
              </p>
              <p className="muted">{track.description}</p>
              <TopicList topics={track.topics} />
            </Card>
          ),
        )}
      </div>
    </div>
  );
}
