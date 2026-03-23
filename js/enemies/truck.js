import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createTruck(x, z) {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x6a5a43, roughness: 0.7, metalness: 0.3 });
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0x4e4232, roughness: 0.6, metalness: 0.3 });
  const detailMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.8, metalness: 0.4 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x7f8c99, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.7 });

  // cargo bed
  const bed = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 1.1, 5.8),
    bodyMat
  );
  bed.position.set(0, 0.8, 0.8);
  bed.castShadow = true;
  group.add(bed);

  // cabin
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 1.5, 2.0),
    cabinMat
  );
  cabin.position.set(0, 1.0, -2.1);
  cabin.castShadow = true;
  group.add(cabin);

  // roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.25, 1.6),
    cabinMat
  );
  roof.position.set(0, 1.85, -2.1);
  group.add(roof);

  // windshield
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.7, 0.08),
    glassMat
  );
  glass.position.set(0, 1.15, -3.05);
  glass.rotation.x = -0.15;
  group.add(glass);

  // front bumper
  const bumper = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.25, 0.2),
    detailMat
  );
  bumper.position.set(0, 0.45, -3.15);
  group.add(bumper);

  // side rails for cargo bed
  const railL = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.7, 5.2),
    cabinMat
  );
  railL.position.set(-1.45, 1.35, 0.85);
  group.add(railL);

  const railR = railL.clone();
  railR.position.x = 1.45;
  group.add(railR);

  // wheels
  const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 12);
  const wheelPositions = [
    [-1.55, 0.4, -2.2],
    [ 1.55, 0.4, -2.2],
    [-1.55, 0.4, -0.3],
    [ 1.55, 0.4, -0.3],
    [-1.55, 0.4,  2.1],
    [ 1.55, 0.4,  2.1]
  ];

  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, detailMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;
    group.add(wheel);
  });

  // headlights
  const lightGeo = new THREE.BoxGeometry(0.35, 0.16, 0.08);

  const lightL = new THREE.Mesh(
    lightGeo,
    new THREE.MeshStandardMaterial({ color: 0xf0e6b6 })
  );
  lightL.position.set(-0.75, 0.95, -3.08);
  group.add(lightL);

  const lightR = lightL.clone();
  lightR.position.x = 0.75;
  group.add(lightR);

  group.position.set(x, 0, z);
  group.scale.set(1.25, 1.25, 1.25);

  return {
    type: "truck",
    mesh: group,

    health: 4,
    maxHealth: 4,

    speed: 1.35,
    attackRange: 36,
    damage: 4,

    scoreValue: 18,
    rewardValue: 25,

    passengers: 3,
    bailThreshold: 2,
    hasDismounted: false,

    alerted: false,
    visionRange: 50,

    isJammer: false,
    labelText: "TR",
    labelColor: "#ff4444",

    hitRadius: 2.5,
    shootCooldown: 1.7
  };
}