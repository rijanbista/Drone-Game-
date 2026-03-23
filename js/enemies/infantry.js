import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createInfantry(x, z) {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3d4a35, roughness: 0.9, metalness: 0.1 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9, metalness: 0.1 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xbd9374, roughness: 0.6, metalness: 0.0 });
  const helmetMat = new THREE.MeshStandardMaterial({ color: 0x2d3a25, roughness: 0.8 });

  // Legs (slightly larger for visibility)
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.3), darkMat);
  leftLeg.position.set(-0.2, 0.5, 0);
  group.add(leftLeg);

  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.2;
  group.add(rightLeg);

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.3, 0.5), bodyMat);
  torso.position.y = 1.6;
  group.add(torso);

  // Arms
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.0, 0.25), bodyMat);
  leftArm.position.set(-0.55, 1.8, 0);
  group.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 0.55;
  group.add(rightArm);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), skinMat);
  head.position.y = 2.45;
  group.add(head);

  // Helmet
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), helmetMat);
  helmet.position.y = 2.5;
  group.add(helmet);

  // Weapon (visual only)
  const gun = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 1.2), darkMat);
  gun.position.set(0.4, 1.7, 0.6);
  group.add(gun);

  group.position.set(x, 0, z);
  group.scale.set(1.1, 1.1, 1.1); // Slightly scale up for visibility

  return {
    weakSpots: [{ offset: { x: 0, y: 2.5, z: 0 }, radius: 0.5, multiplier: 3 }],
    type: "infantry",
    mesh: group,
    health: 1,
    maxHealth: 1,
    speed: 3.2,
    attackRange: 45,
    damage: 3,
    scoreValue: 15,
    rewardValue: 20,
    alerted: false,
    visionRange: 55,
    isJammer: false,
    labelText: "INF",
    labelColor: "#33cc66",
    shootCooldown: 1.8,
    _legs: [leftLeg, rightLeg],
    _time: 0
  };
}