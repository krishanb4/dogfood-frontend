// dogWander.js — Shared autonomous-wander behaviour for the GLB dog breeds.
// Picks random local-space targets inside the fenced grass patch, walks toward
// them with the Walk animation, idles for a few seconds on arrival with the
// Idle animation, and switches to Eating when `isEating` is true.
//
// All bounds are LOCAL to the DogHouse (whose group is the dog's parent),
// so each dog only ever wanders inside its own fence regardless of how the
// house is positioned/rotated in the world.

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { reportDogPosition, clearDogPosition } from "../../utils/dogObstacles";

// Walkable area inside the picket fence, in DogHouse local space.
// Fence spans ±4.75; house sits at z ≈ [-2.9, -0.1], so the dog stays in
// front of the house (positive Z) with a small margin from each fence edge.
const BOUNDS = { minX: -4.0, maxX: 4.0, minZ: 0.4, maxZ: 4.0 };
const WALK_SPEED = 1.2;     // units / sec
const ARRIVE_RADIUS = 0.25; // distance at which target counts as reached
const ROT_LERP = 0.12;
const FADE = 0.25;

export function useDogWander({ groupRef, actions, isEating, groundY = 0.1, wallet }) {
  const targetRef       = useRef(new THREE.Vector3(0, 0, 2));
  const positionRef     = useRef(new THREE.Vector3(0, 0, 2));
  const idleTimerRef    = useRef(0);
  const idleDurationRef = useRef(2 + Math.random() * 3);
  const currentActionRef = useRef(null);
  const worldPosRef     = useRef(new THREE.Vector3());

  // Drop our entry from the shared dog-obstacle map on unmount so the
  // player can't be blocked by a ghost from a player who left.
  useEffect(() => () => clearDogPosition(wallet), [wallet]);

  const pickAction = (...names) => {
    for (const n of names) if (actions[n]) return actions[n];
    return null;
  };

  const playAction = (action) => {
    if (!action || currentActionRef.current === action) return;
    if (currentActionRef.current) currentActionRef.current.fadeOut(FADE);
    action.reset().fadeIn(FADE).play();
    currentActionRef.current = action;
  };

  const pickNewTarget = () => {
    targetRef.current.set(
      THREE.MathUtils.randFloat(BOUNDS.minX, BOUNDS.maxX),
      0,
      THREE.MathUtils.randFloat(BOUNDS.minZ, BOUNDS.maxZ),
    );
    idleDurationRef.current = 2 + Math.random() * 3;
  };

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;

    const walk   = pickAction("AnimalArmature|Walk",   "Walk");
    const idle   = pickAction("AnimalArmature|Idle",   "Idle");
    const eating = pickAction("AnimalArmature|Eating", "Eating");

    if (isEating) {
      playAction(eating || idle);
      g.position.set(positionRef.current.x, groundY, positionRef.current.z);
      return;
    }

    const pos = positionRef.current;
    const target = targetRef.current;
    const dx = target.x - pos.x;
    const dz = target.z - pos.z;
    const dist = Math.hypot(dx, dz);

    if (dist < ARRIVE_RADIUS) {
      playAction(idle);
      idleTimerRef.current += delta;
      if (idleTimerRef.current > idleDurationRef.current) {
        pickNewTarget();
        idleTimerRef.current = 0;
      }
    } else {
      playAction(walk);
      pos.x += (dx / dist) * WALK_SPEED * delta;
      pos.z += (dz / dist) * WALK_SPEED * delta;

      // Smooth-lerp rotation toward movement direction (shortest arc around Y).
      const targetYaw = Math.atan2(dx, dz);
      let diff = targetYaw - g.rotation.y;
      while (diff >  Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      g.rotation.y += diff * ROT_LERP;
    }

    g.position.set(pos.x, groundY, pos.z);

    // Publish world position so the player's collision check can treat
    // this dog as a moving obstacle.
    if (wallet) {
      g.getWorldPosition(worldPosRef.current);
      reportDogPosition(wallet, worldPosRef.current);
    }
  });
}
