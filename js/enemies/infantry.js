import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createInfantry(x, z) {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3fa34d, roughness: 0.9, metalness: 0.1 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1f3d1f, roughness: 0.9, metalness: 0.1 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd8a47f, roughness: 0.6, metalness: 0.0 });

  // body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.2, 0.4),
    bodyMat
  );
  body.position.y = 0.9;
  group.add(body);

  // head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 10, 10),
    skinMat
  );
  head.position.y = 1.7;
  group.add(head);

  // arms
  const leftArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.8, 0.2),
    darkMat
  );
  leftArm.position.set(-0.45, 1.0, 0);
  group.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 0.45;
  group.add(rightArm);

  // legs
  const leftLeg = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.9, 0.25),
    darkMat
  );
  leftLeg.position.set(-0.18, 0.25, 0);
  group.add(leftLeg);

  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.18;
  group.add(rightLeg);

  group.position.set(x, 0, z);

  return {

    weakSpots: [
  { offset: { x: 0, y: 1.7, z: 0 }, radius: 0.4, multiplier: 2 }
],
    type: "infantry",
    mesh: group,

    health: 1,
    maxHealth: 1,

    speed: 2.4,
    attackRange: 28,
    damage: 2,

    scoreValue: 5,
    rewardValue: 5,

    alerted: false,
    visionRange: 30,

    isJammer: false,
    labelText: "I",
    labelColor: "#33cc66",

    shootCooldown: 1.5,

    // animation parts
    _legs: [leftLeg, rightLeg],
    _time: 0
  };
}