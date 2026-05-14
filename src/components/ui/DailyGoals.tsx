// DailyGoals.tsx — Fixed top-right floating card showing today's three
// meal goals (Breakfast / Lunch / Dinner).

import { useEffect, useState } from "react";
import { GOAL_LABELS } from "../../data/catalog";
import { playClick } from "../../utils/soundFx";
import type { DailyGoals as DailyGoalsType, GoalKey } from "../../types";
import "../../styles/popups.css";

const GOALS: GoalKey[] = ["breakfast", "lunch", "dinner"];

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
    <div className="dfg-goals-panel">
      <div className="dfg-goals-title">
        Daily Goals
        <span style={{ marginLeft: "auto", color: "var(--dfg-gold)", fontWeight: 900 }}>
          {doneCount}/3
        </span>
        {onClose && (
          <button
            className="dfg-card-close dfg-card-close--sm"
            onClick={() => { playClick(); onClose(); }}
            aria-label="Close"
          >×</button>
        )}
      </div>

      {GOALS.map((g) => {
        const info = GOAL_LABELS[g];
        const done = !!(goals as DailyGoalsType)[g as GoalKey];
        return (
          <div key={g} className={`dfg-goal-row ${done ? "dfg-goal-row--done" : ""}`}>
            <span className="dfg-goal-icon">{info.icon}</span>
            <div className="dfg-goal-info">
              <div className="dfg-goal-label">{info.label}</div>
              <div className="dfg-goal-reward">+{info.reward} 💰</div>
            </div>
            <span className="dfg-goal-check">{done ? "✓" : ""}</span>
          </div>
        );
      })}

      <div className="dfg-goals-progress">
        <div className="dfg-goals-progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <div className="dfg-goals-reset">Resets in {formatHMS(resetIn)} UTC</div>
    </div>
  );
}
