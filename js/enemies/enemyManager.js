import { createEnemy } from "./enemyFactory.js";

export function createEnemyManager(scene) {
  const enemies = [];
  let currentWave = 1;
  let currentDifficultyMultiplier = 1.0;

  function spawnEnemy(type, x, z) {
    const enemy = createEnemy(type, x, z, currentWave, currentDifficultyMultiplier);
    enemy.shootCooldown = 1 + Math.random() * 1.5;
    scene.add(enemy.mesh);
    enemies.push(enemy);
    return enemy;
  }

  function setCurrentWave(wave) {
    currentWave = wave;
  }

  function setDifficultyMultiplier(mult) {
    currentDifficultyMultiplier = mult;
  }

  function randomPosition(minDist = 70) {
    let x = 0;
    let z = 0;

    do {
      x = (Math.random() - 0.5) * 420;
      z = (Math.random() - 0.5) * 420;
    } while (Math.hypot(x, z) < minDist);

    return { x, z };
  }

  function spawnInfantryGroup(count = 8, aroundPosition = null) {
    for (let i = 0; i < count; i++) {
      let x;
      let z;

      if (aroundPosition) {
        x = aroundPosition.x + (Math.random() - 0.5) * 10;
        z = aroundPosition.z + (Math.random() - 0.5) * 10;
      } else {
        const p = randomPosition(70);
        x = p.x;
        z = p.z;
      }

      spawnEnemy("infantry", x, z);
    }
  }

  function spawnCarGroup(count = 4) {
    for (let i = 0; i < count; i++) {
      const p = randomPosition(90);
      spawnEnemy("car", p.x, p.z);
    }
  }

  function spawnJeepGroup(count = 4) {
    for (let i = 0; i < count; i++) {
      const p = randomPosition(90);
      spawnEnemy("jeep", p.x, p.z);
    }
  }

  function spawnTruckGroup(count = 3) {
    for (let i = 0; i < count; i++) {
      const p = randomPosition(100);
      spawnEnemy("truck", p.x, p.z);
    }
  }

  function spawnTankGroup(count = 2) {
    for (let i = 0; i < count; i++) {
      const p = randomPosition(110);
      spawnEnemy("tank", p.x, p.z);
    }
  }

  function spawnChopperGroup(count = 2) {
    for (let i = 0; i < count; i++) {
      const p = randomPosition(120);
      spawnEnemy("chopper", p.x, p.z);
    }
  }

  function assignJammers(count = 0) {
    const possible = enemies.filter((e) => !e.air && e.type !== "infantry");

    for (let i = 0; i < count && i < possible.length; i++) {
      possible[i].isJammer = true;
      possible[i].labelText = (possible[i].labelText || possible[i].type || "Enemy") + "-J";
      possible[i].labelColor = "#bb66ff";
    }
  }

  function tryBailout(enemy) {
    if (!enemy || !enemy.mesh) return;
    if (enemy.air) return;
    if (!enemy.passengers || enemy.passengers <= 0) return;
    if (enemy.hasDismounted) return;

    if (enemy.health > 0 && enemy.health <= enemy.bailThreshold) {
      enemy.hasDismounted = true;
      spawnInfantryGroup(enemy.passengers, {
        x: enemy.mesh.position.x,
        z: enemy.mesh.position.z
      });
      enemy.passengers = 0;
    }
  }

  function damageEnemy(enemy, amount) {
    if (!enemy || !enemy.mesh) return false;

    enemy.health -= amount;

    if (enemy.health > 0) {
      tryBailout(enemy);
      return false;
    }

    removeEnemy(enemy);
    return true;
  }

  function updateEnemies(drone, delta, wave = 1, now = performance.now(), enemyBulletManager = null, worldObstacles = []) {
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (!enemy || !enemy.mesh) continue;

      const dx = drone.mesh.position.x - enemy.mesh.position.x;
      const dz = drone.mesh.position.z - enemy.mesh.position.z;
      const dist = Math.hypot(dx, dz);

      // Swarm Alert (Hive Mind): If this enemy sees the drone or is damaged (which also alerts), alert nearby enemies
      if (!enemy.alerted && dist < (enemy.visionRange || 60)) {
        for (const e of enemies) {
          if (Math.hypot(e.mesh.position.x - enemy.mesh.position.x, e.mesh.position.z - enemy.mesh.position.z) < 150) {
            e.alerted = true;
          }
        }
      }

      // If damaged by player bullets previously, they should trigger swarm alert
      if (!enemy.alerted && enemy.health < enemy.maxHealth) {
        for (const e of enemies) {
          if (Math.hypot(e.mesh.position.x - enemy.mesh.position.x, e.mesh.position.z - enemy.mesh.position.z) < 150) {
            e.alerted = true;
          }
        }
      }

      if (enemy.alerted && dist > 1) {
        // Tactical Cover Sensing for Infantry/Jeeps: ONLY AFTER WAVE 15
        if (wave > 15 && (enemy.type === "infantry" || enemy.type === "jeep") && worldObstacles.length > 0) {
          let nearestObs = null;
          let minDistToObs = Infinity;
          for (let oi = 0; oi < worldObstacles.length; oi++) {
            const obs = worldObstacles[oi];
            if (!obs.mesh || (obs.type !== "building" && obs.type !== "rock")) continue;
            
            const od = Math.hypot(obs.x - enemy.mesh.position.x, obs.z - enemy.mesh.position.z);
            if (od < minDistToObs && od < 180) {
              minDistToObs = od;
              nearestObs = obs;
            }
          }

          if (nearestObs) {
            // Find a point on the opposite side of the obstacle from the drone
            const dox = nearestObs.x - drone.mesh.position.x;
            const doz = nearestObs.z - drone.mesh.position.z;
            const dolen = Math.hypot(dox, doz) || 1;
            const coverExt = (nearestObs.halfW || 6) + 4;
            
            const cx = nearestObs.x + (dox / dolen) * coverExt;
            const cz = nearestObs.z + (doz / dolen) * coverExt;
            
            const cdx = cx - enemy.mesh.position.x;
            const cdz = cz - enemy.mesh.position.z;
            const cdt = Math.hypot(cdx, cdz) || 1;
            
            // Only move to cover if not perfectly there, else stay put and shoot
            if (cdt > 2.0) {
              enemy.mesh.position.x += (cdx / cdt) * enemy.speed * delta;
              enemy.mesh.position.z += (cdz / cdt) * enemy.speed * delta;
            }
          } else {
            // No cover nearby, advance straight
            enemy.mesh.position.x += (dx / dist) * enemy.speed * delta;
            enemy.mesh.position.z += (dz / dist) * enemy.speed * delta;
          }
        } else {
          // Normal advance (tanks, air)
          enemy.mesh.position.x += (dx / dist) * enemy.speed * delta;
          enemy.mesh.position.z += (dz / dist) * enemy.speed * delta;
        }
      }

      if (enemy.type === "infantry" && enemy._legs) {
        enemy._time = (enemy._time || 0) + delta * 6;
        enemy._legs[0].rotation.x = Math.sin(enemy._time) * 0.6;
        enemy._legs[1].rotation.x = Math.sin(enemy._time + Math.PI) * 0.6;
      }

      enemy.mesh.rotation.y = Math.atan2(dx, dz);

      if (enemy.air) {
        enemy.mesh.position.y = 12 + Math.sin(now * 0.002 + i) * 0.55;
      }

      if (!enemy.alerted) continue;

      enemy.shootCooldown -= delta;

      if (enemyBulletManager && dist < enemy.attackRange && enemy.shootCooldown <= 0) {
        const start = enemy.mesh.position.clone();
        start.y = enemy.air ? 12 : 1.8;

        const target = drone.mesh.position.clone();
        target.y = 33;

        // Damage scales with wave: base + (wave-1) * 20%
        const scaledDamage = enemy.damage * (1 + (wave - 1) * 0.2);
        enemyBulletManager.fireEnemyBullet(start, target, scaledDamage);
        enemy.shootCooldown = 1.2 + Math.random() * 1.5;
      }
    }
  }

  function isJammerActive(drone) {
    for (const enemy of enemies) {
      if (!enemy || !enemy.mesh) continue;
      if (!enemy.isJammer) continue;
      if (!enemy.alerted) continue;

      const dx = drone.mesh.position.x - enemy.mesh.position.x;
      const dz = drone.mesh.position.z - enemy.mesh.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 95) {
        return true;
      }
    }

    return false;
  }

  function removeEnemy(enemy) {
    const index = enemies.indexOf(enemy);
    if (index === -1) return;

    if (enemy.mesh) {
      scene.remove(enemy.mesh);
      enemy.mesh = null;
    }

    enemies.splice(index, 1);
  }

  function clearEnemies() {
    while (enemies.length > 0) {
      const enemy = enemies.pop();
      if (enemy && enemy.mesh) {
        scene.remove(enemy.mesh);
        enemy.mesh = null;
      }
    }
  }

  return {
    enemies,
    spawnEnemy,
    spawnInfantryGroup,
    spawnCarGroup,
    spawnJeepGroup,
    spawnTruckGroup,
    spawnTankGroup,
    spawnChopperGroup,
    assignJammers,
    updateEnemies,
    damageEnemy,
    isJammerActive,
    removeEnemy,
    clearEnemies,
    setCurrentWave,
    setDifficultyMultiplier
  };
}