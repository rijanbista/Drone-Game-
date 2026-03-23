import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createEnemyBullet(scene, startPosition, targetPosition, damage = 5) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 10, 10),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x333333
    })
  );

  mesh.position.copy(startPosition);
  scene.add(mesh);

  const direction = targetPosition.clone().sub(startPosition).normalize();

  return {
    type: "enemyBullet",
    mesh,
    velocity: direction.multiplyScalar(24),
    life: 3,
    damage
  };
}