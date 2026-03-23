import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createCamp(x, z) {
  const group = new THREE.Group();

  const groundPatch = new THREE.Mesh(
    new THREE.CircleGeometry(9, 24),
    new THREE.MeshStandardMaterial({ color: 0x7a715f })
  );
  groundPatch.rotation.x = -Math.PI / 2;
  groundPatch.position.y = 0.03;
  group.add(groundPatch);

  const tentMat = new THREE.MeshStandardMaterial({ color: 0x6e7d4e, roughness: 0.9, metalness: 0.0 });
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x5a4630, roughness: 0.8, metalness: 0.1 });
  const crateMat = new THREE.MeshStandardMaterial({ color: 0x735833, roughness: 0.9, metalness: 0.0 });

  for (let i = 0; i < 2; i++) {
    const tent = new THREE.Mesh(
      new THREE.ConeGeometry(2.2, 2.4, 4),
      tentMat
    );
    tent.rotation.y = Math.PI / 4;
    tent.scale.set(1.2, 0.9, 1.8);
    tent.position.set(i === 0 ? -2.8 : 2.8, 1.2, -1.5 + i * 1.5);
    tent.castShadow = true;
    group.add(tent);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2.3, 8),
      poleMat
    );
    pole.position.copy(tent.position);
    pole.position.y = 1.15;
    group.add(pole);
  }

  for (let i = 0; i < 4; i++) {
    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      crateMat
    );
    crate.position.set(
      (Math.random() - 0.5) * 6,
      0.5,
      2 + (Math.random() - 0.5) * 3
    );
    crate.castShadow = true;
    crate.receiveShadow = true;
    group.add(crate);
  }

  const fireRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.9, 0.15, 14),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
  );
  fireRing.position.set(0, 0.08, 0.5);
  group.add(fireRing);

  group.position.set(x, 0, z);

  return {
    type: "camp",
    mesh: group,
    x,
    z,
    halfW: 9,
    halfD: 9
  };
}