import { playClick } from "../../utils/soundFx";
import type { LeaderboardRow, DogType } from "../../types";

const DOG_ICON: Record<DogType, string> = { husky: "🐺", pug: "🐶", shibainu: "🦊" };

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const RANK_RING: Record<number, { bg: string; border: string }> = {
  1: { bg: "bg-[#FFF6DD]", border: "border-[#FFE4A1]" },
  2: { bg: "bg-[#F0F0F5]", border: "border-[#D8D8E0]" },
  3: { bg: "bg-[#FFEDDE]", border: "border-[#FFD0A8]" },
};

interface LeaderboardProps { rows?: LeaderboardRow[]; selfWallet?: string; onClose?: () => void; }

export function Leaderboard({ rows = [], selfWallet, onClose }: LeaderboardProps): JSX.Element {
  return (
    <div
      className="fixed top-[90px] bottom-6 right-6 w-[340px] z-[60] flex flex-col rounded-3xl border-2 border-line bg-white font-[Fredoka,system-ui,sans-serif] text-ink animate-[slide-in_0.28s_ease-out] shadow-[0_20px_56px_-12px_rgba(124,92,252,0.40),0_4px_12px_rgba(45,27,78,0.06)]"
      role="dialog"
      aria-label="Leaderboard"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b-2 border-line shrink-0">
        <div className="flex items-center gap-2.5 text-[20px] font-extrabold bg-gradient-to-r from-[#FF6B9D] via-[#A78BFA] to-[#7C5CFC] bg-clip-text text-transparent">
          <span className="text-[26px]">🏆</span> Top Dogs
        </div>
        <button
          className="w-9 h-9 rounded-full bg-bg-soft border-2 border-line text-ink-2 flex items-center justify-center text-lg cursor-pointer hover:bg-pink/15 hover:text-pink hover:border-pink/40 hover:rotate-90 active:scale-95 transition-all duration-200"
          onClick={() => { playClick(); onClose?.(); }}
        >×</button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 ui-scroll">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2.5 text-ink-3">
            <span className="text-5xl">📭</span>
            <p className="text-[13px] text-center leading-relaxed text-ink-2 font-medium">
              No dogs ranked yet.<br />
              Feed your dog to get on the board!
            </p>
          </div>
        ) : (
          rows.map((row) => {
            const isSelf = row.wallet === selfWallet;
            const rankStyle = RANK_RING[row.rank];
            const medal = row.rank <= 3 ? MEDAL[row.rank] : null;

            return (
              <div
                key={row.wallet}
                className={`grid items-center gap-3 py-2.5 px-3 my-1.5 rounded-2xl border-2 transition-all duration-150 ${
                  isSelf
                    ? "bg-[#FFF6DD] border-[#FFE4A1] shadow-[0_2px_8px_rgba(255,184,0,0.18)]"
                    : "bg-bg-panel border-line hover:bg-white hover:border-line-strong"
                }`}
                style={{ gridTemplateColumns: "36px 1fr auto" }}
              >
                {medal ? (
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg border-2 ${rankStyle.bg} ${rankStyle.border}`}>
                    {medal}
                  </div>
                ) : (
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-extrabold bg-bg-soft border-2 border-line ${isSelf ? "text-[#B88800]" : "text-ink-2"}`}>
                    #{row.rank}
                  </div>
                )}

                <div className="flex flex-col min-w-0">
                  <div className="text-[13px] font-extrabold whitespace-nowrap overflow-hidden text-ellipsis text-ink flex items-center gap-1">
                    <span className="text-base">{DOG_ICON[row.selectedDog] ?? "🐕"}</span>
                    <span className="truncate">{row.username}</span>
                    {isSelf && (
                      <span className="ml-1 text-[9px] text-white px-1.5 py-0.5 rounded-full font-extrabold bg-[#FFB800] border border-white">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-ink-3 mt-0.5 font-medium">
                    Lv {row.dogLevel} · {row.goalsCompleted ?? 0} goals · {row.perfectDays ?? 0} perfect
                  </div>
                </div>

                <div className="text-[15px] font-black text-[#B88800] whitespace-nowrap">
                  {row.totalScore.toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
