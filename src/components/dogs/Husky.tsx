// Husky.tsx — Husky GLB dog with Walk / Idle / Eating animations.

import { useRef, useMemo } from "react";
import { useGraph } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { useDogWander } from "./dogWander";

interface DogBreedProps {
  isEating?: boolean;
  level?: number;
  scale?: number;
  wallet?: string;
}

export function Husky({ isEating = false, level = 1, scale = 1, wallet }: DogBreedProps): JSX.Element {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/Husky.glb");
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);
  const { actions } = useAnimations(animations, group);

  useDogWander({ groupRef: group, actions, isEating, wallet });

  const levelScale = scale * (1 + Math.min(level, 10) * 0.04);

  return (
    <group ref={group} dispose={null} scale={levelScale}>
      <group name="Root_Scene">
        <group name="RootNode">
          <group name="AnimalArmature" rotation={[-Math.PI / 2, 0, 0]} scale={50}>
            <primitive object={nodes.Body} />
            <primitive object={nodes.IKBackLegL} />
            <primitive object={nodes.IKFrontLegL} />
            <primitive object={nodes.IKBackLegR} />
            <primitive object={nodes.IKFrontLegR} />
          </group>
          <group name="Cube" position={[0, 0, 0.062]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <skinnedMesh name="Cube_1" geometry={(nodes.Cube_1 as THREE.SkinnedMesh).geometry} material={materials.Material}         skeleton={(nodes.Cube_1 as THREE.SkinnedMesh).skeleton} castShadow />
            <skinnedMesh name="Cube_2" geometry={(nodes.Cube_2 as THREE.SkinnedMesh).geometry} material={materials["Material.001"]} skeleton={(nodes.Cube_2 as THREE.SkinnedMesh).skeleton} castShadow />
            <skinnedMesh name="Cube_3" geometry={(nodes.Cube_3 as THREE.SkinnedMesh).geometry} material={materials["Material.006"]} skeleton={(nodes.Cube_3 as THREE.SkinnedMesh).skeleton} castShadow />
            <skinnedMesh name="Cube_4" geometry={(nodes.Cube_4 as THREE.SkinnedMesh).geometry} material={materials["Material.003"]} skeleton={(nodes.Cube_4 as THREE.SkinnedMesh).skeleton} castShadow />
            <skinnedMesh name="Cube_5" geometry={(nodes.Cube_5 as THREE.SkinnedMesh).geometry} material={materials["Material.002"]} skeleton={(nodes.Cube_5 as THREE.SkinnedMesh).skeleton} castShadow />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/Husky.glb");
