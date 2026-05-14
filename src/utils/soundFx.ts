// soundFx.ts — Lightweight Web Audio sound effects.
// No asset files; effects are synthesised on-demand from sine/triangle/square
// oscillators with simple ADSR envelopes. The AudioContext is lazy-created
// on first play (browsers require a user gesture before audio can start).

declare global {
  interface Window { webkitAudioContext?: typeof AudioContext; }
}

interface ToneParams {
  freq?: number;
  duration?: number;
  type?: OscillatorType;
  volume?: number;
  attack?: number;
  release?: number;
  when?: number;
}

interface SweepParams {
  from?: number;
  to?: number;
  duration?: number;
  type?: OscillatorType;
  volume?: number;
  when?: number;
}

let _ctx: AudioContext | null = null;
let _enabled = true;

function ctx(): AudioContext | null {
  if (_ctx) return _ctx;
  const C = typeof window !== "undefined" ? (window.AudioContext || window.webkitAudioContext) : null;
  if (!C) return null;
  _ctx = new C();
  return _ctx;
}

export function setSoundEnabled(v: boolean): void { _enabled = !!v; }
export function isSoundEnabled(): boolean { return _enabled; }

// Play a single tone with an attack/release envelope.
function tone({ freq = 440, duration = 0.2, type = "sine" as OscillatorType, volume = 0.2, attack = 0.005, release = 0.12, when = 0 }: ToneParams): void {
  if (!_enabled) return;
  const ac = ctx();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + attack);
  gain.gain.linearRampToValueAtTime(0, t0 + duration + release);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + release + 0.02);
}

// Slide a tone's frequency between two values (sweep).
function sweep({ from = 200, to = 600, duration = 0.25, type = "triangle" as OscillatorType, volume = 0.25, when = 0 }: SweepParams): void {
  if (!_enabled) return;
  const ac = ctx();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(to, 0.001), t0 + duration);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.linearRampToValueAtTime(0, t0 + duration + 0.05);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.1);
}

// ── Public sound effects ──────────────────────────────────────────────────

// "Cha-ching" coin sound — two-step bright tone for shop purchases.
export function playCoin(): void {
  tone({ freq: 880, duration: 0.06, type: "square", volume: 0.18 });
  tone({ freq: 1320, duration: 0.12, type: "square", volume: 0.18, when: 0.08 });
}

// Munch — quick low pop for eating/feeding action.
export function playMunch(): void {
  sweep({ from: 320, to: 110, duration: 0.18, type: "sine", volume: 0.3 });
}

// Click — UI tap feedback.
export function playClick(): void {
  tone({ freq: 660, duration: 0.04, type: "triangle", volume: 0.12 });
}

// Fanfare — short ascending arpeggio for goal completion.
export function playFanfare(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((f, i) => tone({ freq: f, duration: 0.12, type: "triangle", volume: 0.22, when: i * 0.08 }));
}

// Big win — longer fanfare for perfect-day bonus.
export function playPerfectDay(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  notes.forEach((f, i) => tone({ freq: f, duration: 0.18, type: "triangle", volume: 0.25, when: i * 0.1 }));
  tone({ freq: 1567.98, duration: 0.4, type: "sine", volume: 0.3, when: 0.55 });
}

// Error / insufficient balance buzz.
export function playError(): void {
  tone({ freq: 200, duration: 0.18, type: "square", volume: 0.18 });
  tone({ freq: 150, duration: 0.18, type: "square", volume: 0.18, when: 0.18 });
}
