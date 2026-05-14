// dogObstacles.ts — Shared dog-position registry used by the player's
// collision code. Each wandering dog writes its world position into this
// map every frame (from useDogWander); Player.tsx queries the map to see
// whether a candidate next-position would overlap any dog.
//
// Module-level state is fine here — dogs only mount once per player and
// the entries are cheap to overwrite each frame.

import * as THREE from "three";

const _positions = new Map<string, THREE.Vector3>(); // wallet → THREE.Vector3 (world position)

const DOG_RADIUS = 1.0;       // collision radius for any dog

export function reportDogPosition(wallet: string, source: THREE.Vector3): void {
  if (!wallet || !source) return;
  let v = _positions.get(wallet);
  if (!v) {
    v = new THREE.Vector3();
    _positions.set(wallet, v);
  }
  v.copy(source);
}

export function clearDogPosition(wallet: string): void {
  if (wallet) _positions.delete(wallet);
}

// Circle-vs-circle overlap test. Returns true if a circle of radius `r`
// centered at (x, z) overlaps any registered dog.
export function dogBlocksAt(x: number, z: number, r: number): boolean {
  const minSq = (r + DOG_RADIUS) ** 2;
  for (const pos of _positions.values()) {
    const dx = x - pos.x;
    const dz = z - pos.z;
    if (dx * dx + dz * dz < minSq) return true;
  }
  return false;
}
