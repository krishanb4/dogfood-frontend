// Trees.tsx — Scatters Tree / FallTree / PalmTree across the farm map's
// free grass zones.

import { useMemo } from "react";
import { Tree } from "./trees/Tree";
import { FallTree } from "./trees/FallTree";
import { PalmTree } from "./trees/PalmTree";
import type { SlotPosition } from "../types";

// ── User-tunable tree counts ─────────────────────────────────────────────
export const TREE_COUNTS = {
  oak:  35,
  fall: 25,
  palm: 15,
};

export const TREE_SIZES = {
  oak:  2.5,
  fall: 1.2,
  palm: 1.4,
};

// ── Map geometry (mirrors FarmMap.tsx + App.tsx) ─────────────────────────
const ROADS_X     = [-90, -60, -30, 0, 30, 60, 90];
const ROADS_Z     = [-117, -78, 0, 78, 117];
const ROAD_BUFFER = 4.0;

const SHOP_CENTERS: [number, number][] = [
  [   0,   0 ], [  60,   0 ], [ -60,   0 ],
  [   0,  78 ], [   0, -78 ],
  [ -60,  78 ], [  60,  78 ],
  [ -60, -78 ], [  60, -78 ],
];
const SHOP_RADIUS = 14.0;

const HOUSE_BUFFER = 6.0;

const MAP_HALF_X = 87;
const MIN_TREE_SPACING = 4.5;

const ISLANDS = [
  { zMin: -117, zMax:  -44 },
  { zMin:  -33, zMax:   33 },
  { zMin:   44, zMax:  117 },
];

function seededRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function isAreaFree(x: number, z: number, houseSlots: SlotPosition[]): boolean {
  if (!ISLANDS.some(b => z >= b.zMin && z <= b.zMax)) return false;

  for (const rx of ROADS_X) if (Math.abs(x - rx) < ROAD_BUFFER) return false;
  for (const rz of ROADS_Z) if (Math.abs(z - rz) < ROAD_BUFFER) return false;

  for (let i = 0; i < SHOP_CENTERS.length; i++) {
    const [sx, sz] = SHOP_CENTERS[i];
    const dx = x - sx, dz = z - sz;
    if (dx * dx + dz * dz < SHOP_RADIUS * SHOP_RADIUS) return false;
  }

  for (let i = 0; i < houseSlots.length; i++) {
    const s = houseSlots[i];
    if (Math.abs(x - s.x) < HOUSE_BUFFER && Math.abs(z - s.z) < HOUSE_BUFFER) return false;
  }
  return true;
}

function randomIslandZ(rng: () => number): number {
  const island = ISLANDS[Math.floor(rng() * ISLANDS.length)];
  return island.zMin + rng() * (island.zMax - island.zMin);
}

interface TreeEntry { id: number; x: number; z: number; yaw: number; scale: number; }

function pickPositions(
  rng: () => number,
  targetCount: number,
  houseSlots: SlotPosition[],
  accum: { x: number; z: number }[],
  idOffset: number,
  baseScale: number,
): TreeEntry[] {
  const out: TreeEntry[] = [];
  let tries = 0;
  const maxTries = targetCount * 80;
  const minSpacingSq = MIN_TREE_SPACING * MIN_TREE_SPACING;

  while (out.length < targetCount && tries < maxTries) {
    tries++;
    const x = (rng() * 2 - 1) * MAP_HALF_X;
    const z = randomIslandZ(rng);
    if (!isAreaFree(x, z, houseSlots)) continue;

    let tooClose = false;
    for (let i = 0; i < accum.length; i++) {
      const a = accum[i];
      const dx = x - a.x, dz = z - a.z;
      if (dx * dx + dz * dz < minSpacingSq) { tooClose = true; break; }
    }
    if (tooClose) continue;

    out.push({
      id: idOffset + out.length,
      x, z,
      yaw:   rng() * Math.PI * 2,
      scale: baseScale * (0.85 + rng() * 0.3),
    });
    accum.push({ x, z });
  }
  return out;
}

interface TreesProps { houseSlots?: SlotPosition[]; }

export function Trees({ houseSlots = [] }: TreesProps): JSX.Element {
  const { oak, fall, palm } = useMemo(() => {
    const rng = seededRng(0xD0F00D);
    const accum: { x: number; z: number }[] = [];
    const oak  = pickPositions(rng, TREE_COUNTS.oak,  houseSlots, accum, 0, TREE_SIZES.oak);
    const fall = pickPositions(rng, TREE_COUNTS.fall, houseSlots, accum, oak.length, TREE_SIZES.fall);
    const palm = pickPositions(rng, TREE_COUNTS.palm, houseSlots, accum, oak.length + fall.length, TREE_SIZES.palm);
    return { oak, fall, palm };
  }, [houseSlots]);

  return (
    <group>
      {oak.map((p) => (
        <Tree key={`oak-${p.id}`} position={[p.x, 4, p.z]} rotation={[0, p.yaw, 0]} scale={p.scale} />
      ))}
      {fall.map((p) => (
        <FallTree key={`fall-${p.id}`} position={[p.x, 4, p.z]} rotation={[0, p.yaw, 0]} scale={p.scale} />
      ))}
      {palm.map((p) => (
        <PalmTree key={`palm-${p.id}`} position={[p.x, 3.7, p.z]} rotation={[0, p.yaw, 0]} scale={p.scale} />
      ))}
    </group>
  );
}
