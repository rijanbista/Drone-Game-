import { poolManager } from "../poolManager.js";
import { showHit } from "../ui/hitPopup.js";

export function createBulletManager(scene) {
  const bullets = [];
  const popups = [];
  const explosions = [];
  const MAX_BULLETS = 80;

  poolManager.init(scene);

  function firePlayerBullet(startPosition, targetPosition, type = "small", isAlly = false) {
    if (bullets.length >= MAX_BULLETS) return;

    const bullet = poolManager.bulletPool.get(
      scene,
      startPosition,
      targetPosition,
      type,
      isAlly
    );

    bullets.push(bullet);
  }

  function addPopup(text, color) {
    popups.push(
      showHit(text, window.innerWidth / 2, window.innerHeight / 2, color)
    );
  }

  function updateBullets(delta, enemyManager, gameState, drone, world = null) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];

      if (!bullet || !bullet.mesh) {
        bullets.splice(i, 1);
        continue;
      }

      const direction = bullet.target.clone().sub(bullet.mesh.position);
      const distance = direction.length();

      if (distance < 2) {
        const impactPos = bullet.mesh.position.clone();

        explosions.push(
          poolManager.explosionPool.get(
            scene,
            impactPos,
            bullet.type === "nuke" ? 4.2 : bullet.type === "big" ? 2.8 : 1.8,
            bullet.type === "nuke"
              ? 0xff3333
              : bullet.isAlly
              ? 0x55d8ff
              : 0xff8844
          )
        );

        // Screen Shake
        gameState.screenShake = bullet.type === "nuke" ? 0.7 : bullet.type === "big" ? 0.35 : 0.18;

        let anythingHit = false;
        let killedSomething = false;
        let criticalHit = false;

        const enemiesSnapshot = [...enemyManager.enemies];

        for (const enemy of enemiesSnapshot) {
          if (!enemy || !enemy.mesh) continue;

          const dx = impactPos.x - enemy.mesh.position.x;
          const dz = impactPos.z - enemy.mesh.position.z;
          const flatDist = Math.hypot(dx, dz);

          if (flatDist >= bullet.blastRadius) continue;

          let finalDamage = bullet.damage;
          let thisWasCritical = false;

          if (enemy.weakSpots) {
            for (const spot of enemy.weakSpots) {
              const wx = enemy.mesh.position.x + spot.offset.x;
              const wy = enemy.mesh.position.y + spot.offset.y;
              const wz = enemy.mesh.position.z + spot.offset.z;

              const dist3d = Math.sqrt(
                (impactPos.x - wx) ** 2 +
                (impactPos.y - wy) ** 2 +
                (impactPos.z - wz) ** 2
              );

              if (dist3d < spot.radius) {
                finalDamage *= spot.multiplier;
                thisWasCritical = true;
              }
            }
          }

          enemy.alerted = true;
          const died = enemyManager.damageEnemy(enemy, finalDamage);

          anythingHit = true;
          if (died) killedSomething = true;
          if (thisWasCritical) criticalHit = true;

          if (died) {
            gameState.score += enemy.scoreValue || 0;
            gameState.money += enemy.rewardValue || 0;
          }
        }

        if (world && world.getNearbyObstacles) {
          const nearby = world.getNearbyObstacles(impactPos.x, impactPos.z, bullet.blastRadius + 20);
          for (let oi = nearby.length - 1; oi >= 0; oi--) {
            const obs = nearby[oi];
            if (!obs.mesh || obs.type !== "tent") continue;

            const odx = impactPos.x - obs.x;
            const odz = impactPos.z - obs.z;
            const oflatDist = Math.hypot(odx, odz);

            if (oflatDist >= bullet.blastRadius + (obs.halfW || 6)) continue;

            obs.health = (obs.health === undefined ? 20 : obs.health) - bullet.damage;
            anythingHit = true;

            // Show HP popup for tents
            if (obs.updateHPBar) obs.updateHPBar();
            
            if (obs.health <= 0) {
              world.removeObstacle(obs);
            }
          }
        }

        if (bullet.type === "nuke" && drone && drone.mesh) {
          const dx = impactPos.x - drone.mesh.position.x;
          const dz = impactPos.z - drone.mesh.position.z;
          const selfDist = Math.hypot(dx, dz);

          if (selfDist < 18) {
            gameState.health -= 35;
            if (gameState.health < 0) gameState.health = 0;
          }
        }

        if (killedSomething) {
          addPopup("KILL", "red");
        } else if (criticalHit) {
          addPopup("CRITICAL", "#ffd54a");
        } else if (anythingHit) {
          addPopup("HIT", "white");
        } else {
          addPopup("MISS", "gray");
        }

        if (bullet.mesh) {
          poolManager.bulletPool.release(bullet);
        }

        bullets.splice(i, 1);
        continue;
      }

      direction.normalize();
      const move = direction.clone().multiplyScalar(bullet.speed * delta);
      bullet.mesh.position.add(move);
      
      // Look straight at target (trajectory alignment)
      bullet.mesh.lookAt(bullet.target);
      bullet.mesh.rotateX(Math.PI / 2);
    }

    for (let i = explosions.length - 1; i >= 0; i--) {
      const alive = explosions[i].update(delta);
      if (!alive) {
        poolManager.explosionPool.release(explosions[i]);
        explosions.splice(i, 1);
      }
    }

    for (let i = popups.length - 1; i >= 0; i--) {
      const alive = popups[i].update(delta);
      if (!alive) popups.splice(i, 1);
    }
  }

  return {
    bullets,
    firePlayerBullet,
    updateBullets
  };
}
