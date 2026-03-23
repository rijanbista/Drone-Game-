import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const MAP_HALF = 300;

export function createDrone(scene) {
  const group = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4c5561, metalness: 0.8, roughness: 0.3 });
  const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2f35, metalness: 0.7, roughness: 0.4 });
  const detailMaterial = new THREE.MeshStandardMaterial({ color: 0x1b1f24, metalness: 0.9, roughness: 0.2 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: 0x4cc9f0, emissive: 0x22aadd, emissiveIntensity: 1.5, roughness: 0.1 });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.45, 8.2),
    bodyMaterial
  );
  body.castShadow = true;
  group.add(body);

  const hump = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.28, 2.6),
    detailMaterial
  );
  hump.position.set(0, 0.28, 0.2);
  group.add(hump);

  const nose = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.25, 1.6, 12),
    detailMaterial
  );
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0, -4.8);
  nose.castShadow = true;
  group.add(nose);

  const mainWing = new THREE.Mesh(
    new THREE.BoxGeometry(12.5, 0.08, 1.1),
    wingMaterial
  );
  mainWing.position.set(0, 0.1, -0.6);
  mainWing.castShadow = true;
  group.add(mainWing);

  const leftWingTip = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.12, 0.45),
    detailMaterial
  );
  leftWingTip.position.set(-6.2, 0.22, -0.65);
  leftWingTip.rotation.z = -0.35;
  group.add(leftWingTip);

  const rightWingTip = leftWingTip.clone();
  rightWingTip.position.x = 6.2;
  rightWingTip.rotation.z = 0.35;
  group.add(rightWingTip);

  const rearWing = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 0.08, 0.7),
    wingMaterial
  );
  rearWing.position.set(0, 0.12, 2.9);
  group.add(rearWing);

  const tailFin = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 1.1, 1.0),
    detailMaterial
  );
  tailFin.position.set(0, 0.55, 3.4);
  group.add(tailFin);

  const leftEngine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 1.4, 12),
    detailMaterial
  );
  leftEngine.rotation.z = Math.PI / 2;
  leftEngine.position.set(-4.3, 0.05, -0.4);
  group.add(leftEngine);

  const rightEngine = leftEngine.clone();
  rightEngine.position.x = 4.3;
  group.add(rightEngine);

  const sensor = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 10, 10),
    accentMaterial
  );
  sensor.position.set(0, -0.28, -2.6);
  group.add(sensor);

  group.position.set(0, 28, 0);
  group.scale.set(0.55, 0.55, 0.55);
  scene.add(group);

  return {
    mesh: group,
    speed: 28,
    hitRadius: 1.8
  };
}

export function updateDrone(drone, input, camera, delta) {
  const move = new THREE.Vector3();

  if (input.keys["w"]) move.z -= 1;
  if (input.keys["s"]) move.z += 1;
  if (input.keys["a"]) move.x -= 1;
  if (input.keys["d"]) move.x += 1;

  if (input.joystick && input.joystick.active) {
    move.x += input.joystick.x;
    move.z += input.joystick.y;
  }

  if (move.length() > 0) {
    move.normalize().multiplyScalar(drone.speed * delta);
    drone.mesh.position.add(move);
  }

  drone.mesh.position.x = THREE.MathUtils.clamp(drone.mesh.position.x, -MAP_HALF, MAP_HALF);
  drone.mesh.position.z = THREE.MathUtils.clamp(drone.mesh.position.z, -MAP_HALF, MAP_HALF);

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(input.mouse.x, input.mouse.y), camera);

  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const point = new THREE.Vector3();
  const hit = raycaster.ray.intersectPlane(plane, point);

  if (hit && (!input.joystick || !input.joystick.active)) {
    const dx = point.x - drone.mesh.position.x;
    const dz = point.z - drone.mesh.position.z;
    drone.mesh.rotation.y = Math.atan2(dx, dz) + Math.PI;
  } else if (input.joystick && input.joystick.active && (move.x !== 0 || move.z !== 0)) {
    drone.mesh.rotation.y = Math.atan2(move.x, move.z) + Math.PI;
  }
}