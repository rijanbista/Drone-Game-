import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createTank(x, z) {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4b5a3f, roughness: 0.8, metalness: 0.5 });
  const turretMat = new THREE.MeshStandardMaterial({ color: 0x394731, roughness: 0.7, metalness: 0.6 });
  const detailMat = new THREE.MeshStandardMaterial({ color: 0x1c2218, roughness: 0.9, metalness: 0.3 });

  // main hull
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 1.0, 6.2),
    bodyMat
  );
  hull.position.y = 0.75;
  hull.castShadow = true;
  group.add(hull);

  // upper hull
  const upperHull = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 0.7, 3.4),
    turretMat
  );
  upperHull.position.set(0, 1.25, 0.4);
  upperHull.castShadow = true;
  group.add(upperHull);

  // turret
  const turret = new THREE.Mesh(
    new THREE.CylinderGeometry(1.0, 1.15, 0.6, 14),
    turretMat
  );
  turret.position.set(0, 1.55, -0.1);
  turret.castShadow = true;
  group.add(turret);

  // barrel
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 3.2, 10),
    detailMat
  );
  barrel.rotation.z = Math.PI / 2;
  barrel.position.set(0, 1.58, -2.0);
  barrel.castShadow = true;
  group.add(barrel);

  // barrel tip
  const barrelTip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.35, 10),
    detailMat
  );
  barrelTip.rotation.z = Math.PI / 2;
  barrelTip.position.set(0, 1.58, -3.6);
  group.add(barrelTip);

  // side tracks
  const trackGeo = new THREE.BoxGeometry(0.55, 0.7, 6.4);

  const leftTrack = new THREE.Mesh(trackGeo, detailMat);
  leftTrack.position.set(-1.9, 0.48, 0);
  leftTrack.castShadow = true;
  group.add(leftTrack);

  const rightTrack = leftTrack.clone();
  rightTrack.position.x = 1.9;
  group.add(rightTrack);

  // road wheels
  const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 10);
  const wheelZ = [-2.2, -1.1, 0, 1.1, 2.2];

  wheelZ.forEach((zPos) => {
    const leftWheel = new THREE.Mesh(wheelGeo, new THREE.MeshStandardMaterial({ color: 0x2b2f28 }));
    leftWheel.rotation.z = Math.PI / 2;
    leftWheel.position.set(-1.9, 0.35, zPos);
    group.add(leftWheel);

    const rightWheel = leftWheel.clone();
    rightWheel.position.x = 1.9;
    group.add(rightWheel);
  });

  // hatch
  const hatch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.1, 10),
    detailMat
  );
  hatch.position.set(0.35, 1.9, -0.05);
  group.add(hatch);

  group.position.set(x, 0, z);
  group.scale.set(1.35, 1.35, 1.35);

  return {
    type: "tank",
    mesh: group,

    health: 7,
    maxHealth: 7,

    speed: 1.2,
    attackRange: 48,
    damage: 5,

    scoreValue: 28,
    rewardValue: 50,

    passengers: 2,
    bailThreshold: 3,
    hasDismounted: false,

    alerted: false,
    visionRange: 55,

    isJammer: false,
    labelText: "T",
    labelColor: "#ff4444",

    hitRadius: 2.8,
    shootCooldown: 1.8
  };
}