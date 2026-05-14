// Player.jsx — WASD-controlled local player + third-person follow camera
// Loads Characters.glb, hides the saw weapon (any Mesh attached to bones in
// the Root armature), moves with WASD relative to the camera, plays Run/Idle
// animations, and exposes the world position via a shared THREE.Vector3 ref
// so the third-person camera can lerp behind the player.

import { useRef, useEffect, useMemo } from "react";
import { useFrame, useGraph } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { dogBlocksAt } from "../utils/dogObstacles";
import { getBridgeY } from "../utils/bridgeUtils";

const MOVE_SPEED = 4;
const ROT_LERP = 0.18;
const MAP_HALF_X = 88;
const MAP_HALF_Z = 115;
const PLAYER_RADIUS = 0.6;

function blockedAt(x, z, obstacles, r) {
  if (!obstacles || obstacles.length === 0) return false;
  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (Math.abs(x - o.x) < o.halfX + r && Math.abs(z - o.z) < o.halfZ + r) return true;
  }
  return false;
}

function findClip(animations, candidates) {
  for (const name of candidates) {
    const clip = animations.find(a => a.name === name);
    if (clip) return clip;
  }
  // case-insensitive keyword fallback
  for (const name of candidates) {
    const kw = name.split('|').pop().toLowerCase();
    const clip = animations.find(a => a.name.toLowerCase().includes(kw));
    if (clip) return clip;
  }
  return null;
}

const IDLE_CANDIDATES = ["CharacterArmature|Idle", "CharacterArmature|Idle_Loop", "Idle"];
const RUN_CANDIDATES  = ["CharacterArmature|Run", "CharacterArmature|Walk", "Run", "Walk"];

