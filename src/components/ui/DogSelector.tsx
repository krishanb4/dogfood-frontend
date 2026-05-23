import { useState } from "react";
import type { DogType } from "../../types";

const DEMO_WALLETS = [
  "0xDEMO0000000000000000000000000000000001",
  "0xDEMO0000000000000000000000000000000002",
  "0xDEMO0000000000000000000000000000000003",
  "0xDEMO0000000000000000000000000000000004",
  "0xDEMO0000000000000000000000000000000005",
];

const DOGS: { id: DogType; emoji: string; label: string; desc: string; tint: { bg: string; border: string; text: string } }[] = [
  { id: "husky",    emoji: "🐺", label: "Husky",    desc: "Fast & fierce",
    tint: { bg: "bg-[#DEF7FF]", border: "border-[#A8E5F0]", text: "text-[#0096B5]" } },
  { id: "pug",      emoji: "🐶", label: "Pug",      desc: "Cute & cuddly",
    tint: { bg: "bg-[#FFE5EE]", border: "border-[#FFC1D5]", text: "text-[#D8458A]" } },
  { id: "shibainu", emoji: "🦊", label: "Shiba Inu", desc: "Such wow",
    tint: { bg: "bg-[#FFE8DD]", border: "border-[#FFC9AE]", text: "text-[#D85F38]" } },
];

interface DogSelectorProps { onSelect: (data: { name: string; breed: DogType; wallet: string }) => void; }

export function DogSelector({ onSelect }: DogSelectorProps): JSX.Element {
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState("");
  const [selectedBreed, setSelectedBreed] = useState<DogType | null>(null);

  const canJoin = !!(name.trim() && wallet.trim() && selectedBreed);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
      style={{ background: "rgba(45,27,78,0.45)" }}
    >
      <div className="w-full max-w-120 rounded-[28px] border-2 border-line bg-white p-7 font-[Fredoka,system-ui,sans-serif] text-ink text-center animate-pop-in shadow-[0_24px_64px_-12px_rgba(124,92,252,0.40),0_4px_12px_rgba(45,27,78,0.08)]">
        {/* Title */}
        <h2 className="text-[24px] font-extrabold mb-1 bg-linear-to-r from-pink via-primary to-primary-dk bg-clip-text text-transparent flex items-center justify-center gap-2">
          <span>🐾</span> Choose Your Dog
        </h2>
        <p className="text-[13px] text-ink-2 mb-5 leading-relaxed font-medium">
          Pick a breed and join the $OISHII farm!
        </p>

        {/* Dog Name input */}
        <input
          type="text"
          placeholder="Set your dog's name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 py-3.5 px-4 rounded-2xl border-2 border-line bg-bg-panel text-ink text-[15px] text-center font-[inherit] font-medium outline-none transition-colors duration-200 focus:border-primary focus:bg-white placeholder:text-ink-3"
        />

        {/* Wallet input */}
        <input
          type="text"
          placeholder="Wallet address"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          className="w-full mb-3 py-3.5 px-4 rounded-2xl border-2 border-line bg-bg-panel text-ink text-[15px] text-center font-[inherit] font-medium outline-none transition-colors duration-200 focus:border-primary focus:bg-white placeholder:text-ink-3"
        />

        {/* Demo wallet picker */}
        <div className="mb-5">
          <p className="text-[11px] text-ink-3 mb-2 font-bold tracking-[0.5px] uppercase">Pick a demo wallet</p>
          <div className="flex gap-1.5 justify-center flex-wrap">
            {DEMO_WALLETS.map((w, i) => (
              <button
                key={w}
                type="button"
                onClick={() => setWallet(w)}
                className={`py-1.5 px-3 rounded-full border-2 text-[12px] font-bold cursor-pointer font-[inherit] transition-all duration-200 ${
                  wallet === w
                    ? "bg-[#FFF6DD] border-[#FFB800] text-[#B88800] shadow-[0_2px_6px_rgba(255,184,0,0.30)]"
                    : "bg-bg-panel border-line text-ink-2 hover:bg-bg-soft hover:border-line-strong"
                }`}
              >
                Demo {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Breed selector */}
        <div className="flex gap-3 justify-center flex-wrap mb-5">
          {DOGS.map((dog) => {
            const selected = selectedBreed === dog.id;
            return (
              <button
                key={dog.id}
                type="button"
                onClick={() => setSelectedBreed(dog.id)}
                className={`w-[118px] py-4 px-2.5 rounded-2xl border-2 cursor-pointer font-[inherit] text-center transition-all duration-200 ${
                  selected
                    ? `${dog.tint.bg} ${dog.tint.border} -translate-y-1 shadow-[0_8px_20px_-4px_rgba(124,92,252,0.30)]`
                    : "bg-bg-panel border-line hover:bg-white hover:border-line-strong hover:-translate-y-0.5"
                }`}
              >
                <span className="text-[42px] leading-none mb-2 block drop-shadow-[0_4px_8px_rgba(45,27,78,0.18)]">{dog.emoji}</span>
                <span className={`text-[14px] font-extrabold block ${selected ? dog.tint.text : "text-ink"}`}>{dog.label}</span>
                <span className="text-[10px] text-ink-3 block mt-0.5 font-medium">{dog.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Join button */}
        <button
          type="button"
          onClick={() => { if (canJoin && selectedBreed) onSelect({ name: name.trim(), breed: selectedBreed, wallet: wallet.trim() }); }}
          disabled={!canJoin}
          className={`w-full py-4 rounded-2xl border-2 border-white text-ink font-extrabold text-[16px] font-[inherit] transition-all duration-150 ${
            canJoin
              ? "cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5"
              : "cursor-not-allowed opacity-50"
          }`}
          style={canJoin
            ? {
                background: "linear-gradient(180deg, #FFD15C 0%, #FFB800 100%)",
                boxShadow: "0 4px 0 #D49600, 0 6px 14px rgba(255,184,0,0.35)",
              }
            : {
                background: "#F4E8FF",
                color: "#A89DBD",
                boxShadow: "none",
              }
          }
        >
          {canJoin ? "Join Game 🚀" : "Fill in all fields"}
        </button>
      </div>
    </div>
  );
}
