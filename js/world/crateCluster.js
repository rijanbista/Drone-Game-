import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createCrateCluster(x, z) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: 0x735833, roughness: 0.9, metalness: 0.0 });

  const count = 3 + Math.floor(Math.random() * 3);

  for (let i = 0; i < count; i++) {
    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.1, 1.1),
      material
    );

    crate.position.set(
      (Math.random() - 0.5) * 3,
      0.55,
      (Math.random() - 0.5) * 3
    );

    crate.castShadow = true;
    crate.receiveShadow = true;
    group.add(crate);
  }

  group.position.set(x, 0, z);

  return {
    type: "crateCluster",
    mesh: group,
    x,
    z,
    halfW: 2.0,
    halfD: 2.0
  };
}