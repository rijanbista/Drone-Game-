import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createAllySystem(scene) {
  const allies = [];
  let activeTime = 0;

  function spawnAllies(playerPosition) {
    clearAllies();

    for (let i = 0; i < 2; i++) {
      const group = new THREE.Group();

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.35, 4.0),
        new THREE.MeshStandardMaterial({ color: 0x6dd3ff })
      );
      body.castShadow = true;
      group.add(body);

      const wings = new THREE.Mesh(
        new THREE.BoxGeometry(5.4, 0.08, 0.55),
        new THREE.MeshStandardMaterial({ color: 0x4aa8dd })
      );
      wings.position.y = 0.08;
      group.add(wings);

      group.position.set(
        playerPosition.x + (i === 0 ? -18 : 18),
        26,
        playerPosition.z - 16
      );

      scene.add(group);

      allies.push({
        mesh: group,
        offsetX: i === 0 ? -18 : 18,
        offsetZ: -16,
        fireCooldown: 1.8 + i * 0.3,
        damage: 0.6,
        range: 80
      });
    }

    activeTime = 10;
  }

  function clearAllies() {
    while (allies.length > 0) {
      const ally = allies.pop();
      scene.remove(ally.mesh);
    }
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
      ally.mesh.position.y += (26 - ally.mesh.position.y) * 0.06;

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
      start.y = 26;

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
    get activeTime() {
      return activeTime;
    }
  };
}