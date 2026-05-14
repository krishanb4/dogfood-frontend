// PoolDisplay.tsx — Renamed to "ScoreDisplay" semantically; kept the
// filename so existing imports don't break.

interface PoolDisplayProps { score?: number; level?: number; }

export function PoolDisplay({ score = 0, level = 1 }: PoolDisplayProps): JSX.Element {
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
