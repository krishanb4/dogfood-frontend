// Tree.tsx — Static GLB tree. Geometry/material are shared via useGLTF so
// rendering 50+ instances is cheap; each placement gets its own transform
// from the outer <group {...props}>.

import { useGLTF, Center } from "@react-three/drei";
import type { GroupProps } from "@react-three/fiber";

interface TreeProps extends GroupProps { scale?: number; }

export function Tree({ scale = 1, ...props }: TreeProps): JSX.Element {
  const { nodes, materials } = useGLTF("/models/Tree.glb");
  return (
    <group {...props} dispose={null}>
      <Center bottom>
        <group scale={scale}>
          <mesh geometry={(nodes["Node-Mesh"] as THREE.Mesh).geometry}   material={materials.mat9}  castShadow receiveShadow />
          <mesh geometry={(nodes["Node-Mesh_1"] as THREE.Mesh).geometry} material={materials.mat20} castShadow receiveShadow />
        </group>
      </Center>
    </group>
  );
}

import * as THREE from "three";

useGLTF.preload("/models/Tree.glb");
