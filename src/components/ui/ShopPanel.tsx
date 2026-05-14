// ShopPanel.tsx — Standalone shop popup with Food / Vitamins tabs.

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
  all:       "🏆 ALL 3 goals",
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
    if (balance < item.cost) {
      playError();
      return;
    }
    playCoin();
    setPulseId(item.id);
    setTimeout(() => setPulseId(null), 500);

    const fid = Math.random().toString(36).slice(2);
    setFloaters((arr) => [...arr, { id: fid, item }]);
    setTimeout(() => setFloaters((arr) => arr.filter((f) => f.id !== fid)), 1000);

    onBuy(item);
  }

  return (
    <div className="dfg-overlay" onClick={onClose}>
      <div className="dfg-card" onClick={(e) => e.stopPropagation()}>
        <div className="dfg-card-header">
          <h2 className="dfg-card-title"><span>🛒</span> Shop</h2>
          <button className="dfg-card-close" onClick={() => { playClick(); onClose(); }}>×</button>
        </div>

        <div className="dfg-card-body">
          <div className="dfg-tabs">
            <button
              className={`dfg-tab ${tab === "food" ? "dfg-tab--active" : ""}`}
              onClick={() => { playClick(); setTab("food"); }}
            >Food</button>
            <button
              className={`dfg-tab ${tab === "vitamins" ? "dfg-tab--active" : ""}`}
              onClick={() => { playClick(); setTab("vitamins"); }}
            >Vitamins</button>
          </div>

          <div className="dfg-grid">
            {items.map((item) => {
              const cant = balance < item.cost;
              const goalDone = item.goal && item.goal !== "any" && item.goal !== "all" && dailyGoals?.[item.goal as keyof DailyGoals];
              const isVit = item.kind === "vitamin";
              return (
                <div
                  key={item.id}
                  className={`dfg-item ${isVit ? "dfg-item--vitamin" : ""} ${cant ? "dfg-item--disabled" : ""}`}
                >
                  <div className="dfg-item-icon">{item.icon}</div>
                  <div className="dfg-item-name">{item.name}</div>
                  <div className="dfg-item-meta">+{item.score} pts {isVit && item.desc ? ` · ${item.desc}` : ""}</div>
                  {item.goal && (
                    <span className={`dfg-goal-tag dfg-goal-tag--${item.goal}`}>
                      {GOAL_CHIP[item.goal]}{goalDone ? " ✓" : ""}
                    </span>
                  )}
                  <div className="dfg-item-price">💰 {item.cost}</div>
                  <button
                    className={`dfg-action-btn ${pulseId === item.id ? "dfg-pulse" : ""}`}
                    disabled={cant}
                    onClick={() => handleBuy(item)}
                  >
                    {cant ? "Need more 💰" : "Buy"}
                  </button>
                  {floaters.filter((f) => f.item.id === item.id).map((f) => (
                    <span key={f.id} className="dfg-float">+1 to inventory</span>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="dfg-balance-bar">
            <span className="dfg-balance-bar-label">Your balance</span>
            <span className="dfg-balance-bar-value">💰 {balance.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
