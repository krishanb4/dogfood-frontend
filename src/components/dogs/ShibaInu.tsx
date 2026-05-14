// ShibaInu.tsx — Shiba Inu GLB dog with Walk / Idle / Eating animations.

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

export function ShibaInu({ isEating = false, level = 1, scale = 1, wallet }: DogBreedProps): JSX.Element {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/ShibaInu.glb");
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
          <group name="ShibaInu" position={[0, 0, 0.062]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <skinnedMesh name="ShibaInu_1" geometry={(nodes.ShibaInu_1 as THREE.SkinnedMesh).geometry} material={materials.Main}        skeleton={(nodes.ShibaInu_1 as THREE.SkinnedMesh).skeleton} castShadow />
            <skinnedMesh name="ShibaInu_2" geometry={(nodes.ShibaInu_2 as THREE.SkinnedMesh).geometry} material={materials.Main_Light}  skeleton={(nodes.ShibaInu_2 as THREE.SkinnedMesh).skeleton} castShadow />
            <skinnedMesh name="ShibaInu_3" geometry={(nodes.ShibaInu_3 as THREE.SkinnedMesh).geometry} material={materials.Black}       skeleton={(nodes.ShibaInu_3 as THREE.SkinnedMesh).skeleton} castShadow />
            <skinnedMesh name="ShibaInu_4" geometry={(nodes.ShibaInu_4 as THREE.SkinnedMesh).geometry} material={materials.Eyes_White}  skeleton={(nodes.ShibaInu_4 as THREE.SkinnedMesh).skeleton} castShadow />
            <skinnedMesh name="ShibaInu_5" geometry={(nodes.ShibaInu_5 as THREE.SkinnedMesh).geometry} material={materials.Eyes_Pupil}  skeleton={(nodes.ShibaInu_5 as THREE.SkinnedMesh).skeleton} castShadow />
            <skinnedMesh name="ShibaInu_6" geometry={(nodes.ShibaInu_6 as THREE.SkinnedMesh).geometry} material={materials.Eyes_Black}  skeleton={(nodes.ShibaInu_6 as THREE.SkinnedMesh).skeleton} castShadow />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/ShibaInu.glb");
