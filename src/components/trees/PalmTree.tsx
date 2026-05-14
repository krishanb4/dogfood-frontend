// PalmTree.tsx — Static GLB palm tree (instance-friendly).

import { useGLTF, Center } from "@react-three/drei";
import type { GroupProps } from "@react-three/fiber";
import * as THREE from "three";

interface TreeProps extends GroupProps { scale?: number; }

export function PalmTree({ scale = 1, ...props }: TreeProps): JSX.Element {
  const { nodes, materials } = useGLTF("/models/PalmTree.glb");
  return (
    <group {...props} dispose={null}>
      <Center bottom>
        <group scale={scale}>
          <mesh
            geometry={(nodes.Environment_PalmTree_3 as THREE.Mesh).geometry}
            material={materials.Atlas}
            scale={100}
            castShadow
            receiveShadow
          />
        </group>
      </Center>
    </group>
  );
}

useGLTF.preload("/models/PalmTree.glb");
