// DogHouse.jsx — Dog House with white picket fence + dog
// Matches the reference: house with triangular roof, white picket fence, green grass patch
import { Suspense, useRef, useState } from "react";
import { Html, Text } from "@react-three/drei";
import * as THREE from "three";
import { Dog } from "./Dog";

export function DogHouse({ position, rotation = [0, 0, 0], player, isEating, onInventoryClick }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* ── Green grass patch (base platform) ─────────────────── */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#66BB6A" roughness={0.9} />
      </mesh>
      {/* Grass edge (slight elevation) */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[10, 0.1, 10]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.9} />
      </mesh>

      {/* ── Dog House structure ────────────────────────────────── */}
      <group position={[0, 0.1, -1.5]}>
        {/* Base walls */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[3, 2.2, 2.8]} />
          <meshStandardMaterial color="#D7A86E" roughness={0.7} />
        </mesh>

        {/* Front face (darker trim) */}
        <mesh position={[0, 1.1, 1.41]}>
          <boxGeometry args={[3.05, 2.25, 0.05]} />
          <meshStandardMaterial color="#8B6914" roughness={0.7} />
        </mesh>

        {/* Door opening */}
        <mesh position={[0, 0.7, 1.43]}>
          <circleGeometry args={[0.6, 16, 0, Math.PI * 2]} />
          <meshStandardMaterial color="#3E2723" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.25, 1.43]}>
          <boxGeometry args={[1.2, 0.9, 0.05]} />
          <meshStandardMaterial color="#3E2723" />
        </mesh>

        {/* Roof */}
        <group position={[0, 2.2, 0]}>
          {/* Left roof panel */}
          <mesh position={[-0.9, 0.5, 0]} rotation={[0, 0, 0.55]} castShadow>
            <boxGeometry args={[2, 0.15, 3.2]} />
            <meshStandardMaterial color="#78909C" roughness={0.6} />
          </mesh>
          {/* Right roof panel */}
          <mesh position={[0.9, 0.5, 0]} rotation={[0, 0, -0.55]} castShadow>
            <boxGeometry args={[2, 0.15, 3.2]} />
            <meshStandardMaterial color="#78909C" roughness={0.6} />
          </mesh>
          {/* Roof ridge */}
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[0.3, 0.2, 3.3]} />
            <meshStandardMaterial color="#607D8B" roughness={0.5} />
          </mesh>
        </group>

        {/* Chimney */}
        <mesh position={[0.8, 3.2, -0.5]} castShadow>
          <boxGeometry args={[0.5, 0.8, 0.5]} />
          <meshStandardMaterial color="#90A4AE" roughness={0.6} />
        </mesh>
        {/* Chimney top */}
        <mesh position={[0.8, 3.65, -0.5]}>
          <boxGeometry args={[0.65, 0.12, 0.65]} />
          <meshStandardMaterial color="#78909C" roughness={0.5} />
        </mesh>

        {/* ── Inventory Sign (Only for self) ────────────────────── */}
        {player.isSelf && (
          <group position={[0, 1.7, 1.42]} rotation={[0, 0, 0]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                if (onInventoryClick) onInventoryClick();
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
                setHovered(true);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'auto';
                setHovered(false);
              }}
              scale={hovered ? 1.05 : 1}
            >
              <boxGeometry args={[1.8, 0.6, 0.1]} />
              <meshStandardMaterial color={hovered ? "#4CAF50" : "#2E7D32"} roughness={0.6} />
            </mesh>
            <Text
              position={[0, 0, 0.06]}
              fontSize={0.25}
              color="#FFFFFF"
              fontWeight="bold"
              anchorX="center"
              anchorY="middle"
              scale={hovered ? 1.05 : 1}
              pointerEvents="none"
            >
              INVENTORY
            </Text>
          </group>
        )}
      </group>

      {/* ── White picket fence ─────────────────────────────────── */}
      <PicketFence />

      {/* ── Dog model ─────────────────────────────────────────── */}
      {/* No position prop — the breed component wanders inside the fence
          on its own (see useDogWander). */}
      <Suspense fallback={null}>
        <Dog
          breed={player.dog}
          level={player.level}
          isEating={isEating}
          wallet={player.wallet}
        />
      </Suspense>

      {/* ── Player name label ─────────────────────────────────── */}
      <Html position={[0, 5, 0]} center distanceFactor={25} style={{ pointerEvents: "none" }}>
        <div className="player-label">
          {player.isSelf ? "⭐ " : ""}
          {player.username}
          {player.contribution > 0 && (
            <span style={{ color: "#F7B718", marginLeft: 6 }}>
              🪙{player.contribution}
            </span>
          )}
        </div>
      </Html>

      {/* ── Food bowl (in front of dog house) ─────────────────── */}
      <FoodBowl position={[1.5, 0.1, 2.5]} />
    </group>
  );
}

