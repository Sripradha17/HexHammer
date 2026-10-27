// OPTIONAL SOUND: tiny synthesized chimes for wins (a passed check, an unlock).
// It is OFF until I turn it on (Settings, or the utility menu). Nothing is downloaded: the browser's
// Web Audio API makes each note from a plain sine wave, so there are no sound files at all.
const KEY = "hexhammer-sound";

export function soundOn(): boolean {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false; // storage blocked: stay silent
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // not remembered; it still works for this visit
  }
}

let ctx: AudioContext | null = null;

// Plays a few notes, one after another. Frequencies are in hertz (440 = the A above middle C).
function play(notes: number[], gap = 0.09) {
  if (!soundOn()) return;
  try {
    ctx ??= new AudioContext();
    const start = ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = start + i * gap;
      // A quick fade in and a slow fade out, so it sounds like a soft bell, not a beep.
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });
  } catch {
    // No audio device or the browser refused: silence is fine.
  }
}

export const chime = {
  xp: () => play([660, 880]),
  unlock: () => play([523, 659, 784, 1047], 0.11),
};
