import { useState, type ReactNode } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useGameStore } from "../../store/gameStore";
import type { DogType } from "../../types";

const DOGS: { id: DogType; emoji: string; name: string }[] = [
  { id: "husky",    emoji: "🐺", name: "Husky" },
  { id: "pug",      emoji: "🐶", name: "Pug" },
  { id: "shibainu", emoji: "🦊", name: "Shiba Inu" },
];

type Step = "connect" | "profile";

interface OnboardingPageViewProps {
  step: Step;
  name: string;
  onNameChange: (v: string) => void;
  breed: DogType | null;
  onBreedChange: (b: DogType) => void;
  onJoin: () => void;
  /** Wallet button slot — defaults to RainbowKit's ConnectButton in the live app.
   *  Storybook passes a stub so the story doesn't need a Wagmi provider. */
  walletSlot?: ReactNode;
}

/** Pure presentational version — no hooks, no wallet, safe to render in Storybook. */
export function OnboardingPageView({
  step,
  name,
  onNameChange,
  breed,
  onBreedChange,
  onJoin,
  walletSlot,
}: OnboardingPageViewProps): JSX.Element {
  const onConnect = step === "connect";
  const canJoin = name.trim().length > 0 && breed !== null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-gradient-to-br from-bg-panel via-bg-soft to-[#FFE5EE] font-[Fredoka,system-ui,sans-serif]">
      <div className="w-full max-w-[420px] bg-white border-2 border-line rounded-[28px] px-8 py-9 flex flex-col items-center gap-2 shadow-[0_20px_56px_-12px_rgba(124,92,252,0.32),0_4px_12px_rgba(45,27,78,0.06)]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 text-[28px] text-ink mb-1 font-display tracking-[0.01em]">
          <span className="font-sans">🐕</span>
          <span>
            <span className="text-gold">$OISHII</span>
          </span>
        </div>

        <p className="text-[13px] text-ink-2 font-medium text-center leading-[1.5] mb-4">
          Feed your dog. Earn tokens. Top the leaderboard.
        </p>

        {/* Step dots */}
        <div className="flex gap-3 items-center mb-6">
          {[1, 2].map((s) => {
            const done    = !onConnect && s === 1;
            const current = onConnect ? s === 1 : s === 2;
            const base =
              "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all duration-300";
            const tone = current
              ? "bg-gradient-to-b from-gold-lt to-gold border-white text-ink shadow-[0_4px_14px_rgba(255,184,0,0.40)]"
              : done
              ? "bg-[#FFF6DD] border-gold text-[#B88800]"
              : "bg-bg-panel border-line text-ink-3";
            return (
              <div key={s} className={`${base} ${tone}`}>
                {done ? "✓" : s}
              </div>
            );
          })}
        </div>

        {onConnect ? (
          <div className="w-full flex flex-col items-center gap-3">
            <h3 className="text-[20px] font-extrabold text-ink text-center">
              Connect Your Wallet
            </h3>
            <p className="text-[13px] text-ink-2 font-medium text-center leading-[1.5]">
              Connect and sign once. We'll remember you automatically next time.
            </p>
            <div className="mt-2">{walletSlot ?? <ConnectButton />}</div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-3">
            <h3 className="text-[20px] font-extrabold text-ink text-center">
              Choose Your Dog
            </h3>
            <p className="text-[13px] text-ink-2 font-medium text-center leading-[1.5]">
              You'll only need to do this once.
            </p>

            <input
              className="w-full px-4 py-[13px] rounded-2xl border-2 border-line bg-bg-panel text-ink text-[15px] font-medium outline-none text-center transition-[border-color,background-color] duration-[0.18s] focus:border-primary focus:bg-white placeholder:text-ink-3"
              type="text"
              placeholder="Enter your dog's name"
              maxLength={24}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canJoin && onJoin()}
              autoFocus
            />

            <div className="grid grid-cols-3 gap-2 w-full">
              {DOGS.map((dog) => {
                const selected = breed === dog.id;
                return (
                  <button
                    type="button"
                    key={dog.id}
                    onClick={() => onBreedChange(dog.id)}
                    className={
                      "flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 cursor-pointer transition-all duration-[0.18s] " +
                      (selected
                        ? "border-primary bg-white shadow-[0_4px_14px_rgba(167,139,250,0.30)] -translate-y-0.5"
                        : "border-line bg-bg-panel hover:border-line-strong hover:bg-white")
                    }
                  >
                    <span className="text-[32px] leading-none">{dog.emoji}</span>
                    <span className="text-[12px] font-bold text-ink">{dog.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onJoin}
              disabled={!canJoin}
              className="w-full p-3.5 rounded-2xl border-2 border-white text-[15px] font-extrabold cursor-pointer transition-all duration-[0.18s] bg-gradient-to-b from-gold-lt to-gold text-ink shadow-[0_4px_0_#D49600,0_6px_14px_rgba(255,184,0,0.35)] enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_6px_0_#D49600,0_8px_18px_rgba(255,184,0,0.42)] enabled:active:translate-y-0.5 enabled:active:shadow-[0_2px_0_#D49600,0_3px_8px_rgba(255,184,0,0.30)] disabled:bg-none disabled:bg-bg-soft disabled:text-ink-3 disabled:cursor-not-allowed disabled:shadow-none disabled:border-transparent"
            >
              Enter Farm 🐾
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Connected onboarding — wires the view up to the game store. */
export function OnboardingPage(): JSX.Element {
  const user    = useGameStore((s) => s.user);
  const setUser = useGameStore((s) => s.setUser);

  const [name,  setName]  = useState("");
  const [breed, setBreed] = useState<DogType | null>(null);

  const needsProfile = !!user && !user.hasProfile;

  const handleJoin = (): void => {
    if (!name.trim() || !breed || !user) return;
    setUser({ ...user, name: name.trim(), breed, hasProfile: true });
  };

  return (
    <OnboardingPageView
      step={needsProfile ? "profile" : "connect"}
      name={name}
      onNameChange={setName}
      breed={breed}
      onBreedChange={setBreed}
      onJoin={handleJoin}
    />
  );
}