// ── White picket fence (4 sides around house) ─────────────────────────────
function PicketFence() {
  const fenceWidth = 9.5;
  const fenceDepth = 9.5;
  const picketHeight = 1.6;
  const picketWidth = 0.3;

  function FenceSegment({ start, end, isGate = false }) {
    const dx = end[0] - start[0];
    const dz = end[1] - start[1];
    const length = Math.sqrt(dx * dx + dz * dz);
    const count = Math.floor(length / 0.6);
    const angle = Math.atan2(dx, dz);

    const pickets = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      // Skip gate area (center of front fence)
      if (isGate && t > 0.35 && t < 0.65) continue;
      const x = start[0] + dx * t;
      const z = start[1] + dz * t;
      pickets.push(
        <group key={i} position={[x, 0, z]} rotation={[0, angle, 0]}>
          {/* Picket */}
          <mesh position={[0, picketHeight / 2, 0]} castShadow>
            <boxGeometry args={[picketWidth, picketHeight, 0.08]} />
            <meshStandardMaterial color="#FAFAFA" roughness={0.6} />
          </mesh>
          {/* Pointed top */}
          <mesh position={[0, picketHeight + 0.12, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
            <boxGeometry args={[0.2, 0.2, 0.08]} />
            <meshStandardMaterial color="#FAFAFA" roughness={0.6} />
          </mesh>
        </group>
      );
    }

    // Render a single horizontal rail span between parametric points
    // tStart..tEnd along this fence segment. Used so the gate segment can
    // skip the rails across the doorway (otherwise the bars block the
    // visual opening even though collision already lets us walk past it).
    function rail(tStart, tEnd, y, key) {
      const segLen = (tEnd - tStart) * length;
      const tMid = (tStart + tEnd) / 2;
      const midX = start[0] + dx * tMid;
      const midZ = start[1] + dz * tMid;
      return (
        <mesh key={key} position={[midX, y, midZ]} rotation={[0, angle, 0]}>
          <boxGeometry args={[0.06, 0.12, segLen]} />
          <meshStandardMaterial color="#E0E0E0" roughness={0.5} />
        </mesh>
      );
    }

    const rails = isGate
      ? [
          rail(0, 0.35, 0.4, "lo-l"),
          rail(0.65, 1, 0.4, "lo-r"),
          rail(0, 0.35, 1.1, "hi-l"),
          rail(0.65, 1, 1.1, "hi-r"),
        ]
      : [rail(0, 1, 0.4, "lo"), rail(0, 1, 1.1, "hi")];

    return (
      <group>
        {pickets}
        <group>{rails}</group>
      </group>
    );
  }

  const hw = fenceWidth / 2;
  const hd = fenceDepth / 2;

  return (
    <group position={[0, 0, 0]}>
      {/* Front (with gate opening) */}
      <FenceSegment start={[-hw, hd]} end={[hw, hd]} isGate />
      {/* Back */}
      <FenceSegment start={[-hw, -hd]} end={[hw, -hd]} />
      {/* Left */}
      <FenceSegment start={[-hw, -hd]} end={[-hw, hd]} />
      {/* Right */}
      <FenceSegment start={[hw, -hd]} end={[hw, hd]} />
    </group>
  );
}

// ── Food bowl ─────────────────────────────────────────────────────────────
function FoodBowl({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.3, 0.3, 16]} />
        <meshStandardMaterial color="#795548" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Food inside */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.05, 16]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.9} />
      </mesh>
    </group>
  );
}
