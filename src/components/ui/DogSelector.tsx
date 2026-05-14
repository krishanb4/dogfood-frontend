import { useState } from "react";
import type { DogType } from "../../types";

const DEMO_WALLETS = [
  "0xDEMO0000000000000000000000000000000001",
  "0xDEMO0000000000000000000000000000000002",
  "0xDEMO0000000000000000000000000000000003",
  "0xDEMO0000000000000000000000000000000004",
  "0xDEMO0000000000000000000000000000000005",
];

interface DogSelectorProps {
  onSelect: (data: { name: string; breed: DogType; wallet: string }) => void;
}

export function DogSelector({ onSelect }: DogSelectorProps): JSX.Element {
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState("");
  const [selectedBreed, setSelectedBreed] = useState<DogType | null>(null);

  const dogs: { id: DogType; emoji: string; name: string }[] = [
    { id: "husky",    emoji: "🐺", name: "Husky" },
    { id: "pug",      emoji: "🐶", name: "Pug" },
    { id: "shibainu", emoji: "🦊", name: "Shiba Inu" },
  ];

  const canJoin = name.trim() && wallet.trim() && selectedBreed;

  const handleJoin = (): void => {
    if (canJoin && selectedBreed) {
      onSelect({ name: name.trim(), breed: selectedBreed, wallet: wallet.trim() });
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
    marginBottom: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff',
    fontSize: '16px', outline: 'none', textAlign: 'center',
  };

  return (
    <div className="dog-selector-overlay">
      <div className="dog-selector-card">
        <h2>🐾 Choose Your Dog</h2>
        <p>Select a breed to join the $DOGFOOD farm!</p>

        <input
          type="text"
          placeholder="Set your dog name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ ...inputStyle, marginBottom: '12px' }}
        />

        <input
          type="text"
          placeholder="Wallet address (demo for now)"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          style={inputStyle}
        />
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
            Pick a demo wallet:
          </div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {DEMO_WALLETS.map((w, i) => (
              <button
                key={w}
                type="button"
                onClick={() => setWallet(w)}
                style={{
                  padding: '4px 10px', borderRadius: '8px', border: 'none',
                  background: wallet === w ? 'rgba(247,183,24,0.25)' : 'rgba(255,255,255,0.08)',
                  color: '#fff', fontSize: '12px', cursor: 'pointer',
                }}
              >
                Demo {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="dog-options" style={{ marginBottom: '20px' }}>
          {dogs.map((dog) => (
            <div
              key={dog.id}
              className="dog-option"
              onClick={() => setSelectedBreed(dog.id)}
              style={{ border: selectedBreed === dog.id ? '2px solid #F7B718' : '2px solid rgba(255,255,255,0.08)', background: selectedBreed === dog.id ? 'rgba(247, 183, 24, 0.08)' : 'rgba(255,255,255,0.03)' }}
            >
              <span className="dog-emoji">{dog.emoji}</span>
              <span className="dog-name">{dog.name}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleJoin}
          disabled={!canJoin}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: !canJoin ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #F7B718, #F59E0B)', color: !canJoin ? 'rgba(255,255,255,0.3)' : '#000', fontSize: '16px', fontWeight: 'bold', cursor: !canJoin ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
        >
          Join Game
        </button>
      </div>
    </div>
  );
}
