import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const rockGeometry = new THREE.DodecahedronGeometry(1);
const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x666b69, roughness: 0.9, metalness: 0.2 });

export function createRock(x, z) {
  const mesh = new THREE.Mesh(rockGeometry, rockMaterial);
  const size = 0.9 + Math.random() * 0.6;
  mesh.scale.set(size * 1.2, size * 0.8, size * 1.0);
  mesh.rotation.set(Math.random(), Math.random(), Math.random());
  
  mesh.position.set(x, size * 0.4, z);
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