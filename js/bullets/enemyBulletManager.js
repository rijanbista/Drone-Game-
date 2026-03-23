import { createEnemyBullet } from "./enemyBullet.js";

export function createEnemyBulletManager(scene) {
  const bullets = [];

  function fireEnemyBullet(startPosition, targetPosition, damage = 5) {
    const bullet = createEnemyBullet(scene, startPosition, targetPosition, damage);
    bullets.push(bullet);
    return bullet;
  }

  function updateEnemyBullets(delta, drone, gameState) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      if (!bullet || !bullet.mesh) continue;

      bullet.mesh.position.add(
        bullet.velocity.clone().multiplyScalar(delta)
      );

      bullet.life -= delta;

      const dx = bullet.mesh.position.x - drone.mesh.position.x;
      const dy = bullet.mesh.position.y - drone.mesh.position.y;
      const dz = bullet.mesh.position.z - drone.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < drone.hitRadius) {
        gameState.health -= bullet.damage;
        if (gameState.health < 0) gameState.health = 0;

        scene.remove(bullet.mesh);
        bullets.splice(i, 1);
        continue;
      }

      if (bullet.life <= 0) {
        scene.remove(bullet.mesh);
        bullets.splice(i, 1);
      }
    }
  }

  return {
    bullets,
    fireEnemyBullet,
    updateEnemyBullets
  };
}