import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createAllySystem(scene) {
  const allies = [];
  let activeTime = 0;
  let currentWave = 1;
  let currentDifficultyMultiplier = 1.0;

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4c5561, metalness: 0.8, roughness: 0.3 });
  const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2f35, metalness: 0.7, roughness: 0.4 });
  const detailMaterial = new THREE.MeshStandardMaterial({ color: 0x1b1f24, metalness: 0.9, roughness: 0.2 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: 0x55d8ff, emissive: 0x1b8db5, emissiveIntensity: 1.7, roughness: 0.1 });

  function createAllyDroneMesh() {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.4, 7.2),
      bodyMaterial
    );
    body.castShadow = true;
    group.add(body);

    const hump = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.24, 2.2),
      detailMaterial
    );
    hump.position.set(0, 0.26, 0.2);
    group.add(hump);

    const nose = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.22, 1.4, 12),
      detailMaterial
    );
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0, -4.2);
    nose.castShadow = true;
    group.add(nose);

    const mainWing = new THREE.Mesh(
      new THREE.BoxGeometry(10.2, 0.07, 0.95),
      wingMaterial
    );
    mainWing.position.set(0, 0.1, -0.6);
    mainWing.castShadow = true;
    group.add(mainWing);

    const rearWing = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.07, 0.6),
      wingMaterial
    );
    rearWing.position.set(0, 0.12, 2.6);
    group.add(rearWing);

    const tailFin = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.95, 0.85),
      detailMaterial
    );
    tailFin.position.set(0, 0.48, 3.1);
    group.add(tailFin);

    const leftEngine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 1.2, 12),
      detailMaterial
    );
    leftEngine.rotation.z = Math.PI / 2;
    leftEngine.position.set(-3.7, 0.05, -0.35);
    group.add(leftEngine);

    const rightEngine = leftEngine.clone();
    rightEngine.position.x = 3.7;
    group.add(rightEngine);

    const sensor = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 10, 10),
      accentMaterial
    );
    sensor.position.set(0, -0.24, -2.3);
    group.add(sensor);

    group.scale.set(0.28, 0.28, 0.28);
    return group;
  }

  function spawnAllies(playerPosition) {
    clearAllies();

    const waveScale = 1 + Math.max(0, currentWave - 1) * 0.08;
    const difficultyScale = currentDifficultyMultiplier;
    const powerScale = waveScale * difficultyScale;

    for (let i = 0; i < 2; i++) {
      const group = createAllyDroneMesh();

      group.position.set(
        playerPosition.x + (i === 0 ? -18 : 18),
        playerPosition.y,
        playerPosition.z - 16
      );

      scene.add(group);

      allies.push({
        mesh: group,
        offsetX: i === 0 ? -18 : 18,
        offsetZ: -16,
        fireCooldown: Math.max(0.7, (1.6 + i * 0.25) / (0.9 + powerScale * 0.15)),
        damage: 0.6 * (0.9 + powerScale * 0.35),
        range: 80,
        targetY: playerPosition.y
      });
    }

    activeTime = 15; // Increased active time
  }

  function clearAllies() {
    for (const ally of allies) {
      if (ally.mesh && ally.mesh.parent) {
        scene.remove(ally.mesh);
      }
    }
    allies.length = 0;
    activeTime = 0;
  }

  function findClosestEnemy(ally, enemies) {
    let best = null;
    let bestDist = Infinity;

    for (const enemy of enemies) {
      if (!enemy.mesh) continue;

      const dx = enemy.mesh.position.x - ally.mesh.position.x;
      const dz = enemy.mesh.position.z - ally.mesh.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist < ally.range && dist < bestDist) {
        best = enemy;
        bestDist = dist;
      }
    }

    return best;
  }

  function update(delta, drone, enemies, bulletManager, jammerActive = false) {
    if (activeTime <= 0) return;

    activeTime -= delta;
    if (activeTime <= 0) {
      clearAllies();
      return;
    }

    for (const ally of allies) {
      ally.mesh.position.x += ((drone.mesh.position.x + ally.offsetX) - ally.mesh.position.x) * 0.06;
      ally.mesh.position.z += ((drone.mesh.position.z + ally.offsetZ) - ally.mesh.position.z) * 0.06;
      ally.mesh.position.y += (drone.mesh.position.y - ally.mesh.position.y) * 0.06;

      const target = findClosestEnemy(ally, enemies);

      if (target) {
        const dx = target.mesh.position.x - ally.mesh.position.x;
        const dz = target.mesh.position.z - ally.mesh.position.z;
        ally.mesh.rotation.y = Math.atan2(dx, dz);
      }

      ally.fireCooldown -= delta;

      if (!target) continue;
      if (ally.fireCooldown > 0) continue;

      // jammer weakens allies
      if (jammerActive && Math.random() < 0.45) {
        ally.fireCooldown = 1.4 + Math.random() * 0.5;
        continue;
      }

      const start = ally.mesh.position.clone();
      start.y = ally.mesh.position.y;

      const targetPos = target.mesh.position.clone();

      // slight inaccuracy, worse under jammer
      const spread = jammerActive ? 12 : 5;
      targetPos.x += (Math.random() - 0.5) * spread;
      targetPos.z += (Math.random() - 0.5) * spread;

      bulletManager.firePlayerBullet(start, targetPos, "small", true);

      ally.fireCooldown = jammerActive
        ? 1.9 + Math.random() * 0.7
        : 1.5 + Math.random() * 0.5;
    }
  }

  return {
    allies,
    spawnAllies,
    clearAllies,
    update,
    setLevel(wave, difficultyMultiplier) {
      currentWave = wave;
      currentDifficultyMultiplier = difficultyMultiplier;
    },
    get activeTime() {
      return activeTime;
    }
  };
}
