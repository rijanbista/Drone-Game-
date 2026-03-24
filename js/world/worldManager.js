import { createTree } from "./tree.js";
import { createRock } from "./rock.js";
import { createBuilding } from "./building.js";
import { createCrateCluster } from "./crateCluster.js";
import { createCamp } from "./camp.js";
import { createBarrel } from "./barrel.js";
import { CONFIG } from "../config.js";

export function createWorld(scene) {
  const obstacles = [];
  const grid = new Map();
  const GRID_SIZE = 50;

  function getGridKey(x, z) {
    const gx = Math.floor(x / GRID_SIZE);
    const gz = Math.floor(z / GRID_SIZE);
    return `${gx},${gz}`;
  }

  function addToGrid(obs) {
    const key = getGridKey(obs.x, obs.z);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(obs);
  }

  function removeFromGrid(obs) {
    const key = getGridKey(obs.x, obs.z);
    const cell = grid.get(key);
    if (cell) {
      const idx = cell.indexOf(obs);
      if (idx !== -1) cell.splice(idx, 1);
    }
  }

  function addObstacle(obstacle) {
    scene.add(obstacle.mesh);
    obstacles.push(obstacle);
    addToGrid(obstacle);
  }

  function isColliding(x, z, radius) {
    const gx = Math.floor(x / GRID_SIZE);
    const gz = Math.floor(z / GRID_SIZE);

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const cell = grid.get(`${gx + i},${gz + j}`);
        if (!cell) continue;

        for (const obs of cell) {
          const dx = x - obs.x;
          const dz = z - obs.z;
          const dist = Math.hypot(dx, dz);
          if (dist < radius + (obs.halfW || 6)) return true;
        }
      }
    }
    return false;
  }

  function isOnRoad(x, z, margin = 5) {
    const span = CONFIG.SPAWN_LIMITS.WORLD_RANGE / 2;
    const roads = [
      { minX: -90 - 14 - margin, maxX: -90 + 14 + margin, minZ: -span, maxZ: span },
      { minX: 140 - 16 - margin, maxX: 140 + 16 + margin, minZ: -span, maxZ: span },
      { minX: -250 - 12 - margin, maxX: -250 + 12 + margin, minZ: -span, maxZ: span },
      { minX: -span, maxX: span, minZ: -100 - 13 - margin, maxZ: -100 + 13 + margin },
      { minX: -span, maxX: span, minZ: 180 - 15 - margin, maxZ: 180 + 15 + margin },
      { minX: -span, maxX: span, minZ: -300 - 10 - margin, maxZ: -300 + 10 + margin }
    ];
    for (const r of roads) {
      if (x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ) return true;
    }
    return false;
  }

  function randomPoint(minCenter = 60, radius = 10, avoidRoads = false) {
    let x = 0;
    let z = 0;
    let attempts = 0;

    do {
      x = (Math.random() - 0.5) * CONFIG.SPAWN_LIMITS.WORLD_RANGE;
      z = (Math.random() - 0.5) * CONFIG.SPAWN_LIMITS.WORLD_RANGE;
      attempts++;
    } while (
      (
        Math.hypot(x, z) < minCenter ||
        isColliding(x, z, radius) ||
        (avoidRoads && isOnRoad(x, z))
      ) &&
      attempts < 100
    );

    return { x, z };
  }

  function spawnTrees(count = 80) {
    for (let i = 0; i < count; i++) {
      const p = randomPoint(CONFIG.SPAWN_LIMITS.MIN_CENTER, 4, true);
      addObstacle(createTree(p.x, p.z));
    }
  }

  function spawnRocks(count = 45) {
    for (let i = 0; i < count; i++) {
      const p = randomPoint(CONFIG.SPAWN_LIMITS.MIN_CENTER, 6);
      addObstacle(createRock(p.x, p.z));
    }
  }

  function spawnBuildings(count = 45) {
    for (let i = 0; i < count; i++) {
      // Spawn tents near "roads" (arbitrary lines at x=200, x=-200, z=200, z=-200)
      let x, z;
      const roadX = Math.random() > 0.5 ? 200 : -200;
      const roadZ = Math.random() > 0.5 ? 200 : -200;
      
      if (Math.random() > 0.5) {
        x = roadX + (Math.random() - 0.5) * 40;
        z = (Math.random() - 0.5) * CONFIG.SPAWN_LIMITS.WORLD_RANGE;
      } else {
        x = (Math.random() - 0.5) * CONFIG.SPAWN_LIMITS.WORLD_RANGE;
        z = roadZ + (Math.random() - 0.5) * 40;
      }

      if (!isColliding(x, z, 8) && Math.hypot(x, z) > 85) {
        addObstacle(createBuilding(x, z));
      }
    }
  }

  function spawnCrates(count = 35) {
    for (let i = 0; i < count; i++) {
      const p = randomPoint(CONFIG.SPAWN_LIMITS.MIN_CENTER, 5);
      addObstacle(createCrateCluster(p.x, p.z));
    }
  }

  function spawnCamps(count = 15) {
    for (let i = 0; i < count; i++) {
      const p = randomPoint(90, 15);
      addObstacle(createCamp(p.x, p.z));
    }
  }

  function spawnBarrels(count = 40) {
    for (let i = 0; i < count; i++) {
      const p = randomPoint(70, 3);
      addObstacle(createBarrel(p.x, p.z));
    }
  }

  function getNearbyObstacles(x, z, radius = 50) {
    const gx = Math.floor(x / GRID_SIZE);
    const gz = Math.floor(z / GRID_SIZE);
    const results = [];
    const span = Math.ceil(radius / GRID_SIZE);

    for (let i = -span; i <= span; i++) {
      for (let j = -span; j <= span; j++) {
        const cell = grid.get(`${gx + i},${gz + j}`);
        if (cell) results.push(...cell);
      }
    }
    return results;
  }

  function removeObstacle(obs) {
    const idx = obstacles.indexOf(obs);
    if (idx !== -1) {
      obstacles.splice(idx, 1);
      removeFromGrid(obs);
      if (obs.mesh && obs.mesh.parent) obs.mesh.parent.remove(obs.mesh);
    }
  }

  function updateVisibility(dronePos) {
    const CULL_DIST_SQ = 240 * 240; // Only show objects within 240 units
    for (const obs of obstacles) {
      if (!obs.mesh) continue;
      const dx = dronePos.x - obs.x;
      const dz = dronePos.z - obs.z;
      const dsq = dx * dx + dz * dz;
      obs.mesh.visible = dsq < CULL_DIST_SQ;
    }
  }

  return {
    obstacles,
    addObstacle,
    removeObstacle,
    getNearbyObstacles,
    updateVisibility,
    spawnTrees,
    spawnRocks,
    spawnBuildings,
    spawnCrates,
    spawnCamps,
    spawnBarrels
  };
}
