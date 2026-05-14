// Tree.jsx — Static GLB tree. Geometry/material are shared via useGLTF so
// rendering 50+ instances is cheap; each placement gets its own transform
// from the outer <group {...props}>.

import { useGLTF, Center } from "@react-three/drei";

export function Tree({ scale = 1, ...props }) {
  const { nodes, materials } = useGLTF("/models/Tree.glb");
  // Scale lives INSIDE <Center bottom> so drei's bbox math (world-space)
  // matches the inner local-space shift it applies. If scale were on the
  // outer group, Center under-/over-shifts by the scale factor and the
  // tree ends up floating below the ground.
  return (
    <group {...props} dispose={null}>
      <Center bottom>
        <group scale={scale}>
          <mesh geometry={nodes["Node-Mesh"].geometry}   material={materials.mat9}  castShadow receiveShadow />
          <mesh geometry={nodes["Node-Mesh_1"].geometry} material={materials.mat20} castShadow receiveShadow />
        </group>
      </Center>
    </group>
  );
}

useGLTF.preload("/models/Tree.glb");
