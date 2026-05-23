import { useState } from "react";
import { FOODS, VITAMINS } from "../../data/catalog";
import { playCoin, playError, playClick } from "../../utils/soundFx";
import type { CatalogItem, DailyGoals } from "../../types";
import "../../styles/popups.css";

const GOAL_CHIP: Record<string, string> = {
  breakfast: "🌅 Breakfast",
  lunch:     "☀️ Lunch",
  dinner:    "🌙 Dinner",
  any:       "✨ Any goal",
  all:       "🏆 ALL 3",
};

const GOAL_STYLE: Record<string, string> = {
  breakfast: "bg-[#FFF6DD] text-[#B88800] border-[#FFE4A1]",
  lunch:     "bg-[#FFE8DD] text-[#D85F38] border-[#FFC9AE]",
  dinner:    "bg-[#EFE5FF] text-[#7C5CFC] border-[#C9B3FA]",
  any:       "bg-[#DEF7FF] text-[#0096B5] border-[#A8E5F0]",
  all:       "bg-[#FFE5EE] text-[#D8458A] border-[#FFC1D5]",
};

interface ShopPanelProps {
  balance: number;
  dailyGoals: DailyGoals;
  onBuy: (item: CatalogItem) => void;
  onClose: () => void;
}

export function ShopPanel({ balance, dailyGoals, onBuy, onClose }: ShopPanelProps): JSX.Element {
  const [tab, setTab] = useState<"food" | "vitamins">("food");
  const [pulseId, setPulseId] = useState<string | null>(null);
  const [floaters, setFloaters] = useState<{ id: string; item: CatalogItem }[]>([]);

  const items = tab === "food" ? FOODS : VITAMINS;

  function handleBuy(item: CatalogItem): void {
    if (balance < item.cost) { playError(); return; }
    playCoin();
    setPulseId(item.id);
    setTimeout(() => setPulseId(null), 500);
    const fid = Math.random().toString(36).slice(2);
    setFloaters((arr) => [...arr, { id: fid, item }]);
    setTimeout(() => setFloaters((arr) => arr.filter((f) => f.id !== fid)), 1000);
    onBuy(item);
  }

  return (
    /* Overlay — soft dark purple tint */
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-5 backdrop-blur-md animate-[fade-in_0.22s_ease-out]"
      style={{ background: "rgba(45,27,78,0.45)" }}
      onClick={onClose}
    >
      {/* Card */}
      <div
        className="relative w-full max-w-[520px] max-h-[88vh] overflow-y-auto rounded-[28px] border-2 border-line bg-white text-ink font-[Fredoka,system-ui,sans-serif] animate-[pop-in_0.34s_cubic-bezier(0.34,1.56,0.64,1)] ui-scroll shadow-[0_24px_64px_-12px_rgba(124,92,252,0.40),0_4px_12px_rgba(45,27,78,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 pt-6 pb-4 flex items-center justify-between gap-3 bg-white rounded-t-[28px] border-b-2 border-line">
          <h2 className="m-0 text-[22px] font-extrabold tracking-tight flex items-center gap-2.5 bg-gradient-to-r from-[#FF6B9D] via-[#A78BFA] to-[#7C5CFC] bg-clip-text text-transparent">
            <span className="text-[28px] -my-1">🛒</span> Shop
          </h2>
          <button
            className="flex-shrink-0 w-9 h-9 rounded-full bg-bg-soft border-2 border-line text-ink-2 flex items-center justify-center text-lg cursor-pointer hover:bg-pink/15 hover:text-pink hover:border-pink/40 hover:rotate-90 active:scale-95 transition-all duration-200"
            onClick={() => { playClick(); onClose(); }}
          >×</button>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-2xl bg-bg-soft border-2 border-line mb-5">
            {(["food", "vitamins"] as const).map((t) => (
              <button
                key={t}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-[13px] cursor-pointer transition-all duration-200 border-none font-[inherit] capitalize tracking-[0.2px] ${
                  tab === t
                    ? "text-white shadow-[0_2px_8px_rgba(167,139,250,0.40)]"
                    : "bg-transparent text-ink-2 hover:text-ink hover:bg-white/60"
                }`}
                style={tab === t ? { background: "linear-gradient(180deg, #A78BFA 0%, #7C5CFC 100%)" } : {}}
                onClick={() => { playClick(); setTab(t); }}
              >
                {t === "food" ? "🍖 Food" : "💊 Vitamins"}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => {
              const cant = balance < item.cost;
              const goalDone = item.goal && item.goal !== "any" && item.goal !== "all" && dailyGoals?.[item.goal as keyof DailyGoals];
              const isVit = item.kind === "vitamin";

              return (
                <div
                  key={item.id}
                  className={`relative flex flex-col items-center text-center pt-4 pb-3.5 px-3 rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                    cant
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_24px_-4px_rgba(167,139,250,0.30)]"
                  } ${isVit
                    ? "bg-[#FAF5FF] border-[#D4C5F9] hover:border-primary"
                    : "bg-bg-panel border-line hover:border-gold hover:bg-white"
                  }`}
                >
                  <div className="text-[44px] leading-none mb-1.5 drop-shadow-[0_4px_8px_rgba(45,27,78,0.18)]">
                    {item.icon}
                  </div>
                  <div className="text-[14px] font-extrabold text-ink mb-0.5">{item.name}</div>
                  <div className="text-[11px] text-ink-2 mb-2 min-h-[14px] leading-[1.4]">
                    +{item.score} pts{isVit && item.desc ? ` · ${item.desc}` : ""}
                  </div>

                  {item.goal && (
                    <span className={`inline-block text-[10px] font-extrabold tracking-[0.3px] py-[3px] px-[9px] rounded-full border mt-1 ${GOAL_STYLE[item.goal] ?? GOAL_STYLE.any}`}>
                      {GOAL_CHIP[item.goal]}{goalDone ? " ✓" : ""}
                    </span>
                  )}

                  <div
                    className="inline-flex items-center gap-1 text-ink font-black text-[12px] py-1 px-3 rounded-full mt-2 tracking-[0.2px] border-2 border-white"
                    style={{
                      background: "linear-gradient(180deg, #FFD15C 0%, #FFB800 100%)",
                      boxShadow: "0 2px 6px rgba(255,184,0,0.40), inset 0 -2px 0 rgba(0,0,0,0.08)",
                    }}
                  >
                    💰 {item.cost}
                  </div>

                  <button
                    className={`relative w-full mt-2.5 py-2.5 rounded-2xl border-2 border-white text-ink font-extrabold text-[13px] font-[inherit] tracking-[0.2px] overflow-hidden transition-all duration-150 ${
                      cant
                        ? "opacity-40 cursor-not-allowed"
                        : "cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5"
                    } ${pulseId === item.id ? "dfg-pulse" : ""}`}
                    style={{
                      background: "linear-gradient(180deg, #FFD15C 0%, #FFB800 100%)",
                      boxShadow: cant ? "none" : "0 4px 0 #D49600, 0 6px 12px rgba(255,184,0,0.30)",
                    }}
                    disabled={cant}
                    onClick={() => handleBuy(item)}
                  >
                    {cant ? "Need more 💰" : "Buy"}
                  </button>

                  {floaters.filter((f) => f.item.id === item.id).map((f) => (
                    <span key={f.id} className="ui-float">+1 to inventory</span>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Balance bar */}
          <div className="mt-5 flex items-center justify-between py-3 px-4 rounded-2xl bg-[#FFF6DD] border-2 border-[#FFE4A1]">
            <span className="text-ink-2 text-[13px] font-bold">Your balance</span>
            <span className="text-[20px] font-black text-[#B88800] flex items-center gap-1">
              💰 {balance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
