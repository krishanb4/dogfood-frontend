// GoalCompletePopup.tsx — Brief centred celebration when one or more
// daily goals complete.

import { useEffect, useMemo } from "react";
import { GOAL_LABELS, PERFECT_DAY_BONUS } from "../../data/catalog";
import { playFanfare, playPerfectDay } from "../../utils/soundFx";
import type { GoalEvent } from "../../store/gameStore";
import "../../styles/popups.css";

const CONFETTI_COLORS = ["#F7B718", "#FF8A00", "#FF5C8A", "#8B5CF6", "#22D3EE", "#34D399"];

interface ConfettiPiece {
  dx: number;
  dy: number;
  rot: number;
  color: string;
  delay: number;
}

interface GoalCompletePopupProps { event: GoalEvent | null; onDone: () => void; }

export function GoalCompletePopup({ event, onDone }: GoalCompletePopupProps): JSX.Element | null {
  useEffect(() => {
    if (!event) return;
    if (event.perfectDay) playPerfectDay(); else playFanfare();
    const t = setTimeout(() => onDone?.(), 2000);
    return () => clearTimeout(t);
  }, [event, onDone]);

  const confetti = useMemo((): ConfettiPiece[] => {
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const dist = 120 + Math.random() * 140;
      pieces.push({
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        rot: Math.random() * 720 - 360,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 0.1,
      });
    }
    return pieces;
  }, [event]);

  if (!event) return null;

  const isPerfect = event.perfectDay;
  const titleText = isPerfect ? "PERFECT DAY!" : "GOAL COMPLETE!";
  const subText = isPerfect
    ? `+${PERFECT_DAY_BONUS} 💰 streak bonus`
    : event.completedGoals?.length
      ? `${event.completedGoals.map((g) => GOAL_LABELS[g]?.label).join(" + ")} done`
      : "";

  return (
    <div className="dfg-celebrate">
      <div className="dfg-confetti">
        {confetti.map((c, i) => (
          <span
            key={i}
            style={{
              "--dx": `${c.dx}px`,
              "--dy": `${c.dy}px`,
              "--rot": `${c.rot}deg`,
              background: c.color,
              animationDelay: `${c.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="dfg-celebrate-card">
        <div className="dfg-celebrate-icon">{isPerfect ? "🏆" : "🎉"}</div>
        <div className="dfg-celebrate-title">{titleText}</div>
        <div className="dfg-celebrate-reward">+{event.awardedTokens} $DOGFOOD</div>
        {subText && <div className="dfg-celebrate-sub">{subText}</div>}
      </div>
    </div>
  );
}
