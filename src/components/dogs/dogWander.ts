// dogWander.ts — Shared autonomous-wander behaviour for the GLB dog breeds.
import type { MutableRefObject } from "react";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AnimationAction, Group } from "three";
import { reportDogPosition, clearDogPosition } from "../../utils/dogObstacles";

const BOUNDS = { minX: -4.0, maxX: 4.0, minZ: 0.4, maxZ: 4.0 };
const WALK_SPEED = 1.2;
const ARRIVE_RADIUS = 0.25;
const ROT_LERP = 0.12;
const FADE = 0.25;

export interface DogWanderOptions {
  groupRef: MutableRefObject<Group | null>;
  actions: Record<string, AnimationAction | null | undefined>;
  isEating: boolean;
  groundY?: number;
  wallet?: string;
}

export function useDogWander({ groupRef, actions, isEating, groundY = 0.1, wallet }: DogWanderOptions): void {
  const targetRef       = useRef(new THREE.Vector3(0, 0, 2));
  const positionRef     = useRef(new THREE.Vector3(0, 0, 2));
  const idleTimerRef    = useRef(0);
  const idleDurationRef = useRef(2 + Math.random() * 3);
  const currentActionRef = useRef<AnimationAction | null>(null);
  const worldPosRef     = useRef(new THREE.Vector3());

  useEffect(() => () => clearDogPosition(wallet ?? ""), [wallet]);

  const pickAction = (...names: string[]): AnimationAction | null => {
    for (const n of names) if (actions[n]) return actions[n]!;
    return null;
  };

  const playAction = (action: AnimationAction | null): void => {
    if (!action || currentActionRef.current === action) return;
    if (currentActionRef.current) currentActionRef.current.fadeOut(FADE);
    action.reset().fadeIn(FADE).play();
    currentActionRef.current = action;
  };

  const pickNewTarget = (): void => {
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

      const targetYaw = Math.atan2(dx, dz);
      let diff = targetYaw - g.rotation.y;
      while (diff >  Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      g.rotation.y += diff * ROT_LERP;
    }

    g.position.set(pos.x, groundY, pos.z);

    if (wallet) {
      g.getWorldPosition(worldPosRef.current);
      reportDogPosition(wallet, worldPosRef.current);
    }
  });
}
