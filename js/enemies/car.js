import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createCar(x, z) {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.3, metalness: 0.6 });
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0x2f343a, roughness: 0.5, metalness: 0.4 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, metalness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x7f8c99, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.7 });

  // main body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.75, 5.1),
    bodyMat
  );
  body.position.y = 0.55;
  body.castShadow = true;
  group.add(body);

  // front hood
  const hood = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.35, 1.3),
    bodyMat
  );
  hood.position.set(0, 0.93, -1.45);
  hood.castShadow = true;
  group.add(hood);

  // rear boot
  const rear = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.3, 1.0),
    bodyMat
  );
  rear.position.set(0, 0.88, 1.65);
  rear.castShadow = true;
  group.add(rear);

  // cabin lower
  const cabinBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.7, 2.0),
    cabinMat
  );
  cabinBase.position.set(0, 1.1, 0.1);
  cabinBase.castShadow = true;
  group.add(cabinBase);

  // cabin top / windshield area
  const cabinTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.4, 1.5),
    glassMat
  );
  cabinTop.position.set(0, 1.5, 0.15);
  cabinTop.castShadow = true;
  group.add(cabinTop);

  // wheels
  const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.45, 12);
  const wheelPositions = [
    [-1.25, 0.32, -1.55],
    [ 1.25, 0.32, -1.55],
    [-1.25, 0.32,  1.55],
    [ 1.25, 0.32,  1.55]
  ];

  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;
    group.add(wheel);
  });

  // headlights
  const lightGeo = new THREE.BoxGeometry(0.35, 0.14, 0.08);

  const lightL = new THREE.Mesh(lightGeo, new THREE.MeshStandardMaterial({ color: 0xf0e6b6 }));
  lightL.position.set(-0.7, 0.68, -2.58);
  group.add(lightL);

  const lightR = lightL.clone();
  lightR.position.x = 0.7;
  group.add(lightR);

  // taillights
  const tailGeo = new THREE.BoxGeometry(0.3, 0.12, 0.08);

  const tailL = new THREE.Mesh(tailGeo, new THREE.MeshStandardMaterial({ color: 0xaa2222 }));
  tailL.position.set(-0.7, 0.68, 2.58);
  group.add(tailL);

  const tailR = tailL.clone();
  tailR.position.x = 0.7;
  group.add(tailR);

  group.position.set(x, 0, z);

  return {
    type: "car",
    mesh: group,

    health: 3,
    maxHealth: 3,

    speed: 2.2,
    attackRange: 35,
    damage: 3,

    scoreValue: 10,
    rewardValue: 10,

    passengers: 2,
    bailThreshold: 1,
    hasDismounted: false,

    alerted: false,
    visionRange: 40,

    isJammer: false,
    labelText: "C",
    labelColor: "#ff4444",

    hitRadius: 2.2,
    shootCooldown: 1.6
  };
}