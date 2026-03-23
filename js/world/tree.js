import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createTree(x, z) {
  const group = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b3a1c, roughness: 0.95, metalness: 0.0 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x246128, roughness: 0.9, metalness: 0.0 });

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.32, 2.8, 8),
    trunkMat
  );
  trunk.position.y = 1.4;
  trunk.castShadow = true;
  group.add(trunk);

  const leaves1 = new THREE.Mesh(
    new THREE.ConeGeometry(1.6, 3.2, 10),
    leafMat
  );
  leaves1.position.y = 3.7;
  leaves1.castShadow = true;
  group.add(leaves1);

  const leaves2 = new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 2.4, 10),
    leafMat
  );
  leaves2.position.y = 5.0;
  leaves2.castShadow = true;
  group.add(leaves2);

  group.position.set(x, 0, z);

  return {
    type: "tree",
    mesh: group,
    x,
    z,
    halfW: 1.7,
    halfD: 1.7
  };
}