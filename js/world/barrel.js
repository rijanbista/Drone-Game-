import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createBarrel(x, z) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 1.1, 14),
    new THREE.MeshStandardMaterial({ color: 0x9b1c1c, roughness: 0.6, metalness: 0.4 })
  );
  body.position.y = 0.55;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const band1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.44, 0.44, 0.08, 14),
    new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.7 })
  );
  band1.position.y = 0.25;
  group.add(band1);

  const band2 = band1.clone();
  band2.position.y = 0.85;
  group.add(band2);

  group.position.set(x, 0, z);

  return {
    type: "barrel",
    mesh: group,
    x,
    z,
    halfW: 0.8,
    halfD: 0.8,
    explosive: true,
    exploded: false,
    hitRadius: 1.0,
    blastRadius: 8,
    damage: 4
  };
}