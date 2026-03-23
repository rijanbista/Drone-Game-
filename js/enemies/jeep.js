import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createJeep(x, z) {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3f4a3f, roughness: 0.6, metalness: 0.3 });
  const detailMat = new THREE.MeshStandardMaterial({ color: 0x1b1f1b, roughness: 0.8, metalness: 0.2 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x7f8c99, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.7 });

  // main body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.7, 4.2),
    bodyMat
  );
  body.position.y = 0.6;
  group.add(body);

  // open top frame
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.6, 2.2),
    detailMat
  );
  frame.position.set(0, 1.1, 0.2);
  group.add(frame);

  // windshield
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.5, 0.1),
    glassMat
  );
  glass.position.set(0, 1.2, -0.9);
  glass.rotation.x = -0.3;
  group.add(glass);

  // back spare wheel
  const spare = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12),
    detailMat
  );
  spare.rotation.z = Math.PI / 2;
  spare.position.set(0, 0.8, 2.2);
  group.add(spare);

  // wheels
  const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.45, 12);

  const wheelPos = [
    [-1.2, 0.3, -1.4],
    [ 1.2, 0.3, -1.4],
    [-1.2, 0.3,  1.4],
    [ 1.2, 0.3,  1.4]
  ];

  wheelPos.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, detailMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    group.add(wheel);
  });

  group.position.set(x, 0, z);
  group.scale.set(1.3, 1.3, 1.3);

  return {
    type: "jeep",
    mesh: group,

    health: 4,
    maxHealth: 4,

    speed: 2.8,
    attackRange: 40,
    damage: 3,

    scoreValue: 15,
    rewardValue: 15,

    alerted: false,
    visionRange: 45,

    isJammer: false,
    labelText: "J",
    labelColor: "#ff8844",

    shootCooldown: 1.4
  };
}