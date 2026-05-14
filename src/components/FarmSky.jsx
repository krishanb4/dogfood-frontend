// FarmSky.jsx — Sky dome with gradient + sun
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function FarmSky() {
  const cloudsRef = useRef();

  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.005;
    }
  });

  return (
    <group>
      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[200, 32, 32]} />
        <meshBasicMaterial
          color="#87CEEB"
          side={THREE.BackSide}
        />
      </mesh>

      {/* Sun */}
      <mesh position={[80, 120, -60]}>
        <sphereGeometry args={[8, 16, 16]} />
        <meshBasicMaterial color="#FFF9C4" />
      </mesh>
      {/* Sun glow */}
      <mesh position={[80, 120, -60]}>
        <sphereGeometry args={[14, 16, 16]} />
        <meshBasicMaterial color="#FFEB3B" transparent opacity={0.15} />
      </mesh>

      {/* Simple clouds */}
      <group ref={cloudsRef}>
        {[
          { pos: [40, 70, -30], scale: [12, 3, 6] },
          { pos: [-50, 65, 20], scale: [15, 3, 7] },
          { pos: [20, 75, 50], scale: [10, 2.5, 5] },
          { pos: [-30, 80, -40], scale: [18, 3.5, 8] },
          { pos: [60, 72, 40], scale: [14, 3, 6] },
        ].map((cloud, i) => (
          <mesh key={`cloud-${i}`} position={cloud.pos} scale={cloud.scale}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
