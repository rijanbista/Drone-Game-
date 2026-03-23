import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createPlayerBullet(scene, startPosition, targetPosition, type = "small", isAlly = false) {
  let color = 0xffcc33;
  let damage = isAlly ? 0.6 : 1;
  let speed = 60;
  let blastRadius = 2.2;
  let size = isAlly ? 0.26 : 0.4;
  let emissive = color;

  if (type === "big") {
    color = 0xff8844;
    emissive = 0xaa4411;
    damage = isAlly ? 1.5 : 3;
    speed = 45;
    blastRadius = 4;
    size = isAlly ? 0.3 : 0.5;
  }

  if (type === "nuke") {
    color = 0xff2222;
    emissive = 0xaa0000;
    damage = isAlly ? 4 : 10;
    speed = 35;
    blastRadius = 10;
    size = isAlly ? 0.45 : 0.7;
  }

  if (isAlly) {
    color = 0x55d8ff;
    emissive = 0x1b8db5;
    speed = 52;
    blastRadius = 1.8;
    size = 0.24;
  }

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(size, 10, 10),
    new THREE.MeshStandardMaterial({
      color,
      emissive
    })
  );

  mesh.position.copy(startPosition);
  mesh.castShadow = true;
  scene.add(mesh);

  return {
    mesh,
    target: targetPosition.clone(),
    speed,
    damage,
    blastRadius,
    type,
    isAlly
  };
}