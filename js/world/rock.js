import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createRock(x, z) {
  const mesh = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.9 + Math.random() * 0.6),
    new THREE.MeshStandardMaterial({ color: 0x666b69, roughness: 0.9, metalness: 0.2 })
  );

  mesh.position.set(x, 0.7, z);
  mesh.scale.set(1.2, 0.8, 1.0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return {
    type: "rock",
    mesh,
    x,
    z,
    halfW: 1.4,
    halfD: 1.4
  };
}