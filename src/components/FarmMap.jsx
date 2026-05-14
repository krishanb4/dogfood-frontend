// FarmMap.jsx — Voxel islands connected by wooden arch bridges

import React, { useRef, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { BRIDGE_CX, BRIDGE_HALF, ARCH_PEAK, GAPS } from "../utils/bridgeUtils";

// ── Geometry constants ────────────────────────────────────────────────────
const BS      = 3;
const BLOCK_S = 2.82;
const PH      = BLOCK_S;

// ── Island z-extents ──────────────────────────────────────────────────────
const ISLANDS = {
  north:  { zMin: -117, zMax:  -44 },
  center: { zMin:  -33, zMax:   33 },
  south:  { zMin:   44, zMax:  117 },
};

// ── Arch bridge constants ─────────────────────────────────────────────────
const BRIDGE_W    = BRIDGE_HALF * 2 - 0.5;
const DECK_T      = 0.5;
const POST_H      = 1.8;
const RAIL_R      = 0.1;
const BRIDGE_SEGS = 14;

// ── Zone layout ───────────────────────────────────────────────────────────
const COL_BOUNDS = [
  [-87.5, -62.5], [-57.5, -32.5], [-27.5,  -2.5],
  [  2.5,  27.5], [ 32.5,  57.5], [ 62.5,  87.5],
];
const ISLAND_ZONES = {
  north:  ['forest',  'predict',  'predict',  'battle',   'battle',  'forest' ],
  center: ['plains',  'village',  'training', 'training', 'village', 'plains' ],
  south:  ['market',  'market',   'exchange', 'exchange', 'market',  'market' ],
};

// ── Zone labels ───────────────────────────────────────────────────────────
const LABELS = [
  { text: 'Prediction Forest', x: -30, z: -80 },
  { text: 'Battlefield',       x:  30, z: -80 },
  { text: 'Village',           x: -45, z:   0 },
  { text: 'Training Camp',     x:  15, z:   0 },
  { text: 'Exchange',          x:   0, z:  80 },
  { text: 'Market',            x: -60, z:  80 },
];

// ── Roads ─────────────────────────────────────────────────────────────────
const ROAD_XS = [-90, -60, -30, 0, 30, 60, 90];
const ROAD_ZS = [-117, -78, 0, 78, 117];
const RHW     = 2.5;

// ── Shop plaza positions (used to mask out detail scatter) ────────────────
const PLAZA_POS = [
  [0,0], [60,0], [-60,0], [0,78], [0,-78],
  [-60,78], [60,78], [-60,-78], [60,-78],
];
const PLAZA_R = 14;

function isRoad(x, z) {
  for (const rx of ROAD_XS) if (Math.abs(x - rx) < RHW) return true;
  for (const rz of ROAD_ZS) if (Math.abs(z - rz) < RHW) return true;
  return false;
}
function colIdx(x) {
  for (let i = 0; i < COL_BOUNDS.length; i++) {
    const [lo, hi] = COL_BOUNDS[i];
    if (x >= lo && x <= hi) return i;
  }
  return -1;
}
function islandId(z) {
  for (const [id, b] of Object.entries(ISLANDS)) {
    if (z >= b.zMin && z <= b.zMax) return id;
  }
  return null;
}
function seededRand(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function nearPlaza(x, z) {
  return PLAZA_POS.some(([px, pz]) => (x - px) ** 2 + (z - pz) ** 2 < PLAZA_R * PLAZA_R);
}

// ── Deterministic mini-RNG for canvas texture drawing ────────────────────
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ── Procedural ground textures ────────────────────────────────────────────
function createGroundTexture(type) {
  const SZ = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SZ;
  const ctx = canvas.getContext('2d');
  const rng = makeRng(type.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0));

  // Per-zone config: base color, variation swatches, feature flags
  const cfgs = {
    forest:   { base:'#3a5c1e', v:['#2e4a14','#48701e','#507c26','#263c10'], blades:true,  pebbles:false, rocky:false, packed:false },
    plains:   { base:'#4e7428', v:['#3a5818','#5e8830','#6a9438','#2e4014'], blades:true,  pebbles:true,  rocky:false, packed:false },
    village:  { base:'#5a8030', v:['#48682a','#6c9438','#78a040','#384e1c'], blades:true,  pebbles:true,  rocky:false, packed:false },
    training: { base:'#587a28', v:['#446018','#689030','#749838','#344214'], blades:true,  pebbles:true,  rocky:false, packed:false },
    predict:  { base:'#4a5e6e', v:['#384c5c','#586e80','#425870','#2e3e4e'], blades:false, pebbles:true,  rocky:true,  packed:false },
    battle:   { base:'#7e2040', v:['#641630','#982848','#70182e','#4c0e20'], blades:false, pebbles:true,  rocky:true,  packed:false },
    market:   { base:'#8a5628', v:['#6e4018','#a46830','#7c4c20','#52301a'], blades:false, pebbles:true,  rocky:false, packed:false },
    exchange: { base:'#a87828', v:['#886010','#c88e30','#9a6e1c','#664a10'], blades:false, pebbles:true,  rocky:false, packed:false },
    road:     { base:'#3a2818', v:['#2a1c10','#4a3420','#32221a','#1e1610'], blades:false, pebbles:false, rocky:false, packed:true  },
  };
  const cfg = cfgs[type] || cfgs.plains;

  // ── Base fill
  ctx.fillStyle = cfg.base;
  ctx.fillRect(0, 0, SZ, SZ);

  // ── Organic color blobs for natural variation
  for (let i = 0; i < 130; i++) {
    const x = rng() * SZ, y = rng() * SZ, r = 4 + rng() * 24;
    ctx.fillStyle = cfg.v[Math.floor(rng() * cfg.v.length)];
    ctx.globalAlpha = 0.22 + rng() * 0.48;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ── Grass blades (curved strokes)
  if (cfg.blades) {
    for (let i = 0; i < 90; i++) {
      const x = rng() * SZ, y = rng() * SZ;
      const h = 8 + rng() * 14, lean = (rng() - 0.5) * 12;
      ctx.strokeStyle = rng() > 0.55 ? '#1a3e0a' : '#2e5a12';
      ctx.lineWidth = 0.8 + rng() * 1.4;
      ctx.globalAlpha = 0.5 + rng() * 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + lean * 0.35, y - h * 0.5, x + lean, y - h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Tiny yellow/white flowers on village
    if (type === 'village') {
      for (let i = 0; i < 18; i++) {
        const x = rng() * SZ, y = rng() * SZ;
        ctx.fillStyle = rng() > 0.5 ? '#f0d040' : '#f8f8e8';
        ctx.globalAlpha = 0.75;
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // Autumn tinge on forest edges
    if (type === 'forest') {
      for (let i = 0; i < 12; i++) {
        const x = rng() * SZ, y = rng() * SZ;
        ctx.fillStyle = rng() > 0.5 ? '#8b4500' : '#a06010';
        ctx.globalAlpha = 0.25;
        ctx.beginPath(); ctx.arc(x, y, 2 + rng() * 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  // ── Pebbles / gravel stones
  if (cfg.pebbles) {
    for (let i = 0; i < 55; i++) {
      const x = rng() * SZ, y = rng() * SZ;
      const rx = 1.8 + rng() * 4.5, ry = rx * (0.5 + rng() * 0.5);
      const rot = rng() * Math.PI;
      ctx.fillStyle = rng() > 0.5 ? '#a09080' : '#c0b090';
      ctx.globalAlpha = 0.4 + rng() * 0.45;
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
      // highlight glint
      ctx.fillStyle = '#e8e0c8';
      ctx.globalAlpha = 0.3;
      ctx.beginPath(); ctx.ellipse(-rx * 0.25, -ry * 0.25, rx * 0.4, ry * 0.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // ── Rocky surface (predict / battle)
  if (cfg.rocky) {
    for (let i = 0; i < 20; i++) {
      const x = rng() * SZ, y = rng() * SZ;
      const w = 9 + rng() * 22, h = 6 + rng() * 16;
      ctx.fillStyle = rng() > 0.5 ? '#485868' : '#364856';
      ctx.globalAlpha = 0.42 + rng() * 0.42;
      ctx.save(); ctx.translate(x, y); ctx.rotate(rng() * Math.PI);
      ctx.beginPath(); ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6a7a8a'; ctx.globalAlpha = 0.28;
      ctx.beginPath(); ctx.ellipse(-w * 0.22, -h * 0.22, w * 0.48, h * 0.48, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // Crack lines
    for (let i = 0; i < 14; i++) {
      let cx = rng() * SZ, cy = rng() * SZ;
      ctx.strokeStyle = '#141e28'; ctx.lineWidth = 0.6 + rng(); ctx.globalAlpha = 0.3 + rng() * 0.3;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      for (let j = 0; j < 3; j++) { cx += (rng() - 0.5) * 32; cy += (rng() - 0.5) * 32; ctx.lineTo(cx, cy); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // ── Packed road dirt with compression lines + wheel ruts
  if (cfg.packed) {
    for (let i = 0; i < 32; i++) {
      const y = rng() * SZ;
      ctx.strokeStyle = rng() > 0.5 ? '#0a0602' : '#342010';
      ctx.lineWidth = 0.5 + rng() * 2;
      ctx.globalAlpha = 0.22 + rng() * 0.32;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SZ, y + (rng() - 0.5) * 14); ctx.stroke();
    }
    for (let i = 0; i < 5; i++) {
      const x = SZ * 0.15 + rng() * SZ * 0.7;
      ctx.strokeStyle = '#060402'; ctx.lineWidth = 1.5 + rng() * 2.5; ctx.globalAlpha = 0.28;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (rng() - 0.5) * 10, SZ); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  return tex;
}

// Create all textures once at module load
const ZONE_TYPES = ['forest','predict','battle','plains','village','training','market','exchange','road'];
const GROUND_TEX = Object.fromEntries(ZONE_TYPES.map(t => [t, createGroundTexture(t)]));

// ── Build island block groups (keyed by zone type for texture sharing) ────
function buildGroups() {
  const map = {};
  for (let xi = 0; xi < 60; xi++) {
    for (let zi = 0; zi < 78; zi++) {
      const x = -90  + xi * BS + BS * 0.5;
      const z = -117 + zi * BS + BS * 0.5;
      const isl = islandId(z);
      if (!isl) continue;

      let typeName;
      if (isRoad(x, z)) {
        typeName = 'road';
      } else {
        const ci = colIdx(x);
        typeName = ci === -1 ? 'road' : ISLAND_ZONES[isl][ci];
      }

      if (!map[typeName]) map[typeName] = { typeName, positions: [] };
      map[typeName].positions.push({ x, z });
    }
  }
  return Object.values(map);
}

// ── Textured block group ──────────────────────────────────────────────────
function BlockGroup({ typeName, positions, height = PH }) {
  const ref = useRef();
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    positions.forEach((p, i) => {
      dummy.position.set(p.x, -height * 0.5, p.z);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [positions, height]);
  return (
    <instancedMesh ref={ref} args={[null, null, positions.length]} receiveShadow castShadow>
      <boxGeometry args={[BLOCK_S, height, BLOCK_S]} />
      <meshStandardMaterial map={GROUND_TEX[typeName]} roughness={0.82} />
    </instancedMesh>
  );
}

// ── Scattered rocks ───────────────────────────────────────────────────────
// Instanced low-poly icosahedra, two color variants for natural variety
function ScatteredRocks() {
  const { light, dark } = useMemo(() => {
    const light = [], dark = [];
    for (let xi = 0; xi < 60; xi++) {
      for (let zi = 0; zi < 78; zi++) {
        const x = -90 + xi * BS + BS * 0.5;
        const z = -117 + zi * BS + BS * 0.5;
        if (!islandId(z) || isRoad(x, z) || nearPlaza(x, z)) continue;

        const r0 = seededRand(xi * 997 + zi * 443 + 7777);
        if (r0 > 0.09) continue;

        const ci = colIdx(x);
        const isl = islandId(z);
        const typeName = ci === -1 ? 'road' : ISLAND_ZONES[isl][ci];
        const isRockyZone = typeName === 'predict' || typeName === 'battle' || typeName === 'forest';

        const ox  = (seededRand(xi * 113 + zi * 223 + 1) - 0.5) * 2.2;
        const oz  = (seededRand(xi * 773 + zi * 557 + 2) - 0.5) * 2.2;
        const sc  = isRockyZone
          ? 0.28 + seededRand(xi * 331 + zi * 991 + 3) * 0.52
          : 0.12 + seededRand(xi * 331 + zi * 991 + 3) * 0.18;
        const sy  = sc * (0.45 + seededRand(xi * 221 + zi * 443 + 4) * 0.55);
        const ry  = seededRand(xi * 661 + zi * 771 + 5) * Math.PI * 2;
        const entry = { x: x + ox, z: z + oz, sc, sy, ry };

        if (seededRand(xi * 557 + zi * 313 + 6) > 0.5) light.push(entry);
        else dark.push(entry);
      }
    }
    return { light, dark };
  }, []);

  const lRef = useRef(), dRef = useRef();
  useEffect(() => {
    const dummy = new THREE.Object3D();
    [[lRef, light], [dRef, dark]].forEach(([ref, arr]) => {
      if (!ref.current) return;
      arr.forEach(({ x, z, sc, sy, ry }, i) => {
        dummy.position.set(x, sy * 0.5, z);
        dummy.rotation.set(0, ry, 0);
        dummy.scale.set(sc, sy, sc);
        dummy.updateMatrix();
        ref.current.setMatrixAt(i, dummy.matrix);
      });
      ref.current.instanceMatrix.needsUpdate = true;
    });
  }, [light, dark]);

  return (
    <group>
      <instancedMesh ref={lRef} args={[null, null, light.length]} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#828070" roughness={0.96} />
      </instancedMesh>
      <instancedMesh ref={dRef} args={[null, null, dark.length]} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#585a52" roughness={0.96} />
      </instancedMesh>
    </group>
  );
}

// ── Grass tufts ───────────────────────────────────────────────────────────
// Two sets of crossed instanced planes form small grass clumps
const GREEN_ZONES = new Set(['plains', 'village', 'training', 'forest']);

function GrassTufts() {
  const tufts = useMemo(() => {
    const arr = [];
    for (let xi = 0; xi < 60; xi++) {
      for (let zi = 0; zi < 78; zi++) {
        const x = -90 + xi * BS + BS * 0.5;
        const z = -117 + zi * BS + BS * 0.5;
        const isl = islandId(z);
        if (!isl || isRoad(x, z) || nearPlaza(x, z)) continue;

        const ci = colIdx(x);
        if (ci === -1) continue;
        const typeName = ISLAND_ZONES[isl][ci];
        if (!GREEN_ZONES.has(typeName)) continue;

        if (seededRand(xi * 557 + zi * 331 + 1234) > 0.18) continue;

        const count = 2 + Math.floor(seededRand(xi * 113 + zi * 227 + 99) * 3);
        for (let t = 0; t < count; t++) {
          const ox  = (seededRand(xi * 991 + zi * 447 + t * 173 + 10) - 0.5) * 2.6;
          const oz  = (seededRand(xi * 773 + zi * 661 + t * 337 + 20) - 0.5) * 2.6;
          const h   = 0.28 + seededRand(xi * 443 + zi * 881 + t * 119 + 30) * 0.38;
          const ry  = seededRand(xi * 221 + zi * 773 + t * 557 + 40) * Math.PI;
          const dark = seededRand(xi * 667 + zi * 991 + t * 211 + 50) > 0.5;
          arr.push({ x: x + ox, z: z + oz, h, ry, dark });
        }
      }
    }
    return arr;
  }, []);

  const refA = useRef(), refB = useRef();
  useEffect(() => {
    const dummy = new THREE.Object3D();
    [[refA, 0], [refB, Math.PI * 0.5]].forEach(([ref, extra]) => {
      if (!ref.current) return;
      tufts.forEach(({ x, z, h, ry }, i) => {
        dummy.position.set(x, h * 0.5, z);
        dummy.rotation.set(0, ry + extra, 0);
        dummy.scale.set(0.38, h, 1);
        dummy.updateMatrix();
        ref.current.setMatrixAt(i, dummy.matrix);
      });
      ref.current.instanceMatrix.needsUpdate = true;
    });
  }, [tufts]);

  return (
    <group>
      <instancedMesh ref={refA} args={[null, null, tufts.length]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#2e6a10" side={THREE.DoubleSide} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={refB} args={[null, null, tufts.length]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#3a7818" side={THREE.DoubleSide} roughness={0.9} />
      </instancedMesh>
    </group>
  );
}

// ── Single wooden arch bridge ─────────────────────────────────────────────
function SingleBridge({ bx, gap }) {
  const { zMin, zMax } = gap;
  const zLen  = zMax - zMin;
  const halfW = BRIDGE_W / 2;
  const segLen = zLen / BRIDGE_SEGS;

  const { railGeoL, railGeoR, segments } = useMemo(() => {
    const segments = [];
    const railPtsL = [];
    const railPtsR = [];

    for (let s = 0; s <= BRIDGE_SEGS; s++) {
      const t    = s / BRIDGE_SEGS;
      const z    = zMin + t * zLen;
      const y    = ARCH_PEAK * 4 * t * (1 - t);
      const dydt = ARCH_PEAK * 4 * (1 - 2 * t);
      const tilt = -Math.atan2(dydt, zLen);

      segments.push({ z, y, tilt });
      railPtsL.push(new THREE.Vector3(bx - halfW, y + POST_H, z));
      railPtsR.push(new THREE.Vector3(bx + halfW, y + POST_H, z));
    }

    const railGeoL = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPtsL), 32, RAIL_R, 6, false);
    const railGeoR = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPtsR), 32, RAIL_R, 6, false);

    return { railGeoL, railGeoR, segments };
  }, [bx, zMin, zMax, zLen, halfW]);

  useEffect(() => () => { railGeoL.dispose(); railGeoR.dispose(); }, [railGeoL, railGeoR]);

  return (
    <group>
      {segments.map(({ z, y, tilt }, i) => (
        <mesh key={`d${i}`} position={[bx, y, z]} rotation={[tilt, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[BRIDGE_W, DECK_T, segLen * 1.05]} />
          <meshStandardMaterial color="#A07840" roughness={0.85} />
        </mesh>
      ))}

      {segments.map(({ z, y }, i) => (
        <group key={`p${i}`}>
          <mesh position={[bx - halfW, y + POST_H / 2, z]} castShadow>
            <boxGeometry args={[0.22, POST_H, 0.22]} />
            <meshStandardMaterial color="#7A5230" roughness={0.7} />
          </mesh>
          <mesh position={[bx + halfW, y + POST_H / 2, z]} castShadow>
            <boxGeometry args={[0.22, POST_H, 0.22]} />
            <meshStandardMaterial color="#7A5230" roughness={0.7} />
          </mesh>
        </group>
      ))}

      <mesh geometry={railGeoL} castShadow>
        <meshStandardMaterial color="#C8964A" roughness={0.55} />
      </mesh>
      <mesh geometry={railGeoR} castShadow>
        <meshStandardMaterial color="#C8964A" roughness={0.55} />
      </mesh>

      {[zMin, zMax].flatMap(gz =>
        [bx - halfW, bx + halfW].map(gx => (
          <mesh key={`f${gz}${gx}`} position={[gx, POST_H + 0.3, gz]} castShadow>
            <sphereGeometry args={[0.32, 8, 8]} />
            <meshStandardMaterial color="#D4A84B" roughness={0.4} metalness={0.25} />
          </mesh>
        ))
      )}
    </group>
  );
}

// ── Arch bridges ──────────────────────────────────────────────────────────
function ArchBridges() {
  return (
    <group>
      {GAPS.flatMap((gap, gi) =>
        BRIDGE_CX.map((bx, bi) => (
          <SingleBridge key={`${gi}-${bi}`} bx={bx} gap={gap} />
        ))
      )}
    </group>
  );
}

// ── Main map ──────────────────────────────────────────────────────────────
export function FarmMap({ onLoaded, onShopClick }) {
  const groups = useMemo(buildGroups, []);
  useEffect(() => { if (onLoaded) onLoaded(); }, []);

  return (
    <group>
      {/* Soil base planes — show as earth between block gaps */}
      {[
        { cz: (-117 + -44) / 2, len: 73 },
        { cz: 0,                len: 66 },
        { cz: ( 44 + 117) / 2, len: 73 },
      ].map((p, i) => (
        <mesh key={`base-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, p.cz]}>
          <planeGeometry args={[180, p.len]} />
          <meshStandardMaterial color="#4a3020" roughness={1} />
        </mesh>
      ))}

      {/* Textured island voxel blocks */}
      {groups.map((g, i) => (
        <BlockGroup key={i} typeName={g.typeName} positions={g.positions} />
      ))}

      {/* Ground detail: rocks + grass */}
      <ScatteredRocks />
      <GrassTufts />

      {/* Wooden arch bridges */}
      <ArchBridges />

      {/* Zone labels */}
      {LABELS.map(({ text, x, z }) => (
        <Text
          key={text}
          position={[x, PH * 0.5 + 5, z]}
          fontSize={3.5}
          color="#ffffff"
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.25}
          outlineColor="rgba(0,0,0,0.8)"
          renderOrder={10}
        >
          {text}
        </Text>
      ))}

      {/* Shop plazas */}
      {[
        { id:  1, x:   0, z:    0 }, { id:  2, x:  60, z:   0 }, { id:  3, x: -60, z:   0 },
        { id:  6, x:   0, z:   78 }, { id:  7, x:   0, z: -78 },
        { id:  9, x: -60, z:   78 }, { id: 10, x:  60, z:  78 },
        { id: 13, x: -60, z:  -78 }, { id: 14, x:  60, z: -78 },
      ].map(junc => (
        <group key={`junc-${junc.id}`} position={[junc.x, 0, junc.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
            <circleGeometry args={[12, 48]} />
            <meshStandardMaterial color="#8B7355" roughness={1} />
          </mesh>
          <CenterBarn onShopClick={onShopClick} />
        </group>
      ))}

      <MapFence width={180} length={234} />
    </group>
  );
}

// ── Perimeter fence ───────────────────────────────────────────────────────
function MapFence({ width, length }) {
  const pH = 1.6, spacing = 0.6;
  const cW = Math.floor(width / spacing);
  const cL = Math.floor(length / spacing);
  const total = (cW + cL) * 2;

  const mats = useMemo(() => {
    const arr = [], dummy = new THREE.Object3D();
    const line = (sx, sz, dx, dz, n, a) => {
      for (let i = 0; i < n; i++) {
        const t = i / n;
        dummy.position.set(sx + dx * t, 0, sz + dz * t);
        dummy.rotation.set(0, a, 0);
        dummy.updateMatrix();
        arr.push(dummy.matrix.clone());
      }
    };
    line(-width/2, -length/2,  width,       0, cW,  Math.PI/2);
    line( width/2,  length/2, -width,       0, cW, -Math.PI/2);
    line(-width/2,  length/2,      0, -length, cL,  0);
    line( width/2, -length/2,      0,  length, cL,  Math.PI);
    return arr;
  }, [width, length, cW, cL]);

  const pRef = useRef(), tRef = useRef();
  useEffect(() => {
    if (!pRef.current || !tRef.current) return;
    mats.forEach((mat, i) => {
      const pM = mat.clone();
      pM.multiply(new THREE.Matrix4().makeTranslation(0, pH / 2, 0));
      pRef.current.setMatrixAt(i, pM);
      const tM = mat.clone();
      tM.multiply(new THREE.Matrix4().makeTranslation(0, pH + 0.12, 0));
      tM.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 4));
      tRef.current.setMatrixAt(i, tM);
    });
    pRef.current.instanceMatrix.needsUpdate = true;
    tRef.current.instanceMatrix.needsUpdate = true;
  }, [mats]);

  const rails = [
    { pos:[0,0,-length/2], rot:[0,Math.PI/2,0], len:width  },
    { pos:[0,0, length/2], rot:[0,Math.PI/2,0], len:width  },
    { pos:[-width/2,0,0],  rot:[0,0,0],          len:length },
    { pos:[ width/2,0,0],  rot:[0,0,0],          len:length },
  ];
  return (
    <group>
      <instancedMesh ref={pRef} args={[null, null, total]} castShadow>
        <boxGeometry args={[0.3, pH, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={tRef} args={[null, null, total]} castShadow>
        <boxGeometry args={[0.2, 0.2, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </instancedMesh>
      {rails.map((r, i) => (
        <group key={i} position={r.pos} rotation={r.rot}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[0.06, 0.12, r.len]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.1, 0]} castShadow>
            <boxGeometry args={[0.06, 0.12, r.len]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── Shop barn ─────────────────────────────────────────────────────────────
function CenterBarn({ onShopClick }) {
  const [hovered, setHovered] = useState(false);
  const interact = {
    onClick:       (e) => { e.stopPropagation(); if (onShopClick) onShopClick(); },
    onPointerOver: ()  => { document.body.style.cursor = 'pointer'; setHovered(true);  },
    onPointerOut:  ()  => { document.body.style.cursor = 'auto';    setHovered(false); },
  };
  const sides = [
    { pos:[0,0,2.51],   cp:[0,0,2.56],   sp:[0,3.2,2.52],   sr:[0,0,0],          da:[2,2.4,0.1], cv:[0.15,2,0.05], ch:[1.6,0.15,0.05] },
    { pos:[0,0,-2.51],  cp:[0,0,-2.56],  sp:[0,3.2,-2.52],  sr:[0,Math.PI,0],    da:[2,2.4,0.1], cv:[0.15,2,0.05], ch:[1.6,0.15,0.05] },
    { pos:[3.01,0,0],   cp:[3.06,0,0],   sp:[3.02,3.2,0],   sr:[0,Math.PI/2,0],  da:[0.1,2.4,2], cv:[0.05,2,0.15], ch:[0.05,0.15,1.6] },
    { pos:[-3.01,0,0],  cp:[-3.06,0,0],  sp:[-3.02,3.2,0],  sr:[0,-Math.PI/2,0], da:[0.1,2.4,2], cv:[0.05,2,0.15], ch:[0.05,0.15,1.6] },
  ];
  return (
    <group>
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[6, 4, 5]} />
        <meshStandardMaterial color="#C62828" roughness={0.7} />
      </mesh>
      <mesh position={[0, 5.3, 0]} rotation={[0, Math.PI/4, 0]} castShadow>
        <coneGeometry args={[4.5, 2.5, 4]} />
        <meshStandardMaterial color="#5D4037" roughness={0.8} />
      </mesh>
      {sides.map((s, i) => (
        <group key={i}>
          <mesh position={[s.pos[0], 1.2+s.pos[1], s.pos[2]]}>
            <boxGeometry args={s.da} /><meshStandardMaterial color="#3E2723" roughness={0.9} />
          </mesh>
          <mesh position={[s.cp[0], 1.2+s.cp[1], s.cp[2]]}>
            <boxGeometry args={s.cv} /><meshStandardMaterial color="#5D4037" />
          </mesh>
          <mesh position={[s.cp[0], 1.2+s.cp[1], s.cp[2]]}>
            <boxGeometry args={s.ch} /><meshStandardMaterial color="#5D4037" />
          </mesh>
          <group position={s.sp} rotation={s.sr}>
            <mesh {...interact} scale={hovered ? 1.05 : 1}>
              <boxGeometry args={[3.8, 0.8, 0.05]} />
              <meshStandardMaterial color={hovered ? "#FFF3E0" : "#FFF8E1"} roughness={0.5} />
            </mesh>
            <Text position={[0,0,0.03]} fontSize={0.35} color="#D84315" fontWeight="bold"
              anchorX="center" anchorY="middle" scale={hovered ? 1.05 : 1}>
              DOG FOOD SHOP
            </Text>
          </group>
        </group>
      ))}
    </group>
  );
}
