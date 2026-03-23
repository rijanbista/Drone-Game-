import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createBuilding(x, z) {
  const width = 12 + Math.random() * 15;
  const height = 10 + Math.random() * 15;
  const depth = 12 + Math.random() * 15;

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color: 0x5c5d5e, roughness: 0.8, metalness: 0.1 })
  );

  mesh.position.set(x, height / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return {
    type: "building",
    mesh,
    x,
    z,
    halfW: width / 2,
    halfD: depth / 2
  };
}