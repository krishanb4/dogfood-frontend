// FallTree.jsx — Autumn-colour static GLB tree (instance-friendly).

import { useGLTF, Center } from "@react-three/drei";

export function FallTree({ scale = 1, ...props }) {
  const { nodes, materials } = useGLTF("/models/FallTree.glb");
  return (
    <group {...props} dispose={null}>
      <Center bottom>
        <group scale={scale}>
          <mesh geometry={nodes["Node-Mesh"].geometry}   material={materials.mat20} castShadow receiveShadow />
          <mesh geometry={nodes["Node-Mesh_1"].geometry} material={materials.mat13} castShadow receiveShadow />
        </group>
      </Center>
    </group>
  );
}

useGLTF.preload("/models/FallTree.glb");
