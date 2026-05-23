import { useState } from "react";
import { FOODS, VITAMINS, GOAL_LABELS } from "../../data/catalog";
import { playMunch, playClick } from "../../utils/soundFx";
import type { CatalogItem, DailyGoals, Inventory } from "../../types";
import "../../styles/popups.css";

const GOAL_STYLE: Record<string, string> = {
  breakfast: "bg-[#FFF6DD] text-[#B88800] border-[#FFE4A1]",
  lunch:     "bg-[#FFE8DD] text-[#D85F38] border-[#FFC9AE]",
  dinner:    "bg-[#EFE5FF] text-primary-dk border-[#C9B3FA]",
};

interface InventoryPanelProps {
  inventory: Inventory;
  dailyGoals: DailyGoals;
  onFeed: (item: CatalogItem) => void;
  onClose: () => void;
  disabled: boolean;
}

export function InventoryPanel({ inventory, dailyGoals, onFeed, onClose, disabled }: InventoryPanelProps): JSX.Element {
  const [pulseId, setPulseId] = useState<string | null>(null);

  const ordered = [...FOODS, ...VITAMINS].map((item) => ({ ...item, count: inventory?.[item.id] || 0 }));
  const owned = ordered.filter((i) => i.count > 0);

  function handleFeed(item: CatalogItem & { count: number }): void {
    if (item.count <= 0 || disabled) return;
    playMunch();
    setPulseId(item.id);
    setTimeout(() => setPulseId(null), 500);
    onFeed(item);
  }

  return (
    <div
      className="fixed bottom-6 right-6 w-[390px] max-w-[90vw] max-h-[70vh] z-[200] flex flex-col rounded-3xl border-2 border-line bg-white font-[Fredoka,system-ui,sans-serif] text-ink animate-pop-in ui-scroll overflow-y-auto shadow-[0_20px_56px_-12px_rgba(124,92,252,0.40),0_4px_12px_rgba(45,27,78,0.06)]"
      role="dialog"
      aria-label="Inventory"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 px-5 pt-5 pb-3.5 flex items-center justify-between gap-3 bg-white rounded-t-3xl border-b-2 border-line shrink-0">
        <h2 className="m-0 text-[20px] font-extrabold tracking-tight flex items-center gap-2.5 bg-linear-to-r from-pink via-primary to-primary-dk bg-clip-text text-transparent">
          <span className="text-2xl -my-1">🎒</span> Inventory
        </h2>
        <button
          className="shrink-0 w-9 h-9 rounded-full bg-bg-soft border-2 border-line text-ink-2 flex items-center justify-center text-lg cursor-pointer hover:bg-pink/15 hover:text-pink hover:border-pink/40 hover:rotate-90 active:scale-95 transition-all duration-200"
          onClick={() => { playClick(); onClose(); }}
        >×</button>
      </div>

      {/* Body */}
      <div className="px-5 pt-4 pb-5">
        {owned.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2.5 text-ink-3">
            <span className="text-5xl">📭</span>
            <div className="text-[16px] font-extrabold text-ink-2">Inventory empty</div>
            <p className="text-[13px] text-center leading-relaxed text-ink-3 font-medium max-w-[240px]">
              Buy food or vitamins from the Shop to feed your dog.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {owned.map((item) => {
              const isVit = item.kind === "vitamin";
              const goalDone = item.goal && item.goal !== "any" && item.goal !== "all"
                ? dailyGoals?.[item.goal as keyof DailyGoals]
                : false;
              const reward = item.goal && GOAL_LABELS[item.goal]
                ? `+${GOAL_LABELS[item.goal].reward} 💰${goalDone ? " (done)" : ""}`
                : item.goal === "any" ? "Ticks 1 goal"
                : item.goal === "all" ? "Ticks ALL goals"
                : "Score boost only";

              return (
                <div
                  key={item.id}
                  className={`relative flex flex-col items-center text-center pt-4 pb-3 px-2.5 rounded-2xl border-2 overflow-hidden ${
                    isVit
                      ? "bg-[#FAF5FF] border-line-strong"
                      : "bg-bg-panel border-line"
                  }`}
                >
                  {/* Count badge */}
                  <div
                    className="absolute top-2 right-2 text-white font-black text-[11px] py-0.5 px-2 rounded-full border-2 border-white"
                    style={{
                      background: "linear-gradient(180deg, #6CE5C2 0%, #10D9A0 100%)",
                      boxShadow: "0 2px 6px rgba(16,217,160,0.40)",
                    }}
                  >
                    ×{item.count}
                  </div>

                  <div className="text-[40px] leading-none mb-1.5 drop-shadow-[0_4px_8px_rgba(45,27,78,0.18)]">
                    {item.icon}
                  </div>
                  <div className="text-[14px] font-extrabold text-ink mb-0.5">{item.name}</div>
                  <div className="text-[11px] text-ink-2 mb-2 min-h-[14px] leading-[1.4]">
                    +{item.score} pts · {reward}
                  </div>

                  {item.goal && item.goal !== "any" && item.goal !== "all" && GOAL_LABELS[item.goal] && (
                    <span className={`inline-block text-[10px] font-extrabold tracking-[0.3px] py-0.5 px-2 rounded-full border mt-1 ${GOAL_STYLE[item.goal] ?? ""}`}>
                      {GOAL_LABELS[item.goal].icon} {GOAL_LABELS[item.goal].label}{goalDone ? " ✓" : ""}
                    </span>
                  )}

                  <button
                    className={`relative w-full mt-2.5 py-2.5 rounded-2xl border-2 border-white text-white font-extrabold text-[13px] font-[inherit] tracking-[0.2px] overflow-hidden transition-all duration-150 ${
                      disabled
                        ? "opacity-40 cursor-not-allowed"
                        : "cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5"
                    } ${pulseId === item.id ? "dfg-pulse" : ""}`}
                    style={{
                      background: "linear-gradient(180deg, #6CE5C2 0%, #10D9A0 100%)",
                      boxShadow: disabled ? "none" : "0 4px 0 #0BA579, 0 6px 12px rgba(16,217,160,0.30)",
                    }}
                    disabled={disabled}
                    onClick={() => handleFeed(item)}
                  >
                    Feed 🐕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
