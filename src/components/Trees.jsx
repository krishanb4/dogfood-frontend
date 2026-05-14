// Trees.jsx — Scatters Tree / FallTree / PalmTree across the farm map's
// free grass zones. Avoids:
//   • roads (vertical at x=±90..±30..0, horizontal at z=±117,±78,0)
//   • the dog-house grid (every slot from App.jsx → POSITIONS)
//   • shop plazas (9 junctions, radius 14)
//   • each other (min spacing)
// Counts per breed are configurable below; tune to taste.

import { useMemo } from "react";
import { Tree } from "./trees/Tree";
import { FallTree } from "./trees/FallTree";
import { PalmTree } from "./trees/PalmTree";

// ── User-tunable tree counts ─────────────────────────────────────────────
// Increase / decrease to adjust forest density. Note: with too-high counts
// the placement algorithm gives up if it can't fit all of them.
export const TREE_COUNTS = {
  oak:  35,  // <Tree />
  fall: 25,  // <FallTree />
  palm: 15,  // <PalmTree />
};

// Base scale per tree type — tuned so each renders ~3.5–4 units tall
// (similar visual height regardless of the GLB's native size):
//   • Tree.glb       native ≈ 1.46 units → 2.5× → ~3.7 units
//   • FallTree.glb   native ≈ 3.18 units → 1.2× → ~3.8 units
//   • PalmTree.glb   native ≈ 0.027 units BUT its inner mesh keeps the
//                    baked scale={100} from gltfjsx → ~2.7 units, then
//                    1.4× outer → ~3.8 units.
// Each instance gets ±15% random variance on top of these.
export const TREE_SIZES = {
  oak:  2.5,
  fall: 1.2,
  palm: 1.4,
};

// ── Map geometry (mirrors FarmMap.jsx + App.jsx) ─────────────────────────
const ROADS_X     = [-90, -60, -30, 0, 30, 60, 90];
const ROADS_Z     = [-117, -78, 0, 78, 117];
const ROAD_BUFFER = 4.0;   // road half-width (2.5) + ~1.5 margin

const SHOP_CENTERS = [
  [   0,   0 ], [  60,   0 ], [ -60,   0 ],
  [   0,  78 ], [   0, -78 ],
  [ -60,  78 ], [  60,  78 ],
  [ -60, -78 ], [  60, -78 ],
];
const SHOP_RADIUS = 14.0;  // plaza radius (12) + 2 margin

const HOUSE_BUFFER = 6.0;  // fence half (4.75) + ~1.25 margin

const MAP_HALF_X = 87;
const MIN_TREE_SPACING = 4.5; // metres between trees

// Island platforms — trees must land inside one of these z ranges
const ISLANDS = [
  { zMin: -117, zMax:  -44 },
  { zMin:  -33, zMax:   33 },
  { zMin:   44, zMax:  117 },
];

// Cheap deterministic PRNG (mulberry32) so positions stay stable across
// renders / HMR without depending on Math.random.
function seededRng(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function isAreaFree(x, z, houseSlots) {
  // Must be on an island platform
  if (!ISLANDS.some(b => z >= b.zMin && z <= b.zMax)) return false;

  // Roads (axis-aligned strips)
  for (const rx of ROADS_X) if (Math.abs(x - rx) < ROAD_BUFFER) return false;
  for (const rz of ROADS_Z) if (Math.abs(z - rz) < ROAD_BUFFER) return false;

  // Shop plazas
  for (let i = 0; i < SHOP_CENTERS.length; i++) {
    const [sx, sz] = SHOP_CENTERS[i];
    const dx = x - sx, dz = z - sz;
    if (dx * dx + dz * dz < SHOP_RADIUS * SHOP_RADIUS) return false;
  }

  // Dog-house slots
  for (let i = 0; i < houseSlots.length; i++) {
    const s = houseSlots[i];
    if (Math.abs(x - s.x) < HOUSE_BUFFER && Math.abs(z - s.z) < HOUSE_BUFFER) return false;
  }
  return true;
}

// Pick a random z that falls inside one of the island platforms
function randomIslandZ(rng) {
  const island = ISLANDS[Math.floor(rng() * ISLANDS.length)];
  return island.zMin + rng() * (island.zMax - island.zMin);
}

// Try `targetCount` rejection-sampled positions; appends to `accum` so
// successive breed batches stay clear of previously-placed trees.
function pickPositions(rng, targetCount, houseSlots, accum, idOffset, baseScale) {
  const out = [];
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

export function Trees({ houseSlots = [] }) {
  // Compute once — house slot list is static after generatePositions().
  const { oak, fall, palm } = useMemo(() => {
    const rng = seededRng(0xD0F00D);
    const accum = [];
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
