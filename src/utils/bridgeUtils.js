// Shared bridge geometry — imported by both FarmMap.jsx and Player.jsx
// so the arch curve used for rendering matches the one used for player Y.

export const BRIDGE_CX   = [-60, 0, 60];
export const BRIDGE_HALF = 6;
export const ARCH_PEAK   = 2;   // keep in sync with FarmMap constant
export const GAPS = [
  { zMin: -44, zMax: -33 },
  { zMin:  33, zMax:  44 },
];

// Returns the Y offset a player should stand at for a given world (x, z).
// On a bridge section the deck follows a parabola: y = ARCH_PEAK * 4t(1-t).
// Returns 0 on platforms (or anywhere not on a bridge).
export function getBridgeY(x, z) {
  for (const gap of GAPS) {
    if (z < gap.zMin || z > gap.zMax) continue;
    for (const bx of BRIDGE_CX) {
      if (x >= bx - BRIDGE_HALF && x <= bx + BRIDGE_HALF) {
        const t = (z - gap.zMin) / (gap.zMax - gap.zMin);
        return ARCH_PEAK * 4 * t * (1 - t);
      }
    }
  }
  return 0;
}
