// XP and achievement celebrations. Any page calls `celebrate(result)` after an action; this shows a
// small toast for XP, and a bigger moment for a newly unlocked achievement. It announces itself to
// screen readers (aria-live) and its animation turns off under reduced motion (see app.css).
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Rewards as RewardResult, UnlockedAchievement } from "../atlasApi";

interface Toast {
  id: number;
  xp: number;
  achievement?: UnlockedAchievement;
  message?: string;
}

const RewardsContext = createContext<{ celebrate: (r: Partial<RewardResult> & { message?: string }) => void; xpVersion: number }>({
  celebrate: () => undefined,
  xpVersion: 0,
});

export function useRewards() {
  return useContext(RewardsContext);
}

let nextId = 1;

export function RewardsProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Bumps whenever XP may have changed, so the shell can refresh the level badge.
  const [xpVersion, setXpVersion] = useState(0);

  const celebrate = useCallback((r: Partial<RewardResult> & { message?: string }) => {
    const fresh: Toast[] = [];
    if ((r.xpAwarded ?? 0) > 0 || r.message) fresh.push({ id: nextId++, xp: r.xpAwarded ?? 0, message: r.message });
    for (const a of r.achievements ?? []) fresh.push({ id: nextId++, xp: 0, achievement: a });
    if (fresh.length === 0) return;
    setXpVersion((v) => v + 1);
    setToasts((all) => [...all, ...fresh]);
    for (const t of fresh) {
      setTimeout(() => setToasts((all) => all.filter((x) => x.id !== t.id)), t.achievement ? 6500 : 3200);
    }
  }, []);

  return (
    <RewardsContext.Provider value={{ celebrate, xpVersion }}>
      {children}
      <div className="toasts" aria-live="polite" aria-atomic="false">
        {toasts.map((t) =>
          t.achievement ? (
            <div key={t.id} className="toast toast--achievement" role="status">
              <span className="toast__icon" aria-hidden="true">
                {t.achievement.icon}
              </span>
              <span>
                <strong>Achievement unlocked: {t.achievement.title}</strong>
                <br />
                <span className="muted">{t.achievement.description}</span>
              </span>
            </div>
          ) : (
            <div key={t.id} className="toast" role="status">
              {t.xp > 0 && <strong className="toast__xp">+{t.xp} XP</strong>} {t.message}
            </div>
          ),
        )}
      </div>
    </RewardsContext.Provider>
  );
}