export function Player({ initialPosition, stateRef, obstacles = [], joystickRef }) {
  const group = useRef();
  const { scene, animations } = useGLTF("/models/Characters.glb");
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);

  const mixerRef        = useRef(null);
  const idleActionRef   = useRef(null);
  const runActionRef    = useRef(null);
  const keysRef         = useRef({});
  const currentActionRef = useRef(null);
  const spawnedRef      = useRef(false);

  // Helper to mirror current group transform into the shared stateRef.
  const syncState = () => {
    if (!stateRef?.current || !group.current) return;
    stateRef.current.position.copy(group.current.position);
    stateRef.current.yaw = group.current.rotation.y;
  };

  // Hide extra meshes inside the Root armature (e.g. the saw weapon).
  useEffect(() => {
    if (!nodes.Root) return;
    nodes.Root.traverse((obj) => { if (obj.isMesh) obj.visible = false; });
  }, [nodes.Root]);

  // Build the AnimationMixer AFTER the group is mounted so it has a valid root.
  // useAnimations (drei) initialises the mixer at hook-call time when the ref
  // is still null, meaning clips never bind to bones. Creating it manually in
  // useEffect guarantees group.current exists.
  useEffect(() => {
    if (!group.current || !animations?.length) return;
    const mixer = new THREE.AnimationMixer(group.current);
    mixerRef.current = mixer;

    const idleClip = findClip(animations, IDLE_CANDIDATES);
    const runClip  = findClip(animations, RUN_CANDIDATES);

    if (idleClip) {
      idleActionRef.current = mixer.clipAction(idleClip);
      idleActionRef.current.play();
      currentActionRef.current = idleActionRef.current;
    }
    if (runClip) {
      runActionRef.current = mixer.clipAction(runClip);
    }

    return () => { mixer.stopAllAction(); mixerRef.current = null; };
  }, [animations]);

  // Set spawn position once.
  useEffect(() => {
    if (!group.current || !initialPosition || spawnedRef.current) return;
    group.current.position.set(initialPosition[0], initialPosition[1], initialPosition[2]);
    syncState();
    spawnedRef.current = true;
  }, [initialPosition, stateRef]);

  // Keyboard listeners. Clear keys on blur so the player doesn't keep walking
  // when the window loses focus (e.g. user alt-tabs while holding W).
  useEffect(() => {
    const onDown = (e) => { keysRef.current[e.code] = true; };
    const onUp   = (e) => { keysRef.current[e.code] = false; };
    const onBlur = () => { keysRef.current = {}; };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const switchAction = (next) => {
    if (!next || currentActionRef.current === next) return;
    currentActionRef.current?.fadeOut(0.2);
    next.reset().fadeIn(0.2).play();
    currentActionRef.current = next;
  };

  useFrame((state, delta) => {
    if (!group.current) return;
    mixerRef.current?.update(delta);
    const keys = keysRef.current;

    // Camera-relative movement axes (project camera forward onto the ground plane).
    const camForward = new THREE.Vector3();
    state.camera.getWorldDirection(camForward);
    camForward.y = 0;
    if (camForward.lengthSq() < 1e-6) camForward.set(0, 0, -1);
    camForward.normalize();
    const camRight = new THREE.Vector3().crossVectors(camForward, new THREE.Vector3(0, 1, 0)).normalize();

    let dx = 0, dz = 0;
    if (keys["KeyW"] || keys["ArrowUp"])    dz += 1;
    if (keys["KeyS"] || keys["ArrowDown"])  dz -= 1;
    if (keys["KeyA"] || keys["ArrowLeft"])  dx -= 1;
    if (keys["KeyD"] || keys["ArrowRight"]) dx += 1;

    // Mobile virtual joystick overrides the keyboard while it's being held.
    // The stick stores screen-space offsets (-1..1), so screen-up is "forward"
    // and screen-right is "right" relative to the camera, mirroring WASD.
    const j = joystickRef?.current;
    if (j?.active) {
      dx = j.x;
      dz = -j.y;
    }

    const moveDir = new THREE.Vector3();
    moveDir.addScaledVector(camForward, dz);
    moveDir.addScaledVector(camRight, dx);
    const moving = moveDir.lengthSq() > 0.001;

    if (moving) {
      moveDir.normalize();
      const curX = group.current.position.x;
      const curZ = group.current.position.z;
      const stepX = moveDir.x * MOVE_SPEED * delta;
      const stepZ = moveDir.z * MOVE_SPEED * delta;

      // Axis-separated slide collision: try each axis independently so the
      // player slides along walls/fences instead of stopping dead.
      const nextX = curX + stepX;
      const nextZ = curZ + stepZ;
      if (!blockedAt(nextX, curZ, obstacles, PLAYER_RADIUS) &&
          !dogBlocksAt(nextX, curZ, PLAYER_RADIUS)) {
        group.current.position.x = THREE.MathUtils.clamp(nextX, -MAP_HALF_X, MAP_HALF_X);
      }
      if (!blockedAt(group.current.position.x, nextZ, obstacles, PLAYER_RADIUS) &&
          !dogBlocksAt(group.current.position.x, nextZ, PLAYER_RADIUS)) {
        group.current.position.z = THREE.MathUtils.clamp(nextZ, -MAP_HALF_Z, MAP_HALF_Z);
      }

      // Rotate to face movement direction (shortest-arc lerp around Y).
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      let diff = targetAngle - group.current.rotation.y;
      while (diff >  Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      group.current.rotation.y += diff * ROT_LERP;

      switchAction(runActionRef.current);
    } else {
      switchAction(idleActionRef.current);
    }

    // Snap Y to the bridge arch curve (or 0 on flat ground).
    const targetY = getBridgeY(group.current.position.x, group.current.position.z);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.25);

    syncState();
  });

  return (
    <group ref={group} dispose={null}>
      <group name="Root_Scene">
        <group name="RootNode">
          <group name="CharacterArmature" rotation={[-Math.PI / 2, 0, 0]} scale={140}>
            <primitive object={nodes.Root} />
          </group>
          <skinnedMesh
            name="Sam"
            geometry={nodes.Sam.geometry}
            material={materials.Atlas}
            skeleton={nodes.Sam.skeleton}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={140}
            castShadow
          />
        </group>
      </group>

      {/* Fixed-pixel-size label — no distanceFactor so the badge stays the same
          size on screen regardless of camera distance (otherwise it shrinks
          while the third-person camera lerps in from the default spawn). */}
      <Html position={[0, 2.5, 0]} center style={{ pointerEvents: "none" }}>
        <div className="you-label">YOU</div>
      </Html>
    </group>
  );
}

useGLTF.preload("/models/Characters.glb");

// ── Third-person follow camera ────────────────────────────────────────────
// Lerps the camera to a position BEHIND the player along the player's facing
// direction. The player's local forward is +Z (because we compute
// `targetAngle = atan2(moveDir.x, moveDir.z)`), so "behind" is the -Z axis in
// the player's local frame. Rotating local (0, height, -distance) by yaw
// around Y gives the desired world-space camera position.
const TP_DISTANCE = 10;
const TP_HEIGHT   = 6;
const TP_LOOK_Y   = 2.5;
const TP_POS_LERP = 0.12;

export function ThirdPersonCamera({ stateRef }) {
  useFrame((state) => {
    const s = stateRef?.current;
    if (!s) return;
    const { position: p, yaw } = s;
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    const desiredX = p.x - TP_DISTANCE * sin;
    const desiredZ = p.z - TP_DISTANCE * cos;
    const desiredY = p.y + TP_HEIGHT;
    state.camera.position.lerp(new THREE.Vector3(desiredX, desiredY, desiredZ), TP_POS_LERP);
    state.camera.lookAt(p.x, p.y + TP_LOOK_Y, p.z);
  });
  return null;
}
