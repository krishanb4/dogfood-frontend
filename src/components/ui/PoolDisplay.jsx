// PoolDisplay.jsx — Renamed to "ScoreDisplay" semantically; kept the
// filename so existing imports don't break. Shows the local player's
// total score + current level badge.

export function PoolDisplay({ score = 0, level = 1 }) {
  return (
    <div className="dfg-score-card">
      <div>
        <div className="label">Score</div>
        <div className="value">{score.toLocaleString()}</div>
      </div>
      <div className="level-badge">Lv {level}</div>
    </div>
  );
}
