// PalmTree.jsx — Static GLB palm tree (instance-friendly).
// gltfjsx-baked scale={100} on the inner mesh keeps the tree at its native
// design size; outer <group {...props}> can still apply per-instance scale.

import { useGLTF, Center } from "@react-three/drei";

export function PalmTree({ scale = 1, ...props }) {
  const { nodes, materials } = useGLTF("/models/PalmTree.glb");
  return (
    <group {...props} dispose={null}>
      <Center bottom>
        <group scale={scale}>
          <mesh
            geometry={nodes.Environment_PalmTree_3.geometry}
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
