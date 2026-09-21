// The list of strikes inside one level.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Badge, Card, ProgressBar } from "@hexhammer/design-system";
import { api, type LevelInfo } from "../api";
import { art, levelArt } from "../mascots";
import { Loading } from "../components/Loading";
import { interviewPacks } from "@hexhammer/content/interview-packs";

const STATUS_LABEL = {
  not_started: "Not started",
  in_progress: "In progress",
  complete: "Done",
};

export function LevelPage() {
  const { number } = useParams();
  const [level, setLevel] = useState<LevelInfo | null>(null);

  useEffect(() => {
    api
      .getLevels()
      .then((data) =>
        setLevel(data.levels.find((l) => String(l.number) === number) ?? null),
      );
  }, [number]);

  if (!level) return <Loading />;

  return (
    <div>
      <Link to="/">Back to Level Map</Link>
      <div className="hero">
        <div>
          <h1>
            Level {level.number}: {level.title}
          </h1>
          <p className="muted">{level.description}</p>
        </div>
        <img className="hero__art" src={levelArt[level.number]} alt="" />
      </div>
      <ProgressBar level={level.number} percent={level.percentComplete} />

      <div className="strike-list">
        {level.strikes.map((strike) => (
          <Link key={strike.id} to={`/strike/${strike.id}`} className="card-link">
            <Card tilt level={level.number}>
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

      <Card
        title="Rebuild Lab"
        level={level.number}
        decoration="tape"
        className="rebuild-lab"
      >
        <img className="card-art" src={art.puzzle} alt="" />
        <p>
          When you finish this level, delete one piece of Hexhammer and rebuild it by hand
          from memory. Then compare with the original.
        </p>
        <p>
          <strong>Your challenge:</strong> {level.rebuild}
        </p>
      </Card>

      {interviewPacks[level.number] && (
        <p>
          <Link to={`/interview?level=${level.number}`}>
            Practice the Level {level.number} Interview Pack
          </Link>
        </p>
      )}
    </div>
  );
}
