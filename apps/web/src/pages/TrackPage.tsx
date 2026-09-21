// The list of strikes inside one track (like the DSA track). It works like the Level page.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Badge, Card, ProgressBar } from "@hexhammer/design-system";
import { api, type TrackInfo } from "../api";
import { trackArt } from "../mascots";
import { Loading } from "../components/Loading";

const STATUS_LABEL = {
  not_started: "Not started",
  in_progress: "In progress",
  complete: "Done",
};

export function TrackPage() {
  const { id } = useParams();
  const [track, setTrack] = useState<TrackInfo | null>(null);

  useEffect(() => {
    api
      .getLevels()
      .then((data) => setTrack(data.tracks.find((t) => t.id === id) ?? null));
  }, [id]);

  if (!track) return <Loading />;

  return (
    <div>
      <Link to="/">Back to Level Map</Link>
      <div className="hero">
        <div>
          <h1>{track.title}</h1>
          <p className="muted">{track.description}</p>
        </div>
        <img className="hero__art" src={trackArt[track.id]} alt="" />
      </div>
      <ProgressBar level={track.accent} percent={track.percentComplete} />

      <div className="strike-list">
        {track.strikes.map((strike) => (
          <Link key={strike.id} to={`/strike/${strike.id}`} className="card-link">
            <Card level={track.accent}>
              <strong>
                {strike.order}. {strike.title}
              </strong>{" "}
              <Badge tone={strike.status === "complete" ? "success" : "soft"}>
                {STATUS_LABEL[strike.status]}
              </Badge>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
