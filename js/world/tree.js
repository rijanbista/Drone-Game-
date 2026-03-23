import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const trunkMat = new THREE.MeshStandardMaterial({ color: 0x422a14, roughness: 1.0, metalness: 0.0 });
const leafMat = new THREE.MeshStandardMaterial({ 
  color: 0x2e4a21, 
  roughness: 0.85, 
  metalness: 0.0,
  flatShading: true 
});

const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 3.5, 6);
const leafGeo = new THREE.IcosahedronGeometry(1, 0);

export function createTree(x, z) {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.75;
  trunk.castShadow = true;
  group.add(trunk);

  // More organic leaf structure using multiple spheres/cones
  for (let i = 0; i < 4; i++) {
    const size = 1.5 - i * 0.25;
    const leaves = new THREE.Mesh(leafGeo, leafMat);
    leaves.scale.set(size, size, size);
    leaves.position.y = 3 + i * 1.2;
    leaves.rotation.y = Math.random() * Math.PI;
    leaves.castShadow = true;
    group.add(leaves);
  }

  // Add some smaller branches/foliage clusters
  for (let i = 0; i < 5; i++) {
    const cluster = new THREE.Mesh(leafGeo, leafMat);
    cluster.scale.set(0.6, 0.6, 0.6);
    const angle = (i / 5) * Math.PI * 2;
    const dist = 0.8;
    cluster.position.set(Math.cos(angle) * dist, 3.5 + Math.random(), Math.sin(angle) * dist);
    cluster.castShadow = true;
    group.add(cluster);
  }

  group.position.set(x, 0, z);
  const scale = 0.8 + Math.random() * 0.4;
  group.scale.set(scale, scale, scale);

  return {
    type: "tree",
    mesh: group,
    x,
    z,
    halfW: 1.7,
    halfD: 1.7
  };
}