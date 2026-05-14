// Leaderboard.tsx — Slide-in side panel showing the top-N dogs by total score.

import { playClick } from "../../utils/soundFx";
import type { LeaderboardRow, DogType } from "../../types";
import "../../styles/popups.css";

const DOG_ICON: Record<DogType, string> = { husky: "🐺", pug: "🐶", shibainu: "🦊" };

interface LeaderboardProps { rows?: LeaderboardRow[]; selfWallet?: string; onClose?: () => void; }

export function Leaderboard({ rows = [], selfWallet, onClose }: LeaderboardProps): JSX.Element {
  return (
    <div className="dfg-leaderboard" role="dialog" aria-label="Leaderboard">
      <div className="dfg-leaderboard-header">
        <div className="dfg-leaderboard-title">
          <span>🏆</span> Top Dogs
        </div>
        <button className="dfg-card-close" onClick={() => { playClick(); onClose?.(); }}>×</button>
      </div>

      <div className="dfg-leaderboard-list">
        {rows.length === 0 && (
          <div style={{ textAlign: "center", padding: 32, color: "rgba(243,244,246,0.55)" }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>📭</div>
            <div style={{ fontSize: 13 }}>No dogs ranked yet.<br />Feed your dog to get on the board!</div>
          </div>
        )}

        {rows.map((row) => {
          const isSelf = row.wallet === selfWallet;
          const rankCls = row.rank <= 3 ? `dfg-lb-rank--${row.rank}` : "";
          const medal = row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : `#${row.rank}`;
          return (
            <div key={row.wallet} className={`dfg-lb-row ${isSelf ? "dfg-lb-row--self" : ""}`}>
              <div className={`dfg-lb-rank ${rankCls}`}>{medal}</div>
              <div className="dfg-lb-name">
                <div className="dfg-lb-name-text">
                  {DOG_ICON[row.selectedDog] || "🐕"} {row.username}
                  {isSelf && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--dfg-gold)" }}>(YOU)</span>}
                </div>
                <div className="dfg-lb-name-meta">
                  Lv {row.dogLevel} · {row.goalsCompleted || 0} goals · {row.perfectDays || 0} perfect
                </div>
              </div>
              <div className="dfg-lb-score">{row.totalScore.toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
