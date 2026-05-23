import { useEffect, useMemo } from "react";
import { GOAL_LABELS, PERFECT_DAY_BONUS } from "../../data/catalog";
import { playFanfare, playPerfectDay } from "../../utils/soundFx";
import type { GoalEvent } from "../../store/gameStore";

const CONFETTI_COLORS = ["#FFB800", "#FF6B9D", "#A78BFA", "#10D9A0", "#06B6D4", "#FF8A65"];

interface ConfettiPiece { dx: number; dy: number; rot: number; color: string; delay: number; }
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
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[2000]">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((c, i) => (
          <span
            key={i}
            className="ui-confetti-piece"
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

      {/* Card */}
      <div
        className="relative font-[Fredoka,system-ui,sans-serif] text-center rounded-3xl py-8 px-12 text-ink bg-white border-4 border-white"
        style={{
          boxShadow: "0 24px 60px -12px rgba(124,92,252,0.45), 0 0 0 4px rgba(255,184,0,0.50), 0 0 80px rgba(255,107,157,0.30)",
          animation: "celebrate-in 0.48s cubic-bezier(0.17,0.89,0.32,1.28), celebrate-out 0.38s ease-in 1.62s forwards",
        }}
      >
        <div className="text-[64px] leading-none mb-2 drop-shadow-[0_6px_12px_rgba(45,27,78,0.25)]">
          {isPerfect ? "🏆" : "🎉"}
        </div>
        <div className="text-[26px] font-black tracking-[0.5px] mb-1 bg-gradient-to-r from-[#FF6B9D] via-[#A78BFA] to-[#7C5CFC] bg-clip-text text-transparent">
          {titleText}
        </div>
        <div
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mt-2 border-2 border-white text-ink font-black text-[18px]"
          style={{
            background: "linear-gradient(180deg, #FFD15C 0%, #FFB800 100%)",
            boxShadow: "0 4px 12px rgba(255,184,0,0.45), inset 0 -2px 0 rgba(0,0,0,0.10)",
          }}
        >
          +{event.awardedTokens} 💰
        </div>
        {subText && (
          <div className="text-[13px] mt-3 text-ink-2 font-bold">{subText}</div>
        )}
      </div>
    </div>
  );
}
