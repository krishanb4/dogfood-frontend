// CountdownTimer.tsx — Counts down to the next UTC midnight reset.

import { useEffect, useState } from "react";

function msUntilNextUTCMidnight(): number {
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0);
  return next - now.getTime();
}

export function CountdownTimer(): JSX.Element {
  const [ms, setMs] = useState(msUntilNextUTCMidnight());

  useEffect(() => {
    const t = setInterval(() => setMs(msUntilNextUTCMidnight()), 1000);
    return () => clearInterval(t);
  }, []);

  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const formatted = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const isUrgent = total <= 600;

  return (
    <div className="top-card">
      <div className="label">Goals Reset</div>
      <div className={`value timer ${isUrgent ? "urgent" : ""}`}>{formatted}</div>
    </div>
  );
}
