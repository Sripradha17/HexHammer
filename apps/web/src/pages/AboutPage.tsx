// ABOUT: the first page a new learner sees. What Hexhammer is, how learning works here (the same
// four steps for every topic), and what each page in the top bar is for.
import { useEffect } from "react";
import { Link } from "react-router";
import { BramFace } from "../art/Bram";

// Remembered in this browser, so first-time visitors are shown this page once (see App.tsx).
export const ABOUT_SEEN_KEY = "hexhammer-seen-about";

const STEPS = [
  { n: 1, name: "Study", what: "Read the topic. It starts with a few cards in plain everyday words, then the full lesson and a worked example you can run step by step." },
  { n: 2, name: "Play", what: "Practise it: a short story game with Bram, riddles that ask you to predict output or spot a bug, a hands-on lab, and small exercises you type by hand." },
  { n: 3, name: "Build", what: "Make something real with it: a small project with clear steps and a checklist that tells you when it works." },
  { n: 4, name: "Test", what: "Prove you know it with a short scored test. Pass it and the topic is done; it comes back later as a quick review so you do not forget." },
];

const PAGES = [
  { to: "/", name: "Today", what: "Where you start each day: your next topic, reviews that are due, and the project you are building." },
  { to: "/map", name: "Learn", what: "The map of everything to learn: 16 towns, each a subject (Foundations, The Web, Backend...). Pick a town, then a topic. Topics open in order." },
  { to: "/interview", name: "Practice", what: "Interview practice: quick multiple-choice riddles, and real interview questions you answer in your own words before seeing a model answer." },
  { to: "/projects", name: "Build", what: "The workshop: games, creative tools, apps and AI toys to build, plus the project from every topic you study." },
  { to: "/progress", name: "Progress", what: "Your level, how much of each subject you have mastered, and the achievements you have earned." },
];

export function AboutPage() {
  // Once seen, Today no longer sends you here first.
  useEffect(() => {
    try {
      localStorage.setItem(ABOUT_SEEN_KEY, "1");
    } catch {
      // storage blocked: you may see this page again, which is harmless
    }
  }, []);

  return (
    <div className="about">
      <header className="about__hero">
        <BramFace mood="happy" size={96} />
        <div>
          <p className="kicker kicker--amber">Start here</p>
          <h1 className="about__title">Welcome to Hexhammer</h1>
          <p className="about__lead">
            A free classroom for learning to code by hand, from the very basics to full stack engineering, and for getting ready for coding interviews. You write the code yourself; Bram the owl guides you, gives hints, and checks your work.
          </p>
        </div>
      </header>

      <section className="about__section" aria-labelledby="about-how">
        <h2 id="about-how">How every topic works</h2>
        <p className="about__text">Every topic has the same four steps, always in this order. You can go back to any step at any time.</p>
        <ol className="about__steps">
          {STEPS.map((s) => (
            <li key={s.n} className="about__step">
              <span className="about__n" aria-hidden="true">
                {s.n}
              </span>
              <span>
                <strong>{s.name}</strong>
                <span>{s.what}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="about__section" aria-labelledby="about-pages">
        <h2 id="about-pages">The pages in the top bar</h2>
        <dl className="about__pages">
          {PAGES.map((p) => (
            <div key={p.to} className="about__page">
              <dt>
                <Link to={p.to}>{p.name}</Link>
              </dt>
              <dd>{p.what}</dd>
            </div>
          ))}
          <div className="about__page">
            <dt>Menu</dt>
            <dd>The button at the far right: your reviews, portfolio of finished projects, a glossary of tech words, the tech radar (what is new in the industry) and settings.</dd>
          </div>
        </dl>
      </section>

      <section className="about__section" aria-labelledby="about-rules">
        <h2 id="about-rules">A few rules that make it work</h2>
        <ul className="about__rules">
          <li>Type every example yourself. Your fingers remember what your eyes only skim.</li>
          <li>Stuck? Take one hint at a time. The full answer only appears when you ask for it, after a real try.</li>
          <li>Ten minutes every day beats three hours once a week. Your streak counts days, and missing a day never resets your progress.</li>
          <li>Everything is free and runs on your own computer. Your progress is saved locally.</li>
        </ul>
      </section>

      <div className="about__start">
        <Link to="/" className="cta">
          Start learning
        </Link>
        <Link to="/map" className="cta cta--ghost">
          Look at the map first
        </Link>
      </div>
    </div>
  );
}
