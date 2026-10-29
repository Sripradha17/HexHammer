// OWL BUDDY: Bram's face in the corner of every page, with a short tip for THAT page: how to build
// without leaning on AI, how to answer like a strong interviewee, how to make memory stick.
// He pops in a moment after the page opens, says one tip, and tucks it away after a while.
// Tap him for the next tip. On phones he waits to be tapped, so the bubble never covers the
// lesson you are reading on a small screen. (Home, World and quests have their own, bigger Bram.)
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { BramFace, type Mood } from "../art/Bram";

interface Tip {
  mood: Mood;
  text: string;
}

const TIPS: { match: string; tips: Tip[] }[] = [
  {
    match: "/projects",
    tips: [
      { mood: "happy", text: "Build it before you look it up. Struggle for 15 minutes, then take ONE hint." },
      { mood: "think", text: "Make it work, then make it nice. Ugly-but-working beats perfect-but-empty." },
      { mood: "proud", text: "Read the error out loud. It almost always names the line and the reason." },
      { mood: "think", text: "Write each milestone's steps in plain words first. Then code one step at a time." },
    ],
  },
  {
    match: "/interview",
    tips: [
      { mood: "think", text: "Answer first, THEN check. Committing to an answer makes the memory stronger." },
      { mood: "happy", text: "Talk in three beats: what it is, why it matters, a tiny example." },
      { mood: "proud", text: "Interviewers grade your thinking, not just the answer. Say your steps out loud." },
      { mood: "wow", text: "Don't know? Say what you DO know and how you'd find out. That still scores." },
    ],
  },
  {
    match: "/strike",
    tips: [
      { mood: "happy", text: "Type it, don't paste it. Your fingers learn what your eyes skim." },
      { mood: "oops", text: "Break one line on purpose. Watching it fail teaches you how to fix it." },
      { mood: "think", text: "Take hints one at a time. Type \"reveal\" only after a real try." },
    ],
  },
  {
    match: "/reviews",
    tips: [
      { mood: "think", text: "Remembering just before you forget is the fastest way to remember for good." },
      { mood: "happy", text: "Try to recall BEFORE you peek. The effort is what makes it stick." },
    ],
  },
  {
    match: "/progress",
    tips: [
      { mood: "proud", text: "Mastery means: learn it, practise it, prove it, and still know it weeks later." },
      { mood: "happy", text: "Ten minutes a day beats three hours on Sunday. Keep the streak glowing!" },
    ],
  },
  {
    match: "/glossary",
    tips: [{ mood: "think", text: "Explain each word to a ten-year-old. If you can't yet, it isn't yours yet." }],
  },
  {
    match: "",
    tips: [
      { mood: "happy", text: "One tiny idea at a time. Small steps, every day, add up to big skills." },
      { mood: "think", text: "When you use AI later, check every line it writes. You're the engineer." },
    ],
  },
];

export function OwlBuddy() {
  const { pathname } = useLocation();
  const tips = (TIPS.find((t) => pathname.startsWith(t.match)) ?? TIPS[TIPS.length - 1]).tips;
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(false);

  // A new page: start at its first tip, pop in after a moment, tuck the tip away after a while.
  useEffect(() => {
    setAt(0);
    setOpen(false);
    const roomy = window.matchMedia("(min-width: 761px)").matches;
    const show = setTimeout(() => roomy && setOpen(true), 1400);
    const hide = setTimeout(() => setOpen(false), 11000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [pathname]);

  const tip = tips[at % tips.length];
  return (
    <aside className="buddy" aria-label="Bram's tip">
      {open && (
        <p className="buddy__bubble" key={at} role="status">
          <span className="buddy__who">Bram</span>
          {tip.text}
        </p>
      )}
      <button
        type="button"
        className="buddy__face"
        aria-label={open ? "Next tip from Bram" : "Show a tip from Bram"}
        onClick={() => (open ? setAt((a) => a + 1) : setOpen(true))}
      >
        <BramFace mood={open ? tip.mood : "happy"} size={60} />
      </button>
    </aside>
  );
}
