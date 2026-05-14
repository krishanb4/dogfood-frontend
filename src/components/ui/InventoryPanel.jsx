// InventoryPanel.jsx — Standalone inventory popup. Lists owned food /
// vitamins and lets the player feed their dog (consumes 1 from inventory
// and applies score/goal effects via onFeed). Feed click triggers a green
// pulse + munch sound. Each card shows whether feeding it would tick a
// goal (and the token reward to expect).

import { useState } from "react";
import { FOODS, VITAMINS, GOAL_LABELS } from "../../data/catalog";
import { playMunch, playClick } from "../../utils/soundFx";
import "../../styles/popups.css";

export function InventoryPanel({ inventory, dailyGoals, onFeed, onClose, disabled }) {
  const [pulseId, setPulseId] = useState(null);

  // Combine all owned items in display order (food first, then vitamins).
  const ordered = [...FOODS, ...VITAMINS]
    .map((item) => ({ ...item, count: inventory?.[item.id] || 0 }));

  function handleFeed(item) {
    if (item.count <= 0 || disabled) return;
    playMunch();
    setPulseId(item.id);
    setTimeout(() => setPulseId(null), 500);
    onFeed(item);
  }

  const owned = ordered.filter((i) => i.count > 0);

  // Non-modal floating panel anchored bottom-right so the dog eating
  // animation stays visible while the player feeds.
  return (
    <div className="dfg-corner-panel" role="dialog" aria-label="Inventory">
      <div className="dfg-card-header">
        <h2 className="dfg-card-title"><span>🎒</span> Inventory</h2>
        <button className="dfg-card-close" onClick={() => { playClick(); onClose(); }}>×</button>
      </div>

      <div className="dfg-card-body">
          {owned.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(243,244,246,0.6)" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>📭</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Inventory empty</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Buy food or vitamins from the Shop to feed your dog.</div>
            </div>
          ) : (
            <div className="dfg-grid">
              {owned.map((item) => {
                const isVit = item.kind === "vitamin";
                const goalDone = item.goal && item.goal !== "any" && item.goal !== "all"
                  ? dailyGoals?.[item.goal]
                  : false;
                const reward = item.goal && GOAL_LABELS[item.goal]
                  ? `+${GOAL_LABELS[item.goal].reward} 💰 ${goalDone ? "(done)" : ""}`
                  : item.goal === "any" ? "Ticks 1 goal"
                  : item.goal === "all" ? "Ticks ALL goals"
                  : "Score boost only";

                return (
                  <div key={item.id} className={`dfg-item ${isVit ? "dfg-item--vitamin" : ""}`}>
                    <div className="dfg-item-count">×{item.count}</div>
                    <div className="dfg-item-icon">{item.icon}</div>
                    <div className="dfg-item-name">{item.name}</div>
                    <div className="dfg-item-meta">+{item.score} pts · {reward}</div>
                    {item.goal && item.goal !== "any" && item.goal !== "all" && (
                      <span className={`dfg-goal-tag dfg-goal-tag--${item.goal}`}>
                        {GOAL_LABELS[item.goal].icon} {GOAL_LABELS[item.goal].label}{goalDone ? " ✓" : ""}
                      </span>
                    )}
                    <button
                      className={`dfg-action-btn dfg-action-btn--green ${pulseId === item.id ? "dfg-pulse" : ""}`}
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
