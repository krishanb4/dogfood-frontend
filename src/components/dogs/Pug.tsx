// Pug.tsx — Pug GLB dog with Walk / Idle / Eating animations.

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

export function Pug({ isEating = false, level = 1, scale = 1, wallet }: DogBreedProps): JSX.Element {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/Pug.glb");
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);
  const { actions } = useAnimations(animations, group);

  useDogWander({ groupRef: group, actions, isEating, wallet });

  const levelScale = scale * (1 + Math.min(level, 10) * 0.04);

  return (
    <group ref={group} dispose={null} scale={levelScale}>
      <group name="Root_Scene">
        <group name="RootNode">
          <group name="AnimalArmature" rotation={[-Math.PI / 2, 0, 0]} scale={180}>
            <primitive object={nodes.Body} />
            <primitive object={nodes.IKBackLegL} />
            <primitive object={nodes.IKFrontLegL} />
            <primitive object={nodes.IKBackLegR} />
            <primitive object={nodes.IKFrontLegR} />
          </group>
          <skinnedMesh name="Pug" geometry={(nodes.Pug as THREE.SkinnedMesh).geometry} material={materials.Atlas} skeleton={(nodes.Pug as THREE.SkinnedMesh).skeleton} rotation={[-Math.PI / 2, 0, 0]} scale={100} castShadow />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/Pug.glb");
