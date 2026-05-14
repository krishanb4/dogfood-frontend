import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useGameStore } from "../../store/gameStore";
import type { DogType } from "../../types";

const DOGS: { id: DogType; emoji: string; name: string }[] = [
  { id: "husky",    emoji: "🐺", name: "Husky" },
  { id: "pug",      emoji: "🐶", name: "Pug" },
  { id: "shibainu", emoji: "🦊", name: "Shiba Inu" },
];

export function OnboardingPage(): JSX.Element {
  const user    = useGameStore((s) => s.user);
  const setUser = useGameStore((s) => s.setUser);

  const [name,  setName]  = useState("");
  const [breed, setBreed] = useState<DogType | null>(null);

  // Step 2: authenticated but no profile yet
  const needsProfile = !!user && !user.hasProfile;

  const handleJoin = (): void => {
    if (!name.trim() || !breed || !user) return;
    setUser({ ...user, name: name.trim(), breed, hasProfile: true });
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-logo">
          <span>🐕</span>
          <span className="logo-text"><span>$DOG</span>FOOD</span>
        </div>
        <p className="onboarding-subtitle">Feed your dog. Earn tokens. Top the leaderboard.</p>

        <div className="onboarding-steps">
          {[1, 2].map((s) => {
            const done    = needsProfile ? s === 1 : false;
            const current = needsProfile ? s === 2 : s === 1;
            return (
              <div key={s} className={`step-dot ${done || current ? "active" : ""} ${current ? "current" : ""}`}>
                {done ? "✓" : s}
              </div>
            );
          })}
        </div>

        {!needsProfile ? (
          // Step 1 — RainbowKit handles connect + SIWE sign automatically
          <div className="onboarding-step">
            <h3>Connect Your Wallet</h3>
            <p>Connect and sign once. We'll remember you automatically next time.</p>
            <div className="rainbowkit-wrapper">
              <ConnectButton />
            </div>
          </div>
        ) : (
          // Step 2 — Pick dog name + breed (first time only)
          <div className="onboarding-step">
            <h3>Choose Your Dog</h3>
            <p>You'll only need to do this once.</p>
            <input
              className="onboarding-input"
              type="text"
              placeholder="Enter your dog's name"
              maxLength={24}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && breed && handleJoin()}
              autoFocus
            />
            <div className="dog-options">
              {DOGS.map((dog) => (
                <div
                  key={dog.id}
                  className={`dog-option ${breed === dog.id ? "selected" : ""}`}
                  onClick={() => setBreed(dog.id)}
                >
                  <span className="dog-emoji">{dog.emoji}</span>
                  <span className="dog-name">{dog.name}</span>
                </div>
              ))}
            </div>
            <button
              className="onboarding-btn primary"
              onClick={handleJoin}
              disabled={!name.trim() || !breed}
            >
              Enter Farm 🐾
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
