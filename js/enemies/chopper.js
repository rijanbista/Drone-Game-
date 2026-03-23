import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createChopper(x, z) {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xc7cdd4, roughness: 0.4, metalness: 0.6 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2c3138, roughness: 0.6, metalness: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x7f8c99, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.8 });
  const rotorMat = new THREE.MeshStandardMaterial({ color: 0x1b1f24, roughness: 0.5, metalness: 0.7 });

  // main body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.0, 4.8),
    bodyMat
  );
  body.position.y = 1.1;
  body.castShadow = true;
  group.add(body);

  // cockpit
  const cockpit = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.8, 1.8),
    glassMat
  );
  cockpit.position.set(0, 1.35, -1.3);
  cockpit.castShadow = true;
  group.add(cockpit);

  // nose
  const nose = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.75, 1.3, 12),
    bodyMat
  );
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 1.0, -3.0);
  nose.castShadow = true;
  group.add(nose);

  // tail boom
  const tail = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.45, 3.4),
    darkMat
  );
  tail.position.set(0, 1.0, 3.6);
  tail.castShadow = true;
  group.add(tail);

  // tail fin
  const tailFin = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 1.0, 0.9),
    darkMat
  );
  tailFin.position.set(0, 1.65, 4.9);
  tailFin.castShadow = true;
  group.add(tailFin);

  // main rotor mast
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.55, 10),
    rotorMat
  );
  mast.position.set(0, 1.75, 0.2);
  group.add(mast);

  // main rotor
  const rotor = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 0.08, 0.22),
    rotorMat
  );
  rotor.position.set(0, 2.0, 0.2);
  group.add(rotor);

  const rotor2 = rotor.clone();
  rotor2.rotation.y = Math.PI / 2;
  group.add(rotor2);

  // tail rotor
  const tailRotor = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.08, 0.18),
    rotorMat
  );
  tailRotor.position.set(0, 1.45, 5.2);
  tailRotor.rotation.z = Math.PI / 2;
  group.add(tailRotor);

  // landing skids
  const skidGeo = new THREE.CylinderGeometry(0.06, 0.06, 4.0, 10);

  const leftSkid = new THREE.Mesh(skidGeo, darkMat);
  leftSkid.rotation.z = Math.PI / 2;
  leftSkid.position.set(-0.9, 0.25, 0.4);
  group.add(leftSkid);

  const rightSkid = leftSkid.clone();
  rightSkid.position.x = 0.9;
  group.add(rightSkid);

  const skidBarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);

  const frontBar = new THREE.Mesh(skidBarGeo, darkMat);
  frontBar.rotation.x = Math.PI / 2;
  frontBar.position.set(0, 0.42, -0.5);
  group.add(frontBar);

  const rearBar = frontBar.clone();
  rearBar.position.z = 1.7;
  group.add(rearBar);

  group.position.set(x, 0, z);
  group.scale.set(1.2, 1.2, 1.2);

  return {
    type: "chopper",
    mesh: group,

    health: 5,
    maxHealth: 5,

    speed: 1.4,
    attackRange: 42,
    damage: 4,

    scoreValue: 24,
    rewardValue: 30,

    alerted: false,
    visionRange: 70,

    passengers: 0,
    bailThreshold: 0,
    hasDismounted: true,

    air: false,
    isJammer: false,
    labelText: "H",
    labelColor: "#4da6ff",

    hitRadius: 2.4,
    shootCooldown: 1.6
  };
}