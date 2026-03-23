import { createTree } from "./tree.js";
import { createRock } from "./rock.js";
import { createBuilding } from "./building.js";
import { createCrateCluster } from "./crateCluster.js";
import { createCamp } from "./camp.js";
import { createBarrel } from "./barrel.js";

export function createWorld(scene) {
  const obstacles = [];

  function addObstacle(obstacle) {
    scene.add(obstacle.mesh);
    obstacles.push(obstacle);
  }

  function isOnRoad(x, z, margin = 5) {
    const roads = [
      { minX: -90 - 14 - margin, maxX: -90 + 14 + margin, minZ: -400, maxZ: 400 },
      { minX: 140 - 16 - margin, maxX: 140 + 16 + margin, minZ: -400, maxZ: 400 },
      { minX: -250 - 12 - margin, maxX: -250 + 12 + margin, minZ: -400, maxZ: 400 },
      { minX: -400, maxX: 400, minZ: -100 - 13 - margin, maxZ: -100 + 13 + margin },
      { minX: -400, maxX: 400, minZ: 180 - 15 - margin, maxZ: 180 + 15 + margin },
      { minX: -400, maxX: 400, minZ: -300 - 10 - margin, maxZ: -300 + 10 + margin }
    ];
    for (const r of roads) {
      if (x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ) {
        return true;
      }
    }
    return false;
  }

  function randomPoint(minCenter = 60, avoidRoads = false) {
    let x = 0;
    let z = 0;

    do {
      x = (Math.random() - 0.5) * 560;
      z = (Math.random() - 0.5) * 560;
    } while (Math.hypot(x, z) < minCenter || (avoidRoads && isOnRoad(x, z)));

    return { x, z };
  }

  function spawnTrees(count = 22) {
    for (let i = 0; i < count; i++) {
      const p = randomPoint(60, true); // avoid roads
      addObstacle(createTree(p.x, p.z));
    }
  }

  function spawnRocks(count = 14) {
    for (let i = 0; i < count; i++) {
      const p = randomPoint(60);
      addObstacle(createRock(p.x, p.z));
    }
  }

  function spawnBuildings(count = 14) {
    for (let i = 0; i < count; i++) {
      const p = randomPoint(85);
      addObstacle(createBuilding(p.x, p.z));
    }
  }

  function spawnCrates(count = 10) {
    for (let i = 0; i < count; i++) {
      const p = randomPoint(60);
      addObstacle(createCrateCluster(p.x, p.z));
    }
  }

  function spawnCamps(count = 5) {
    for (let i = 0; i < count; i++) {
      const p = randomPoint(90);
      addObstacle(createCamp(p.x, p.z));
    }
  }

  function spawnBarrels(count = 18) {
    for (let i = 0; i < count; i++) {
      const p = randomPoint(70);
      addObstacle(createBarrel(p.x, p.z));
    }
  }

  return {
    obstacles,
    addObstacle,
    spawnTrees,
    spawnRocks,
    spawnBuildings,
    spawnCrates,
    spawnCamps,
    spawnBarrels
  };
}