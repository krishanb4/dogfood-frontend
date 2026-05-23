import { useEffect, useState } from "react";
import { GOAL_LABELS } from "../../data/catalog";
import { playClick } from "../../utils/soundFx";
import type { DailyGoals as DailyGoalsType, GoalKey } from "../../types";

const GOALS: GoalKey[] = ["breakfast", "lunch", "dinner"];

const GOAL_ROW_STYLE: Record<GoalKey, { bg: string; border: string; text: string }> = {
  breakfast: { bg: "bg-[#FFF6DD]", border: "border-[#FFE4A1]", text: "text-[#B88800]" },
  lunch:     { bg: "bg-[#FFE8DD]", border: "border-[#FFC9AE]", text: "text-[#D85F38]" },
  dinner:    { bg: "bg-[#EFE5FF]", border: "border-[#C9B3FA]", text: "text-[#7C5CFC]" },
};

function msUntilNextUTCMidnight(): number {
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0);
  return next - now.getTime();
}
function formatHMS(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface DailyGoalsProps { goals?: Partial<DailyGoalsType>; onClose?: () => void; }

export function DailyGoals({ goals = {}, onClose }: DailyGoalsProps): JSX.Element {
  const [resetIn, setResetIn] = useState(msUntilNextUTCMidnight());

  useEffect(() => {
    const t = setInterval(() => setResetIn(msUntilNextUTCMidnight()), 1000);
    return () => clearInterval(t);
  }, []);

  const doneCount = GOALS.filter((g) => goals[g]).length;
  const pct = (doneCount / 3) * 100;

  return (
    <div
      className="fixed top-[130px] right-6 w-[260px] z-50 rounded-3xl border-2 border-line bg-white p-4 font-[Fredoka,system-ui,sans-serif] text-ink animate-[pop-in_0.32s_cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_16px_40px_-8px_rgba(124,92,252,0.30),0_4px_8px_rgba(45,27,78,0.06)]"
    >
      {/* Title row */}
      <div className="flex items-center mb-3.5 gap-2">
        <span className="text-[11px] font-extrabold tracking-[1.5px] uppercase text-ink-3 flex-1">
          Daily Goals
        </span>
        <span
          className="text-[13px] font-black text-ink px-2 py-0.5 rounded-full border-2 border-white"
          style={{
            background: "linear-gradient(180deg, #FFD15C 0%, #FFB800 100%)",
            boxShadow: "0 2px 6px rgba(255,184,0,0.35)",
          }}
        >
          {doneCount}/3
        </span>
        {onClose && (
          <button
            className="w-7 h-7 rounded-full bg-bg-soft border-2 border-line text-ink-2 flex items-center justify-center text-sm cursor-pointer hover:bg-pink/15 hover:text-pink hover:border-pink/40 hover:rotate-90 active:scale-95 transition-all duration-200"
            onClick={() => { playClick(); onClose(); }}
            aria-label="Close"
          >×</button>
        )}
      </div>

      {/* Goal rows */}
      {GOALS.map((g) => {
        const info = GOAL_LABELS[g];
        const done = !!(goals as DailyGoalsType)[g];
        const c = GOAL_ROW_STYLE[g];

        return (
          <div
            key={g}
            className={`flex items-center gap-3 py-2.5 px-3 mb-1.5 rounded-xl border-2 transition-all duration-300 last:mb-0 ${
              done
                ? `${c.bg} ${c.border}`
                : "bg-bg-panel border-line"
            }`}
          >
            <span className={`text-2xl leading-none flex-shrink-0 ${done ? "" : "grayscale opacity-60"}`}>
              {info.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className={`text-[13px] font-bold leading-tight ${done ? c.text : "text-ink"}`}>
                {info.label}
              </div>
              <div className="text-[11px] font-bold mt-0.5 text-[#B88800]">+{info.reward} 💰</div>
            </div>
            <div
              className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-[12px] font-extrabold transition-all duration-300 border-2 ${
                done
                  ? "text-white border-white"
                  : "text-transparent bg-white border-line"
              }`}
              style={done ? {
                background: "linear-gradient(180deg, #6CE5C2 0%, #10D9A0 100%)",
                boxShadow: "0 2px 6px rgba(16,217,160,0.45)",
              } : {}}
            >
              {done ? "✓" : ""}
            </div>
          </div>
        );
      })}

      {/* Progress bar */}
      <div className="mt-3 h-2 rounded-full overflow-hidden bg-line border border-line-strong">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #6CE5C2 0%, #FFD15C 100%)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
          }}
        />
      </div>

      {/* Reset timer */}
      <div className="mt-2.5 text-center text-[11px] text-ink-3 font-[tabular-nums]">
        🕒 Resets in <span className="font-bold text-ink-2">{formatHMS(resetIn)}</span> UTC
      </div>
    </div>
  );
}
