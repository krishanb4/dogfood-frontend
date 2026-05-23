import { useState } from "react";

interface DepositPanelProps {
  wallet?: string;
  balance: number;
  onClose: () => void;
}

function shortenAddr(addr: string): string {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function DepositPanel({ wallet, balance, onClose }: DepositPanelProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = (): void => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center p-4 backdrop-blur-md animate-[fade-in_0.22s_ease-out]"
      style={{ background: "rgba(45,27,78,0.45)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] rounded-[28px] border-2 border-line bg-white p-7 font-[Fredoka,system-ui,sans-serif] text-ink animate-[pop-in_0.34s_cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_24px_64px_-12px_rgba(124,92,252,0.40),0_4px_12px_rgba(45,27,78,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-bg-soft border-2 border-line text-ink-2 flex items-center justify-center text-base cursor-pointer hover:bg-pink/15 hover:text-pink hover:border-pink/40 hover:rotate-90 active:scale-95 transition-all duration-200"
          onClick={onClose}
          aria-label="Close"
        >✕</button>

        {/* Title */}
        <h2 className="text-[22px] font-extrabold text-center mb-1 flex items-center justify-center gap-2">
          <span>💰</span> Deposit
          <span className="text-gold">$OISHII</span>
        </h2>
        <p className="text-[12px] text-ink-2 text-center font-medium mb-5 leading-snug">
          Send $OISHII tokens to your game wallet to top up your balance.
        </p>

        {/* Current balance card */}
        <div className="mb-5 rounded-2xl border-2 border-[#FFE4A1] bg-[#FFF6DD] px-4 py-3 flex items-center justify-between">
          <span className="text-[11px] font-extrabold tracking-[1.5px] uppercase text-[#B88800]">
            Current Balance
          </span>
          <span className="text-[18px] font-black text-[#B88800]">
            {balance.toLocaleString()}
          </span>
        </div>

        {/* Wallet address */}
        <label className="block text-[11px] font-extrabold tracking-[1.5px] uppercase text-ink-3 mb-2">
          Your Wallet Address
        </label>
        <div className="flex items-stretch gap-2 mb-5">
          <div className="flex-1 min-w-0 rounded-2xl border-2 border-line bg-bg-panel px-3 py-2.5 font-mono text-[13px] text-ink-2 truncate">
            {wallet ? shortenAddr(wallet) : "—"}
          </div>
          <button
            type="button"
            disabled={!wallet}
            onClick={handleCopy}
            className="shrink-0 px-4 rounded-2xl border-2 border-line bg-bg-panel text-ink text-[12px] font-extrabold cursor-pointer transition-all duration-150 hover:bg-white hover:border-line-strong active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Helper notes */}
        <ul className="text-[12px] text-ink-2 font-medium leading-relaxed list-none p-0 m-0 mb-5">
          <li className="flex gap-2 mb-1.5">
            <span className="text-gold">•</span>
            <span>Only send <span className="font-extrabold text-ink">$OISHII</span> tokens to this address.</span>
          </li>
          <li className="flex gap-2 mb-1.5">
            <span className="text-gold">•</span>
            <span>Deposits credit to your in-game balance within a few seconds.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gold">•</span>
            <span>Don&apos;t have $OISHII? Grab some from the exchange below.</span>
          </li>
        </ul>

        {/* Primary CTA */}
        <button
          type="button"
          className="block w-full py-3.5 rounded-2xl border-2 border-white text-ink font-extrabold text-[15px] cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0.5"
          style={{
            background: "linear-gradient(180deg, #FFD15C 0%, #FFB800 100%)",
            boxShadow: "0 4px 0 #D49600, 0 6px 14px rgba(255,184,0,0.35)",
          }}
          onClick={onClose}
        >
          Buy $OISHII 🛒
        </button>
      </div>
    </div>
  );
}
